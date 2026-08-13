import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL;

// --------------------
// Types
// --------------------
export interface ExpenseCategory {
  id: number;
  name: string;
  expenseAccountId: number;
  expenseAccountName: string | null;
  payableAccountId: number | null;
  payableAccountName: string | null;
  alwaysCreatePayable: boolean;
}

export interface ExpenseCategoryState {
  data: ExpenseCategory[] | ExpenseCategory | null;
  message: string;
  status: boolean;
  loading: boolean;
}

export interface AddExpenseCategoryPayload {
  name: string;
  expenseAccountId: number;
  payableAccountId: number | null;
  alwaysCreatePayable: boolean;
}

export interface UpdateExpenseCategoryPayload {
  id: number;
  name: string;
  expenseAccountId: number;
  expenseAccountName?: string;
  payableAccountId: number | null;
  payableAccountName?: string;
  alwaysCreatePayable: boolean;
}

// --------------------
// Async Thunks
// --------------------
export const GetAllExpenseCategories = createAsyncThunk<ExpenseCategory[], void>(
  'expenseCategory/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data }: AxiosResponse<{ data: ExpenseCategory[] }> = await axios.get(
        `${baseURL}/api/Expense/GetAllCategories`
      )
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
)

export const AddExpenseCategory = createAsyncThunk<any, AddExpenseCategoryPayload>(
  'expenseCategory/add',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Expense/AddCategory`, body)
      if (response.data.status === true) {
        toast.success(response.data.message || 'Category added successfully.')
      } else {
        toast.error(response.data.message)
      }
      return response.data.data
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || String(error))
      return rejectWithValue(error)
    }
  }
)

export const UpdateExpenseCategory = createAsyncThunk<any, UpdateExpenseCategoryPayload>(
  'expenseCategory/update',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/Expense/UpdateCategory`, body)
      if (response.data.status === true) {
        toast.success(response.data.message || 'Category updated successfully.')
      } else {
        toast.error(response.data.message)
      }
      return response.data
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || String(error))
      return rejectWithValue(error)
    }
  }
)

export const DeleteExpenseCategory = createAsyncThunk<any, number>(
  'expenseCategory/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/Expense/DeleteCategory/${id}`)
      if (response.data.status === true) {
        toast.success(response.data.message || 'Category deleted successfully.')
      } else {
        toast.error(response.data.message)
      }
      return id
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || String(error))
      return rejectWithValue(error)
    }
  }
)

// --------------------
// Initial State
// --------------------
const initialState: ExpenseCategoryState = {
  data: [],
  message: '',
  status: false,
  loading: false
}

// --------------------
// Slice
// --------------------
const ExpenseCategorySlice = createSlice({
  name: 'expenseCategory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // GetAllExpenseCategories
      .addCase(GetAllExpenseCategories.pending, state => {
        state.loading = true
      })
      .addCase(GetAllExpenseCategories.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload
        state.status = true
        state.message = ''
      })
      .addCase(GetAllExpenseCategories.rejected, state => {
        state.status = false
        state.loading = false
      })

      // AddExpenseCategory
      .addCase(AddExpenseCategory.pending, state => {
        state.loading = true
      })
      .addCase(AddExpenseCategory.fulfilled, (state) => {
        state.loading = false
        state.status = true
      })
      .addCase(AddExpenseCategory.rejected, state => {
        state.loading = false
        state.status = false
      })

      // UpdateExpenseCategory
      .addCase(UpdateExpenseCategory.pending, state => {
        state.loading = true
      })
      .addCase(UpdateExpenseCategory.fulfilled, (state) => {
        state.loading = false
        state.status = true
      })
      .addCase(UpdateExpenseCategory.rejected, state => {
        state.loading = false
        state.status = false
      })

      // DeleteExpenseCategory
      .addCase(DeleteExpenseCategory.pending, state => {
        state.loading = true
      })
      .addCase(DeleteExpenseCategory.fulfilled, (state) => {
        state.loading = false
        state.status = true
      })
      .addCase(DeleteExpenseCategory.rejected, state => {
        state.loading = false
        state.status = false
      })
  }
})

export default ExpenseCategorySlice.reducer
