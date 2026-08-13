import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================

export interface InquiryType {
  id?: number
  campusId: number
  inquiryNo?: number
  firstName: string
  middleName?: string
  familyName: string
  dateOfBirth: string
  fatherName: string
  email?: string
  religionId: number
  religion?: string;
  contactNumber: string
  cnic?: string
  inquiryDate: string
  motherTongeId: number
  montherTonge?: string;

  cCountryId: number
  cCountry?: string;
  cCityId: number
  cCity?: string;
  cProvinceId: number
  cProvince?: string;
  cHouseNo?: string
  cStreetNo?: string
  cTown?: string

  pCountryId: number | null
  pCityId: number | null
  pProvinceId: number | null
  pHouseNo?: string
  pStreetNo?: string
  pTown?: string

  referenceId: number
  gradeId: number
  sessionId: number
  sessionName?: string;
  status: string
  isDeleted?: boolean
}

export interface InquiryFilter {
  pageNo: number
  pageSize: number
  search?: string
  gradeId?: number
  campusId?: number
  regionId?: number
}



export interface InquiryResponse {
  data: InquiryType[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}


export interface InquiryState {
  data: InquiryType[]
  single: InquiryType | null
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
  loading: boolean
  message: string
  status: boolean
}


// ================= ASYNC THUNKS ==================

// 👉 Get All Inquiries (POST)
export const GetInquiries = createAsyncThunk<
  InquiryResponse,
  InquiryFilter
>(
  'inquiry/getAll',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/Inquiry/GetAll`,
        payload
      )

      if (data.status) return data as InquiryResponse

      toast.error(data.message || 'Failed to load inquiries')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)




// 👉 Get Single Inquiry by ID
export const GetInquiry = createAsyncThunk<
  InquiryType,
  number
>(
  'inquiry/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/Inquiry/GetById?id=${id}`
      )

      if (data.status) return data.data as InquiryType

      toast.error(data.message || 'Failed to load inquiry')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Inquiry
export const AddInquiry = createAsyncThunk<
  any,
  InquiryType
>(
  'inquiry/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/Inquiry/AddInquiry`,
        payload
      )

      if (data.status) {
        toast.success('Inquiry added successfully')
        return data.data
      }

      toast.error(data.message || 'Failed to add inquiry')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// ================= INITIAL STATE ==================

const initialState: InquiryState = {
  data: [],
  single: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  totalPages: 0,
  loading: false,
  message: '',
  status: false,
}

// ================= SLICE ==================

const InquirySlice = createSlice({
  name: 'inquiry',
  initialState,
  reducers: {
    clearInquirySingle: state => {
      state.single = null
    },
  },
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetInquiries.pending, state => {
        state.loading = true
      })
      .addCase(
        GetInquiries.fulfilled,
        (state, action: PayloadAction<InquiryResponse>) => {
          state.loading = false
          state.status = true
          state.data = action.payload.data
          state.totalCount = action.payload.totalCount
          state.pageSize = action.payload.pageSize
          state.currentPage = action.payload.currentPage
          state.totalPages = action.payload.totalPages
        }
      )
      .addCase(GetInquiries.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Get Single ----------
      .addCase(
        GetInquiry.fulfilled,
        (state, action: PayloadAction<InquiryType>) => {
          state.single = action.payload
        }
      )

      // ---------- Add ----------
      .addCase(AddInquiry.pending, state => {
        state.loading = true
      })
      .addCase(AddInquiry.fulfilled, state => {
        state.loading = false
      })
      .addCase(AddInquiry.rejected, state => {
        state.loading = false
      })
  },
})

export const { clearInquirySingle } = InquirySlice.actions
export default InquirySlice.reducer
