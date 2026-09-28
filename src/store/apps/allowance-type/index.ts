import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface GetAllowanceTypesPayload {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface AllowanceType {
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

export interface AllowanceTypeState {
  data: AllowanceType[];
  selectedAllowanceType: AllowanceType | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: AllowanceTypeState = {
  data: [],
  selectedAllowanceType: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  loading: false,
  error: null,
};

// =================== Thunks ===================

export const GetAllAllowanceTypes = createAsyncThunk(
  'allowanceType/getAll',
  async (payload: GetAllowanceTypesPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRAllowanceType/GetAll`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const GetAllowanceTypeById = createAsyncThunk<AllowanceType, number>(
  'allowanceType/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRAllowanceType/GetById?id=${id}`);
      const res = response.data;

      if (res.status) {
        return res.data as AllowanceType;
      }
      return rejectWithValue(res.message || 'Allowance type not found');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Something went wrong');
    }
  }
);

export const AddAllowanceType = createAsyncThunk<AllowanceType, Partial<AllowanceType>>(
  'allowanceType/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRAllowanceType/Add`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Allowance type added successfully!');
        return res.data as AllowanceType;
      }
      toast.error(res.message || 'Failed to add allowance type');
      return rejectWithValue(res.message || 'Failed to add allowance type');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error adding allowance type!';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const UpdateAllowanceType = createAsyncThunk<AllowanceType, Partial<AllowanceType>>(
  'allowanceType/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRAllowanceType/Update`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Allowance type updated successfully!');
        return res.data as AllowanceType;
      }
      toast.error(res.message || 'Failed to update allowance type');
      return rejectWithValue(res.message || 'Failed to update allowance type');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error updating allowance type';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const DeleteAllowanceType = createAsyncThunk<number, number>(
  'allowanceType/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRAllowanceType/Delete?id=${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Allowance type deleted successfully!');
        return id;
      }
      toast.error(res.message || 'Failed to delete allowance type');
      return rejectWithValue(res.message || 'Failed to delete allowance type');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error deleting allowance type';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// =================== Slice ===================
const allowanceTypeSlice = createSlice({
  name: 'allowanceType',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllAllowanceTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllAllowanceTypes.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllAllowanceTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetAllowanceTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedAllowanceType = null;
      })
      .addCase(GetAllowanceTypeById.fulfilled, (state, action: PayloadAction<AllowanceType>) => {
        state.loading = false;
        state.selectedAllowanceType = action.payload;
      })
      .addCase(GetAllowanceTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(AddAllowanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddAllowanceType.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AddAllowanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(UpdateAllowanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateAllowanceType.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(UpdateAllowanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(DeleteAllowanceType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteAllowanceType.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((a) => a.id !== action.payload);
      })
      .addCase(DeleteAllowanceType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default allowanceTypeSlice.reducer;
