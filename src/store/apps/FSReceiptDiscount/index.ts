import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface FSReceiptDiscount {
  id?: number
  feeTypeId: number
  discountTypeId: number
  receiptDebitAccount: number
  // Included optional names for UI display mapping
  feeTypeName?: string
  discountTypeName?: string
  receiptAccountName?: string
}

export interface FSReceiptDiscountState {
  data: FSReceiptDiscount[]
  message: string
  status: boolean
  loading: boolean
}

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

// GET: api/FSReceiptDiscount/GetAll
export const GetAllDiscountSettings = createAsyncThunk<FSReceiptDiscount[]>(
  'fsReceiptDiscount/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FSReceiptDiscount/GetAll`)

      if (data.status) return data.data as FSReceiptDiscount[]
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// POST: /api/FSReceiptDiscount/Add
export const AddDiscountSettings = createAsyncThunk<any, FSReceiptDiscount[]>(
  'fsReceiptDiscount/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/FSReceiptDiscount/Add`,
        payload
      )

      if (data.status) {
        toast.success('Discount settings added successfully')
        dispatch(GetAllDiscountSettings())
        return data.data
      }

      toast.error(data.message || 'Failed to add discount settings')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// PUT: /api/FSReceiptDiscount/Update
export const UpdateDiscountSettings = createAsyncThunk<any, FSReceiptDiscount[]>(
  'fsReceiptDiscount/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${baseURL}/api/FSReceiptDiscount/Update`,
        payload
      )

      if (data.status) {
        toast.success('Discount settings updated successfully')
        dispatch(GetAllDiscountSettings())
        return data.data
      }

      toast.error(data.message || 'Failed to update discount settings')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// ------------------------------------------------------------------
// Slice
// ------------------------------------------------------------------
const initialState: FSReceiptDiscountState = {
  data: [],
  message: '',
  status: false,
  loading: false,
}

const FSReceiptDiscountSlice = createSlice({
  name: 'fsReceiptDiscount',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // ---------- Get All ----------
      .addCase(GetAllDiscountSettings.pending, state => {
        state.loading = true
      })
      .addCase(
        GetAllDiscountSettings.fulfilled,
        (state, action: PayloadAction<FSReceiptDiscount[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetAllDiscountSettings.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Add ----------
      .addCase(AddDiscountSettings.pending, state => {
        state.loading = true
      })
      .addCase(AddDiscountSettings.fulfilled, state => {
        state.loading = false
      })
      .addCase(AddDiscountSettings.rejected, (state, action) => {
        state.loading = false
        state.message = action.payload as string
      })

      // ---------- Update ----------
      .addCase(UpdateDiscountSettings.pending, state => {
        state.loading = true
      })
      .addCase(UpdateDiscountSettings.fulfilled, state => {
        state.loading = false
      })
      .addCase(UpdateDiscountSettings.rejected, (state, action) => {
        state.loading = false
        state.message = action.payload as string
      })
  },
})

export default FSReceiptDiscountSlice.reducer