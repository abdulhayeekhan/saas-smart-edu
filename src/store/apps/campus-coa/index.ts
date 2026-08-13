// src/store/HoCoaSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import authConfig from '../../../configs/auth';
import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
const baseURL = process.env.REACT_APP_API_BASE_URL;
// --------------------
// Types
// --------------------
export interface ChartOfAccount {
    id: number
    name: string
    accountLevel: number
    parentId?: number
    [key: string]: any // in case backend returns extra fields
}

export interface HoCoaState {
    data: ChartOfAccount[] | ChartOfAccount | null
    message: string
    status: boolean
    loading: boolean
}

export interface ChartOfAccountPayload {
    parentAccountId: number | null;
    accountTypeId: number | null;
    accountCode: string;
    accountName: string;
    accountLevel: number;
    nature: string;
    mapping: string;
    isActive: boolean;
    campusId?: string;
}
// --------------------
// Async Thunks
// --------------------
export const GetChartofAccountByID = createAsyncThunk<ChartOfAccount, number>(
    'getchartofaccountbyid',
    async (id, { rejectWithValue }) => {
        try {
            const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
            const { data }: AxiosResponse<{ data: ChartOfAccount }> = await axios.get(
                `${baseURL}/api/BChartOfAccount/GetAccountById?id=${id}`,
                {
                    headers: {
                        Authorization: storedToken ?? ''
                    }
                }
            )
            return data.data
        } catch (error) {
            console.error(error)
            return rejectWithValue(error)
        }
    }
)

export const GetChartOfAccount = createAsyncThunk<
    ChartOfAccount[],      // return type
    number | undefined     // argument type
>(
    'getchartofaccount',
    async (id, { rejectWithValue }) => {
        try {
            let res: AxiosResponse<{ data: ChartOfAccount[] }>

            if (id) {
                res = await axios.get(
                    `${baseURL}/api/bchartofaccount/getcampuscoa?campusId=${id}`
                )
            } else {
                res = await axios.get(
                    `${baseURL}/api/BChartOfAccount/GetCOA`
                )
            }

            return res.data.data
        } catch (error) {
            console.error(error)
            return rejectWithValue(error)
        }
    }
)


export const GetCampusChartOfAccount = createAsyncThunk<
    ChartOfAccount[],
    number | null
>(
    'getcampuschartofaccount',
    async (id, { rejectWithValue }) => {
        try {
            let res: AxiosResponse<{ data: ChartOfAccount[] }>
            if (id) {
                res = await axios.get(`${baseURL}/api/BChartOfAccount/GetCampusCOA?campusId=${id}`)
            } else {
                res = await axios.get(`${baseURL}/api/BChartOfAccount/GetCampusCOA`)
            }
            return res.data.data
        } catch (error) {
            console.error(error)
            return rejectWithValue(error)
        }
    }
)

export const DeleteCOAccount = createAsyncThunk<any, number>(
    "deletecoaccount",
    async (accountId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${baseURL}/api/BChartOfAccount/DeleteAccount?accountId=${accountId}`
            );

            if (response.data.status === true) {
                toast.success("Account deleted successfully");
            } else {
                toast.error(response.data.message);
            }

            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(String(error));
            return rejectWithValue(error);
        }
    }
);

export const AddCampusChartofAccount = createAsyncThunk<any, ChartOfAccountPayload>(
    "addcampuschartofaccount",
    async (body, { rejectWithValue }) => {
        try {
            // get latest financial year
            const getRes: AxiosResponse<{ data: { id: number }[] }> = await axios.get(
                `${baseURL}/api/financialyear/getfinancialyears`
            );
            const financialYearId = getRes?.data?.data.slice(-1)[0];

            // create chart of account
            const response = await axios.post(
                `${baseURL}/api/BChartOfAccount/AddAccount`,
                body
            );

            if (response.data.status === true) {
                // handle opening balance only for 4th level accounts
                if (body?.accountLevel === 4) {
                    const current = new Date();
                    const voucherYear = current.getFullYear();

                    const userInfo = JSON.parse(
                        window.localStorage.getItem("userData") || "{}"
                    );
                    const createdBy = userInfo?.data?.id;

                    const accountIdInfo = response?.data?.data?.id;

                    const Newbody = [
                        {
                            financialYearId: financialYearId?.id,
                            accountId: accountIdInfo,
                            debitAmount: 0,
                            creditAmount: 0,
                            year: voucherYear,
                            addedBy: createdBy,
                            isHO: true,
                        },
                    ];

                    try {
                        await axios.post(`${baseURL}/api/OBV/AddOpening`, Newbody);
                    } catch (errors: any) {
                        toast.error("opening " + errors);
                    }
                }

                toast.success("Cong! chart of account saved successfully");
            } else {
                toast.error(response.data.message);
            }

            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(String(error));
            return rejectWithValue(error);
        }
    }
);



export const UpdateCOAccount = createAsyncThunk<any, ChartOfAccountPayload>(
    'updatecoaccount',
    async (body, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${baseURL}/api/BChartOfAccount/UpdateAccount`, body)

            if (response.data.status === true) {
                toast.success('Cong! Update successfully')
            } else {
                toast.error(response.data.message)
            }

            return response.data.data
        } catch (error) {
            console.error(error)
            toast.error(String(error))
            return rejectWithValue(error)
        }
    }
)

export const GetChildAccount = createAsyncThunk<ChartOfAccount[], { id: number; campusId: number }>(
    'getchildaccount',
    async ({ id, campusId }, { rejectWithValue }) => {
        try {
            // 1. Build the base URL
            let url = `${baseURL}/api/BChartOfAccount/getchildaccount?id=${id}`;

            // 2. Append campusId only if it exists and is not null/undefined
            if (campusId !== undefined && campusId !== null) {
                url += `&campusId=${campusId}`;
            }

            let res: AxiosResponse<{ data: ChartOfAccount[] }>;
            res = await axios.get(url);

            return res.data.data;
        } catch (error) {
            console.error(error)
            return rejectWithValue(error)
        }
    }
)

export const GetAccountsLevelWise = createAsyncThunk<ChartOfAccount[], { accountLevel: number; }>(
    'getaccountslevelwise',
    async ({ accountLevel }, { rejectWithValue }) => {
        try {
            let res: AxiosResponse<{ data: ChartOfAccount[] }>
            res = await axios.get(`${baseURL}/api/BChartOfAccount/GetChildAccountByLevel?accountLevel=${accountLevel}`)

            return res.data.data
        } catch (error) {
            console.error(error)
            return rejectWithValue(error)
        }
    }
)

// --------------------
// Initial State
// --------------------
const initialState: HoCoaState = {
    data: [],
    message: '',
    status: false,
    loading: false
}

// --------------------
// Slice
// --------------------
const CampusCoaSlice = createSlice({
    name: 'CampusCoa',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            // GetChartOfAccount


            // GetCampusChartOfAccount / GetChartOfAccount
            .addCase(GetChartOfAccount.pending, state => {
                state.loading = true
            })
            .addCase(GetChartOfAccount.fulfilled, (state, { payload }) => {
                state.loading = false
                state.data = payload
                state.status = true
                state.message = ''
            })
            .addCase(GetChartOfAccount.rejected, state => {
                state.status = false
                state.loading = false
            })
            .addCase(GetCampusChartOfAccount.pending, state => {
                state.loading = true
            })
            .addCase(GetCampusChartOfAccount.fulfilled, (state, { payload }) => {
                state.loading = false
                state.data = payload
                state.status = true
                state.message = ''
            })
            .addCase(GetCampusChartOfAccount.rejected, state => {
                state.status = false
                state.loading = false
            })




            // DeleteCOAccount
            .addCase(DeleteCOAccount.pending, state => {
                state.loading = true
            })
            .addCase(DeleteCOAccount.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false
                state.data = action.payload
                state.status = true
            })
            .addCase(DeleteCOAccount.rejected, state => {
                state.loading = false
                state.status = false
            })

            // AddCampusChartofAccount
            .addCase(AddCampusChartofAccount.pending, state => {
                state.loading = true
            })
            .addCase(AddCampusChartofAccount.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false
                state.data = action.payload
                state.status = true
                state.message = ''
            })
            .addCase(AddCampusChartofAccount.rejected, state => {
                state.loading = false
                state.status = false
            })

            // UpdateCOAccount
            .addCase(UpdateCOAccount.pending, state => {
                state.loading = true
                state.status = false
            })
            .addCase(UpdateCOAccount.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false
                if (Array.isArray(state.data)) {
                    state.data = state.data.map(element =>
                        element.id === action.payload.id ? action.payload : element
                    )
                }
                state.status = true
            })
            .addCase(UpdateCOAccount.rejected, state => {
                state.loading = false
                state.status = false
            })

            // GetChartofAccountByID
            .addCase(GetChartofAccountByID.pending, state => {
                state.loading = true
            })
            .addCase(GetChartofAccountByID.fulfilled, (state, action: PayloadAction<ChartOfAccount>) => {
                state.loading = false
                state.data = action.payload
                state.status = true
            })
            .addCase(GetChartofAccountByID.rejected, state => {
                state.loading = false
                state.status = false
            })


            .addCase(GetAccountsLevelWise.pending, state => {
                state.loading = true
            })
            .addCase(GetAccountsLevelWise.fulfilled, (state, action: PayloadAction<ChartOfAccount[]>) => {
                state.loading = false
                state.data = action.payload
                state.status = true
            })
            .addCase(GetAccountsLevelWise.rejected, state => {
                state.loading = false
                state.status = false
            })

            // GetChildAccount
            .addCase(GetChildAccount.pending, state => {
                state.loading = true
            })
            .addCase(GetChildAccount.fulfilled, (state, action: PayloadAction<ChartOfAccount[]>) => {
                state.loading = false
                state.data = action.payload
                state.status = true
            })
            .addCase(GetChildAccount.rejected, state => {
                state.loading = false
                state.status = false
            })
    }
})

export default CampusCoaSlice.reducer
