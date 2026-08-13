import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================

export interface AdmissionDiscount {
  id?: number
  feeTypeId: number
  discountTypeId: number
  discountPercentage: number
  discountTypeName?: string
  feeTypeName?: string
  discountAmount: number
  isOverride: boolean
}

export interface Admission {
  id?: number
  campusId: number
  firstName: string
  middleName: string
  lastName: string
  admissionNumber?: number
  studentNumber?: string
  gradeId: number
  section?: string
  sectionId: number
  sessionId: number
  session?: string
  sectionName?: string
  admissionDate: string
  religion?: string
  cCity: string
  cProvince: string
  pCity: string
  pProvince: string
  motherTonge?: string
  dateOfBirth: string
  fatherName: string
  religionId: number
  contactNumber: string
  email: string
  cnic: string
  motherTongeId: number
  cCountryId: number
  cCityId: number
  cProvinceId: number
  cHouseNo: string
  cStreetNo: string
  cTown: string
  pCountryId: number
  pCityId: number
  pProvinceId: number
  pHouseNo: string
  pStreetNo: string
  pTown: string
  referenceId: number
  bForm: string
  bFormNumber?: string
  fatherCNIC: string
  motherCNIC: string
  gender: number
  imageUrl: string
  characterCertificate: string
  status?: string
  isEnabled: boolean
  userId: number
  grade?: string
  campusName?: string
  reference?: string
  cCountry?: string
  pCountry?: string
  isSecurityDeposit?: boolean
  depositAmount?: number
  isRefund?: boolean
  depositeAt?: string
  admissionDiscounts: AdmissionDiscount[]
  admissionDiscountList?: AdmissionDiscount[]
}

export interface AdmissionFilter {
  pageNo: number
  pageSize: number
  search?: string
  gradeId?: number | null
  sectionId?: number | null
  campusId?: number | null
  isEnabled: boolean
}

export interface UpdateFeePayload {
  admissionId: number;
  id: number;
  feeTypeId: number;
  discountTypeId: number;
  discountPercentage: number;
  discountAmount: number;
  isOverride: boolean;
}

export interface AdmissionState {
  data: Admission[]
  totalCount: number
  totalPages: number
  currentPage: number
  single: Admission | null
  message: string
  status: boolean
  loading: boolean
  isActionLoading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Admissions (Post Method with Filter)
export const GetAdmissions = createAsyncThunk<any, AdmissionFilter>(
  'admission/getAll',
  async (filter, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Admission/GetAll`, filter)
      if (data.status) return data
      toast.error(data.message || 'Failed to load admissions')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Admission
export const GetAdmission = createAsyncThunk<Admission, number>(
  'admission/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Admission/GetAdmission?id=${id}`)
      if (data.status) return data.data as Admission
      toast.error(data.message || 'Failed to load admission')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Admission
export const AddAdmission = createAsyncThunk<any, Admission>(
  'admission/add',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Admission/AddAdmission`, payload)
      if (data.status) {
        toast.success('Admission created successfully')
        return data.data
      }
      toast.error(data.message || 'Failed to create admission')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Edit Admission
export const EditAdmission = createAsyncThunk<any, Admission>(
  'admission/edit',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Admission/EditAdmission`, payload)
      if (data.status) {
        toast.success('Admission updated successfully')
        if (payload.id) {
          dispatch(GetAdmission(payload.id));
        }
        return data.data
      }
      toast.error(data.message || 'Failed to update admission')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Profile Picture
export const UpdateProfilePic = createAsyncThunk<any, { admissionId: number; imageUrl: string }>(
  'admission/updateProfilePic',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/Admission/UpdateProfilePic`, payload)
      if (data.status) {
        toast.success('Profile picture updated')
        return data.data
      }
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Remove Discount
export const RemoveDiscount = createAsyncThunk<any, { admissionId: number; feeTypeId: number }>(
  'admission/removeDiscount',
  async ({ admissionId, feeTypeId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${baseURL}/api/Admission/RemoveDiscount?admissionId=${admissionId}&feeTypeId=${feeTypeId}`
      )
      if (data.status) {
        toast.success('Discount removed')
        return { admissionId, feeTypeId }
      }
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Bulk Import
// export const BulkImportAdmissions = createAsyncThunk<any, { campusId: number; userId: number; file: File }>(
//   'admission/bulkImport',
//   async ({ campusId, userId, file }, { rejectWithValue }) => {
//     try {
//       const formData = new FormData()
//       formData.append('file', file)
//       const { data } = await axios.post(
//         `${baseURL}/api/Admission/bulk-import?campusId=${campusId}&userId=${userId}`,
//         formData
//       )
//       console.log('res data:', data)
//       if (data.status) {
//         toast.success('Bulk import successful')
//         return data.data
//       }
//       return rejectWithValue(data.message)
//     } catch (error: any) {
//       toast.error(error.message)
//       return rejectWithValue(error.message)
//     }
//   }
// )
// export const BulkImportAdmissions = createAsyncThunk<any, { campusId: number; userId: number; file: File }>(
//   'admission/bulkImport',
//   async ({ campusId, userId, file }, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const { data } = await axios.post(
//         `${baseURL}/api/Admission/bulk-import?campusId=${campusId}&userId=${userId}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );


//       // Handle the case where the API returns a JSON object with a status field
//       // if (data.status === true) {
//       //   toast.success(data.message || 'Bulk import successful');
//       //   return data.data;
//       // } else {
//       //   // Handle case where status is false (e.g., business logic validation)
//       //   const msg = typeof data === 'string' ? data : data.message || 'Import failed';
//       //   toast.error(msg);
//       //   return rejectWithValue(msg);
//       // }
//       toast.success('Bulk import successful');
//       return data
//     } catch (error: any) {
//       // 1. Check if the server sent a raw string error (like "Invalid file format")
//       let errorMessage = 'An unknown error occurred';

//       if (error.response) {
//         // If the backend returns a direct string instead of JSON
//         if (typeof error.response.data === 'string') {
//           errorMessage = error.response.data;
//         }
//         // If the backend returns a standard JSON error object
//         else if (error.response.data?.message) {
//           errorMessage = error.response.data.message;
//         }
//       } else {
//         errorMessage = error.message;
//       }

//       // 2. Show the string in the toast
//       toast.error(errorMessage);

//       // 3. Return ONLY the string to Redux to prevent the "React Child" error
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

export const BulkImportAdmissions = createAsyncThunk<any, { campusId: number; userId: number; file: File }>(
  'admission/bulkImport',
  async ({ campusId, userId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post(
        `${baseURL}/api/Admission/bulk-import?campusId=${campusId}&userId=${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Bulk import successful');
      return data;
    } catch (error: any) {
      if (error.response) {
        const serverData = error.response.data;

        // CASE 1: Validation Errors Array
        if (serverData.errors && Array.isArray(serverData.errors)) {
          toast.error(serverData.message || 'Validation failed');
          return rejectWithValue(serverData); // Pass the whole object { message, errors }
        }

        // CASE 2: Plain String Error (e.g., "Invalid file format")
        if (typeof serverData === 'string') {
          toast.error(serverData);
          return rejectWithValue({ message: serverData });
        }

        // CASE 3: Standard Message object
        if (serverData.message) {
          toast.error(serverData.message);
          return rejectWithValue(serverData);
        }
      }

      const fallbackMsg = error.message || 'An unknown error occurred';
      toast.error(fallbackMsg);
      return rejectWithValue({ message: fallbackMsg });
    }
  }
);

export const UpdateFee = createAsyncThunk<any, UpdateFeePayload[]>(
  'admission/updateFee',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      // CHANGE axios.put TO axios.post 
      const { data } = await axios.post(`${baseURL}/api/Admission/UpdateFee`, payload);

      if (data.status) {
        toast.success(data.message || 'Fee updated successfully');
        if (payload.length > 0 && payload[0].admissionId) {
          dispatch(GetAdmission(payload[0].admissionId));
        }
        return data.data;
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      // If still 405, it means the URL itself might be wrong or doesn't support POST/PUT
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// =============== INITIAL STATE ===============
const initialState: AdmissionState = {
  data: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 0,
  single: null,
  message: '',
  status: false,
  loading: false,
  isActionLoading: false,
}

// =============== SLICE ===============
const AdmissionSlice = createSlice({
  name: 'admission',
  initialState,
  reducers: {
    // Helpful for clearing state on component unmount
    resetAdmissionState: (state) => {
      state.data = [];
      state.totalCount = 0;
      state.single = null;
    }
  },
  extraReducers: builder => {
    builder
      // Get All
      .addCase(GetAdmissions.pending, state => {
        state.loading = true
        state.data = [];
      })
      .addCase(GetAdmissions.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(GetAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
      })

      // Get Single
      .addCase(GetAdmission.fulfilled, (state, action) => {
        state.single = action.payload
      })


      .addCase(EditAdmission.fulfilled, (state, action) => {
        // 1. If your API returns the updated object, update it in the data array
        if (action.payload && action.payload.id) {
          const index = state.data.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        }
        // Note: We don't manually set state.single here because 
        // GetAdmission.fulfilled (dispatched above) will handle it.
        state.isActionLoading = false;
      })

      .addCase(UpdateFee.pending, state => {
        state.isActionLoading = true;
      })
      .addCase(UpdateFee.fulfilled, (state, action) => {
        state.isActionLoading = false;
        // The GetAdmission dispatch inside the Thunk will update state.single
      })
      .addCase(UpdateFee.rejected, (state, action) => {
        state.isActionLoading = false;
        state.message = action.payload as string;
      })

      // Global Loading for Actions
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.includes('getAll'),
        (state) => { state.isActionLoading = true }
      )
      .addMatcher(
        (action) => (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && !action.type.includes('getAll'),
        (state) => { state.isActionLoading = false }
      )
  }
})

export const { resetAdmissionState } = AdmissionSlice.actions;
export default AdmissionSlice.reducer