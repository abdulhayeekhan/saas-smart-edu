import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// ---------- Types ----------
export interface VoucherDetail {
  creditAccountId: number | null;
  debitAccountId: number | null;
  debitAmount: number;
  creditAmount: number;
  description: string;
  cheaqueNo: string;
  referenceId: number;
  referenceTypeId: number;
  classId: number;
  departmentId: number;
  budgetId: number;
}

export interface Voucher {
  id?: number; // Added for findIndex/updates
  regionId: number | null;
  voucherDate: string;
  voucherNumber?: number;
  isPosted: boolean;
  postedDate: string;
  voucherTypeId: number;
  voucherYear: number;
  financialYearId: number;
  reference: number;
  isReversed: boolean;
  totalAmount: number;
  createdBy: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
  details?: VoucherDetail[];
}

export interface VoucherState {
  data: Voucher[]; // Strictly an array now
  status: boolean;
  loading: boolean;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface VoucherResponse {
  data: Voucher[];
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  status: boolean;
  message: string;
}

// ---------- Initial State ----------
const initialState: VoucherState = {
  data: [],
  status: false,
  loading: false,
  totalCount: 0,
  pageSize: 25,
  totalPages: 0,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
};

// ---------- Async Thunks ----------

// Get All with Pagination
export const GetJVVouchersList = createAsyncThunk<VoucherResponse, any>(
  "jvvoucher/GetJVVouchersList",
  async (body) => {
    const res = await axios.post(`${baseURL}/api/HOJVoucher/GetAll`, body);
    return res.data;
  }
);

export const GetJvVoucherByID = createAsyncThunk<Voucher, number>(
  "jvvoucher/GetJvVoucherByID",
  async (id) => {
    const { data } = await axios.get(`${baseURL}/api/HOJVoucher/GetById?id=${id}`);
    return data.data;
  }
);

export const AddJVNewVoucher = createAsyncThunk<Voucher, Voucher>(
  "jvvoucher/AddJVNewVoucher",
  async (body) => {
    const response = await axios.post(`${baseURL}/api/HOJVoucher/AddVoucher`, body);
    if (response.data.status === true) {
      toast.success("Cong! voucher saved successfully.");
    } else {
      toast.error("" + response.data.message);
    }
    return response.data.data;
  }
);

export const UpdateJVVoucher = createAsyncThunk<Voucher, Voucher>(
  "jvvoucher/UpdateJVVoucher",
  async (body) => {
    const response = await axios.put(`${baseURL}/api/HOJVoucher/UpdateVoucher`, body);
    if (response.data.status === true) {
      toast.success("Cong! voucher updated.");
    } else {
      toast.error("" + response.data.message);
    }
    return response.data.data;
  }
);

// ---------- Slice ----------
const JvVoucherSlice = createSlice({
  name: "jvvoucher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get List (Paginated)
      .addCase(GetJVVouchersList.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetJVVouchersList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data ?? [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
        state.status = action.payload.status;
      })
      .addCase(GetJVVouchersList.rejected, (state) => {
        state.loading = false;
        state.status = false;
        state.data = [];
      })

      // Add Voucher
      .addCase(AddJVNewVoucher.pending, (state) => {
        state.loading = true;
      })
      .addCase(AddJVNewVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.status = true;
        state.data.unshift(action.payload); // Adds new voucher to the top of the list
      })
      .addCase(AddJVNewVoucher.rejected, (state) => {
        state.loading = false;
        state.status = false;
      })

      // Update Voucher
      .addCase(UpdateJVVoucher.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateJVVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.status = true;
        const index = state.data.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(UpdateJVVoucher.rejected, (state) => {
        state.loading = false;
        state.status = false;
      })

      // Get By ID
      .addCase(GetJvVoucherByID.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetJvVoucherByID.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.status = true;
        // Replaces the list with just the single searched item or updates it
        state.data = [action.payload]; 
      })
      .addCase(GetJvVoucherByID.rejected, (state) => {
        state.loading = false;
        state.status = false;
      });
  },
});

export default JvVoucherSlice.reducer;