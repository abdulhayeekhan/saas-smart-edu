import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL;

// --------------------
// Types
// --------------------
export interface Expense {
  id: number;
  expenseCategoryId: number;
  expenseCategoryName: string;
  amount: number;
  description: string;
  date: string;
  isAlreadyPaid: boolean;
  campusId: number;
  campusName: string;
  bankAccountId: number;
  bankAccountName: string;
  financialYearId: number;
  financialYearName: string;
  createdBy: number;
  createdByName: string | null;
  createdAt: string;
  modifiedBy: number | null;
  modifiedByName: string | null;
  modifiedAt: string | null;
  jVoucherId: number | null;
  pVoucherId: number | null;
}

export interface ExpenseState {
  data: Expense[];
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  message: string;
  status: boolean;
  loading: boolean;
}

export interface BookExpensePayload {
  expenseCategoryId: number;
  amount: number;
  description: string;
  date: string;
  isAlreadyPaid: boolean;
  campusId: number;
  bankAccountId: number;
  financialYearId: number;
  createdBy: number;
}

export interface GetExpensesPagedPayload {
  pageNo: number;
  pageSize: number;
  campusId: number;
  expenseCategoryId: number | null;
}

export interface UpdateExpensePayload {
  id: number;
  expenseCategoryId: number;
  amount: number;
  description: string;
  date: string;
  isAlreadyPaid: boolean;
  campusId: number;
  bankAccountId: number;
  financialYearId: number;
  modifiedBy: number;
}

// --------------------
// Async Thunks
// --------------------

// 👉 Book Expense
export const BookExpense = createAsyncThunk<any, BookExpensePayload>(
  'expense/book',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Expense/BookExpense`, body)
      if (response.data.status === true) {
        toast.success(response.data.message || 'Expense booked successfully.')
        return response.data.data
      } else {
        toast.error(response.data.message || 'Failed to book expense.')
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || String(error))
      return rejectWithValue(error)
    }
  }
)

// 👉 Get Expenses By Campus ID (Deprecated in favor of Paged version if needed)
export const GetExpensesByCampusId = createAsyncThunk<Expense[], number>(
  'expense/getByCampusId',
  async (campusId, { rejectWithValue }) => {
    try {
      const { data }: AxiosResponse<{ data: Expense[] }> = await axios.get(
        `${baseURL}/api/Expense/GetExpensesByCampusId/${campusId}`
      )
      return data.data
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 👉 Get Expenses Paged
export const GetExpensesPaged = createAsyncThunk<any, GetExpensesPagedPayload>(
  'expense/getPaged',
  async (body, { rejectWithValue }) => {
    try {
      const { data }: AxiosResponse<any> = await axios.post(
        `${baseURL}/api/Expense/GetExpensesPaged`,
        body
      )
      return data
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 👉 Update Expense
export const UpdateExpense = createAsyncThunk<any, UpdateExpensePayload>(
  'expense/update',
  async (body, { rejectWithValue }) => {
    console.log('expense update body:', body);
    try {

      const response = await axios.put(`${baseURL}/api/Expense/UpdateExpense`, body)
      if (response.data.status === true) {
        toast.success(response.data.message || 'Expense updated successfully.')
        return response.data.data
      } else {
        toast.error(response.data.message || 'Failed to update expense.')
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || String(error))
      return rejectWithValue(error)
    }
  }
)

// --------------------
// Initial State
// --------------------
const initialState: ExpenseState = {
  data: [],
  totalCount: 0,
  pageSize: 10,
  totalPages: 0,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
  message: '',
  status: false,
  loading: false
}

// --------------------
// Slice
// --------------------
const ExpenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // BookExpense
      .addCase(BookExpense.pending, state => {
        state.loading = true
      })
      .addCase(BookExpense.fulfilled, (state) => {
        state.loading = false
        state.status = true
      })
      .addCase(BookExpense.rejected, state => {
        state.loading = false
        state.status = false
      })

      // GetExpensesByCampusId
      .addCase(GetExpensesByCampusId.pending, state => {
        state.loading = true
      })
      .addCase(GetExpensesByCampusId.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload || []
        state.status = true
      })
      .addCase(GetExpensesByCampusId.rejected, state => {
        state.loading = false
        state.status = false
      })

      // GetExpensesPaged
      .addCase(GetExpensesPaged.pending, state => {
        state.loading = true
      })
      .addCase(GetExpensesPaged.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload.data || []
        state.totalCount = payload.totalCount
        state.pageSize = payload.pageSize
        state.totalPages = payload.totalPages
        state.currentPage = payload.currentPage
        state.hasNext = payload.hasNext
        state.hasPrevious = payload.hasPrevious
        state.status = true
      })
      .addCase(GetExpensesPaged.rejected, state => {
        state.loading = false
        state.status = false
      })

      // UpdateExpense
      .addCase(UpdateExpense.pending, state => {
        state.loading = true
      })
      .addCase(UpdateExpense.fulfilled, (state) => {
        state.loading = false
        state.status = true
      })
      .addCase(UpdateExpense.rejected, state => {
        state.loading = false
        state.status = false
      })
  }
})

export default ExpenseSlice.reducer
