// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// ** Axios Imports
import axios from "axios";
import toast from "react-hot-toast";

// Import single definition (don’t redefine it here)
import { ModulePermission } from "../../../types/permissions";

const baseURL = process.env.REACT_APP_API_BASE_URL;

// ==================
// API Response Types
// ==================
interface PermissionPayload {
  moduleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
  roleId: number;
}

export interface PermissionCreate {
  moduleId: number;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}

interface PermissionUpdate {
  id: number;
  moduleId: number;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}

interface PermissionResponse {
  status: boolean;
  data: ModulePermission[];
}

// ==================
// Slice State
// ==================
export interface AppPermissionsState {
  data: ModulePermission[]; // for list/grid display
  total: number;
  params: Record<string, any>;
  allData: ModulePermission[];
  loading: boolean;
  permissions: ModulePermission[]; //clearer name than fulfilled
  status: boolean | null;
  error?: string | null;
}

// ==================
// Thunks
// ==================
export const fetchData = createAsyncThunk(
  "appPermissions/fetchData",
  async (params: Record<string, any>) => {
    const response = await axios.get("/apps/permissions/data", { params });
    return response.data;
  }
);

// export const createPermissions = createAsyncThunk<
//   ModulePermission[] | null, // return type
//   ModulePermission[],        // argument type
//   { rejectValue: string }
// >("createPermission", async (moduleData, { rejectWithValue }) => {
//   const roleId = parseInt(sessionStorage.getItem("roleId") || "0", 10);

//   if (!roleId) return rejectWithValue("Role ID not found");

//   const updatedModuleData: PermissionPayload[] = moduleData.map((module) => ({
//     moduleId: module.moduleId, //use `moduleId` from types/permissions
//     viewRight: module.viewRight,
//     addRight: module.addRight,
//     editRight: module.editRight,
//     deleteRight: module.deleteRight,
//     roleId,
//   }));

//   try {
//     const response = await axios.post<PermissionResponse>(
//       `${baseURL}/api/permission/createpermissions`,
//       updatedModuleData
//     );

//     if (response.data.status === true) {
//       toast.success("Permission Successfully Created");
//       return response.data.data;
//     } else {
//       toast.error("Sorry! Something went wrong");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error while creating permissions", error);
//     return rejectWithValue("Error while creating permissions");
//   }
// });

export const createPermissions = createAsyncThunk<
  ModulePermission[] | null, // return type
  PermissionCreate[],         // argument type (changed here)
  { rejectValue: string }
>("createPermission", async (moduleData, { rejectWithValue }) => {

  const updatedModuleData: PermissionPayload[] = moduleData.map((module) => ({
    moduleId: module.moduleId,
    viewRight: module.viewRight,
    addRight: module.addRight,
    editRight: module.editRight,
    deleteRight: module.deleteRight,
    roleId: module.roleId,
  }));
  try {


    const response = await axios.post<PermissionResponse>(
      `${baseURL}/api/permission/createpermissions`,
      updatedModuleData,
    );

    if (response.data.status === true) {
      toast.success("Permission Successfully Created");
      return response.data.data;
    } else {
      toast.error("Sorry! Something went wrong");
      return null;
    }
  } catch (error) {
    console.error("Error while creating permissions", error);
    return rejectWithValue("Error while creating permissions");
  }
});


export const updatePermissions = createAsyncThunk<
  ModulePermission[] | null,   // return type
  PermissionUpdate[],          // argument type
  { rejectValue: string }
>(
  "updatePermission",
  async (permissionData, { rejectWithValue }) => {

    // 🔧 Ensure booleans and shape match backend expectations
    const updatedModuleData = permissionData.map((module) => ({
      id: module.id,
      moduleId: module.moduleId,
      roleId: module.roleId,
      viewRight: Boolean(module.viewRight),
      addRight: Boolean(module.addRight),
      editRight: Boolean(module.editRight),
      deleteRight: Boolean(module.deleteRight),
    }));

    try {
      const response = await axios.put<PermissionResponse>(
        `${baseURL}/api/permission/updatepermissions`,
        updatedModuleData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === true) {
        toast.success("Permission Successfully Updated");
        return response.data.data;
      } else {
        toast.error("Sorry! Something went wrong");
        return rejectWithValue("Update failed");
      }
    } catch (error: any) {
      console.error("Error while updating permissions", error);
      toast.error("Error while updating permissions");
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);


export const getPermissionByRole = createAsyncThunk<
  ModulePermission[],
  number,
  { rejectValue: ModulePermission[] }
>("getPermissionByRole", async (roleId, { rejectWithValue }) => {
  try {
    const response = await axios.get<PermissionResponse>(
      `${baseURL}/api/permission/getallpermissionbyrole?roleId=${roleId}`
    );

    if (response.data.status === true) {
      return response.data.data;
    } else {
      toast.error("Sorry! Something went wrong");
      return [];
    }
  } catch (error) {
    console.log("Error While getting module By ID", error);
    return rejectWithValue([]);
  }
});

// ==================
// Slice
// ==================
const initialState: AppPermissionsState = {
  data: [],
  total: 0,
  params: {},
  allData: [],
  loading: false,
  permissions: [], // will hold role-specific permissions
  status: null,
};

export const appPermissionsSlice = createSlice({
  name: "appPermissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.fulfilled, (state, action: PayloadAction<any>) => {
        state.data = action.payload.permissions;
        state.params = action.payload.params;
        state.allData = action.payload.allData;
        state.total = action.payload.total;
      })

      .addCase(getPermissionByRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPermissionByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload; // now consistent with CASL
        state.status = true;
      })
      .addCase(getPermissionByRole.rejected, (state) => {
        state.loading = false;
        state.permissions = [];
        state.status = false;
      })

      .addCase(createPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPermissions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.permissions = action.payload;
        }
        state.status = true;
      })
      .addCase(createPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create permissions";
        state.status = false;
      })

      // 🔹 Update Permissions
      .addCase(updatePermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePermissions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.permissions = action.payload;
        }
        state.status = true;
      })
      .addCase(updatePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update permissions";
        state.status = false;
      });
  },
});

export default appPermissionsSlice.reducer;
