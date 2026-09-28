import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// ================= TYPES ==================

export interface AttendanceRecord {
  id: number;
  campusId: number;
  campusName: string;
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  admissionId: number;
  studentName: string;
  studentNumber: string;
  attendanceDate: string;
  status: number;
  statusName: string;
  remarks?: string | null;
  isEnabled: boolean;
  createdAt: string;
}

export interface AttendanceFilter {
  pageNo: number;
  pageSize: number;
  search?: string;
  campusId?: number | null;
  gradeId?: number | null;
  sectionId?: number | null;
  admissionId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
  status?: number | null;
  month?: number | null; // added month filter
}

export interface AttendanceState {
  data: AttendanceRecord[];
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
}

// =============== INITIAL STATE ===============

const initialState: AttendanceState = {
  data: [],
  totalCount: 0,
  pageSize: 100,
  totalPages: 1,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
  loading: false,
  error: null,
};

// =============== ASYNC THUNK ===============

export const GetAttendance = createAsyncThunk<any, AttendanceFilter>(
  'attendance/getAll',
  async (filter, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Attendance/GetAll`, filter);
      if (data.status) {
        return data;
      }
      toast.error(data.message || 'Failed to fetch attendance records');
      return rejectWithValue(data.message);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch attendance records';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// =============== SLICE ===============

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    resetAttendanceState: (state) => {
      state.data = [];
      state.totalCount = 0;
      state.pageSize = 100;
      state.totalPages = 1;
      state.currentPage = 1;
      state.hasNext = false;
      state.hasPrevious = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || [];
        state.totalCount = action.payload?.totalCount || 0;
        state.pageSize = action.payload?.pageSize || 100;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.currentPage || 1;
        state.hasNext = action.payload?.hasNext || false;
        state.hasPrevious = action.payload?.hasPrevious || false;
      })
      .addCase(GetAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
