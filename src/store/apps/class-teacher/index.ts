import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface GetClassTeachersPayload {
  pageNo: number;
  pageSize: number;
  search: string;
  campusId?: number | null;
  gradeId?: number | null;
  sectionId?: number | null;
  employeeId?: number | null;
  isEnabled: boolean;
}

export interface ClassTeacher {
  id?: number;
  campusId: number;
  campusName?: string;
  gradeId: number;
  gradeName?: string;
  sectionId: number;
  sectionName?: string;
  employeeId: number;
  employeeName?: string;
  isEnabled: boolean;
  createdAt?: string;
}

export interface ClassTeacherState {
  data: ClassTeacher[];
  selectedClassTeacher: ClassTeacher | null;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: ClassTeacherState = {
  data: [],
  selectedClassTeacher: null,
  totalCount: 0,
  pageSize: 10,
  totalPages: 0,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
  loading: false,
  error: null,
};

// =================== Thunks ===================

export const GetAllClassTeachers = createAsyncThunk(
  'classTeacher/getAll',
  async (payload: GetClassTeachersPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Attendance/GetAllClassTeachers`, payload);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const GetClassTeacherById = createAsyncThunk<ClassTeacher, number>(
  'classTeacher/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/Attendance/GetClassTeacherById/${id}`);
      const res = response.data;
      if (res.status === true) {
        return res.data as ClassTeacher;
      } else {
        toast.error(res.message || 'Failed to get class teacher');
        return rejectWithValue(res.message || 'Failed to get class teacher');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error getting class teacher');
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const AddClassTeacher = createAsyncThunk<ClassTeacher, Partial<ClassTeacher>>(
  'classTeacher/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Attendance/AddClassTeacher`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Class teacher assigned successfully');
        return res.data as ClassTeacher;
      } else {
        toast.error(res.message || 'Failed to add class teacher');
        return rejectWithValue(res.message || 'Failed to add class teacher');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error adding class teacher!');
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const UpdateClassTeacher = createAsyncThunk<ClassTeacher, Partial<ClassTeacher>>(
  'classTeacher/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Attendance/UpdateClassTeacher`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Class teacher mapping updated successfully');
        return res.data as ClassTeacher;
      } else {
        toast.error(res.message || 'Failed to update class teacher');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating class teacher');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const DeleteClassTeacher = createAsyncThunk<number, number>(
  'classTeacher/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/Attendance/DeleteClassTeacher/${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Class teacher mapping deleted successfully');
        return id;
      } else {
        toast.error(res.message || 'Failed to delete class teacher');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting class teacher');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================== Slice ===================
const classTeacherSlice = createSlice({
  name: 'classTeacher',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get All
    builder
      .addCase(GetAllClassTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllClassTeachers.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pageSize = action.payload.pageSize || 10;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 0;
        state.hasNext = action.payload.hasNext || false;
        state.hasPrevious = action.payload.hasPrevious || false;
      })
      .addCase(GetAllClassTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get By Id
    builder
      .addCase(GetClassTeacherById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetClassTeacherById.fulfilled, (state, action: PayloadAction<ClassTeacher>) => {
        state.loading = false;
        state.selectedClassTeacher = action.payload;
      })
      .addCase(GetClassTeacherById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add
    builder
      .addCase(AddClassTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddClassTeacher.fulfilled, (state, action: PayloadAction<ClassTeacher>) => {
        state.loading = false;
        state.data.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(AddClassTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(UpdateClassTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateClassTeacher.fulfilled, (state, action: PayloadAction<ClassTeacher>) => {
        state.loading = false;
        const index = state.data.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(UpdateClassTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(DeleteClassTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteClassTeacher.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((d) => d.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(DeleteClassTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default classTeacherSlice.reducer;
