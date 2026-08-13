import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface GetDesignationsPayload {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface Designation {
  id?: number;
  name: string;
  isHO: boolean;
  sortOrder: number;
}

export interface DesignationState {
  data: Designation[];
  selectedDesignation: Designation | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: DesignationState = {
  data: [],
  selectedDesignation: null,
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  loading: false,
  error: null,
};

// =================== Thunks ===================

export const GetAllDesignations = createAsyncThunk(
  'designation/getAll',
  async (payload: GetDesignationsPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDesignation/GetAll`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const GetDesignationById = createAsyncThunk<Designation, number>(
  'designation/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/HRDesignation/GetById?id=${id}`);
      const res = response.data;

      if (res.status || res.id) {
        return res.data || res;
      } else {
        return rejectWithValue(res.message || 'Designation not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const AddDesignation = createAsyncThunk<Designation, Partial<Designation>>(
  'designation/add',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDesignation/Add`, payload);
      const res = response.data;
      if (res.status === true) {
        toast.success(res.message || 'Designation added successfully!');
        return res.data as Designation;
      } else {
        toast.error(res.message || 'Failed to add designation');
        return rejectWithValue(res.message || 'Failed to add designation');
      }
    } catch (error: any) {
      toast.error('Error adding designation!');
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

export const UpdateDesignation = createAsyncThunk<Designation, Partial<Designation>>(
  'designation/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/HRDesignation/Update`, payload);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Designation updated successfully!');
        return res.data as Designation;
      } else {
        toast.error(res.message || 'Failed to update designation');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating designation');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const DeleteDesignation = createAsyncThunk<number, number>(
  'designation/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/HRDesignation/Delete?id=${id}`);
      const res = response.data;

      if (res.status === true) {
        toast.success(res.message || 'Designation deleted successfully!');
        return id;
      } else {
        toast.error(res.message || 'Failed to delete designation');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error deleting designation');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================== Slice ===================
const designationSlice = createSlice({
  name: 'designation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get All Designations
    builder
      .addCase(GetAllDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllDesignations.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Designation
    builder
      .addCase(AddDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddDesignation.fulfilled, (state, action: PayloadAction<Designation>) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(AddDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Designation By Id
    builder
      .addCase(GetDesignationById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDesignation = null;
      })
      .addCase(GetDesignationById.fulfilled, (state, action: PayloadAction<Designation>) => {
        state.loading = false;
        state.selectedDesignation = action.payload;
      })
      .addCase(GetDesignationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Designation
    builder
      .addCase(UpdateDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateDesignation.fulfilled, (state, action: PayloadAction<Designation>) => {
        state.loading = false;
        const index = state.data.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(UpdateDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Designation
    builder
      .addCase(DeleteDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteDesignation.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.data = state.data.filter((d) => d.id !== action.payload);
      })
      .addCase(DeleteDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default designationSlice.reducer;
