import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = process.env.REACT_APP_API_BASE_URL

// ================= TYPES ==================
export interface Subject {
    id?: number
    name: string
    sortOrder: number
}

export interface SubjectState {
    data: Subject[]
    single: Subject | null
    message: string
    status: boolean
    loading: boolean
}

// =============== ASYNC THUNKS ===============

// 👉 Get All Subjects
export const GetSubjects = createAsyncThunk<Subject[]>(
    'subject/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${baseURL}/api/Subject/GetSubjects`)

            if (data.status) return data.data as Subject[]
            console.log(data.message || 'Failed to load subjects')
            return rejectWithValue(data.message)
        } catch (error: any) {
            console.log(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// 👉 Get Single Subject by ID
export const GetSubject = createAsyncThunk<Subject, number>(
    'subject/getSingle',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${baseURL}/api/Subject/GetSubject?id=${id}`)
            if (data.status) return data.data as Subject

            toast.error(data.message || 'Failed to load subject')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// 👉 Add Grade
export const AddSubject = createAsyncThunk<any, Subject>(
    'subject/add',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const { data } = await axios.post(`${baseURL}/api/Subject/AddSubject`, payload)

            if (data.status) {
                toast.success('Subject added successfully')
                dispatch(GetSubjects()) // Reload list
                return data.data
            }

            toast.error(data.message || 'Failed to add subject')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// 👉 Update Grade
export const UpdateSubject = createAsyncThunk<any, Subject>(
    'subject/update',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const { data } = await axios.put(`${baseURL}/api/Subject/UpdateSubject`, payload)

            if (data.status) {
                toast.success('Subject updated successfully')
                dispatch(GetSubjects())
                return data.data
            }

            toast.error(data.message || 'Failed to update subject')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// 👉 Delete Grade
export const DeleteSubject = createAsyncThunk<any, number>(
    'subject/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const { data } = await axios.delete(`${baseURL}/api/Subject/Delete?id=${id}`)

            if (data.status) {
                toast.success('Subject deleted successfully')
                dispatch(GetSubjects())
                return id
            }

            toast.error(data.message || 'Failed to delete subject')
            return rejectWithValue(data.message)
        } catch (error: any) {
            toast.error(error.message)
            return rejectWithValue(error.message)
        }
    }
)

// =============== INITIAL STATE ===============
const initialState: SubjectState = {
    data: [],
    single: null,
    message: '',
    status: false,
    loading: false,
}

// =============== SLICE ===============
const SubjectSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {},
    extraReducers: builder => {
        // ---------- Get All ----------
        builder
            .addCase(GetSubjects.pending, state => {
                state.loading = true
            })
            .addCase(GetSubjects.fulfilled, (state, action: PayloadAction<Subject[]>) => {
                state.loading = false
                state.status = true
                state.data = action.payload
            })
            .addCase(GetSubjects.rejected, (state, action) => {
                state.loading = false
                state.status = false
                state.message = action.payload as string
            })

            // ---------- Get Single ----------
            .addCase(GetSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
                state.single = action.payload
            })

            // ---------- Add / Update / Delete ----------
            .addCase(AddSubject.pending, state => { state.loading = true })
            .addCase(AddSubject.fulfilled, state => { state.loading = false })

            .addCase(UpdateSubject.pending, state => { state.loading = true })
            .addCase(UpdateSubject.fulfilled, state => { state.loading = false })

            .addCase(DeleteSubject.pending, state => { state.loading = true })
            .addCase(DeleteSubject.fulfilled, (state, action: PayloadAction<number>) => {
                state.loading = false
                state.data = state.data.filter(sub => sub.id !== action.payload)
            })
    }
})

export default SubjectSlice.reducer
