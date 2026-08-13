import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface GetEmployeesPayload {
  pageNo: number;
  pageSize: number;
  search: string;
  campusId: number | null;
  departmentId: number | null;
  designationId: number | null;
  employeeTypeId: number | null;
  gender: number | null;
  isActive: boolean | null;
  joiningDateFrom?: string;
  joiningDateTo?: string;
}

export interface Employee {
  id?: number;
  campusId: number | null;
  employeeKey?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fatherName: string;
  email: string;
  departmentId: number | null;
  departmentName?: string | null;
  designationId: number | null;
  designationName?: string | null;
  dob: string;
  cnic: string;
  joiningDate: string;
  confirmationDate: string;
  employeeTypeId: number | null;
  employeeTypeName?: string | null;
  gender: number;
  martialStatus: number;
  repportToId: number | null;
  isActive: boolean;
  imageUrl: string;
  contactNumber: string;
  eobi: string;
  debitAccountId: number | null;
  paymentMode: string;
  bankBranchId: number | null;
  accountTitle: string;
  accountNumber: string;
  religionId: number | null;
  religionName?: string | null;
  campusName?: string | null;
  userId?: number | null;
}

export interface GetAllEmployeesResponse {
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  status: boolean;
  message: string;
  data: Employee[];
}

export interface CampusEmployeeState {
  data: Employee[];
  selectedEmployee: Employee | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
  generatedEmployeeKey: string | null;
}

const initialState: CampusEmployeeState = {
  data: [],
  selectedEmployee: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  loading: false,
  error: null,
  generatedEmployeeKey: null,
};

export const GetAllEmployees = createAsyncThunk<GetAllEmployeesResponse, GetEmployeesPayload>(
  'campusEmployee/getAll',
  async (payload: GetEmployeesPayload, { rejectWithValue }) => {
    try {
      const finalPayload = { ...payload } as any;
      
      // Remove joining dates if empty
      if (!finalPayload.joiningDateFrom) {
        delete finalPayload.joiningDateFrom;
      }
      if (!finalPayload.joiningDateTo) {
        delete finalPayload.joiningDateTo;
      }

      const response = await axios.post(`${baseURL}/api/HREmployee/GetAll`, finalPayload);
      const res = response.data;
      if (res.status === true) {
        return res;
      } else {
        return rejectWithValue(res.message || 'Failed to fetch employees');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const GetEmployeeById = createAsyncThunk<Employee, number>(
  'campusEmployee/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HREmployee/GetById?id=${id}`);
      const res = response.data;
      if (res.status === true || res.data) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Employee not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const AddEmployee = createAsyncThunk<Employee, Partial<Employee>>(
  'campusEmployee/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmployee/Add`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee added successfully');
        return res.data as Employee;
      } else {
        toast.error(res.message || 'Failed to add employee');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error adding employee');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const UpdateEmployee = createAsyncThunk<Employee, Partial<Employee>>(
  'campusEmployee/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmployee/Update`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee updated successfully');
        return res.data as Employee;
      } else {
        toast.error(res.message || 'Failed to update employee');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating employee');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const UpdateEmployeeStatus = createAsyncThunk<any, { employeeId: number; isActive: boolean }>(
  'campusEmployee/updateStatus',
  async ({ employeeId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/HREmployee/UpdateStatus?employeeId=${employeeId}&isActive=${isActive}`);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee status updated successfully');
        return { employeeId, isActive };
      } else {
        toast.error(res.message || 'Failed to update employee status');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating employee status');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const DeleteEmployee = createAsyncThunk<number, number>(
  'campusEmployee/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HREmployee/Delete?id=${id}`);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Employee deleted successfully');
        return id;
      } else {
        toast.error(res.message || 'Failed to delete employee');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error deleting employee');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const GenerateEmployeeKey = createAsyncThunk<string, number>(
  'campusEmployee/generateEmployeeKey',
  async (campusId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HREmployee/GenerateEmployeeKey?campusId=${campusId}`);
      const res = response.data;
      if (res.status === true && res.data) {
        return res.data.employeeKey;
      } else {
        return rejectWithValue(res.message || 'Failed to generate employee key');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

const campusEmployeeSlice = createSlice({
  name: 'campusEmployee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(GetAllEmployees.fulfilled, (state, action: PayloadAction<GetAllEmployeesResponse>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
      })
      .addCase(GetAllEmployees.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(AddEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(AddEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        if (action.payload) {
          state.data.unshift(action.payload);
        }
      })
      .addCase(AddEmployee.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(GetEmployeeById.pending, (state) => { state.loading = true; state.error = null; state.selectedEmployee = null; })
      .addCase(GetEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(GetEmployeeById.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(UpdateEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(UpdateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.data.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) { state.data[index] = { ...state.data[index], ...action.payload }; }
        }
      })
      .addCase(UpdateEmployee.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
      
    builder
      .addCase(UpdateEmployeeStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(UpdateEmployeeStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.data.findIndex((d) => d.id === action.payload.employeeId);
        if (index !== -1) { state.data[index].isActive = action.payload.isActive; }
      })
      .addCase(UpdateEmployeeStatus.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(DeleteEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(DeleteEmployee.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((d) => d.id !== action.payload);
      })
      .addCase(DeleteEmployee.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
      
    builder
      .addCase(GenerateEmployeeKey.pending, (state) => { state.loading = true; state.error = null; state.generatedEmployeeKey = null; })
      .addCase(GenerateEmployeeKey.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.generatedEmployeeKey = action.payload;
      })
      .addCase(GenerateEmployeeKey.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
  },
});

export default campusEmployeeSlice.reducer;
