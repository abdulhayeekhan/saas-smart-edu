import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface GetDeductionsPayload {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface Deduction {
  id?: number;
  name: string;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  createdBy?: number;
  createdAt?: string;
  modifiedBy?: number | null;
  modifiedAt?: string | null;

  // Resolved by the API for the list view.
  debitAccountName?: string | null;
  debitAccountCode?: string | null;
  creditAccountName?: string | null;
  creditAccountCode?: string | null;
}

export interface DeductionState {
  data: Deduction[];
  selectedDeduction: Deduction | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: DeductionState = {
  data: [],
  selectedDeduction: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  loading: false,
  error: null,
};

// =================== Thunks ===================

export const GetAllDeductions = createAsyncThunk(
  'deduction/getAll',
  async (payload: GetDeductionsPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDeduction/GetAll`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const GetDeductionById = createAsyncThunk<Deduction, number>(
  'deduction/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRDeduction/GetById?id=${id}`);
      const res = response.data;

      if (res.status) {
        return res.data as Deduction;
      }
      return rejectWithValue(res.message || 'Deduction not found');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Something went wrong');
    }
  }
);

export const AddDeduction = createAsyncThunk<Deduction, Partial<Deduction>>(
  'deduction/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDeduction/Add`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Deduction added successfully!');
        return res.data as Deduction;
      }
      toast.error(res.message || 'Failed to add deduction');
      return rejectWithValue(res.message || 'Failed to add deduction');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error adding deduction!';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const UpdateDeduction = createAsyncThunk<Deduction, Partial<Deduction>>(
  'deduction/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDeduction/Update`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Deduction updated successfully!');
        return res.data as Deduction;
      }
      toast.error(res.message || 'Failed to update deduction');
      return rejectWithValue(res.message || 'Failed to update deduction');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error updating deduction';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const DeleteDeduction = createAsyncThunk<number, number>(
  'deduction/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRDeduction/Delete?id=${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Deduction deleted successfully!');
        return id;
      }
      toast.error(res.message || 'Failed to delete deduction');
      return rejectWithValue(res.message || 'Failed to delete deduction');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error deleting deduction';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// =================== Slice ===================
const deductionSlice = createSlice({
  name: 'deduction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllDeductions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllDeductions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllDeductions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetDeductionById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDeduction = null;
      })
      .addCase(GetDeductionById.fulfilled, (state, action: PayloadAction<Deduction>) => {
        state.loading = false;
        state.selectedDeduction = action.payload;
      })
      .addCase(GetDeductionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(AddDeduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddDeduction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AddDeduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(UpdateDeduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateDeduction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(UpdateDeduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(DeleteDeduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteDeduction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((d) => d.id !== action.payload);
      })
      .addCase(DeleteDeduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default deductionSlice.reducer;
