import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface GetDepartmentsPayload {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface Department {
  id?: number;
  name: string;
  description: string;
  isOvertimeAllowed: boolean;
  isHO: boolean;
  isEnabled: boolean;
  isDeleted: boolean;
  sortOrder: number;
}

export interface DepartmentState {
  data: Department[];
  selectedDepartment: Department | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: DepartmentState = {
  data: [],
  selectedDepartment: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  loading: false,
  error: null,
};

// =================== Thunks ===================

export const GetAllDepartments = createAsyncThunk(
  'department/getAll',
  async (payload: GetDepartmentsPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDepartment/GetAll`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const GetDepartmentById = createAsyncThunk<Department, number>(
  'department/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRDepartment/GetById?id=${id}`);
      const res = response.data;

      if (res.status || res.id) {
        return res.data || res;
      } else {
        return rejectWithValue(res.message || 'Department not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const AddDepartment = createAsyncThunk<Department, Partial<Department>>(
  'department/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDepartment/Add`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Department added successfully!');
        return res.data as Department;
      } else {
        toast.error(res.message || 'Failed to add department');
        return rejectWithValue(res.message || 'Failed to add department');
      }
    } catch (error: any) {
      toast.error('Error adding department!');
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const UpdateDepartment = createAsyncThunk<Department, Partial<Department>>(
  'department/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDepartment/Update`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Department updated successfully!');
        return res.data as Department;
      } else {
        toast.error(res.message || 'Failed to update department');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating department');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const DeleteDepartment = createAsyncThunk<number, number>(
  'department/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRDepartment/Delete?id=${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Department deleted successfully!');
        return id;
      } else {
        toast.error(res.message || 'Failed to delete department');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error deleting department');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================== Slice ===================
const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get All Departments
    builder
      .addCase(GetAllDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllDepartments.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Department
    builder
      .addCase(AddDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.loading = false;
        // Optionally insert at top or bottom (push vs unshift)
        state.data.unshift(action.payload);
      })
      .addCase(AddDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Department By Id
    builder
      .addCase(GetDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDepartment = null;
      })
      .addCase(GetDepartmentById.fulfilled, (state, action: PayloadAction<Department>) => {
        state.loading = false;
        state.selectedDepartment = action.payload;
      })
      .addCase(GetDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Department
    builder
      .addCase(UpdateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.loading = false;
        const index = state.data.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(UpdateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Department
    builder
      .addCase(DeleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteDepartment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((d) => d.id !== action.payload);
      })
      .addCase(DeleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default departmentSlice.reducer;
