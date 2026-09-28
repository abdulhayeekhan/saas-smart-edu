import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface HRLoanRequestCreateDto {
  campusId: number;
  employeeId: number;
  loanAmount: number;
  loanDate: string;
  deductionMonth: string;
  installmentsCount: number;
  remarks: string | null;
  createdBy: number;
}

export interface HRLoanRequestReviewDto {
  id: number;
  isApproved: boolean;
  remarks: string | null;
  reviewedBy: number;
}

export interface HRLoanRequestFilterDto {
  campusId: number | null;
  status: number | null;
  pageNo: number;
  pageSize: number;
}

export interface HRLoanRequest {
  id: number;
  campusId: number;
  campusName: string | null;
  employeeId: number;
  employeeName: string | null;
  designationName: string | null;
  loanAmount: number;
  loanDate: string;
  deductionMonth: string;
  installmentsCount: number;
  status: number;
  statusName: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface HRLoanRequestListResponse {
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  data: HRLoanRequest[];
}

interface State {
  data: HRLoanRequest[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  current: HRLoanRequest | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: State = {
  data: [],
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
  current: null,
  loading: false,
  saving: false,
  error: null,
};

const errorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || error.message || fallback;

export const AddLoanRequest = createAsyncThunk<HRLoanRequest, HRLoanRequestCreateDto>(
  'hrLoanRequest/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRLoanRequest/Add`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Loan request created successfully');
        return res.data;
      }
      toast.error(res.message || 'Unable to create loan request');
      return rejectWithValue(res.message);
    } catch (error: any) {
      const msg = errorMessage(error, 'Unable to create loan request');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const ReviewLoanRequest = createAsyncThunk<HRLoanRequest, HRLoanRequestReviewDto>(
  'hrLoanRequest/review',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRLoanRequest/Review`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Loan request reviewed successfully');
        return res.data;
      }
      toast.error(res.message || 'Unable to review loan request');
      return rejectWithValue(res.message);
    } catch (error: any) {
      const msg = errorMessage(error, 'Unable to review loan request');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const GetAllLoanRequests = createAsyncThunk<HRLoanRequestListResponse, HRLoanRequestFilterDto>(
  'hrLoanRequest/getAll',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRLoanRequest/GetAll`, payload);
      const res = response.data;
      if (res.status === true) {
        return res;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load loan requests'));
    }
  }
);

export const GetLoanRequestById = createAsyncThunk<HRLoanRequest, number>(
  'hrLoanRequest/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRLoanRequest/GetById/${id}`);
      const res = response.data;
      if (res.status === true) {
        return res.data;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load loan request'));
    }
  }
);

export const DeleteLoanRequest = createAsyncThunk<number, number>(
  'hrLoanRequest/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRLoanRequest/Delete/${id}`);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Loan request deleted');
        return id;
      }
      toast.error(res.message || 'Unable to delete loan request');
      return rejectWithValue(res.message);
    } catch (error: any) {
      const msg = errorMessage(error, 'Unable to delete loan request');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const hrLoanRequestSlice = createSlice({
  name: 'hrLoanRequest',
  initialState,
  reducers: {
    clearCurrentLoanRequest: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetAllLoanRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllLoanRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(GetAllLoanRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetLoanRequestById.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetLoanRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(GetLoanRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder.addCase(DeleteLoanRequest.fulfilled, (state, action) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    });

    [AddLoanRequest, ReviewLoanRequest].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.saving = false;
          if (thunk.typePrefix === 'hrLoanRequest/review') {
             const index = state.data.findIndex(x => x.id === action.payload.id);
             if (index !== -1) {
                state.data[index] = action.payload;
             }
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload as string;
        });
    });
  },
});

export const { clearCurrentLoanRequest } = hrLoanRequestSlice.actions;
export default hrLoanRequestSlice.reducer;
