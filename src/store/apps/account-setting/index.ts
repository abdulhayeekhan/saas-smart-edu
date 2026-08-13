import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
export interface AccountSettingPayload {
  settingType: string;
  debitAccountId: number;
  creditAccountId: number;
}

export interface AccountSetting {
  id: number;
  settingType: string;
  debitAccountId: number;
  creditAccountId: number;
  debitAccountName?: string;
  creditAccountName?: string;
}

interface AccountSettingState {
  data: AccountSetting[];
  selectedSetting: AccountSetting | null;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: AccountSettingState = {
  data: [],
  selectedSetting: null,
  loading: false,
  error: null,
};

// =================== Thunks ===================

// Save Setting
export const SaveSetting = createAsyncThunk<AccountSetting, AccountSettingPayload>(
  'accountSetting/saveSetting',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/AccountSetting/SaveSetting`, payload);
      const res = response.data;
      if (res.status) {
        toast.success(res.message || 'Settings saved successfully');
        return res.data as AccountSetting;
      } else {
        toast.error(res.message || 'Failed to save settings');
        return rejectWithValue(res.message || 'Failed to save settings');
      }
    } catch (error: any) {
      toast.error('Error saving settings');
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

// Get Setting
export const GetSetting = createAsyncThunk<AccountSetting, string>(
  'accountSetting/getSetting',
  async (type, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/AccountSetting/GetSetting?type=${encodeURIComponent(type)}`);
      const res = response.data;
      if (res.status) {
        return res.data as AccountSetting;
      } else {
        return rejectWithValue(res.message || 'Setting not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

// Get All Settings
export const GetAllSettings = createAsyncThunk<AccountSetting[]>(
  'accountSetting/getAllSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/AccountSetting/GetAllSettings`);
      const res = response.data;
      if (res.status) {
        return res.data as AccountSetting[];
      } else {
        return rejectWithValue(res.message || 'Failed to fetch settings');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

// =================== Slice ===================
const accountSettingSlice = createSlice({
  name: 'accountSetting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Save Setting
    builder
      .addCase(SaveSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SaveSetting.fulfilled, (state, action: PayloadAction<AccountSetting>) => {
        state.loading = false;
        // Update or add the setting
        const index = state.data.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(SaveSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Setting
    builder
      .addCase(GetSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedSetting = null;
      })
      .addCase(GetSetting.fulfilled, (state, action: PayloadAction<AccountSetting>) => {
        state.loading = false;
        state.selectedSetting = action.payload;
      })
      .addCase(GetSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get All Settings
    builder
      .addCase(GetAllSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllSettings.fulfilled, (state, action: PayloadAction<AccountSetting[]>) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(GetAllSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default accountSettingSlice.reducer;
