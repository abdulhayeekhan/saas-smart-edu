import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface Country {
  id?: number
  name: string
  isEnabled: boolean
  tblProvinces: null | any[]
}

export interface CountryState {
  data: Country[]
  single: Country | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Countries
export const GetCountries = createAsyncThunk<Country[]>(
  'country/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/address/getcountries`)
      if (data.status) return data.data as Country[]
      toast.error(data.message || 'Failed to load countries')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)


// =============== INITIAL STATE ===============
const initialState: CountryState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const CountrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetCountries.pending, state => {
        state.loading = true
      })
      .addCase(GetCountries.fulfilled, (state, action: PayloadAction<Country[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetCountries.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

  }
})

export default CountrySlice.reducer
