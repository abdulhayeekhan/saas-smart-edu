import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Constants ===================
// Mirrors Models.Enums.AllowanceDeductionHeadType on the API.
export const HEAD_TYPE_ALLOWANCE = 1;
export const HEAD_TYPE_DEDUCTION = 2;

// =================== Types ===================

/** One allowance/deduction head as assigned to an employee. */
export interface EmpAllowanceDeduction {
  id: number;
  employeeId: number;
  campusId: number | null;
  headType: number;
  allowanceTypeId: number | null;
  deductionId: number | null;
  amount: number;
  openingBalance: number;
  openingBalanceDate: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  remarks: string | null;
  isActive: boolean;

  headTypeName?: string | null;
  headName?: string | null;
  employeeName?: string | null;
  employeeKey?: string | null;
  campusName?: string | null;

  /** OpeningBalance + SUM(Debit) - SUM(Credit); computed by the API, not stored. */
  currentBalance: number;
}

/** What GetByEmployee returns — the payroll section of the employee profile. */
export interface EmpAllowanceDeductionProfile {
  employeeId: number;
  employeeName: string | null;
  employeeKey: string | null;
  campusName: string | null;
  allowances: EmpAllowanceDeduction[];
  deductions: EmpAllowanceDeduction[];
  totalAllowanceAmount: number;
  totalDeductionAmount: number;
  netAmount: number;
  totalAllowanceBalance: number;
  totalDeductionBalance: number;
}

/** Add/Update body. `userId` is the acting user — this API reads it from the body, not the token. */
export interface EmpAllowanceDeductionPayload {
  id?: number;
  employeeId: number;
  userId: number;
  headType: number;
  allowanceTypeId: number | null;
  deductionId: number | null;
  amount: number;
  openingBalance: number;
  openingBalanceDate: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  remarks: string | null;
  isActive: boolean;
}

export interface LedgerEntryPayload {
  empAllowanceDeductionId: number;
  userId: number;
  entryDate: string | null;
  debit: number;
  credit: number;
  description: string;
  referenceNumber: string | null;
}

export interface LedgerRequestPayload {
  employeeId: number;
  empAllowanceDeductionId?: number | null;
  headType?: number | null;
  fromDate: string | null;
  toDate: string | null;
}

export interface LedgerLine {
  id: number;
  entryDate: string;
  empAllowanceDeductionId: number;
  headType: number;
  headTypeName: string;
  headName: string;
  description: string;
  sourceTypeName: string;
  referenceNumber: string | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerHeadSummary {
  empAllowanceDeductionId: number;
  headType: number;
  headTypeName: string;
  headName: string;
  amount: number;
  isActive: boolean;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  entryCount: number;
}

export interface LedgerEmployeeDetail {
  employeeId: number;
  employeeName: string;
  employeeKey: string;
  fatherName?: string | null;
  cnic?: string | null;
  contactNumber?: string | null;
  designationName?: string | null;
  departmentName?: string | null;
  campusName?: string | null;
  joiningDate?: string | null;
  isActive?: boolean;
}

export interface LedgerResponse {
  employeeDetail: LedgerEmployeeDetail;
  fromDate: string | null;
  toDate: string | null;
  head: LedgerHeadSummary | null;
  headSummaries: LedgerHeadSummary[];
  details: LedgerLine[];
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  totalEntries: number;

  // A single running balance mixes the two sides, so each is also reported on its own.
  allowanceOpeningBalance: number;
  allowanceTotalDebit: number;
  allowanceTotalCredit: number;
  allowanceClosingBalance: number;

  deductionOpeningBalance: number;
  deductionTotalDebit: number;
  deductionTotalCredit: number;
  deductionClosingBalance: number;

  /** allowanceClosingBalance - deductionClosingBalance. */
  netClosingBalance: number;
}

export interface EmpAllowanceDeductionState {
  profile: EmpAllowanceDeductionProfile | null;
  profileLoading: boolean;
  saving: boolean;
  headLedger: LedgerResponse | null;
  headLedgerLoading: boolean;
  /** The whole-employee statement — every head interleaved by date. */
  employeeLedger: LedgerResponse | null;
  employeeLedgerLoading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: EmpAllowanceDeductionState = {
  profile: null,
  profileLoading: false,
  saving: false,
  headLedger: null,
  headLedgerLoading: false,
  employeeLedger: null,
  employeeLedgerLoading: false,
  error: null,
};

const errorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || error.message || fallback;

// =================== Thunks ===================

export const GetEmployeeAllowanceDeductions = createAsyncThunk<EmpAllowanceDeductionProfile, number>(
  'empAllowanceDeduction/getByEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HREmpAllowanceDeduction/GetByEmployee/${employeeId}`);
      const res = response.data;

      if (res.status === true) {
        return res.data as EmpAllowanceDeductionProfile;
      }
      return rejectWithValue(res.message || 'Unable to load allowances and deductions');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load allowances and deductions'));
    }
  }
);

/**
 * Deliberately silent — the profile screen saves many heads at once and reports one
 * summary instead of a toast per row.
 */
export const AddEmpAllowanceDeduction = createAsyncThunk<EmpAllowanceDeduction, EmpAllowanceDeductionPayload>(
  'empAllowanceDeduction/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/Add`, payload);
      const res = response.data;

      if (res.status === true) {
        return res.data as EmpAllowanceDeduction;
      }
      return rejectWithValue(res.message || 'Failed to assign allowance/deduction');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Failed to assign allowance/deduction'));
    }
  }
);

/** Silent for the same reason as AddEmpAllowanceDeduction. */
export const UpdateEmpAllowanceDeduction = createAsyncThunk<EmpAllowanceDeduction, EmpAllowanceDeductionPayload>(
  'empAllowanceDeduction/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/Update`, payload);
      const res = response.data;

      if (res.status === true) {
        return res.data as EmpAllowanceDeduction;
      }
      return rejectWithValue(res.message || 'Failed to update allowance/deduction');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Failed to update allowance/deduction'));
    }
  }
);

export const UpdateEmpAllowanceDeductionStatus = createAsyncThunk<
  { id: number; isActive: boolean },
  { id: number; isActive: boolean; userId: number }
>(
  'empAllowanceDeduction/updateStatus',
  async ({ id, isActive, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/UpdateStatus`, { id, isActive, userId });
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Status updated successfully');
        return { id, isActive };
      }
      toast.error(res.message || 'Unable to update status');
      return rejectWithValue(res.message || 'Unable to update status');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to update status');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Only assignments with no ledger history can be deleted — the API rejects the rest and
 * asks for a deactivation instead, so surface its message as-is.
 */
export const DeleteEmpAllowanceDeduction = createAsyncThunk<number, number>(
  'empAllowanceDeduction/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HREmpAllowanceDeduction/Delete/${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Assignment deleted successfully');
        return id;
      }
      toast.error(res.message || 'Unable to delete assignment');
      return rejectWithValue(res.message || 'Unable to delete assignment');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to delete assignment');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const AddLedgerEntry = createAsyncThunk<any, LedgerEntryPayload>(
  'empAllowanceDeduction/addLedgerEntry',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/AddLedgerEntry`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Ledger entry posted successfully');
        return res.data;
      }
      toast.error(res.message || 'Unable to post ledger entry');
      return rejectWithValue(res.message || 'Unable to post ledger entry');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to post ledger entry');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/** Only Manual entries are deletable; payroll/loan-recovery rows must be undone by their subsystem. */
export const DeleteLedgerEntry = createAsyncThunk<number, number>(
  'empAllowanceDeduction/deleteLedgerEntry',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HREmpAllowanceDeduction/DeleteLedgerEntry/${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Ledger entry deleted successfully');
        return id;
      }
      toast.error(res.message || 'Unable to delete ledger entry');
      return rejectWithValue(res.message || 'Unable to delete ledger entry');
    } catch (error: any) {
      const message = errorMessage(error, 'Unable to delete ledger entry');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const GetHeadLedger = createAsyncThunk<LedgerResponse, LedgerRequestPayload>(
  'empAllowanceDeduction/getHeadLedger',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/GetHeadLedger`, payload);
      const res = response.data;

      if (res.status === true) {
        return res.data as LedgerResponse;
      }
      return rejectWithValue(res.message || 'Unable to load ledger');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load ledger'));
    }
  }
);

/**
 * The whole employee statement: every allowance and deduction head interleaved by date, with
 * per-head roll-ups alongside. Movement before `fromDate` is folded into the opening balance
 * by the API rather than listed, so opening + period movement always equals closing.
 */
export const GetEmployeeLedger = createAsyncThunk<LedgerResponse, LedgerRequestPayload>(
  'empAllowanceDeduction/getEmployeeLedger',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HREmpAllowanceDeduction/GetEmployeeLedger`, payload);
      const res = response.data;

      if (res.status === true) {
        return res.data as LedgerResponse;
      }
      return rejectWithValue(res.message || 'Unable to load the employee ledger');
    } catch (error: any) {
      return rejectWithValue(errorMessage(error, 'Unable to load the employee ledger'));
    }
  }
);

// =================== Slice ===================
const empAllowanceDeductionSlice = createSlice({
  name: 'empAllowanceDeduction',
  initialState,
  reducers: {
    clearHeadLedger: (state) => {
      state.headLedger = null;
    },
    clearEmployeeLedger: (state) => {
      state.employeeLedger = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetEmployeeAllowanceDeductions.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(
        GetEmployeeAllowanceDeductions.fulfilled,
        (state, action: PayloadAction<EmpAllowanceDeductionProfile>) => {
          state.profileLoading = false;
          state.profile = action.payload;
        }
      )
      .addCase(GetEmployeeAllowanceDeductions.rejected, (state, action) => {
        state.profileLoading = false;
        state.profile = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(AddEmpAllowanceDeduction.pending, (state) => {
        state.saving = true;
      })
      .addCase(AddEmpAllowanceDeduction.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(AddEmpAllowanceDeduction.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(UpdateEmpAllowanceDeduction.pending, (state) => {
        state.saving = true;
      })
      .addCase(UpdateEmpAllowanceDeduction.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(UpdateEmpAllowanceDeduction.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetHeadLedger.pending, (state) => {
        state.headLedgerLoading = true;
        state.error = null;
      })
      .addCase(GetHeadLedger.fulfilled, (state, action: PayloadAction<LedgerResponse>) => {
        state.headLedgerLoading = false;
        state.headLedger = action.payload;
      })
      .addCase(GetHeadLedger.rejected, (state, action) => {
        state.headLedgerLoading = false;
        state.headLedger = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(GetEmployeeLedger.pending, (state) => {
        state.employeeLedgerLoading = true;
        state.error = null;
      })
      .addCase(GetEmployeeLedger.fulfilled, (state, action: PayloadAction<LedgerResponse>) => {
        state.employeeLedgerLoading = false;
        state.employeeLedger = action.payload;
      })
      .addCase(GetEmployeeLedger.rejected, (state, action) => {
        state.employeeLedgerLoading = false;
        state.employeeLedger = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearHeadLedger, clearEmployeeLedger } = empAllowanceDeductionSlice.actions;
export default empAllowanceDeductionSlice.reducer;
