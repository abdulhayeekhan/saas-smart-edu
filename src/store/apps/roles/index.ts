import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'
const baseURL = process.env.REACT_APP_API_BASE_URL;

// ✅ Define the Role interface
export interface Role {
  id: number
  name: string
  description?: string
  roleType?: number
  isEnabled?: boolean
  isVisible?: number
}

// ✅ Define the slice state interface
interface RoleState {
  data: Role[]
  loading: boolean
  status: boolean
  fulfilled?: any
}

// ✅ Initial state
const initialState: RoleState = {
  data: [],
  loading: false,
  status: false
}

// ✅ Thunks

export const GetAllRoles = createAsyncThunk<Role[]>('getAllRoles', async () => {
  try {
    const { data } = await axios.get(`${baseURL}/api/Role/GetAllRoles`)
    return data.data as Role[]
  } catch (error) {
    console.error(error)
    throw error
  }
})

export const getRoleById = createAsyncThunk<any, number>(
  'getRoleById',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/Role/GetRole?roleId=${roleId}`)
      if (response.data.status === true) {
        return response.data
      } else {
        toast.error('Sorry! Something went wrong')
        return rejectWithValue('Failed to fetch role')
      }
    } catch (error: any) {
      console.error('Error While getting role By ID', error)
      return rejectWithValue(error.response?.data?.message || 'Error fetching role')
    }
  }
)

export const DeleteRole = createAsyncThunk<{ id: number }, number>(
  'deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseURL}/api/Role/DeleteRole?roleId=${id}`)
      toast.success('Role Successfully Deleted')
      return { id }
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.response?.data?.message || 'Error deleting role')
    }
  }
)

export const createRole = createAsyncThunk<Role | null, Partial<Role>>(
  'createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/Role/CreateRole`, roleData)
      if (response.data.status === true) {
        toast.success('Role Successfully Created')
        return response.data.data as Role
      } else {
        toast.error('Sorry! Something went wrong')
        return null
      }
    } catch (error: any) {
      console.error('Error while creating a role', error.response?.data?.message)
      toast.error(error.response?.data?.message || 'Error creating role')
      return rejectWithValue(error.response?.data?.message || 'Error creating role')
    }
  }
)

export const updateRole = createAsyncThunk<Role | null, Partial<Role>>(
  'updateRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/Role/UpdateRole/</Role>`, roleData)
      if (response.data.status === true) {
        toast.success('Role Successfully Updated')
        return response.data.data as Role
      } else {
        toast.error('Sorry! Something went wrong')
        return null
      }
    } catch (error: any) {
      console.error('Error while updating a role', error.response?.data?.message)
      toast.error(error.response?.data?.message || 'Error updating role')
      return rejectWithValue(error.response?.data?.message || 'Error updating role')
    }
  }
)

// ✅ Slice definition
const RoleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // 👉 Get All Roles
      .addCase(GetAllRoles.pending, state => {
        state.loading = true
      })
      .addCase(GetAllRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false
        state.data = action.payload
        state.status = true
      })
      .addCase(GetAllRoles.rejected, state => {
        state.loading = false
        state.status = false
      })

      // 👉 Get Role By ID
      .addCase(getRoleById.pending, state => {
        state.loading = true
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false
        state.fulfilled = action.payload
        state.status = true
      })
      .addCase(getRoleById.rejected, state => {
        state.loading = false
        state.status = false
      })

      // 👉 Delete Role
      .addCase(DeleteRole.pending, state => {
        state.loading = true
      })
      .addCase(DeleteRole.fulfilled, (state, action) => {
        state.loading = false
        state.data = state.data.filter(role => role.id !== action.payload.id)
        state.status = true
      })
      .addCase(DeleteRole.rejected, state => {
        state.loading = false
        state.status = false
      })

      // 👉 Create Role
      .addCase(createRole.pending, state => {
        state.loading = true
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.data.push(action.payload)
          state.status = true
        }
      })
      .addCase(createRole.rejected, state => {
        state.loading = false
        state.status = false
      })

      // 👉 Update Role
      .addCase(updateRole.pending, state => {
        state.loading = true
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const index = state.data.findIndex(role => role.id === action.payload!.id)
          if (index !== -1) state.data[index] = action.payload
          else state.data.push(action.payload)
          state.status = true
        }
      })
      .addCase(updateRole.rejected, state => {
        state.loading = false
        state.status = false
      })
  }
})

export default RoleSlice.reducer
