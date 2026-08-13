import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface SessionType {
  id?: number
  name: string
  description?: string
  calenderYear?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  regionId?: number
  tblRegion?: any
  [key: string]: any
}

export interface SessionState {
  data: SessionType[]
  single: SessionType | null
  currentSession: SessionType | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Sessions (Optionally by regionId)
export const GetSessions = createAsyncThunk<SessionType[], number | { regionId?: number } | undefined>(
  'session/getAll',
  async (param, { rejectWithValue }) => {
    try {
      let regionId: number | undefined
      if (typeof param === 'number') {
        regionId = param
      } else if (param && typeof param === 'object') {
        regionId = param.regionId
      }

      const url = regionId
        ? `${baseURL}/api/Session/GetSessions?regionId=${regionId}`
        : `${baseURL}/api/Session/GetSessions`

      const { data } = await axios.get(url)

      if (data.status) return data.data as SessionType[]

      toast.error(data.message || 'Failed to load sessions')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Current Session (Optionally by regionId)
export const GetCurrentSession = createAsyncThunk<SessionType, number | { regionId?: number } | undefined>(
  'session/getCurrent',
  async (param, { rejectWithValue }) => {
    try {
      let regionId: number | undefined
      if (typeof param === 'number') {
        regionId = param
      } else if (param && typeof param === 'object') {
        regionId = param.regionId
      }

      const url = regionId
        ? `${baseURL}/api/Session/GetCurrentSession?regionId=${regionId}`
        : `${baseURL}/api/Session/GetCurrentSession`

      const { data } = await axios.get(url)

      if (data.status || data.id) return (data.data || data) as SessionType

      toast.error(data.message || 'Failed to load current session')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Session by ID
export const GetSession = createAsyncThunk<SessionType, number>(
  'session/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Session/GetSession?id=${id}`)

      if (data.status) return data.data as SessionType

      toast.error(data.message || 'Failed to load session')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Session
export const AddSession = createAsyncThunk<any, SessionType>(
  'session/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Session/AddSession`, payload)

      if (data.status) {
        toast.success('Session added successfully')
        if (payload.regionId) {
          dispatch(GetSessions(payload.regionId))
        } else {
          dispatch(GetSessions())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to add session')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Session
export const UpdateSession = createAsyncThunk<any, SessionType>(
  'session/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`${baseURL}/api/Session/UpdateSession`, payload)

      if (data.status) {
        toast.success('Session updated successfully')
        if (payload.regionId) {
          dispatch(GetSessions(payload.regionId))
        } else {
          dispatch(GetSessions())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to update session')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Delete Session
export const DeleteSession = createAsyncThunk<any, number>(
  'session/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(`${baseURL}/api/Session/Delete?id=${id}`)

      if (data.status) {
        toast.success('Session deleted successfully')
        dispatch(GetSessions())
        return id
      }

      toast.error(data.message || 'Failed to delete session')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: SessionState = {
  data: [],
  single: null,
  currentSession: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const SessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetSessions.pending, state => {
        state.loading = true
      })
      .addCase(GetSessions.fulfilled, (state, action: PayloadAction<SessionType[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetSessions.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

    // ---------- Get Current ----------
      .addCase(GetCurrentSession.pending, state => {
        state.loading = true
      })
      .addCase(GetCurrentSession.fulfilled, (state, action: PayloadAction<SessionType>) => {
        state.loading = false
        state.currentSession = action.payload
      })
      .addCase(GetCurrentSession.rejected, (state, action) => {
        state.loading = false
        state.message = action.payload as string
      })

    // ---------- Get Single ----------
      .addCase(GetSession.fulfilled, (state, action: PayloadAction<SessionType>) => {
        state.single = action.payload
      })

    // ---------- Add / Update / Delete ----------
      .addCase(AddSession.pending, state => { state.loading = true })
      .addCase(AddSession.fulfilled, state => { state.loading = false })

      .addCase(UpdateSession.pending, state => { state.loading = true })
      .addCase(UpdateSession.fulfilled, state => { state.loading = false })

      .addCase(DeleteSession.pending, state => { state.loading = true })
      .addCase(DeleteSession.fulfilled, state => { state.loading = false })
  }
})

export default SessionSlice.reducer
