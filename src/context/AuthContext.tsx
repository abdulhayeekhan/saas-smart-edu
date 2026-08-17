// ** React Imports
import { createContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react'

// ** React Router
import { useNavigate, useLocation } from 'react-router-dom'
import toast from "react-hot-toast";
// ** Axios
import axios from 'axios'
// ** Config
import authConfig from '../configs/auth'

const baseURL = process.env.REACT_APP_API_BASE_URL;

// -------------------- Types --------------------
export interface User {
  id?: number
  username?: string
  roleId?: number
  roleName?: string
  userLevel?: number
  userLevelId?: number
  campusId?: number
  userDP?: string
  accessToken?: string
  refreshToken?: string
  [key: string]: any
}

export interface LoginParams {
  username: string
  password: string
  rememberMe: boolean
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (params: LoginParams, errorCallback?: (err: any) => void) => Promise<void>
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

// -------------------- Defaults --------------------
const defaultProvider: AuthContextType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => null,
  login: async () => Promise.resolve(),
  logout: () => { }
}

const AuthContext = createContext<AuthContextType>(defaultProvider)

// -------------------- Auto Logout Config --------------------
const AUTO_LOGOUT_TIME = 5 * 60 * 1000 // 5 minutes

const AuthProvider = ({ children }: AuthProviderProps) => {
  // ** States
  const [user, setUser] = useState<User | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Refs
  const logoutTimer = useRef<NodeJS.Timeout | null>(null)

  // ** Hooks
  const navigate = useNavigate()
  const location = useLocation()

  // -------------------- Auto Logout --------------------
  // const resetLogoutTimer = () => {
  //   if (logoutTimer.current) clearTimeout(logoutTimer.current)
  //   if (user) {
  //     logoutTimer.current = setTimeout(() => {
  //       handleLogout()
  //       toast.success("Logged out due to inactivity")
  //     }, AUTO_LOGOUT_TIME)
  //   }
  // }

  const resetLogoutTimer = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)

    if (user) {
      logoutTimer.current = setTimeout(() => {
        handleLogout()
        toast.success("Logged out due to inactivity")
      }, AUTO_LOGOUT_TIME)
    }
  }, [user])  // user dependency is okay here

  // useEffect(() => {
  //   const events = ["mousemove", "keydown", "scroll", "click", "touchstart"]
  //   events.forEach(evt => window.addEventListener(evt, resetLogoutTimer))

  //   // Start timer if user is logged in
  //   resetLogoutTimer()

  //   return () => {
  //     if (logoutTimer.current) clearTimeout(logoutTimer.current)
  //     events.forEach(evt => window.removeEventListener(evt, resetLogoutTimer))
  //   }
  // }, [user])
  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"]

    events.forEach(evt =>
      window.addEventListener(evt, resetLogoutTimer)
    )

    return () => {
      events.forEach(evt =>
        window.removeEventListener(evt, resetLogoutTimer)
      )
    }
  }, [resetLogoutTimer])

  // -------------------- Initialize Auth --------------------
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      const userInfo = JSON.parse(window.localStorage.getItem('userData') || 'null')
      const userBody = {
        accessToken: userInfo?.data?.accessToken,
        refreshToken: userInfo?.data?.refreshToken
      }

      if (storedToken) {
        setLoading(true)
        await axios
          .post(
            authConfig.meEndpoint,
            { userBody }
          )
          .then(response => {
            setLoading(false)
            setUser({ ...response.data })
          })
          .catch(() => {
            localStorage.removeItem('userData')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('roleRights')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && location.pathname !== '/login') {
              navigate('/login', { replace: true })
            }
          })
      } else {
        setLoading(false)
        navigate('/login', { replace: true })
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------- Login --------------------
  const handleLogin = async (params: LoginParams, errorCallback?: (err: any) => void) => {
    try {
      const response = await axios.post(authConfig.loginEndpoint, params);
      const resData = response?.data;

      if (!resData || resData.status === false || !resData.data) {
        const errMsg = resData?.message || 'Username or password is incorrect';
        toast.error(errMsg);
        if (errorCallback) errorCallback(new Error(errMsg));
        return;
      }

      const userInfo = resData.data;

      if (userInfo?.isEnabled === false) {
        const errMsg = "Your account is inactive. Please contact the administrator.";
        toast.error(errMsg);
        if (errorCallback) errorCallback(new Error(errMsg));
        return;
      }

      if (userInfo?.userLevel === 4 || userInfo?.userLevel === 5) {
        const errMsg = "Access restricted for student/parent accounts";
        toast.error(errMsg);
        if (errorCallback) errorCallback(new Error(errMsg));
        return;
      }

      if (params.rememberMe) {
        window.localStorage.setItem(authConfig.storageTokenKeyName, userInfo.accessToken || '');
        window.localStorage.setItem('userData', JSON.stringify(resData));
      }

      setUser({ ...resData });
      resetLogoutTimer();

      let userCampusId = userInfo?.userLevelId;
      let userDP = '/images/avatars/1.png';

      const roleId = userInfo?.roleId;
      try {
        const res = await axios.get(
          `${baseURL}/api/permission/getallpermissionbyrole?roleId=${roleId}`
        );
        const rights = res?.data?.data || [];
        localStorage.setItem("roleRights", JSON.stringify(rights));
      } catch (e) {
        console.error("Failed to fetch permissions:", e);
      }

      const newBody = {
        campusId: userCampusId,
        userId: userInfo?.id,
        userLevel: userInfo?.userLevel,
        userLevelId: userInfo?.userLevelId,
        roleId: userInfo?.roleId,
        roleName: userInfo?.roleName,
        username: userInfo?.username,
        userDP
      };

      if (params.rememberMe) {
        window.localStorage.setItem('loginInfo', JSON.stringify(newBody));
      }

      const from = (location.state as any)?.from?.pathname || '/';
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.Message || err?.response?.data?.title || err?.message || 'Username or password is incorrect';
      toast.error(errMsg);
      if (errorCallback) errorCallback(err);
    }
  }

  // -------------------- Logout --------------------
  // const handleLogout = () => {
  //   setUser(null)
  //   if (logoutTimer.current) clearTimeout(logoutTimer.current)
  //   window.localStorage.removeItem('userData')
  //   window.localStorage.removeItem(authConfig.storageTokenKeyName)
  //   window.localStorage.removeItem('roleRights')
  //   toast.success('Logged out successfully')
  //   navigate('/login', { replace: true })
  // }
  // -------------------- Logout --------------------
  const handleLogout = useCallback(async () => {
    // 1. Clear React State
    setUser(null)

    // 2. Clear Timers
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current)
      logoutTimer.current = null
    }

    // 3. Clear Local Storage (Strictly for your domain)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem('roleRights')
    window.localStorage.removeItem('loginInfo')
    // Or use window.localStorage.clear() to wipe all keys for v1.smartedu.site

    // 4. Clear Session Storage
    window.sessionStorage.clear()

    // 5. Clear Domain-Specific Cache API
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      } catch (error) {
        console.error("Cache clearing failed:", error)
      }
    }

    // 6. Clear Cookies for this domain
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    toast.success('Logged out successfully')

    // 7. Navigate or Hard Reload
    // Replace current history so they can't go "Back" into the app
    navigate('/login', { replace: true })

    // Optional: Use window.location.reload() if you want to ensure 
    // all memory variables are totally wiped.
  }, [navigate])

  const values: AuthContextType = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
export { }
