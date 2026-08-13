import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface Religion {
  id?: number
  name: string
  isActive: boolean
}

export interface ReligionState {
  data: Religion[]
  single: Religion | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Religions
export const GetReligions = createAsyncThunk<Religion[]>(
  'religion/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Religion/GetReligions`)

      if (data.status) return data.data as Religion[]

      toast.error(data.message || 'Failed to load religions')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Religion by ID
export const GetReligion = createAsyncThunk<Religion, number>(
  'religion/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/Religion/GetReligion?id=${id}`
      )

      if (data.status) return data.data as Religion

      toast.error(data.message || 'Failed to load religion')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Religion
export const AddReligion = createAsyncThunk<any, Religion>(
  'religion/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/Religion/AddReligion`,
        payload
      )

      if (data.status) {
        toast.success('Religion added successfully')
        dispatch(GetReligions())
        return data.data
      }

      toast.error(data.message || 'Failed to add religion')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Religion
export const UpdateReligion = createAsyncThunk<any, Religion>(
  'religion/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${baseURL}/api/Religion/UpdateReligion`,
        payload
      )

      if (data.status) {
        toast.success('Religion updated successfully')
        dispatch(GetReligions())
        return data.data
      }

      toast.error(data.message || 'Failed to update religion')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Delete Religion
export const DeleteReligion = createAsyncThunk<any, number>(
  'religion/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(
        `${baseURL}/api/Religion/Delete?id=${id}`
      )

      if (data.status) {
        toast.success('Religion deleted successfully')
        dispatch(GetReligions())
        return id
      }

      toast.error(data.message || 'Failed to delete religion')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: ReligionState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const ReligionSlice = createSlice({
  name: 'religion',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // ---------- Get All ----------
      .addCase(GetReligions.pending, state => {
        state.loading = true
      })
      .addCase(
        GetReligions.fulfilled,
        (state, action: PayloadAction<Religion[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetReligions.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Get Single ----------
      .addCase(
        GetReligion.fulfilled,
        (state, action: PayloadAction<Religion>) => {
          state.single = action.payload
        }
      )

      // ---------- Add / Update / Delete ----------
      .addCase(AddReligion.pending, state => {
        state.loading = true
      })
      .addCase(AddReligion.fulfilled, state => {
        state.loading = false
      })

      .addCase(UpdateReligion.pending, state => {
        state.loading = true
      })
      .addCase(UpdateReligion.fulfilled, state => {
        state.loading = false
      })

      .addCase(DeleteReligion.pending, state => {
        state.loading = true
      })
      .addCase(DeleteReligion.fulfilled, state => {
        state.loading = false
      })
  },
})

export default ReligionSlice.reducer
