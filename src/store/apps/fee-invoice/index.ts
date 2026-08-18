import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PayloadAction } from '@reduxjs/toolkit'; // Ensure this is imported

const baseURL = process.env.REACT_APP_API_BASE_URL;

// ================= TYPES ==================

export interface FeeInvoiceDetail {
    id: number;
    feeInvoiceId: number;
    feeTypeId: number;
    feeName: string;
    invoiceAmount: number;
    discountAmount: number;
    receivedAmount: number;
    remainingAmount: number;
    invoiceMonth: string;
}

export interface CancelInvoicePayload {
    invoiceId: number | null;
    reason: string;
}

export interface FeeInvoice {
    id: number;
    campusId: number;
    studentNumber: string;
    fatherName: string;
    campusName: string;
    admissionId: number;
    firstName: string;
    lastName: string;
    session: string;
    grade: string;
    invoiceVoucherId: number;
    invoiceNumber: number;
    invoiceDate: string;
    monthFrom: string;
    monthTo: string;
    dueDate: string;
    totalAmount: number;
    totalDiscount: number;
    netAmount: number;
    amountReceived: number;
    invoiceStatusId: number;
    status: string;
    details: FeeInvoiceDetail[];
    receipts: any[];
}

export interface FeeInvoiceFilter {
    pageNo: number;
    pageSize: number;
    gradeId?: number | null;
    sessionId?: number | null;
    campusId?: number | null;
    dateFrom?: string;
    dateTo?: string;
    admissionId?: number | null;
    status?: string;
}

export interface BulkInvoicePayload {
    gradeId: number;
    campusId: number;
    invoiceDate: string;
    monthFrom: string;
    monthTo: string;
    dueDate: string;
    userId: number;
    bankId: number | null;
    customFees: any[];
}
export interface SingleInvoicePayload {
    admissionId: number;
    invoiceDate: string;
    monthFrom: string;
    monthTo: string;
    dueDate: string;
    userId: number;
    newAdmission: boolean;
}

export interface ManualReceiptPayload {
    invoiceNumber: number;
    campusId: number;
    receiptAccount: number;
    referenceNo: string;
    detail: {
        id?: number;
        feeTypeId: number;
        month: string;
        amountReceived: number;
    }[];
}

export interface FeeInvoiceState {
    data: FeeInvoice[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    single: FeeInvoice | null;
    loading: boolean;
    isActionLoading: boolean;
}

// =============== ASYNC THUNKS ===============

// 1. Get List of Invoices
export const GetFeeInvoices = createAsyncThunk<any, FeeInvoiceFilter>(
    'feeInvoice/getAll',
    async (filter, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/FeeInvoice/List`, filter);
            if (data.status) return data;
            toast.error(data.message || 'Failed to load invoices');
            return rejectWithValue(data.message);
        } catch (error: any) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 2. Get Single Invoice by ID
export const GetFeeInvoiceById = createAsyncThunk<FeeInvoice, number>(
    'feeInvoice/getById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${baseURL}/api/FeeInvoice/GetInvoice?id=${id}`);
            if (data.status) return data.data;
            toast.error(data.message);
            return rejectWithValue(data.message);
        } catch (error: any) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 3. Get Invoice by Number and Campus
export const GetInvoiceByNumber = createAsyncThunk<FeeInvoice, { invoiceNumber: number; campusId: number }>(
    'feeInvoice/getByNumber',
    async ({ invoiceNumber, campusId }, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/FeeInvoice/GetInvoiceByNumber?invoiceNumber=${invoiceNumber}&campusId=${campusId}`
            );
            if (data.status) return data.data;
            toast.error(data.message);
            return rejectWithValue(data.message);
        } catch (error: any) {
            // toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 4. Generate Bulk Invoice
export const GenerateBulkInvoice = createAsyncThunk<any, BulkInvoicePayload>(
    'feeInvoice/generateBulk',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/FeeInvoice/GenerateBulkInvoice`, payload);
            if (data.status) {
                toast.success(data.message || 'Bulk Invoices generated successfully');
                return data.data;
            }
            toast.error(data.message);
            return rejectWithValue(data.message);
        } catch (error: any) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 5. Cancel Invoice
// 5. Cancel Invoice
export const CancelInvoice = createAsyncThunk<number, CancelInvoicePayload>(
    'feeInvoice/cancel',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/FeeInvoice/CancelInvoice`, payload);

            // We must ensure a number is returned. 
            // If invoiceId is null in the payload, we throw a manual error to catch block
            if (!payload.invoiceId) {
                throw new Error("Invalid Invoice ID");
            }

            if (data.status) {
                toast.success(data.message || 'Invoice cancelled successfully');
                // Return the ID as a non-nullable number
                return payload.invoiceId;
            } else {
                toast.error(data.message || 'Server error occurred');
                return rejectWithValue(data.message);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Network error';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// 7. Generate Single Invoice
export const GenerateSingleInvoice = createAsyncThunk<any, SingleInvoicePayload>(
    'feeInvoice/generateSingle',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/FeeInvoice/GenerateInvoiceDiscount`, payload);
            if (data.status) {
                toast.success(data.message || 'Invoice generated successfully');
                return data.data; // This typically returns the new invoice object
            } else {
                toast.error(data.message || 'Failed to generate invoice');
                return rejectWithValue(data.message);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Network error';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// 6. Manual Receipt Discount
export const ManualReceiptDiscount = createAsyncThunk<any, ManualReceiptPayload>(
    'feeInvoice/manualReceipt',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/FeeInvoice/ManualReceiptDiscount`, payload);
            if (data.status) {
                toast.success('Receipt processed successfully');
                return data.data;
            }
            toast.error(data.message);
            return rejectWithValue(data.message);
        } catch (error: any) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 7. Delete Receipts (SuperAdmin feature)
export const DeleteReceipts = createAsyncThunk<any, { campusId: number | string; invoiceNumber: number | string }>(
    'feeInvoice/deleteReceipts',
    async ({ campusId, invoiceNumber }, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(
                `${baseURL}/api/FeeInvoice/DeleteReceipts/${campusId}/${invoiceNumber}`
            );
            if (data.status) {
                toast.success(data.message || 'Fee receipt deleted successfully');
                return { campusId, invoiceNumber, data: data.data };
            } else {
                toast.error(data.message || 'Failed to delete fee receipt');
                return rejectWithValue(data.message || 'Failed to delete fee receipt');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Network error';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// =============== INITIAL STATE ===============
const initialState: FeeInvoiceState = {
    data: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    single: null,
    loading: false,
    isActionLoading: false,
};

// =============== SLICE ===============
const FeeInvoiceSlice = createSlice({
    name: 'feeInvoice',
    initialState,
    reducers: {
        resetFeeInvoiceState: (state) => {
            state.data = [];
            state.single = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // 1. Get All List
            .addCase(GetFeeInvoices.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetFeeInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.totalCount = action.payload.totalCount;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(GetFeeInvoices.rejected, (state) => {
                state.loading = false;
            })

            // 2. Handle Cancellation
            .addCase(CancelInvoice.fulfilled, (state, action: PayloadAction<number>) => {
                // 1. Find the invoice in the current list and update its status
                const index = state.data.findIndex(item => item.id === action.payload);
                if (index !== -1) {
                    // We update the local status string so the table shows "Cancelled"
                    state.data[index].status = 'Cancelled';
                    // If your API uses numeric status IDs, update that too
                    state.data[index].invoiceStatusId = 0; // or your specific ID for cancelled
                }

                // 2. Update if it's the currently viewed single invoice
                if (state.single?.id === action.payload) {
                    state.single.status = 'Cancelled';
                }
            })


            .addCase(GenerateSingleInvoice.fulfilled, (state, action: PayloadAction<FeeInvoice>) => {
                state.isActionLoading = false;
                
                // If the API returns the full invoice object, we store it in 'single'
                // so the user can be redirected to a detail/print view.
                if (action.payload) {
                    state.single = action.payload;
                }
            })

            // 3. Generate Bulk Invoice
            .addCase(GenerateBulkInvoice.fulfilled, (state) => {
                // Usually, after bulk generation, we don't push to 'data' 
                // because we don't want to mess up pagination.
                // The component should re-dispatch GetFeeInvoices to refresh.
                state.isActionLoading = false;
            })

            // 4. Manual Receipt & Discount
            .addCase(ManualReceiptDiscount.fulfilled, (state, action: PayloadAction<any>) => {
                // If the API returns the updated invoice object, update it in our state
                if (action.payload && action.payload.id) {
                    const index = state.data.findIndex(item => item.id === action.payload.id);
                    if (index !== -1) {
                        state.data[index] = action.payload;
                    }
                    if (state.single?.id === action.payload.id) {
                        state.single = action.payload;
                    }
                }
            })

            // 5. Matcher for Single Invoice Fetching (By ID or Number)
            .addMatcher(
                (action) => [
                    GetFeeInvoiceById.fulfilled.type,
                    GetInvoiceByNumber.fulfilled.type
                ].includes(action.type),
                (state, action: PayloadAction<any>) => {
                    state.single = action.payload;
                }
            )

            // 6. Matcher for Global Action Loading (Start)
            .addMatcher(
                (action) => action.type.endsWith('/pending') && !action.type.includes('getAll'),
                (state) => {
                    state.isActionLoading = true;
                }
            )

            // 7. Matcher for Global Action Loading (End)
            .addMatcher(
                (action) => (
                    action.type.endsWith('/fulfilled') ||
                    action.type.endsWith('/rejected')
                ) && !action.type.includes('getAll'),
                (state) => {
                    state.isActionLoading = false;
                }
            );
    },
});

export const { resetFeeInvoiceState } = FeeInvoiceSlice.actions;
export default FeeInvoiceSlice.reducer;