import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface OpeningBalanceType {
  id: number
  financialYearId: number
  accountId: number
  debitAmount: number
  creditAmount: number
  year: number
  addedBy: number
  addedAt: string
  modifiedBy: number
  modifiedAt: string
  campusId: number
  isHO: boolean
}

export interface OpeningBalanceState {
  data: OpeningBalanceType[]
  single: OpeningBalanceType | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All By Campus ID
interface GetAllParams {
  campusId: number
  financialYearId: number
}

export const GetAllByCampusId = createAsyncThunk<OpeningBalanceType[], GetAllParams>(
  'openingBalance/getAllByCampusId',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/OBV/GetAllByCampusId?campusId=${params.campusId}&financialYearId=${params.financialYearId}`)

      if (data.status) return data.data as OpeningBalanceType[]

      toast.error(data.message || 'Failed to load opening balances')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single By ID
export const GetById = createAsyncThunk<OpeningBalanceType, number>(
  'openingBalance/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/OBV/GetById?id=${id}`)

      if (data.status) return data.data as OpeningBalanceType

      toast.error(data.message || 'Failed to load opening balance')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Opening Balance
export const AddOpening = createAsyncThunk<any, OpeningBalanceType[]>(
  'openingBalance/add',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/OBV/AddOpening`, payload)

      if (data.status) {
        toast.success('Opening balance added successfully')
        return data.data
      }

      toast.error(data.message || 'Failed to add opening balance')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add HO Opening Balance
export const AddHOOpening = createAsyncThunk<any, OpeningBalanceType[]>(
  'openingBalance/addHO',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/HOOBV/AddOpening`, payload)

      if (data.status) {
        toast.success('Opening balance added successfully')
        return data.data
      }

      toast.error(data.message || 'Failed to add opening balance')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: OpeningBalanceState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const OpeningBalanceSlice = createSlice({
  name: 'openingBalance',
  initialState,
  reducers: {
    clearSingleOpeningBalance: (state) => {
        state.single = null
    }
  },
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetAllByCampusId.pending, state => {
        state.loading = true
      })
      .addCase(GetAllByCampusId.fulfilled, (state, action: PayloadAction<OpeningBalanceType[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetAllByCampusId.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

    // ---------- Get Single ----------
      .addCase(GetById.pending, state => {
        state.loading = true
      })
      .addCase(GetById.fulfilled, (state, action: PayloadAction<OpeningBalanceType>) => {
        state.loading = false
        state.single = action.payload
      })
      .addCase(GetById.rejected, state => {
        state.loading = false
      })

    // ---------- Add Opening Balance ----------
      .addCase(AddOpening.pending, state => { state.loading = true })
      .addCase(AddOpening.fulfilled, state => { state.loading = false })
      .addCase(AddOpening.rejected, state => { state.loading = false })

    // ---------- Add HO Opening Balance ----------
      .addCase(AddHOOpening.pending, state => { state.loading = true })
      .addCase(AddHOOpening.fulfilled, state => { state.loading = false })
      .addCase(AddHOOpening.rejected, state => { state.loading = false })
  }
})

export const { clearSingleOpeningBalance } = OpeningBalanceSlice.actions
export default OpeningBalanceSlice.reducer
