import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from 'react-hot-toast'
const baseURL = process.env.REACT_APP_API_BASE_URL;


export interface AccountOption {
  value: number | string;
  label: string;
}

// ---------- Types ----------
export interface VoucherDetail {
  creditAccountId: number;
  debitAccountId: number;
  amount: number;
  description: string;
  cheaqueNo: string;
  referenceId: number;
  referenceTypeId: number;
  classId: number;
  departmentId: number;
  budgetId: number;
}

export interface Voucher {
  id?: 0;
  regionId: number | null;
  voucherDate: string;
  voucherNumber?: number,
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

export interface FinancialYearType {
  id: number | null;
  year: number | null;
}

export interface VoucherState {
  data: Voucher[];
  status: boolean;
  loading: boolean;
  totalCount: number
  pageSize: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface VoucherResponse {
  data: Voucher[]
  totalCount: number
  pageSize: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
  status: boolean
  message: string
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
export const getSortVouchers = createAsyncThunk<
  VoucherResponse,
  any
>(
  "voucher/getSortVouchers",
  async (body) => {
    const res = await axios.post(`${baseURL}/api/HOVoucher/GetAll`, body)
    return res.data
  }
)


export const getVoucherbyType = createAsyncThunk<Voucher[], number>(
  "getvoucherbytype",
  async (id) => {
    const { data } = await axios.get(
      `${baseURL}/api/hovoucher/getbytype?typeId=${id}`
    );
    return data.data.sort().reverse();
  }
);

export const getVoucherByID = createAsyncThunk<Voucher, number>(
  "getvoucherbyid",
  async (id) => {
    const { data } = await axios.get(
      `${baseURL}/api/hovoucher/getbyid?id=${id}`
    );
    return data.data;
  }
);

export const AddNewVoucher = createAsyncThunk<Voucher, Voucher>(
  "addnewvoucher",
  async (body) => {
    const response = await axios.post(`${baseURL}/api/HOVoucher/AddVoucher`, body);
    if (response.data.status === true) {
      toast.success("Cong! voucher save successfully.");
    } else {
      toast.error("" + response.data.message);
    }
    return response.data.data;
  }
);

export const UpdateVoucher = createAsyncThunk<Voucher, Voucher>(
  "updatevoucher",
  async (body) => {
    const response = await axios.put(`${baseURL}/api/hovoucher/updatevoucher`, body);
    if (response.data.status === true) {
      toast.success("Cong! voucher updated.");
    } else {
      toast.error("" + response.data.message);
    }
    return response.data.data;
  }
);

// ---------- Slice ----------
const VoucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get sort vouchers
      .addCase(getSortVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSortVouchers.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data ?? []
        state.totalCount = action.payload.totalCount
        state.pageSize = action.payload.pageSize
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.hasNext = action.payload.hasNext
        state.hasPrevious = action.payload.hasPrevious
        state.status = action.payload.status
      })
      .addCase(getSortVouchers.rejected, (state) => {
        state.status = false;
        state.loading = false;
        state.data = [];
      })

      // get by type
      .addCase(getVoucherbyType.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVoucherbyType.fulfilled, (state, action: PayloadAction<Voucher[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.status = true;
      })
      .addCase(getVoucherbyType.rejected, (state) => {
        state.status = false;
        state.loading = false;
      })

      // add voucher
      .addCase(AddNewVoucher.pending, (state) => {
        state.loading = true;
      })
      .addCase(AddNewVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.data.unshift(action.payload); // fine, still an array
        state.status = true;
      })
      .addCase(AddNewVoucher.rejected, (state) => {
        state.loading = false;
        state.status = false;
      })



      // update voucher
      .addCase(UpdateVoucher.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        const index = state.data.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.status = true;
      })

      .addCase(UpdateVoucher.rejected, (state) => {
        state.loading = false;
        state.status = false;
      })

      // get by id
      .addCase(getVoucherByID.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVoucherByID.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.data = [action.payload]; // wrap in array
        state.status = true;
      })
      .addCase(getVoucherByID.rejected, (state) => {
        state.loading = false;
        state.status = false;
      });
  },
});

export default VoucherSlice.reducer;
