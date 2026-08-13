import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================

export interface DiscountType {
  id?: number
  name: string
  description?: string
  isEnabled: boolean
  isDeleted?: boolean
  isPercentage: boolean
  amount: number
}

export interface DiscountTypeState {
  data: DiscountType[]
  single: DiscountType | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Discount Types
export const GetDiscountTypes = createAsyncThunk<DiscountType[]>(
  'discountType/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/DiscountType/GetAll`
      )

      if (data.status) return data.data as DiscountType[]

      toast.error(data.message || 'Failed to load discount types')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Discount Type
export const GetDiscountType = createAsyncThunk<DiscountType, number>(
  'discountType/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/DiscountType/GetById?id=${id}`
      )

      if (data.status) return data.data as DiscountType

      toast.error(data.message || 'Failed to load discount type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Discount Type
export const AddDiscountType = createAsyncThunk<any, DiscountType>(
  'discountType/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/DiscountType/Add`,
        payload
      )

      if (data.status) {
        toast.success('Discount type added successfully')
        dispatch(GetDiscountTypes())
        return data.data
      }

      toast.error(data.message || 'Failed to add discount type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Discount Type
export const UpdateDiscountType = createAsyncThunk<any, DiscountType>(
  'discountType/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${baseURL}/api/DiscountType/Update`,
        payload
      )

      if (data.status) {
        toast.success('Discount type updated successfully')
        dispatch(GetDiscountTypes())
        return data.data
      }

      toast.error(data.message || 'Failed to update discount type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============

const initialState: DiscountTypeState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============

const DiscountTypeSlice = createSlice({
  name: 'discountType',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // ---------- Get All ----------
      .addCase(GetDiscountTypes.pending, state => {
        state.loading = true
      })
      .addCase(
        GetDiscountTypes.fulfilled,
        (state, action: PayloadAction<DiscountType[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetDiscountTypes.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Get Single ----------
      .addCase(GetDiscountType.fulfilled, (state, action: PayloadAction<DiscountType>) => {
        state.single = action.payload
      })

      // ---------- Add / Update ----------
      .addCase(AddDiscountType.pending, state => {
        state.loading = true
      })
      .addCase(AddDiscountType.fulfilled, state => {
        state.loading = false
      })

      .addCase(UpdateDiscountType.pending, state => {
        state.loading = true
      })
      .addCase(UpdateDiscountType.fulfilled, state => {
        state.loading = false
      })
  },
})

export default DiscountTypeSlice.reducer
