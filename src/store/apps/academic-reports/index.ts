import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// --------------------
// Types
// --------------------
export interface CollectionReportItem {
  studentName: string;
  studentNumber: string;
  campusId: number;
  admissionId: number;
  contactNumber: string;
  feeType: string;
  amountReceived: number;
  grade: string;
  invoiceNumber: number;
  invoiceDate: string;
  receiptDate: string;
  // Based on user requirements but missing in sample data:
  fatherName?: string;
  amountReceivable?: number;
}

export interface CollectionReportFilter {
  campusId: number | null;
  fromDate: string;
  toDate: string;
  feeTypeId: number | null;
  gradeId: number | null;
}

export interface StudentLedgerDetail {
  date: string;
  voucherNumber: string;
  voucherType: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface StudentLedgerReportData {
  studentDetail: {
    fullName: string;
    studentNumber: string;
    fatherName: string;
    contactNumber: string;
    grade: string;
    section: string;
    admissionDate: string;
    status: string;
    leaveDate: string | null;
  };
  details: StudentLedgerDetail[];
  openingBalance: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface StudentLedgerFilter {
  admissionId: number;
  fromDate: string;
  toDate: string;
  pageNo?: number;
  pageSize?: number;
}


export interface StudentStrengthSection {
  sectionName: string;
  boysCount: number;
  girlsCount: number;
  strength: number;
}

export interface StudentStrengthGrade {
  gradeName: string;
  batch: string;
  sections: StudentStrengthSection[];
  totalBoys: number;
  totalGirls: number;
  totalStrength: number;
}

export interface StudentStrengthReportData {
  grades: StudentStrengthGrade[];
  grandTotalBoys: number;
  grandTotalGirls: number;
  grandTotalStrength: number;
}

export interface StudentStrengthReportFilter {
  campusId: number | null;
  sessionId: number | null;
}

export interface InvoiceReceiptSummaryDetail {
  studentName: string;
  studentNumber: string;
  gradeSection: string;
  invoiceNumber: string;
  invoiceAmount: number;
  receiptNumber: string;
  receiptAmount: number;
  netReceivable: number;
}

export interface InvoiceReceiptSummaryReportData {
  details: InvoiceReceiptSummaryDetail[];
  totalInvoiceAmount: number;
  totalReceiptAmount: number;
  totalNetReceivable: number;
}

export interface InvoiceReceiptSummaryReportFilter {
  campusId: number | null;
  fromDate: string;
  toDate: string;
  gradeId: number | null;
}

export interface AverageFeeReportDetail {
  fee: number;
  noOfStudents: number;
  amount: number;
}

export interface AverageFeeReportData {
  details: AverageFeeReportDetail[];
  totalNoOfStudents: number;
  totalAmount: number;
  averageFee: number;
}

export interface AverageFeeReportFilter {
  campusId: number | null;
  sessionId: number | null;
}

export interface AcademicReportState {
  collectionReport: CollectionReportItem[];
  studentLedgerReport: StudentLedgerReportData | null;
  studentStrengthReport: StudentStrengthReportData | null;
  invoiceReceiptSummaryReport: InvoiceReceiptSummaryReportData | null;
  averageFeeReport: AverageFeeReportData | null;
  campusAdmissionStatusReport: CampusAdmissionStatusReportData[] | null;
  branchContactList: BranchContactListData[] | null;
  defaulterReportData: DefaulterReportData | null;
  loading: boolean;
  error: string | null;
}

export interface CampusAdmissionStatusCounts {
  [key: string]: number;
}

export interface CampusAdmissionStatusReportData {
  campusId: number;
  campusName: string;
  averageFee: number;
  statusCounts: CampusAdmissionStatusCounts;
}

export interface CampusAdmissionStatusReportFilter {
  regionId?: number | null;
}

export interface BranchContactListFilter {
  campusId: number;
  sessionId: number;
  gradeId?: number | null;
  sectionId?: number | null;
}

export interface BranchContactListData {
  studentId: number;
  studentNumber: string;
  admissionNumber: number;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherName: string;
  contactNumber: string;
  email: string;
  cnic: string;
  fatherCNIC: string;
  motherCNIC: string;
  bForm: string;
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  sessionId: number;
  sessionName: string;
  campusId: number;
  campusName: string;
  status: string;
  isLeft: boolean;
  isEnabled: boolean;
  admissionDate: string;
  dateOfBirth: string;
}



// Defaulter Report Types
export interface FeeTypeBreakdown {
  feeTypeId: number;
  feeTypeName: string;
  outstandingAmount: number;
}

export interface Defaulter {
  admissionId: number;
  studentNumber: string;
  studentName: string;
  fatherName: string;
  contactNumber: string;
  gradeName: string;
  sectionName: string;
  sessionName: string;
  tuitionFeeDue: number;
  annualChargesDue: number;
  otherChargesDue: number;
  totalPendingAmount: number;
  feeTypeBreakdowns: FeeTypeBreakdown[];
}

export interface DefaulterReportData {
  defaulters: Defaulter[];
  overallTuitionFeeDue: number;
  overallAnnualChargesDue: number;
  overallOtherChargesDue: number;
  overallPendingAmount: number;
  totalDefaultersCount: number;
}

export interface DefaulterReportFilter {
  campusId: number;
  sessionId: number;
  gradeId?: number | null;
  sectionId?: number | null;
  asOfDate: string;
}

// --------------------
// Async Thunks
// --------------------

export const GetDefaulterReport = createAsyncThunk<DefaulterReportData, DefaulterReportFilter>(
  'academicReport/getDefaulterReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: DefaulterReportData, status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/DefaulterSummaryReport`,
        filter
      );
      if (!response.data.status) {
        toast.error(response.data.message);
        return rejectWithValue(response.data.message);
      }
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred while fetching defaulter report');
      return rejectWithValue(error.response?.data?.message || 'An error occurred');
    }
  }
);

export const GetBranchContactList = createAsyncThunk<BranchContactListData[], BranchContactListFilter>(
  'academicReport/getBranchContactList',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: BranchContactListData[], status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/BranchContactList`,
        filter
      );
      if (response.data.status) {
        return response.data.data;
      } else {
        toast.error(response.data.message || 'Failed to fetch branch contact list');
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      toast.error('Error fetching branch contact list');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const GetCollectionReport = createAsyncThunk<CollectionReportItem[], CollectionReportFilter>(
  'academicReport/getCollectionReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: CollectionReportItem[], status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/CollectionReport`,
        filter
      )
      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch collection report')
    }
  }
)

export const GetStudentLedgerReport = createAsyncThunk<StudentLedgerReportData, StudentLedgerFilter>(
  'academicReport/getStudentLedgerReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: StudentLedgerReportData, status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/StudentLedgerReport`,
        filter
      )
      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch student ledger report')
    }
  }
)

export const GetStudentStrengthReport = createAsyncThunk<StudentStrengthReportData, StudentStrengthReportFilter>(
  'academicReport/getStudentStrengthReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: StudentStrengthReportData, status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/StudentStrengthReport`,
        filter
      )

      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch student strength report')
    }
  }
)

export const GetInvoiceReceiptSummaryReport = createAsyncThunk<InvoiceReceiptSummaryReportData, InvoiceReceiptSummaryReportFilter>(
  'academicReport/getInvoiceReceiptSummaryReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: InvoiceReceiptSummaryReportData, status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/InvoiceReceiptSummaryReport`,
        filter
      )
      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch invoice receipt summary report')
    }
  }
)

export const GetAverageFeeReport = createAsyncThunk<AverageFeeReportData, AverageFeeReportFilter>(
  'academicReport/getAverageFeeReport',
  async (filter, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<{ data: AverageFeeReportData, status: boolean, message: string }> = await axios.post(
        `${baseURL}/api/AcademicReport/AverageFeeReport`,
        filter
      )
      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch average fee report')
    }
  }
)

export const GetCampusAdmissionStatusReport = createAsyncThunk<CampusAdmissionStatusReportData[], CampusAdmissionStatusReportFilter | undefined>(
  'academicReport/getCampusAdmissionStatusReport',
  async (filter, { rejectWithValue }) => {
    try {
      const url = filter?.regionId 
        ? `${baseURL}/api/HOReport/CampusAdmissionStatusReport?regionId=${filter.regionId}` 
        : `${baseURL}/api/HOReport/CampusAdmissionStatusReport`
      
      const response: AxiosResponse<{ data: CampusAdmissionStatusReportData[], status: boolean, message: string }> = await axios.get(url)
      
      if (response.data.status) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.message || 'Failed to fetch campus admission status report')
    }
  }
)


// --------------------
// Initial State
// --------------------
const initialState: AcademicReportState = {
  collectionReport: [],
  studentLedgerReport: null,
  studentStrengthReport: null,
  invoiceReceiptSummaryReport: null,
  averageFeeReport: null,
  campusAdmissionStatusReport: null,
  branchContactList: null,
  defaulterReportData: null,
  loading: false,
  error: null
}


// --------------------
// Slice
// --------------------
const AcademicReportSlice = createSlice({
  name: 'academicReport',
  initialState,
  reducers: {
    clearCollectionReport: (state) => {
      state.collectionReport = [];
      state.error = null;
    },
    clearStudentLedgerReport: (state) => {
      state.studentLedgerReport = null;
      state.error = null;
    },
    clearStudentStrengthReport: (state) => {
      state.studentStrengthReport = null;
      state.error = null;
    },
    clearInvoiceReceiptSummaryReport: (state) => {
      state.invoiceReceiptSummaryReport = null;
      state.error = null;
    },
    clearAverageFeeReport: (state) => {
      state.averageFeeReport = null;
      state.error = null;
    },
    clearCampusAdmissionStatusReport: (state) => {
      state.campusAdmissionStatusReport = null;
      state.error = null;
    },
    clearBranchContactList: (state) => {
      state.branchContactList = null;
      state.error = null;
    },
    clearDefaulterReport: (state) => {
      state.defaulterReportData = null;
      state.error = null;
    }

  },
  extraReducers: builder => {
    builder
      .addCase(GetCollectionReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetCollectionReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.collectionReport = payload
      })
      .addCase(GetCollectionReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Student Ledger Report
      .addCase(GetStudentLedgerReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetStudentLedgerReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.studentLedgerReport = payload
      })
      .addCase(GetStudentLedgerReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Student Strength Report
      .addCase(GetStudentStrengthReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetStudentStrengthReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.studentStrengthReport = payload
      })
      .addCase(GetStudentStrengthReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Invoice Receipt Summary Report
      .addCase(GetInvoiceReceiptSummaryReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetInvoiceReceiptSummaryReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.invoiceReceiptSummaryReport = payload
      })
      .addCase(GetInvoiceReceiptSummaryReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Average Fee Report
      .addCase(GetAverageFeeReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetAverageFeeReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.averageFeeReport = payload
      })
      .addCase(GetAverageFeeReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Campus Admission Status Report
      .addCase(GetCampusAdmissionStatusReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetCampusAdmissionStatusReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.campusAdmissionStatusReport = payload
      })
      .addCase(GetCampusAdmissionStatusReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Branch Contact List
      .addCase(GetBranchContactList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetBranchContactList.fulfilled, (state, { payload }) => {
        state.loading = false
        state.branchContactList = payload
      })
      .addCase(GetBranchContactList.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

      // Defaulter Report
      .addCase(GetDefaulterReport.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(GetDefaulterReport.fulfilled, (state, { payload }) => {
        state.loading = false
        state.defaulterReportData = payload
      })
      .addCase(GetDefaulterReport.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload as string
      })

  }
})

export const { clearCollectionReport, clearStudentLedgerReport, clearStudentStrengthReport, clearInvoiceReceiptSummaryReport, clearAverageFeeReport, clearCampusAdmissionStatusReport, clearBranchContactList, clearDefaulterReport } = AcademicReportSlice.actions

export default AcademicReportSlice.reducer
