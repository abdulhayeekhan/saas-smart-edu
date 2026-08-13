import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface SecurityDepositPayload {
  admissionId: number;
  amount: number;
  actionDate: string;
  userId: number;
  accountSettingType: string;
}

export interface DepositDetail {
  id: number;
  admissionId: number;
  amount: number;
  generatedAt: string;
  depositedAt: string | null;
  isRefund: boolean;
  refundAt: string | null;
  isAdjusted: boolean;
  tblSMSAdmission: any;
}

export interface SecurityDepositResponse {
  status: boolean;
  message: string;
  data: any;
}

export interface SecurityDepositState {
  loading: boolean;
  error: string | null;
  status: boolean;
  message: string | null;
  depositDetail: DepositDetail | null;
}

const initialState: SecurityDepositState = {
  loading: false,
  error: null,
  status: false,
  message: null,
  depositDetail: null,
};

export const GenerateReceivable = createAsyncThunk<SecurityDepositResponse, SecurityDepositPayload>(
  'securityDeposit/generateReceivable',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/SecurityDeposit/GenerateReceivable`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Security deposit receivable generated successfully');
        return res;
      } else {
        toast.error(res.message || 'Failed to generate security deposit receivable');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const ReceiveDeposit = createAsyncThunk<SecurityDepositResponse, SecurityDepositPayload>(
  'securityDeposit/receiveDeposit',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/SecurityDeposit/ReceiveDeposit`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Security deposit received successfully');
        return res;
      } else {
        toast.error(res.message || 'Failed to receive security deposit');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const RefundDeposit = createAsyncThunk<SecurityDepositResponse, SecurityDepositPayload>(
  'securityDeposit/refundDeposit',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/SecurityDeposit/RefundDeposit`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Security deposit refunded successfully');
        return res;
      } else {
        toast.error(res.message || 'Failed to refund security deposit');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const GetDepositDetail = createAsyncThunk<SecurityDepositResponse, number>(
  'securityDeposit/getDepositDetail',
  async (admissionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/SecurityDeposit/GetDepositDetail/${admissionId}`);
      const res = response.data;
      if (res.status === true) {
        return res;
      } else {
        toast.error(res.message || 'Failed to fetch deposit detail');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const securityDepositSlice = createSlice({
  name: 'securityDeposit',
  initialState,
  reducers: {
    resetSecurityDepositState: (state) => {
      state.loading = false;
      state.error = null;
      state.status = false;
      state.message = null;
      state.depositDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GenerateReceivable
      .addCase(GenerateReceivable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = false;
      })
      .addCase(GenerateReceivable.fulfilled, (state, action) => {
        state.loading = false;
        state.status = true;
        state.message = action.payload.message;
      })
      .addCase(GenerateReceivable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = false;
      })
      // ReceiveDeposit
      .addCase(ReceiveDeposit.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = false;
      })
      .addCase(ReceiveDeposit.fulfilled, (state, action) => {
        state.loading = false;
        state.status = true;
        state.message = action.payload.message;
      })
      .addCase(ReceiveDeposit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = false;
      })
      // RefundDeposit
      .addCase(RefundDeposit.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = false;
      })
      .addCase(RefundDeposit.fulfilled, (state, action) => {
        state.loading = false;
        state.status = true;
        state.message = action.payload.message;
      })
      .addCase(RefundDeposit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = false;
      })
      // GetDepositDetail
      .addCase(GetDepositDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.depositDetail = null;
      })
      .addCase(GetDepositDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.depositDetail = action.payload.data;
      })
      .addCase(GetDepositDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSecurityDepositState } = securityDepositSlice.actions;
export default securityDepositSlice.reducer;
