import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Constants ===================

/**
 * Mirrors Models.Enums.SalaryStatus on the API — the three steps of the salary cycle plus the
 * two "half way through" states.
 */
export const SALARY_STATUS = {
  DRAFT: 0,
  PARTIAL_ACCRUAL: 1,
  ACCRUED: 2,
  PARTIALLY_PAID: 3,
  PAID: 4,
} as const;

export const SALARY_STATUS_LABEL: Record<number, string> = {
  [SALARY_STATUS.DRAFT]: 'Draft',
  [SALARY_STATUS.PARTIAL_ACCRUAL]: 'Partly Accrued',
  [SALARY_STATUS.ACCRUED]: 'Accrued',
  [SALARY_STATUS.PARTIALLY_PAID]: 'Partly Paid',
  [SALARY_STATUS.PAID]: 'Paid',
};

/** Ant Design Tag colours, so the status reads the same on every screen. */
export const SALARY_STATUS_COLOR: Record<number, string> = {
  [SALARY_STATUS.DRAFT]: 'default',
  [SALARY_STATUS.PARTIAL_ACCRUAL]: 'orange',
  [SALARY_STATUS.ACCRUED]: 'blue',
  [SALARY_STATUS.PARTIALLY_PAID]: 'gold',
  [SALARY_STATUS.PAID]: 'green',
};

// Mirrors Models.Enums.AllowanceDeductionHeadType.
export const HEAD_TYPE_ALLOWANCE = 1;
export const HEAD_TYPE_DEDUCTION = 2;

// =================== Types ===================

export interface SalaryPayrollHead {
  id: number;
  salaryPayrollDetailId: number;
  empAllowanceDeductionId: number | null;
  headType: number;
  headTypeName: string | null;
  allowanceTypeId: number | null;
  deductionId: number | null;
  headName: string;
  /** The full monthly value from the employee profile, before day proration. */
  baseAmount: number;
  /** What the line is worth for this month once days are applied. */
  amount: number;
  isProrated: boolean;
  debitAccountId: number;
  debitAccountName: string | null;
  creditAccountId: number;
  creditAccountName: string | null;
  remarks: string | null;
}

export interface SalaryPayrollEmployee {
  id: number;
  salaryPayrollId: number;
  employeeId: number;
  employeeKey: string | null;
  employeeName: string | null;
  fatherName: string | null;
  cnic: string | null;
  departmentName: string | null;
  designationName: string | null;
  campusId: number;

  totalDays: number;
  payableDays: number;

  grossAmount: number;
  totalDeduction: number;
  netAmount: number;

  paymentMode: string;
  payableAccountId: number | null;
  payableAccountName: string | null;
  bankBranchId: number | null;
  bankName: string | null;
  accountTitle: string | null;
  accountNumber: string | null;

  status: number;
  statusName: string | null;

  paymentVoucherId: number | null;
  paymentVoucherNumber: number | null;
  chequeNumber: string | null;
  paymentAccountId: number | null;
  paymentAccountName: string | null;
  paymentDate: string | null;

  remarks: string | null;

  allowances: SalaryPayrollHead[];
  deductions: SalaryPayrollHead[];
}

export interface SalaryPayroll {
  id: number;
  campusId: number;
  campusName: string | null;
  salaryMonth: string;
  salaryMonthName: string | null;
  totalDays: number;
  status: number;
  statusName: string | null;
  remarks: string | null;

  totalAllowance: number;
  totalDeduction: number;
  netPayable: number;

  employeeCount: number;
  paidEmployeeCount: number;
  paidAmount: number;

  accrualVoucherId: number | null;
  accrualVoucherNumber: number | null;
  accrualDate: string | null;

  createdAt: string;
  createdBy: number | null;
  createdByName: string | null;
  modifiedAt: string | null;

  /** Workflow flags computed by the API — the UI does not re-derive the step rules. */
  canEdit: boolean;
  canAccrue: boolean;
  canPay: boolean;
}

export interface SalaryPayrollDetailed extends SalaryPayroll {
  details: SalaryPayrollEmployee[];
}

export interface SalaryPaymentRow {
  detailId: number;
  employeeId: number;
  employeeKey: string | null;
  employeeName: string | null;
  designationName: string | null;
  departmentName: string | null;
  netAmount: number;
  paymentMode: string;
  payableAccountId: number | null;
  payableAccountName: string | null;
  accountTitle: string | null;
  accountNumber: string | null;
  bankName: string | null;
  status: number;
  statusName: string | null;
  isPaid: boolean;
  chequeNumber: string | null;
  paymentDate: string | null;
  paymentVoucherNumber: number | null;
}

export interface SalaryPaymentGroup {
  paymentMode: string;
  /** True for a bank batch — the UI then asks for a cheque number per employee. */
  requiresCheque: boolean;
  voucherTypeShortName: string;
  employees: SalaryPaymentRow[];
  pendingCount: number;
  paidCount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface SalaryPaymentList {
  salaryPayrollId: number;
  campusId: number;
  campusName: string | null;
  salaryMonth: string;
  salaryMonthName: string | null;
  status: number;
  statusName: string | null;
  groups: SalaryPaymentGroup[];
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface EligibleEmployee {
  employeeId: number;
  employeeKey: string | null;
  employeeName: string | null;
  departmentName: string | null;
  designationName: string | null;
  paymentMode: string | null;
  totalAllowance: number;
  totalDeduction: number;
  netAmount: number;
  /** Profile heads applying to the run's month. */
  headCount: number;
  /**
   * False when nothing on the profile applies to the run's month. The API refuses such an
   * employee: a line given to them by hand posts to the accounts but never reaches their
   * allowance/deduction ledger.
   */
  hasPayrollHeads: boolean;
  alreadyInPayroll: boolean;
}

// ------------------------------------------------------------------ payloads

export interface GeneratePayload {
  campusId: number;
  salaryMonth: string;
  totalDays: number;
  userId: number;
  departmentId?: number | null;
  designationId?: number | null;
  employeeTypeId?: number | null;
  employeeIds?: number[] | null;
  remarks?: string | null;
}

export interface UpdateDraftHeadPayload {
  id?: number | null;
  headType: number;
  allowanceTypeId: number | null;
  deductionId: number | null;
  baseAmount: number;
  isProrated: boolean;
  remarks?: string | null;
}

export interface UpdateDraftDetailPayload {
  id: number;
  payableDays: number;
  remarks?: string | null;
  heads: UpdateDraftHeadPayload[];
}

export interface UpdateDraftPayload {
  id: number;
  userId: number;
  totalDays: number;
  remarks?: string | null;
  details: UpdateDraftDetailPayload[];
}

export interface PostPaymentPayload {
  salaryPayrollId: number;
  userId: number;
  paymentAccountId: number;
  paymentDate: string | null;
  paymentMode: string;
  payments: { detailId: number; chequeNumber: string | null }[];
}

export interface SalaryReportPayload {
  campusId: number;
  salaryMonth: string;
  month: number;
  year: number;
}

export interface SalaryReportEmployee extends Omit<SalaryPayrollEmployee, 'id'> {
  detailId: number;
  totalAllowance: number;
}

export interface SalaryReportData {
  salaryPayrollId: number;
  campusId: number;
  campusName: string | null;
  salaryMonth: string;
  salaryMonthName: string | null;
  status: number;
  statusName: string | null;
  totalEmployees: number;
  totalGrossSalary: number;
  totalAllowance: number;
  totalDeduction: number;
  totalNetPayable: number;
  employees: SalaryReportEmployee[];
}

export interface SalaryPayrollListResponse {
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: SalaryPayroll[];
}

export interface SalaryPayrollState {
  data: SalaryPayroll[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;

  current: SalaryPayrollDetailed | null;
  paymentList: SalaryPaymentList | null;
  eligibleEmployees: EligibleEmployee[];

  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SalaryPayrollState = {
  data: [],
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
  current: null,
  paymentList: null,
  eligibleEmployees: [],
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
};

const errorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || error.message || fallback;

// =================== Thunks ===================

export const GetSalaryReport = createAsyncThunk<SalaryReportData, SalaryReportPayload>(
  'salaryPayroll/report',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/SalaryReport`, payload);
      const res = response.data;
      if (res.status === true) {
        return res.data as SalaryReportData;
      }
      return rejectWithValue(res.message || 'Unable to load salary report');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load salary report'));
    }
  }
);

export const GetSalaryPayrolls = createAsyncThunk<
  SalaryPayrollListResponse,
  { pageNo: number; pageSize: number; campusId: number | null; month: number | null; year: number | null; status: number | null; search: string }
>('salaryPayroll/getAll', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/GetAll`, payload);
    const res = response.data;

    if (res.status === true) {
      return res as SalaryPayrollListResponse;
    }
    return rejectWithValue(res.message || 'Unable to load salary runs');
  } catch (error: any) {
    return rejectWithValue(errorMessage(error, 'Unable to load salary runs'));
  }
});

export const GetSalaryPayrollById = createAsyncThunk<SalaryPayrollDetailed, number>(
  'salaryPayroll/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRSalaryPayroll/GetById/${id}`);
      const res = response.data;

      if (res.status === true) {
        return res.data as SalaryPayrollDetailed;
      }
      return rejectWithValue(res.message || 'Unable to load the salary run');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load the salary run'));
    }
  }
);

/** Step 1 — build the draft from the allowance/deduction heads on each employee profile. */
export const GenerateSalaryPayroll = createAsyncThunk<SalaryPayrollDetailed, GeneratePayload>(
  'salaryPayroll/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/Generate`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Salary generated as draft');
        return res.data as SalaryPayrollDetailed;
      }
      toast.error(res.message || 'Unable to generate salary');
      return rejectWithValue(res.message || 'Unable to generate salary');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to generate salary');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const UpdateSalaryDraft = createAsyncThunk<SalaryPayrollDetailed, UpdateDraftPayload>(
  'salaryPayroll/updateDraft',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/UpdateDraft`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Draft saved');
        return res.data as SalaryPayrollDetailed;
      }
      toast.error(res.message || 'Unable to save the draft');
      return rejectWithValue(res.message || 'Unable to save the draft');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to save the draft');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const AddSalaryPayrollEmployees = createAsyncThunk<
  SalaryPayrollDetailed,
  { salaryPayrollId: number; userId: number; employeeIds: number[] }
>('salaryPayroll/addEmployees', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/AddEmployees`, payload);
    const res = response.data;

    if (res.status === true) {
      toast.success(res.message || 'Employee(s) added');
      return res.data as SalaryPayrollDetailed;
    }
    toast.error(res.message || 'Unable to add employees');
    return rejectWithValue(res.message || 'Unable to add employees');
  } catch (error: any) {
    const message = errorMessage(error, 'Unable to add employees');
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const DeleteSalaryPayrollDetail = createAsyncThunk<number, number>(
  'salaryPayroll/deleteDetail',
  async (detailId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRSalaryPayroll/DeleteDetail/${detailId}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Employee removed from the salary run');
        return detailId;
      }
      toast.error(res.message || 'Unable to remove the employee');
      return rejectWithValue(res.message || 'Unable to remove the employee');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to remove the employee');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const DeleteSalaryPayroll = createAsyncThunk<number, number>(
  'salaryPayroll/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRSalaryPayroll/Delete/${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Salary run deleted');
        return id;
      }
      toast.error(res.message || 'Unable to delete the salary run');
      return rejectWithValue(res.message || 'Unable to delete the salary run');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to delete the salary run');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/** Step 2 — hit the ledger. The run is frozen once this succeeds. */
export const PostSalaryAccrual = createAsyncThunk<
  SalaryPayrollDetailed,
  { id: number; userId: number; voucherDate?: string | null }
>('salaryPayroll/postAccrual', async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/PostAccrual`, payload);
    const res = response.data;

    if (res.status === true) {
      toast.success(res.message || 'Salary posted to accrual');
      return res.data as SalaryPayrollDetailed;
    }
    toast.error(res.message || 'Unable to post the accrual');
    return rejectWithValue(res.message || 'Unable to post the accrual');
  } catch (error: any) {
    const message = errorMessage(error, 'Unable to post the accrual');
    toast.error(message);
    return rejectWithValue(message);
  }
});

/** Only possible while nothing on the run has been paid — the API enforces that. */
export const RevertSalaryAccrual = createAsyncThunk<SalaryPayrollDetailed, { id: number; userId: number }>(
  'salaryPayroll/revertAccrual',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/RevertAccrual`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Accrual reverted');
        return res.data as SalaryPayrollDetailed;
      }
      toast.error(res.message || 'Unable to revert the accrual');
      return rejectWithValue(res.message || 'Unable to revert the accrual');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to revert the accrual');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const GetSalaryPaymentList = createAsyncThunk<SalaryPaymentList, number>(
  'salaryPayroll/getPaymentList',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRSalaryPayroll/GetPaymentList/${id}`);
      const res = response.data;

      if (res.status === true) {
        return res.data as SalaryPaymentList;
      }
      return rejectWithValue(res.message || 'Unable to load the payment list');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load the payment list'));
    }
  }
);

/** Step 3 — pay one payment-mode batch. */
export const PostSalaryPayment = createAsyncThunk<SalaryPayrollDetailed, PostPaymentPayload>(
  'salaryPayroll/postPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRSalaryPayroll/PostPayment`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Salary posted to accounts');
        return res.data as SalaryPayrollDetailed;
      }
      toast.error(res.message || 'Unable to post the payment');
      return rejectWithValue(res.message || 'Unable to post the payment');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to post the payment');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const GetEligibleEmployees = createAsyncThunk<
  EligibleEmployee[],
  { campusId: number; salaryPayrollId?: number | null }
>('salaryPayroll/getEligibleEmployees', async ({ campusId, salaryPayrollId }, { rejectWithValue }) => {
  try {
    const query = salaryPayrollId ? `?campusId=${campusId}&salaryPayrollId=${salaryPayrollId}` : `?campusId=${campusId}`;
    const response = await axios.get(`${baseURL}/api/HRSalaryPayroll/GetEligibleEmployees${query}`);
    const res = response.data;

    if (res.status === true) {
      return res.data as EligibleEmployee[];
    }
    return rejectWithValue(res.message || 'Unable to load employees');
  } catch (error: any) {
    return rejectWithValue(errorMessage(error, 'Unable to load employees'));
  }
});

// =================== Slice ===================

const salaryPayrollSlice = createSlice({
  name: 'salaryPayroll',
  initialState,
  reducers: {
    clearCurrentSalaryPayroll: (state) => {
      state.current = null;
      state.paymentList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetSalaryPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetSalaryPayrolls.fulfilled, (state, action: PayloadAction<SalaryPayrollListResponse>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(GetSalaryPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetSalaryPayrollById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(GetSalaryPayrollById.fulfilled, (state, action: PayloadAction<SalaryPayrollDetailed>) => {
        state.detailLoading = false;
        state.current = action.payload;
      })
      .addCase(GetSalaryPayrollById.rejected, (state, action) => {
        state.detailLoading = false;
        state.current = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetSalaryPaymentList.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(GetSalaryPaymentList.fulfilled, (state, action: PayloadAction<SalaryPaymentList>) => {
        state.detailLoading = false;
        state.paymentList = action.payload;
      })
      .addCase(GetSalaryPaymentList.rejected, (state, action) => {
        state.detailLoading = false;
        state.paymentList = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetEligibleEmployees.fulfilled, (state, action: PayloadAction<EligibleEmployee[]>) => {
        state.eligibleEmployees = action.payload;
      })
      .addCase(GetEligibleEmployees.rejected, (state) => {
        state.eligibleEmployees = [];
      });

    builder
      .addCase(DeleteSalaryPayroll.fulfilled, (state, action: PayloadAction<number>) => {
        state.data = state.data.filter((x) => x.id !== action.payload);
      });

    // Every mutation returns the whole run, so one handler keeps `current` in step with the
    // server instead of each screen patching its own copy.
    [
      GenerateSalaryPayroll,
      UpdateSalaryDraft,
      AddSalaryPayrollEmployees,
      PostSalaryAccrual,
      RevertSalaryAccrual,
      PostSalaryPayment,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action: PayloadAction<SalaryPayrollDetailed>) => {
          state.saving = false;
          state.current = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.saving = false;
          state.error = action.payload as string;
        });
    });
  },
});

export const { clearCurrentSalaryPayroll } = salaryPayrollSlice.actions;
export default salaryPayrollSlice.reducer;
