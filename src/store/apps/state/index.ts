import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface State {
  id?: number
  name: string
  isEnabled: boolean
  countryId: number
  tblCountry: null | any[]
  tblCities: null | any[]
}

export interface StateState {
  data: State[]
  single: State | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All States
export const GetStates = createAsyncThunk<State[]>(
  'state/getAll',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Address/GetProvinceByCountry?countryId=${id}`)
      if (data.status) return data.data as State[]
      toast.error(data.message || 'Failed to load states')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)


// =============== INITIAL STATE ===============
const initialState: StateState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const StateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetStates.pending, state => {
        state.loading = true
      })
      .addCase(GetStates.fulfilled, (state, action: PayloadAction<State[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetStates.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

  }
})

export default StateSlice.reducer
