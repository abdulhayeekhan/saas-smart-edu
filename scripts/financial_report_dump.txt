import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface BranchExpenseReportFilter {
  campusId: number;
  fromDate: string;
  toDate: string;
}

export interface BranchExpenseReportData {
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
  createdByName: string;
  createdAt: string;
}

export interface FinancialReportState {
  branchExpenseReport: BranchExpenseReportData[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: FinancialReportState = {
  branchExpenseReport: null,
  loading: false,
  error: null,
};

export const GetBranchExpenseReport = createAsyncThunk<BranchExpenseReportData[], BranchExpenseReportFilter>(
  'financialReport/getBranchExpenseReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: BranchExpenseReportData[], status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/FinancialReport/BranchExpenseReport`,
        filter
      );
      if (response.data.status) {
        return response.data.data;
      } else {
        toast.error(response.data.message || 'Failed to fetch branch expense report');
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      toast.error('Error fetching branch expense report');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const FinancialReportSlice = createSlice({
  name: 'financialReport',
  initialState,
  reducers: {
    clearBranchExpenseReport: (state) => {
      state.branchExpenseReport = null;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(GetBranchExpenseReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetBranchExpenseReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.branchExpenseReport = payload;
      })
      .addCase(GetBranchExpenseReport.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  }
});

export const { clearBranchExpenseReport } = FinancialReportSlice.actions;

export default FinancialReportSlice.reducer;
