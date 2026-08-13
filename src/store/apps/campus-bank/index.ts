import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface CampusBankType {
    id: number
    campusId: number
    bankId: number
    accountId: number
    accountTitle: string
    iban: string
    tblAccountBank?: {
        id: number;
        name: string;
    };
}

export interface CampusBankState {
    data: CampusBankType[]
    single: CampusBankType | null
    message: string
    status: boolean
    loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Add Bank to Campus
export const AddBankCampus = createAsyncThunk<any, CampusBankType>(
    'campusBank/add',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const { data } = await axios.post(
                `${baseURL}/api/Campus/AddBankCampus`,
                payload
            )

            if (data.status) {
                toast.success('Bank added to campus successfully')
                // Option: Re-fetch list if you have a Get function
                // dispatch(GetCampusBanks(payload.campusId)) 
                return data.data
            }

            toast.error(data.message || 'Failed to add bank')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

export const GetCampusBanksByCampus = createAsyncThunk<CampusBankType[], number>(
    'campusBank/getByCampus',
    async (campusId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${baseURL}/api/Campus/GetCampusBanks?campusId=${campusId}`);
            return data.data
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

// 👉 Update Bank Campus (Using POST as requested)
export const UpdateBankCampus = createAsyncThunk<any, CampusBankType>(
    'campusBank/update',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            // Specifically using POST per your request
            const { data } = await axios.post(
                `${baseURL}/api/Campus/UpdateBankCampus`,
                payload
            )

            if (data.status) {
                toast.success('Campus bank updated successfully')
                return data.data
            }

            toast.error(data.message || 'Failed to update campus bank')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// =============== INITIAL STATE ===============
const initialState: CampusBankState = {
    data: [],
    single: null,
    message: '',
    status: false,
    loading: false,
}

// =============== SLICE ===============
const CampusBankSlice = createSlice({
    name: 'campusBank',
    initialState,
    reducers: {
        clearBankState: (state) => {
            state.single = null
        }
    },
    extraReducers: builder => {
        builder
            // ---------- Add Bank ----------

            .addCase(GetCampusBanksByCampus.pending, state => {
                state.loading = true
                state.data = [];
            })
            .addCase(GetCampusBanksByCampus.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(GetCampusBanksByCampus.rejected, (state, action) => {
                state.loading = false;
                state.message = action.payload as string;
            })

            .addCase(AddBankCampus.pending, state => {
                state.loading = true
            })
            .addCase(AddBankCampus.fulfilled, (state, action) => {
                state.loading = false
                state.status = true
                state.data.unshift(action.payload)
            })
            .addCase(AddBankCampus.rejected, (state, action) => {
                state.loading = false
                state.message = action.payload as string
            })

            // ---------- Update Bank ----------
            .addCase(UpdateBankCampus.pending, state => {
                state.loading = true
            })
            .addCase(UpdateBankCampus.fulfilled, (state, action) => {
                state.loading = false
                state.status = true
                const index = state.data.findIndex(b => b.id === action.payload.id)
                if (index !== -1) {
                    state.data[index] = action.payload
                }
            })
            .addCase(UpdateBankCampus.rejected, (state, action) => {
                state.loading = false
                state.message = action.payload as string
            })
    }
})

export const { clearBankState } = CampusBankSlice.actions
export default CampusBankSlice.reducer