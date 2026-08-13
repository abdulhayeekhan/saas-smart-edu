import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast'
const baseURL = process.env.REACT_APP_API_BASE_URL;

// =================== Types ===================
interface GetUsersPayload {
  pageNo: number;
  pageSize: number;
  username?: string;
  email?: string;
  contactNumber?: string;
  name?: string;
}

export interface User {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  password?: string;
  email: string;
  contactNumber: string;
  isEnabled: boolean;
  roleId: number;
  userLevel: number;
  userLevelId: number | null;
}

interface UsersState {
  data: User[];
  selectedUser: User | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

// =================== Initial State ===================
const initialState: UsersState = {
  data: [],
  selectedUser: null,
  totalCount: 0,
  pageSize: 25,
  currentPage: 1,
  loading: false,
  error: null,
};

// =================== Thunks ===================

// Fetch users
export const GetUsers = createAsyncThunk(
  'users/getUsers',
  async (payload: GetUsersPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Account/GetAllUser`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

// Get Single User
export const GetSingleUser = createAsyncThunk<User, number>(
  'users/getSingleUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/Account/GetUser?userId=${userId}`);
      const res = response.data;

      // Checking if status is true based on your existing pattern
      if (res.status || res.id) {
        return res.data || res; // Use res.data if your API wraps it, otherwise use res
      } else {
        return rejectWithValue(res.message || 'User not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

// Add user
export const AddUser = createAsyncThunk<User, Partial<User>>(
  'users/addUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Account/CreateUser`, payload);
      const res = response.data;
      if (res.status) {
        toast.success('🎉 User has been added successfully!')
        return res.data as User; // assuming API returns created user in `data`
      } else {
        toast.error('Your username,email/ContactNo already exist!')
        return rejectWithValue(res.message || 'Failed to add user');
      }
    } catch (error: any) {
      toast.error('Your username,email/ContactNo already exist!')
      return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
    }
  }
);

// Update User
export const UpdateUser = createAsyncThunk<User, Partial<User>>(
  "users/updateUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/Account/UpdateUser`, payload);
      const res = response.data;

      if (res.status) {
        toast.success("User updated successfully!");
        return res.data as User; // updated user return
      } else {
        toast.error(res.message || "Failed to update user");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error("Error updating user");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Reset Password
export const ResetPassword = createAsyncThunk<
  any,
  { email: string; newPassword: string }
>(
  "users/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { email, newPassword } = payload
      const response = await axios.post(
        `${baseURL}/api/Account/UpdateEmpPassword?email=${encodeURIComponent(
          email
        )}&newPassword=${encodeURIComponent(newPassword)}`
      );

      const res = response.data;

      if (res.status) {
        toast.success("Password updated successfully!");
        return res;
      } else {
        toast.error(res.message || "Failed to reset password");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error("Error resetting password");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Decrypt Password
export const DecryptPassword = createAsyncThunk<
  string, // Returns the decrypted password as a string
  number // Takes userId as number
>(
  "users/decryptPassword",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/Account/DecryptPassword?userId=${userId}`
      );
      const res = response.data;

      if (res.status) {
        return res.message as string; // Password is returned in message
      } else {
        toast.error(res.message || "Failed to decrypt password");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      toast.error("Error decrypting password");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// =================== Slice ===================
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get Users
    builder
      .addCase(GetUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalCount = action.payload.totalCount;
        state.pageSize = action.payload.pageSize;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(GetUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add User
    builder
      .addCase(AddUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AddUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.data.unshift(action.payload); // Add new user to the top
      })
      .addCase(AddUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Single User
    builder
      .addCase(GetSingleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null; // Clear previous user while loading
      })
      .addCase(GetSingleUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(GetSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update User  
    builder
      .addCase(UpdateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;

        // find and replace updated user
        const index = state.data.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(UpdateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Reset Password
    builder
      .addCase(ResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ResetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(ResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;
