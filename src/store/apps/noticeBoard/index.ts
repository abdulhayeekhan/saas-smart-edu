import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const baseURL = process.env.REACT_APP_API_BASE_URL;

// ======================= Types =======================

export interface Notice {
  id?: number;
  title: string;
  noticeDate: string;
  gradeId: number | null;
  campusId: number | null;
  publishedAt: string;
  message: string;
  messageTo: string;
  attachmentLink: string;
  regions: string;
  isEnabled: boolean;
  createdBy?: number;
  createdAt?: string;
  modifiedBy?: number;
  modifiedAt?: string;
  createdUser?: any;
  modifiedUser?: any;
}

export interface NoticeFilter {
  pageNo: number;
  pageSize: number;
  totalCount?: number,
  search?: string;
  gradeId?: number | null;
  campusId?: number | null;
  isEnabled?: boolean;
  regionId?: number | null;
  fromDate?: string;
  toDate?: string;
}

// ======================= Thunks =======================

// GET ALL
export const GetAllNotices = createAsyncThunk(
  "notice/getAll",
  async (payload: NoticeFilter, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/AcademicMaterial/GetAll`, payload);
      const res = response.data;

      if (res.status) {
        return res; // return the full response including metadata and data
      }
      toast.error(res.message || "Failed to fetch notices");
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// GET BY ID
export const GetNoticeById = createAsyncThunk(
  "notice/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/AcademicMaterial/GetMaterial?id=${id}`);
      const res = response.data;

      if (res.status) return res.data;
      toast.error(res.message || "Failed to load notice");
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
      return rejectWithValue(error.response?.data);
    }
  }
);

// ADD
export const AddNotice = createAsyncThunk(
  "notice/add",
  async (payload: Partial<Notice>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/AcademicMaterial/Add`, payload);
      const res = response.data;

      if (res.status) {
        toast.success("Notice added successfully!");
        return res.data;
      }
      toast.error(res.message || "Failed to add notice");
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
      return rejectWithValue(error.response?.data);
    }
  }
);

// UPDATE
export const EditNotice = createAsyncThunk(
  "notice/edit",
  async (payload: Partial<Notice>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/AcademicMaterial/Update`, payload);
      const res = response.data;

      if (res.status) {
        toast.success("Notice updated successfully!");
        return res.data;
      }
      toast.error(res.message || "Failed to update notice");
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
      return rejectWithValue(error.response?.data);
    }
  }
);

// DELETE
export const DeleteNotice = createAsyncThunk(
  "notice/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      // Adjusting to the specific endpoint format you provided
      const response = await axios.delete(`${baseURL}/api/AcademicMaterial/Delete?id=${id}`);
      const res = response.data;

      if (res.status) {
        toast.success("Notice deleted successfully!");
        return id; // Return the ID so we can remove it from the state
      }
      toast.error(res.message || "Failed to delete notice");
      return rejectWithValue(res.message);
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
      return rejectWithValue(error.response?.data);
    }
  }
);

// ======================= Slice =======================

interface NoticesState {
  data: Notice[];         // just the array
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedNotice: Notice | null;
}

const initialState: NoticesState = {
  data: [],
  totalCount: 0,
  pageSize: 25,
  currentPage: 1,
  loading: false,
  error: null,
  selectedNotice: null,
};

const noticesSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder
      .addCase(GetAllNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllNotices.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data;            // array of notices
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetAllNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GET BY ID
    builder
      .addCase(GetNoticeById.pending, (state) => {
        state.loading = true;
        state.selectedNotice = null;
      })
      .addCase(GetNoticeById.fulfilled, (state, action: PayloadAction<Notice>) => {
        state.loading = false;
        state.selectedNotice = action.payload;
      })
      .addCase(GetNoticeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ADD
    builder
      .addCase(AddNotice.pending, (state) => {
        state.loading = true;
      })
      .addCase(AddNotice.fulfilled, (state, action: PayloadAction<Notice>) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(AddNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // EDIT
    builder
      .addCase(EditNotice.pending, (state) => {
        state.loading = true;
      })
      .addCase(EditNotice.fulfilled, (state, action: PayloadAction<Notice>) => {
        state.loading = false;

        const index = state.data.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload; // update existing
        }
      })
      .addCase(EditNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // DELETE
    builder
      .addCase(DeleteNotice.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteNotice.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        // Remove the deleted notice from the local state array
        state.data = state.data.filter((notice) => notice.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(DeleteNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default noticesSlice.reducer;
