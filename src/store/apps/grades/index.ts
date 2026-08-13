import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface Grade {
  id?: number
  name: string
  sortOrder?: number
  regionId?: number
  [key: string]: any
}

export interface GradeState {
  data: Grade[]
  single: Grade | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Grades (Optionally by regionId)
export const GetGrades = createAsyncThunk<Grade[], number | { regionId?: number } | undefined>(
  'grade/getAll',
  async (param, { rejectWithValue }) => {
    try {
      let regionId: number | undefined
      if (typeof param === 'number') {
        regionId = param
      } else if (param && typeof param === 'object') {
        regionId = param.regionId
      }

      const url = regionId
        ? `${baseURL}/api/Grade/GetGrades?regionId=${regionId}`
        : `${baseURL}/api/Grade/GetGrades`

      const { data } = await axios.get(url)

      if (data.status) return data.data as Grade[]
      toast.error(data.message || 'Failed to load grades')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Grade by ID
export const GetGrade = createAsyncThunk<Grade, number>(
  'grade/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Grade/GetGrade?id=${id}`)
      if (data.status) return data.data as Grade

      toast.error(data.message || 'Failed to load grade')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Grade
export const AddGrade = createAsyncThunk<any, Grade>(
  'grade/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Grade/AddGrade`, payload)

      if (data.status) {
        toast.success('Grade added successfully')
        if (payload.regionId) {
          dispatch(GetGrades(payload.regionId))
        } else {
          dispatch(GetGrades())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to add grade')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Grade
export const UpdateGrade = createAsyncThunk<any, Grade>(
  'grade/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`${baseURL}/api/Grade/UpdateGrade`, payload)

      if (data.status) {
        toast.success('Grade updated successfully')
        if (payload.regionId) {
          dispatch(GetGrades(payload.regionId))
        } else {
          dispatch(GetGrades())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to update grade')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Delete Grade
export const DeleteGrade = createAsyncThunk<any, number>(
  'grade/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(`${baseURL}/api/Grade/Delete?id=${id}`)

      if (data.status) {
        toast.success('Grade deleted successfully')
        dispatch(GetGrades())
        return id
      }

      toast.error(data.message || 'Failed to delete grade')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: GradeState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const GradeSlice = createSlice({
  name: 'grade',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetGrades.pending, state => {
        state.loading = true
      })
      .addCase(GetGrades.fulfilled, (state, action: PayloadAction<Grade[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetGrades.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

    // ---------- Get Single ----------
      .addCase(GetGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.single = action.payload
      })

    // ---------- Add / Update / Delete ----------
      .addCase(AddGrade.pending, state => { state.loading = true })
      .addCase(AddGrade.fulfilled, state => { state.loading = false })

      .addCase(UpdateGrade.pending, state => { state.loading = true })
      .addCase(UpdateGrade.fulfilled, state => { state.loading = false })

      .addCase(DeleteGrade.pending, state => { state.loading = true })
      .addCase(DeleteGrade.fulfilled, state => { state.loading = false })
  }
})

export default GradeSlice.reducer
