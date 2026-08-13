import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface SectionType {
  id?: number
  campusId: number
  name: string
  displayName: string
  sortOrder: number
}

export interface SectionState {
  data: SectionType[]
  single: SectionType | null
  message: string
  status: boolean
  loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Sections
export const GetSections = createAsyncThunk<SectionType[]>(
  'section/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/Section/GetSections`)

      if (data.status) return data.data as SectionType[]
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const GetSectionsByCampus = createAsyncThunk<
  SectionType[],   // return type
  number,          // 👈 argument type (campusId)
  { rejectValue: string }
>(
  'section/getSectionsByCampus',
  async (campusId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/Section/GetSectionsByCampus?campusId=${campusId}`
      )

      if (data.status) return data.data as SectionType[]
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)


// 👉 Get Single Section by ID
export const GetSection = createAsyncThunk<SectionType, number>(
  'section/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/Section/GetSection?id=${id}`
      )

      if (data.status) return data.data as SectionType

      toast.error(data.message || 'Failed to load section')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Add Section
export const AddSection = createAsyncThunk<any, SectionType>(
  'section/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/Section/AddSection`,
        payload
      )

      if (data.status) {
        toast.success('Section added successfully')
        if (payload?.campusId) {
          dispatch(GetSectionsByCampus(payload.campusId))
        } else {
          dispatch(GetSections())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to add section')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Update Section
export const UpdateSection = createAsyncThunk<any, SectionType>(
  'section/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${baseURL}/api/Section/UpdateSection`,
        payload
      )

      if (data.status) {
        toast.success('Section updated successfully')
        if (payload?.campusId) {
          dispatch(GetSectionsByCampus(payload.campusId))
        } else {
          dispatch(GetSections())
        }
        return data.data
      }

      toast.error(data.message || 'Failed to update section')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// 👉 Delete Section
export const DeleteSection = createAsyncThunk<any, number>(
  'section/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(
        `${baseURL}/api/Section/Delete?id=${id}`
      )

      if (data.status) {
        toast.success('Section deleted successfully')
        return id
      }

      toast.error(data.message || 'Failed to delete section')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// =============== INITIAL STATE ===============
const initialState: SectionState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

// =============== SLICE ===============
const SectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ---------- Get All ----------
    builder
      .addCase(GetSections.pending, state => {
        state.loading = true
      })
      .addCase(
        GetSections.fulfilled,
        (state, action: PayloadAction<SectionType[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetSections.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })


      .addCase(GetSectionsByCampus.pending, state => {
        state.loading = true
      })
      .addCase(
        GetSectionsByCampus.fulfilled,
        (state, action: PayloadAction<SectionType[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetSectionsByCampus.rejected, (state, action) => {
        state.loading = false;
        state.status = false;
        state.data = []; // Explicitly reset data to empty array on failure
        state.message = action.payload as string;
      })

      // ---------- Get Single ----------
      .addCase(
        GetSection.fulfilled,
        (state, action: PayloadAction<SectionType>) => {
          state.single = action.payload
        }
      )

      // ---------- Add / Update / Delete ----------
      .addCase(AddSection.pending, state => {
        state.loading = true
      })
      .addCase(AddSection.fulfilled, (state, action) => {
        state.loading = false
        state.data.unshift(action.payload)
      })

      .addCase(UpdateSection.pending, state => {
        state.loading = true
      })
      .addCase(UpdateSection.fulfilled, (state, action) => {
        const index = state.data.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.data[index] = action.payload
        }
      })

      .addCase(DeleteSection.pending, state => {
        state.loading = true
      })
      .addCase(DeleteSection.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        state.data = state.data.filter(
          section => section.id !== action.payload
        )
      })
  }
})

export default SectionSlice.reducer