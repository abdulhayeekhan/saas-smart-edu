import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface City {
  id?: number
  name: string
  isEnabled: boolean
  provinceId: number
  countryId: number
  tblCountry: null | any[]
  tblProvince: null | any[]
}

export interface CityState {
  data: City[]
  single: City | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Cities
export const GetCities = createAsyncThunk<City[]>(
  'city/getAll',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Address/GetCityByProvince?provinceId=${id}`)
      if (data.status) return data.data as City[]
      toast.error(data.message || 'Failed to load cities')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)


// =============== INITIAL STATE ===============
const initialState: CityState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const CitySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetCities.pending, state => {
        state.loading = true
      })
      .addCase(GetCities.fulfilled, (state, action: PayloadAction<City[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetCities.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

  }
})

export default CitySlice.reducer
