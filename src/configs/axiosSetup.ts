import axios from 'axios';
import authConfig from './auth';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    const transformNamesToUppercase = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(transformNamesToUppercase);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey === 'studentname' || 
            lowerKey === 'fathername' || 
            lowerKey === 'employeename' || 
            lowerKey === 'firstname' || 
            lowerKey === 'lastname' || 
            lowerKey === 'fullname'
          ) {
            if (typeof obj[key] === 'string') {
              obj[key] = obj[key].toUpperCase();
            }
          }
          transformNamesToUppercase(obj[key]);
        });
      }
    };
    
    if (response.data) {
      transformNamesToUppercase(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop or hanging promise on auth endpoints (login, refreshtoken)
    const isAuthEndpoint = 
      originalRequest?.url === authConfig.meEndpoint || 
      originalRequest?.url === authConfig.loginEndpoint ||
      originalRequest?.url?.includes('/api/account/login') ||
      originalRequest?.url?.includes('/api/account/refreshtoken');

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Intercept 404 responses to return an empty array response instead of rejecting with "Request failed with status code 404"
    if (error.response?.status === 404) {
      const resData = error.response.data;
      let finalData: any = { data: [], message: 'No record found', status: true, totalCount: 0 };

      if (Array.isArray(resData)) {
        finalData = resData;
      } else if (resData && typeof resData === 'object') {
        finalData = {
          ...resData,
          data: Array.isArray(resData.data)
            ? resData.data
            : (resData.data === null || resData.data === undefined ? [] : resData.data),
          status: true,
        };
      }

      return Promise.resolve({
        data: finalData,
        status: 200,
        statusText: 'OK',
        headers: error.response.headers || {},
        config: originalRequest
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return new Promise(() => {}); // Hang instead of rejecting to avoid toasts during redirect
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const userInfoString = window.localStorage.getItem('userData');
      const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
      const refreshToken = userInfo?.data?.refreshToken;
      const accessToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

      if (!refreshToken || !accessToken) {
        isRefreshing = false;
        window.localStorage.removeItem('userData');
        window.localStorage.removeItem(authConfig.storageTokenKeyName);
        window.localStorage.removeItem('roleRights');
        window.localStorage.removeItem('loginInfo');
        window.sessionStorage.clear();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return new Promise(() => {}); // Hang instead of rejecting
      }

      return new Promise((resolve, reject) => {
        // Send a post request to refresh the token. 
        axios.post(authConfig.meEndpoint, { 
          userBody: { accessToken, refreshToken } 
        })
        .then(({ data }) => {
          if (!data || !data.data) {
             throw new Error("Invalid response from refresh token endpoint");
          }
          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;
          
          window.localStorage.setItem(authConfig.storageTokenKeyName, newAccessToken);
          
          if (userInfo) {
             const updatedUserInfo = { ...userInfo, data: { ...userInfo.data, accessToken: newAccessToken, refreshToken: newRefreshToken } };
             window.localStorage.setItem('userData', JSON.stringify(updatedUserInfo));
          }

          axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          
          processQueue(null, newAccessToken);
          resolve(axios(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          // If refresh token fails, we log the user out
          window.localStorage.removeItem('userData');
          window.localStorage.removeItem(authConfig.storageTokenKeyName);
          window.localStorage.removeItem('roleRights');
          window.localStorage.removeItem('loginInfo');
          window.sessionStorage.clear();
          if (window.location.pathname !== '/login') {
             window.location.href = '/login';
          }
          // Do not resolve or reject to avoid downstream toast errors
        })
        .finally(() => {
          isRefreshing = false;
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axios;
