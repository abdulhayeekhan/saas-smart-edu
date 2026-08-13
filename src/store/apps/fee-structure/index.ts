import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface FeeDetailType {
  arrayid: string
  id?: number
  feeStructureId?: number
  feeTypeId: number
  amount: number
  recurreceType: number
  frequence: string
}

export interface FeeStructureType {
  id?: number
  campusId?: number
  sessionId: number
  gradeId: number
  details: FeeDetailType[]
  tblSMSFeeStructureDetails?: FeeDetailType[]
}

export interface FeeStructureState {
  data: FeeStructureType[]
  single: FeeStructureType | null
  message: string
  status: boolean
  loading: boolean
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

// =============== ASYNC THUNKS ===============

// 👉 Get All Fee Structures
export const GetFeeStructures = createAsyncThunk<FeeStructureType[]>(
  'feeStructure/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeStructure/GetAll`)
      if (data.status) return data.data as FeeStructureType[]
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get by Session and Grade
export const GetFeeByGradeSession = createAsyncThunk<FeeStructureType[], { campusId: number; sessionId: number; gradeId: number }>(
  'feeStructure/getByGradeSession',
  async ({ campusId, sessionId, gradeId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/FeeStructure/GetByGradeSession?sessionId=${sessionId}&gradeId=${gradeId}&campusId=${campusId}`
      )

      if (data.status) {
        // Check if data.data is already an array. If not, wrap it in one.
        const result = Array.isArray(data.data) ? data.data : [data.data];
        return result as FeeStructureType[];
      }

      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
)

// 1. Ensure the Generic is set to FeeStructureType[]
export const GetFeeByCampusSession = createAsyncThunk<FeeStructureType[], { sessionId: number; campusId: number }>(
  'feeStructure/getfeebycampussession',
  async ({ sessionId, campusId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/FeeStructure/GetBySession?campusId=${campusId}&sessionId=${sessionId}`
      )

      // 2. Change 'as FeeStructureType' to 'as FeeStructureType[]'
      if (data.status) return data.data as FeeStructureType[]

      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get by Grade
export const GetFeeByGrade = createAsyncThunk<FeeStructureType[], number>(
  'feeStructure/getByGrade',
  async (gradeId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeStructure/GetByGrade?id=${gradeId}`)
      if (data.status) {
        const result = Array.isArray(data.data) ? data.data : [data.data];
        return result as FeeStructureType[];
      }
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Get Single Fee Structure by ID
export const GetFeeById = createAsyncThunk<FeeStructureType, number>(
  'feeStructure/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeStructure/GetById?id=${id}`)
      if (data.status) return data.data as FeeStructureType
      toast.error(data.message || 'Failed to load fee structure')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Fee Structure
export const AddFeeStructure = createAsyncThunk<any, FeeStructureType>(
  'feeStructure/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${baseURL}/api/FeeStructure/AddFeeStructure`, payload)
      if (data.status) {
        toast.success('Fee Structure added successfully')
        const { campusId, sessionId } = payload;

        // Re-fetch the updated data automatically
        dispatch(GetFeeByCampusSession({
          campusId: campusId!,
          sessionId: sessionId!
        }));

        return data.data
      }
      toast.error(data.message || 'Failed to add fee structure')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Update Fee Structure
// REMOVE the curly braces around payload in the async arguments
export const UpdateFeeStructure = createAsyncThunk<any, any>(
  'feeStructure/update',
  async (payload, { rejectWithValue }) => { // <--- Changed from { payload } to payload
    try {
      console.log('Updating Fee Structure with payload:', payload);
      const { data } = await axios.put(`${baseURL}/api/FeeStructure/UpdateFeeStructure`, payload);

      if (data.status) {
        toast.success('Fee Structure updated successfully');
        return data.data;
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);



// =============== INITIAL STATE ===============
const initialState: FeeStructureState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const FeeStructureSlice = createSlice({
  name: 'feeStructure',
  initialState,
  reducers: {
    clearSingleFee: (state) => {
      state.single = null
    }
  },
  extraReducers: builder => {
    builder
      // ---------- Get All ----------
      .addCase(GetFeeStructures.pending, state => {
        state.loading = true
      })
      .addCase(GetFeeStructures.fulfilled, (state, action: PayloadAction<FeeStructureType[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetFeeStructures.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Get By Grade/Session ----------
      .addCase(GetFeeByGradeSession.pending, state => {
        state.loading = true
      })
      .addCase(GetFeeByGradeSession.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // This is now guaranteed to be an array
      })
      .addCase(GetFeeByGradeSession.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.data = []
        state.message = action.payload as string
      })

      // ---------- Get By Campus/Session ----------
      .addCase(GetFeeByCampusSession.pending, state => {
        state.loading = true
      })
      .addCase(GetFeeByCampusSession.fulfilled, (state, action: PayloadAction<FeeStructureType[]>) => {
        state.loading = false
        state.status = true
        state.data = action.payload
      })
      .addCase(GetFeeByCampusSession.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.data = []
        state.message = action.payload as string
      })

      // ---------- Get By Grade ----------
      .addCase(GetFeeByGrade.pending, state => {
        state.loading = true
      })
      .addCase(GetFeeByGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(GetFeeByGrade.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.data = []
        state.message = action.payload as string
      })


      // ---------- Get Single ID ----------
      .addCase(GetFeeById.fulfilled, (state, action: PayloadAction<any>) => {
        state.single = {
          ...action.payload,
          details: action.payload.tblSMSFeeStructureDetails || []
        };
      })

      // ---------- Add ----------
      .addCase(AddFeeStructure.pending, state => {
        state.loading = true
      })
      .addCase(AddFeeStructure.fulfilled, (state, action) => {
        state.loading = false;

        // action.payload is data.data returned from your thunk
        if (action.payload) {
          // We check if state.data is an array to prevent errors
          const currentData = Array.isArray(state.data) ? state.data : [];

          // Spread the existing data and put the new payload at the start
          state.data = [action.payload, ...currentData];
        }
      })
      .addCase(AddFeeStructure.rejected, (state) => {
        state.loading = false;
      })

      // ---------- Update ----------
      .addCase(UpdateFeeStructure.pending, state => {
        state.loading = true
      })
      .addCase(UpdateFeeStructure.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((f: any) => f.id === action.payload.id);

        if (index !== -1) {
          // Cast the existing item to 'any' so TS stops complaining about properties
          const existingItem = state.data[index] as any;
          const oldDetails = existingItem.tblSMSFeeStructureDetails || [];

          const mergedDetails = action.payload.details.map((newDetail: any) => {
            const matchingOldDetail = oldDetails.find((old: any) => old.id === newDetail.id);
            return {
              ...newDetail,
              tblSMSFeeType: matchingOldDetail?.tblSMSFeeType
            };
          });

          state.data[index] = {
            ...existingItem,
            ...action.payload,
            tblSMSFeeStructureDetails: mergedDetails
          };
        }
      })

      
  }
})

export const { clearSingleFee } = FeeStructureSlice.actions
export default FeeStructureSlice.reducer