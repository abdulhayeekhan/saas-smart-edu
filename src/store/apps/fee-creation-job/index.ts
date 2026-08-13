import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

export interface FeeCreationJobSetting {
  id: number
  runTime: string
  dayOfMonth: number
  isEnabled: boolean
  dueDays: number
  userId: number
  lastRunDate: string | null
}

export interface FeeCreationJobLog {
  id: number
  runDate: string
  startTime: string
  endTime: string
  totalStudents: number
  successCount: number
  failureCount: number
  status: string
  errorMessage: string | null
}

export interface FeeCreationJobState {
  setting: FeeCreationJobSetting | null
  logs: FeeCreationJobLog[]
  loading: boolean
}

// 👉 Get Job Setting
export const FeeCreationGetJobSetting = createAsyncThunk<FeeCreationJobSetting>(
  'feeCreationJob/getSetting',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeInvoiceJob/GetJobSetting`)

      if (data.status) return data.data as FeeCreationJobSetting

      toast.error(data.message || 'Failed to load job setting')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Job Setting
export const FeeCreationUpdateJobSetting = createAsyncThunk<any, FeeCreationJobSetting>(
  'feeCreationJob/updateSetting',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/FeeInvoiceJob/UpdateJobSetting`, payload)

      if (data.status) {
        toast.success(data.message || 'Job settings updated successfully')
        dispatch(FeeCreationGetJobSetting())
        return data.data
      }

      toast.error(data.message || 'Failed to update job setting')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Job Logs
export const FeeCreationGetJobLogs = createAsyncThunk<FeeCreationJobLog[]>(
  'feeCreationJob/getLogs',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeInvoiceJob/GetJobLogs`)

      if (data.status) return data.data as FeeCreationJobLog[]

      toast.error(data.message || 'Failed to load job logs')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

const initialState: FeeCreationJobState = {
  setting: null,
  logs: [],
  loading: false,
}

const feeCreationJobSlice = createSlice({
  name: 'feeCreationJob',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(FeeCreationGetJobSetting.pending, state => {
        state.loading = true
      })
      .addCase(FeeCreationGetJobSetting.fulfilled, (state, action) => {
        state.loading = false
        state.setting = action.payload
      })
      .addCase(FeeCreationGetJobSetting.rejected, state => {
        state.loading = false
      })
      .addCase(FeeCreationUpdateJobSetting.pending, state => {
        state.loading = true
      })
      .addCase(FeeCreationUpdateJobSetting.fulfilled, state => {
        state.loading = false
      })
      .addCase(FeeCreationUpdateJobSetting.rejected, state => {
        state.loading = false
      })
      .addCase(FeeCreationGetJobLogs.pending, state => {
        state.loading = true
      })
      .addCase(FeeCreationGetJobLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload
      })
      .addCase(FeeCreationGetJobLogs.rejected, state => {
        state.loading = false
      })
  }
})

export default feeCreationJobSlice.reducer
