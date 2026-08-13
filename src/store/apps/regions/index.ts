import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

export interface Region {
  id?: number
  name: string
  logoPath?: string | null
  directorId?: number | null
  directorName?: string | null
  createdAt?: string
  subscriptionFee?: number
  isFixed?: boolean
  subscriptionStart?: string
  subscriptionEnd?: string
  status?: string
  isEnabled?: boolean
  androidAppUrl?: string | null
  iosAppUrl?: string | null
  [key: string]: any
}

export interface RegionState {
  data: Region[]
  selectedRegion: Region | null
  message: string
  status: boolean
  loading: boolean
  error: string | null
}

// Get All Regions
export const GetAllRegions = createAsyncThunk<Region[], any>(
  'region/getAll',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Region/GetAll`, body || {})
      if (data.status) return data.data as Region[]
      toast.error(data.message || 'Failed to load regions')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Get Region By ID
export const GetRegionById = createAsyncThunk<Region, number>(
  'region/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Region/GetById?id=${id}`)
      if (data.status || data.id) return (data.data || data) as Region
      toast.error(data.message || 'Failed to load region')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Add Region
export const AddRegion = createAsyncThunk<Region, Partial<Region>>(
  'region/add',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Region/Add`, body)
      if (data.status) {
        toast.success(data.message || 'Region added successfully!')
        return data.data as Region
      }
      toast.error(data.message || 'Failed to add region')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message || 'Error adding region!')
      return rejectWithValue(error.message)
    }
  }
)

// Update Region
export const UpdateRegion = createAsyncThunk<Region, Partial<Region>>(
  'region/update',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Region/Update`, body)
      if (data.status) {
        toast.success(data.message || 'Region updated successfully!')
        return data.data as Region
      }
      toast.error(data.message || 'Failed to update region')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message || 'Error updating region!')
      return rejectWithValue(error.message)
    }
  }
)

// Delete Region
export const DeleteRegion = createAsyncThunk<number, number>(
  'region/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${baseURL}/api/Region/Delete?id=${id}`)
      if (data.status) {
        toast.success(data.message || 'Region deleted successfully!')
        return id
      }
      toast.error(data.message || 'Failed to delete region')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message || 'Error deleting region!')
      return rejectWithValue(error.message)
    }
  }
)

const initialState: RegionState = {
  data: [],
  selectedRegion: null,
  message: '',
  status: false,
  loading: false,
  error: null,
}

const RegionSlice = createSlice({
  name: 'region',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Get All Regions
      .addCase(GetAllRegions.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetAllRegions.fulfilled, (state, action: PayloadAction<Region[]>) => {
        state.loading = false
        state.data = action.payload
        state.status = true
      })
      .addCase(GetAllRegions.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.error = action.payload as string
        state.message = action.payload as string
      })

      // Get Region By ID
      .addCase(GetRegionById.pending, state => {
        state.loading = true
        state.error = null
        state.selectedRegion = null
      })
      .addCase(GetRegionById.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false
        state.selectedRegion = action.payload
      })
      .addCase(GetRegionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Add Region
      .addCase(AddRegion.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(AddRegion.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false
        if (action.payload) {
          state.data.unshift(action.payload)
        }
      })
      .addCase(AddRegion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update Region
      .addCase(UpdateRegion.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(UpdateRegion.fulfilled, (state, action: PayloadAction<Region>) => {
        state.loading = false
        if (action.payload) {
          const index = state.data.findIndex(r => r.id === action.payload.id)
          if (index !== -1) {
            state.data[index] = action.payload
          }
        }
      })
      .addCase(UpdateRegion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete Region
      .addCase(DeleteRegion.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(DeleteRegion.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        state.data = state.data.filter(r => r.id !== action.payload)
      })
      .addCase(DeleteRegion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default RegionSlice.reducer
