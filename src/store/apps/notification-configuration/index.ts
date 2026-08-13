import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export interface NotificationConfiguration {
  id?: number;
  feeGenerationEnabled: boolean;
  feeReceiptEnabled: boolean;
  admissionEnabled: boolean;
  attendancePresentEnabled: boolean;
  attendanceAbsentEnabled: boolean;
  attendanceLeaveEnabled: boolean;
  feeDefaulterEnabled: boolean;
  feeDefaulterOccurrence: number;
  feeDefaulterOccurrenceName?: string;
  modifiedAt?: string | null;
}

export interface NotificationConfigState {
  data: NotificationConfiguration | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationConfigState = {
  data: null,
  loading: false,
  error: null,
};

export const GetConfiguration = createAsyncThunk<NotificationConfiguration, void>(
  'notificationConfig/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/NotificationConfiguration/GetConfiguration`);
      const res = response.data;
      if (res.status) {
        return res.data as NotificationConfiguration;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const UpdateConfiguration = createAsyncThunk<NotificationConfiguration, NotificationConfiguration>(
  'notificationConfig/update',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/NotificationConfiguration/UpdateConfiguration`, body);
      const res = response.data;
      if (res.status || res.data) {
        toast.success('Notification Configuration updated successfully!');
        return body; // Return the updated payload
      } else {
        toast.error(res.message || 'Failed to update configuration');
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error('Error updating configuration');
      return rejectWithValue(error.message);
    }
  }
);

const notificationConfigSlice = createSlice({
  name: 'notificationConfig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get
    builder.addCase(GetConfiguration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetConfiguration.fulfilled, (state, action: PayloadAction<NotificationConfiguration>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(GetConfiguration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update
    builder.addCase(UpdateConfiguration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(UpdateConfiguration.fulfilled, (state, action: PayloadAction<NotificationConfiguration>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(UpdateConfiguration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default notificationConfigSlice.reducer;
