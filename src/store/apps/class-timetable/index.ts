import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// Types
export interface TimetableEntry {
  id?: number;
  timetableId?: number;
  dayOfWeek: string;
  subjectId: number;
  subjectName?: string;
  employeeId: number;
  employeeName?: string;
  timeFrom: string;
  timeTo: string;
}

export interface Timetable {
  id?: number;
  campusId: number;
  campusName?: string;
  gradeId: number;
  gradeName?: string;
  sectionId: number;
  sectionName?: string;
  createdBy?: number;
  subjectGroup: string;
  periodStartTime: string;
  durationMinutes: number;
  isEnabled: boolean;
  entries: TimetableEntry[];
}

interface GetAllPayload {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  campusId?: number;
  gradeId?: number;
  sectionId?: number;
  isEnabled?: boolean;
}

interface GetAllResponse {
  data: Timetable[];
  totalCount: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  status: boolean;
  message: string;
}

export interface TimetableState {
  data: Timetable[];
  selectedTimetable: Timetable | null;
  loading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

const initialState: TimetableState = {
  data: [],
  selectedTimetable: null,
  loading: false,
  isActionLoading: false,
  error: null,
};

// Async Thunks
export const AddTimetable = createAsyncThunk<Timetable, Timetable>(
  'classTimetable/add',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Timetable/Add`, body);
      const res = response.data;
      if (res.status) {
        toast.success(res.message || 'Timetable added successfully!');
        return res.data;
      }
      toast.error(res.message || 'Failed to add timetable');
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return rejectWithValue(error.message);
    }
  }
);

export const UpdateTimetable = createAsyncThunk<Timetable, Timetable>(
  'classTimetable/update',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Timetable/Update`, body);
      const res = response.data;
      if (res.status) {
        toast.success(res.message || 'Timetable updated successfully!');
        return res.data;
      }
      toast.error(res.message || 'Failed to update timetable');
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return rejectWithValue(error.message);
    }
  }
);

export const GetAllTimetables = createAsyncThunk<GetAllResponse, GetAllPayload>(
  'classTimetable/getAll',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Timetable/GetAll`, body);
      const res = response.data;
      if (res.status) {
        return res;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const GetTimetableById = createAsyncThunk<Timetable, number>(
  'classTimetable/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/Timetable/GetById/${id}`);
      const res = response.data;
      if (res.status) {
        return res.data;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const GetTimetableByClass = createAsyncThunk<Timetable | null, { campusId: number; gradeId: number; sectionId: number }>(
  'classTimetable/getByClass',
  async ({ campusId, gradeId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/Timetable/GetByClass?campusId=${campusId}&gradeId=${gradeId}&sectionId=${sectionId}`);
      const res = response.data;
      if (res.status) {
        return res.data; // Usually returns a single timetable object if it exists
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Handle gracefully if not found
        return null;
      }
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const classTimetableSlice = createSlice({
  name: 'classTimetable',
  initialState,
  reducers: {
    clearSelectedTimetable(state) {
      state.selectedTimetable = null;
    }
  },
  extraReducers: (builder) => {
    // GetAll
    builder.addCase(GetAllTimetables.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetAllTimetables.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
    });
    builder.addCase(GetAllTimetables.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // GetByClass
    builder.addCase(GetTimetableByClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetTimetableByClass.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTimetable = action.payload;
    });
    builder.addCase(GetTimetableByClass.rejected, (state, action) => {
      state.loading = false;
      state.selectedTimetable = null;
      state.error = action.payload as string;
    });

    // GetById
    builder.addCase(GetTimetableById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetTimetableById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTimetable = action.payload;
    });
    builder.addCase(GetTimetableById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add
    builder.addCase(AddTimetable.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(AddTimetable.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.selectedTimetable = action.payload;
    });
    builder.addCase(AddTimetable.rejected, (state) => {
      state.isActionLoading = false;
    });

    // Update
    builder.addCase(UpdateTimetable.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(UpdateTimetable.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.selectedTimetable = action.payload;
    });
    builder.addCase(UpdateTimetable.rejected, (state) => {
      state.isActionLoading = false;
    });
  },
});

export const { clearSelectedTimetable } = classTimetableSlice.actions;
export default classTimetableSlice.reducer;
