import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface GetEmployeeTypePayload {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface EmployeeType {
  id?: number;
  name: string;
  sortOrder: number;
}

export interface EmployeeTypeState {
  data: EmployeeType[];
  selectedEmployeeType: EmployeeType | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeTypeState = {
  data: [],
  selectedEmployeeType: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  loading: false,
  error: null,
};

export const GetAllEmployeeType = createAsyncThunk(
  'employeeType/getAll',
  async (payload: GetEmployeeTypePayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmployeeType/GetAll`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const GetEmployeeTypeById = createAsyncThunk<EmployeeType, number>(
  'employeeType/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HREmployeeType/GetById?id=${id}`);
      const res = response.data;
      if (res.status || res.id) {
        return res.data || res;
      } else {
        return rejectWithValue(res.message || 'Employee type not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const AddEmployeeType = createAsyncThunk<EmployeeType, Partial<EmployeeType>>(
  'employeeType/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmployeeType/Add`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee type added successfully');
        return res.data as EmployeeType;
      } else {
        toast.error(res.message || 'Failed to add employee type');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error adding employee type');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const UpdateEmployeeType = createAsyncThunk<EmployeeType, Partial<EmployeeType>>(
  'employeeType/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmployeeType/Update`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee type updated successfully');
        return res.data as EmployeeType;
      } else {
        toast.error(res.message || 'Failed to update employee type');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating employee type');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const DeleteEmployeeType = createAsyncThunk<number, number>(
  'employeeType/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HREmployeeType/Delete?id=${id}`);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee type deleted successfully');
        return id;
      } else {
        toast.error(res.message || 'Failed to delete employee type');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error deleting employee type');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const employeeTypeSlice = createSlice({
  name: 'employeeType',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(GetAllEmployeeType.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllEmployeeType.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(AddEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(AddEmployeeType.fulfilled, (state, action: PayloadAction<EmployeeType>) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(AddEmployeeType.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(GetEmployeeTypeById.pending, (state) => { state.loading = true; state.error = null; state.selectedEmployeeType = null; })
      .addCase(GetEmployeeTypeById.fulfilled, (state, action: PayloadAction<EmployeeType>) => {
        state.loading = false;
        state.selectedEmployeeType = action.payload;
      })
      .addCase(GetEmployeeTypeById.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(UpdateEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(UpdateEmployeeType.fulfilled, (state, action: PayloadAction<EmployeeType>) => {
        state.loading = false;
        const index = state.data.findIndex(d => d.id === action.payload.id);
        if (index !== -1) { state.data[index] = action.payload; }
      })
      .addCase(UpdateEmployeeType.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(DeleteEmployeeType.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(DeleteEmployeeType.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter(d => d.id !== action.payload);
      })
      .addCase(DeleteEmployeeType.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
  },
});

export default employeeTypeSlice.reducer;
