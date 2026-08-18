import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ✅ Types
export interface Campus {
  id?: number
  name: string
  campusKey: string
  shortName: string
  address: string
  cityId: number
  latitude: string
  lngitude: string
  contactNumber: string
  email: string
  regionId: number
  addedBy: number
  addedAt: string
  isEnabled: boolean
  isDeleted: boolean
  hasUploaded: boolean
  allowBulkImport: boolean
  [key: string]: any
}

export interface CampusState {
  data: Campus[]       // always array
  selectedCampus?: Campus | null // optional for single campus fetch
  message: string
  status: boolean
  loading: boolean
}

// ✅ Initial state
const initialState: CampusState = {
  data: [],
  selectedCampus: null,
  message: '',
  status: false,
  loading: false,
}

// ✅ Thunks
export const GetAllCampus = createAsyncThunk<Campus[], any>(
  'campus/getAll',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/campus/getall`, body)
      return data.data as Campus[]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const GetCampusByID = createAsyncThunk<Campus, number>(
  'campus/getById',
  async (id, { rejectWithValue }) => {
    if (!id || Number(id) <= 0) {
      return rejectWithValue('Invalid Campus ID')
    }
    try {
      const { data } = await axios.get(`${baseURL}/api/campus/getcampusbyid?id=${id}`)
      return (data.data || data) as Campus
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const AddCampus = createAsyncThunk<Campus, Partial<Campus>>(
  'campus/add',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/campus/addcampus`, body)
      const res = response.data
      if (res.status) {
        toast.success('🎉 Campus has been added successfully!')
        return (res.data || body) as Campus
      } else {
        toast.error(res.message || 'Failed to add campus')
        return rejectWithValue(res.message || 'Failed to add campus')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add campus')
      return rejectWithValue(error.message)
    }
  }
)

export const UpdateCampus = createAsyncThunk<Campus, Partial<Campus>>(
  'campus/update',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/campus/updatecampus`, body)
      const res = response.data
      if (res.status) {
        toast.success('Campus updated successfully!')
        return (res.data || body) as Campus
      } else {
        toast.error(res.message || 'Failed to update campus')
        return rejectWithValue(res.message || 'Failed to update campus')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update campus')
      return rejectWithValue(error.message)
    }
  }
)

// ✅ Slice
const CampusSlice = createSlice({
  name: 'campus',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Get All
      .addCase(GetAllCampus.pending, state => { state.loading = true })
      .addCase(GetAllCampus.fulfilled, (state, action: PayloadAction<Campus[]>) => {
        state.loading = false
        state.data = action.payload
        state.status = true
      })
      .addCase(GetAllCampus.rejected, state => { state.loading = false; state.status = false })

      // Get by ID
      .addCase(GetCampusByID.pending, state => { state.loading = true })
      .addCase(GetCampusByID.fulfilled, (state, action: PayloadAction<Campus>) => {
        state.loading = false
        state.selectedCampus = action.payload
        state.status = true
      })
      .addCase(GetCampusByID.rejected, state => { state.loading = false; state.status = false })

      // Add Campus
      .addCase(AddCampus.pending, state => { state.loading = true })
      .addCase(AddCampus.fulfilled, (state, action: PayloadAction<Campus>) => {
        state.loading = false
        state.data.unshift(action.payload)
        state.status = true
      })
      .addCase(AddCampus.rejected, state => { state.loading = false; state.status = false })

      // Update Campus
      .addCase(UpdateCampus.pending, state => { state.loading = true })
      .addCase(UpdateCampus.fulfilled, (state, action: PayloadAction<Campus>) => {
        state.loading = false
        if (action.payload) {
          state.data = state.data.map(c =>
            c.id === action.payload?.id ? { ...c, ...action.payload } : c
          )
        }
        state.status = true
      })
      .addCase(UpdateCampus.rejected, state => { state.loading = false; state.status = false })
  },
})

export default CampusSlice.reducer
