import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface FinancialYearType {
  id: number
  name: string
  fromDate: string
  toDate: string
  isEnabled: boolean
}

export interface AccountBalanceType {
  accountId: number
  accountCode: string
  accountName: string
  accountLevel: number
  parentAccountId: number | null
  nature: string
  openingBalance: number
  closingBalance: number
}

export interface FinancialYearState {
  data: FinancialYearType[]
  single: FinancialYearType | null
  accountBalances: AccountBalanceType[]
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Financial Years
export const GetFinancialYears = createAsyncThunk<FinancialYearType[]>(
  'financialYear/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FinancialYear/GetFinancialYears`)

      if (data.status) return data.data as FinancialYearType[]

      toast.error(data.message || 'Failed to load financial years')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Financial Year by ID
export const GetFinancialYear = createAsyncThunk<FinancialYearType, number>(
  'financialYear/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FinancialYear/GetFinancialYear?id=${id}`)

      if (data.status) return data.data as FinancialYearType

      toast.error(data.message || 'Failed to load financial year')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Accounts Balance By Financial Year
export const GetAccountsBalanceByFinancialYear = createAsyncThunk<AccountBalanceType[], number>(
  'financialYear/getAccountsBalance',
  async (financialYearId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FinancialYear/GetAccountsBalanceByFinancialYear?financialYearId=${financialYearId}`)

      if (data.status) return data.data as AccountBalanceType[]

      toast.error(data.message || 'Failed to load accounts balance')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Financial Year
export const AddFinancialYear = createAsyncThunk<any, FinancialYearType>(
  'financialYear/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/FinancialYear/AddFinancialYear`, payload)

      if (data.status) {
        toast.success('Financial year added successfully')
        dispatch(GetFinancialYears()) 
        return data.data
      }

      toast.error(data.message || 'Failed to add financial year')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Financial Year
export const UpdateFinancialYear = createAsyncThunk<any, FinancialYearType>(
  'financialYear/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(`${baseURL}/api/FinancialYear/UpdateFinancialYear`, payload)

      if (data.status) {
        toast.success('Financial year updated successfully')
        dispatch(GetFinancialYears())
        return data.data
      }

      toast.error(data.message || 'Failed to update financial year')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Delete Financial Year
export const DeleteFinancialYear = createAsyncThunk<any, number>(
  'financialYear/delete',
  async (yearId, { rejectWithValue, dispatch }) => {
    try {
      // Note the parameter name change to 'yearId' as per your endpoint requirement
      const { data } = await axios.delete(`${baseURL}/api/FinancialYear/Delete?yearId=${yearId}`)

      if (data.status) {
        toast.success('Financial year deleted successfully')
        dispatch(GetFinancialYears())
        return yearId
      }

      toast.error(data.message || 'Failed to delete financial year')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: FinancialYearState = {
  data: [],
  single: null,
  accountBalances: [],
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const FinancialYearSlice = createSlice({
  name: 'financialYear',
  initialState,
  reducers: {
    // Optional: Clear single record state when closing a modal
    clearSingleYear: (state) => {
        state.single = null
    }
  },
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetFinancialYears.pending, state => {
        state.loading = true
      })
      .addCase(GetFinancialYears.fulfilled, (state, action: PayloadAction<FinancialYearType[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetFinancialYears.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

    // ---------- Get Single ----------
      .addCase(GetFinancialYear.fulfilled, (state, action: PayloadAction<FinancialYearType>) => {
        state.single = action.payload
      })

    // ---------- Get Accounts Balance ----------
      .addCase(GetAccountsBalanceByFinancialYear.pending, state => {
        state.loading = true
      })
      .addCase(GetAccountsBalanceByFinancialYear.fulfilled, (state, action: PayloadAction<AccountBalanceType[]>) => {
        state.loading = false
        state.status = true
        state.accountBalances = action.payload
      })
      .addCase(GetAccountsBalanceByFinancialYear.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

    // ---------- Add / Update / Delete (Loading States) ----------
      .addCase(AddFinancialYear.pending, state => { state.loading = true })
      .addCase(AddFinancialYear.fulfilled, state => { state.loading = false })

      .addCase(UpdateFinancialYear.pending, state => { state.loading = true })
      .addCase(UpdateFinancialYear.fulfilled, state => { state.loading = false })

      .addCase(DeleteFinancialYear.pending, state => { state.loading = true })
      .addCase(DeleteFinancialYear.fulfilled, state => { state.loading = false })
  }
})

export const { clearSingleYear } = FinancialYearSlice.actions
export default FinancialYearSlice.reducer