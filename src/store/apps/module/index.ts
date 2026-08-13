import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
const baseURL = process.env.REACT_APP_API_BASE_URL;

// -----------------------------
// 🔹 Types
// -----------------------------
export interface Module {
    id: number;
    name: string;
    description?: string;
    [key: string]: any;
}

interface ModuleResponse {
    status: boolean;
    message?: string;
    data: Module | Module[] | null;
}

interface ModuleState {
    data: Module[];
    fulfilled?: Module | Module[] | null;
    status: boolean;
    loading: boolean;
}

// -----------------------------
// 🔹 Async Thunks
// -----------------------------

export const getAllModules = createAsyncThunk<Module[] | null>(
    "getAllModules",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get<ModuleResponse>(`${baseURL}/api/module/getallmodules`);
            return (res.data.data as Module[]) || [];
        } catch (error: any) {
            console.error("Error fetching modules:", error);
            return rejectWithValue("Failed to fetch modules");
        }
    }
);

export const createModule = createAsyncThunk<Module | null, Partial<Module>>(
    "createModule",
    async (moduleData, { rejectWithValue }) => {
        try {
            const response = await axios.post<ModuleResponse>(`${baseURL}/api/module/createmodule`, moduleData);

            if (response.data.status) {
                toast.success("Module Created Successfully");
                return response.data.data as Module;
            } else {
                toast.error(response.data.message || "Failed to create module");
                return null;
            }
        } catch (error: any) {
            console.error("Error while creating a module:", error?.response?.data?.message);
            toast.error(error?.response?.data?.message || "Error while creating module");
            return rejectWithValue("Failed to create module");
        }
    }
);

export const deleteModule = createAsyncThunk<{ id: number } | null, number>(
    "deleteModule",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete<ModuleResponse>(
                `${baseURL}/api/module/deletemodule?moduleId=${id}`
            );
            if (response.data.status) {
                toast.success("Module Successfully Deleted");
                return { id };
            }
            return rejectWithValue("Failed to delete module");
        } catch (error) {
            console.error("Error deleting module:", error);
            return rejectWithValue("Error deleting module");
        }
    }
);

export const getModuleById = createAsyncThunk<Module | null, number>(
    "getModuleById",
    async (moduleId, { rejectWithValue }) => {
        try {
            const response = await axios.get<ModuleResponse>(
                `${baseURL}/api/module/getmodule?moduleId=${moduleId}`
            );

            if (response.data.status) {
                return response.data.data as Module;
            } else {
                toast.error("Sorry! Something went wrong");
                return null;
            }
        } catch (error) {
            console.error("Error while getting module by ID:", error);
            return rejectWithValue("Failed to fetch module by ID");
        }
    }
);

export const updateModule = createAsyncThunk<Module | null, Module>(
    "updateModule",
    async (moduleData, { rejectWithValue }) => {
        try {
            const response = await axios.put<ModuleResponse>(`${baseURL}/api/module/updatemodule`, moduleData);

            if (response.data.status) {
                toast.success("Module Updated Successfully");
                return response.data.data as Module;
            } else {
                toast.error(response.data.message || "Failed to update module");
                return null;
            }
        } catch (error: any) {
            console.error("Error while updating module:", error?.response?.data?.message);
            toast.error(error?.response?.data?.message || "Error while updating module");
            return rejectWithValue("Failed to update module");
        }
    }
);

// -----------------------------
// 🔹 Initial State
// -----------------------------
const initialState: ModuleState = {
    data: [],
    status: false,
    loading: false,
};

// -----------------------------
// 🔹 Slice
// -----------------------------
const ModuleSlice = createSlice({
    name: "modules",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // 🔸 Get All Modules
        builder
            .addCase(getAllModules.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllModules.fulfilled, (state, action: PayloadAction<Module[] | null>) => {
                state.loading = false;
                state.data = action.payload || [];
                state.status = true;
            })
            .addCase(getAllModules.rejected, (state) => {
                state.loading = false;
                state.status = false;
            });

        // 🔸 Create Module
        builder
            .addCase(createModule.pending, (state) => {
                state.loading = true;
            })
            .addCase(createModule.fulfilled, (state, action: PayloadAction<Module | null>) => {
                state.loading = false;
                if (action.payload) {
                    state.data.push(action.payload);
                    state.status = true;
                }
            })
            .addCase(createModule.rejected, (state) => {
                state.loading = false;
                state.status = false;
            });

        // 🔸 Get Module By ID
        builder
            .addCase(getModuleById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getModuleById.fulfilled, (state, action: PayloadAction<Module | null>) => {
                state.loading = false;
                state.fulfilled = action.payload;
                state.status = true;
            })
            .addCase(getModuleById.rejected, (state) => {
                state.loading = false;
                state.status = false;
            });

        // 🔸 Update Module
        builder
            .addCase(updateModule.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateModule.fulfilled, (state, action: PayloadAction<Module | null>) => {
                state.loading = false;
                if (action.payload) {
                    const index = state.data.findIndex((m) => m.id === action.payload?.id);
                    if (index !== -1) state.data[index] = action.payload;
                    state.status = true;
                }
            })
            .addCase(updateModule.rejected, (state) => {
                state.loading = false;
                state.status = false;
            });

        // 🔸 Delete Module
        builder
            .addCase(deleteModule.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteModule.fulfilled, (state, action) => {
                state.loading = false;
                const id = action.payload?.id; // optional chaining
                if (id !== undefined) {
                    state.data = state.data.filter(m => m.id !== id);
                    state.status = true;
                }
            })
            .addCase(deleteModule.rejected, (state) => {
                state.loading = false;
                state.status = false;
            });
},
});

export default ModuleSlice.reducer;
