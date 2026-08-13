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
  id: number;
  accountName: string;
  accountCode: string;
  accountLevel: number;
  parentAccountId?: number | null;
  [key: string]: any;
}

export interface RegionCOANode {
  account: ChartOfAccount
  subAccounts: RegionCOANode[]
}

export interface HoCoaState {
  list: ChartOfAccount[]          // for tables
  single: ChartOfAccount | null   // for edit/view
  regionData: ChartOfAccount[]
  message: string
  status: boolean
  loading: boolean
}

interface GetAccountsPayload {
  accountLevel: number;
  campusId?: number; // optional, default to 0
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
  regionId?: string;
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
        `${baseURL}/api/hochartofaccount/getaccountbyid?id=${id}`,
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

const flattenAccounts = (nodes: any[]): ChartOfAccount[] => {
  const result: ChartOfAccount[] = [];

  const walk = (items: any[]) => {
    items.forEach(item => {
      if (!item) return;

      // RegionCOA shape
      if (item.account) {
        result.push(item.account);
        if (Array.isArray(item.subAccounts)) {
          walk(item.subAccounts);
        }
      }
      // Normal COA shape
      else if (item.id) {
        result.push(item);
        if (Array.isArray(item.children)) {
          walk(item.children);
        }
      }
    });
  };

  walk(nodes);
  return result;
};



const transformTree = (nodes: any[], level = 1): ChartOfAccount[] => {
  return nodes.map(node => ({
    ...node.account,
    level,
    children: transformTree(node.subAccounts || [], level + 1),
  }));
};


export const GetChartOfAccount = createAsyncThunk<
  ChartOfAccount[],
  void,
  { rejectValue: any }
>(
  'getchartofaccount',
  async (_, { rejectWithValue }) => {
    try {
      const { data }: AxiosResponse<{ data: any[] }> =
        await axios.get(`${baseURL}/api/hochartofaccount/getcoa`);

      //API already returns tree
      const roots = transformTree(data.data);
      return roots;

    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);




export const GetRegionChartOfAccount = createAsyncThunk<
  ChartOfAccount[], //must match transformTree output
  number,
  { rejectValue: any }
>(
  'getregionchartofaccount',
  async (regionId, { rejectWithValue }) => {
    try {
      const res: AxiosResponse<{
        status: boolean;
        message: string;
        data: any[];
      }> = await axios.get(
        `${baseURL}/api/HOChartOfAccount/GetRegionCOA?regionId=${regionId}`
      );

      const roots = transformTree(res.data.data);
      return roots; //type matches ChartOfAccount[]
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);




export const GetCampusChartOfAccount = createAsyncThunk<ChartOfAccount[], number | null>(
  'getcampuschartofaccount',
  async (id, { rejectWithValue }) => {
    try {
      let res: AxiosResponse<{ data: ChartOfAccount[] }>
      if (id) {
        res = await axios.get(`${baseURL}/api/bchartofaccount/getcampuscoa?campusId=${id}`)
      } else {
        res = await axios.get(`${baseURL}/api/bchartofaccount/getcampuscoa`)
      }
      return res.data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
)

export const AddChartofAccount = createAsyncThunk<any, ChartOfAccountPayload>(
  "addchartofaccount",
  async (body, { rejectWithValue }) => {
    try {
      // get latest financial year
      const getRes: AxiosResponse<{ data: { id: number }[] }> = await axios.get(
        `${baseURL}/api/financialyear/getfinancialyears`
      );
      const financialYearId = getRes?.data?.data.slice(-1)[0];

      // create chart of account
      const response = await axios.post(
        `${baseURL}/api/hochartofaccount/addaccount`,
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

          const hasRegion = body?.regionId !== undefined && body?.regionId !== null;

          const Newbody = [
            {
              financialYearId: financialYearId?.id,
              accountId: accountIdInfo,
              debitAmount: 0,
              creditAmount: 0,
              year: voucherYear,
              addedBy: createdBy,
              // If regionId exists, isHO is false, otherwise true
              isHO: !hasRegion,
              // If regionId exists, assign it to campusId
              ...(hasRegion && { campusId: body?.regionId }),
            },
          ];
          // const Newbody = [
          //   {
          //     financialYearId: financialYearId?.id,
          //     accountId: accountIdInfo,
          //     debitAmount: 0,
          //     creditAmount: 0,
          //     year: voucherYear,
          //     addedBy: createdBy,
          //     isHO: true,
          //   },
          // ];

          try {
            await axios.post(`${baseURL}/api/hoobv/addopening`, Newbody);
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

export const DeleteCOAccount = createAsyncThunk<any, number>(
  "deletecoaccount",
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${baseURL}/api/HOChartOfAccount/DeleteAccount?accountId=${accountId}`
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

export const AddCampusChartofAccount = createAsyncThunk<any, ChartOfAccount & { campusId: number }>(
  'addcampuschartofaccount',
  async (body, { rejectWithValue }) => {
    try {
      const { campusId } = body
      const getRes: AxiosResponse<{ data: { id: number }[] }> = await axios.get(
        `${baseURL}/api/financialyear/getfinancialyears`
      )
      const financialYearId = getRes?.data?.data.slice(-1)[0]

      const response = await axios.post(`${baseURL}/api/hochartofaccount/addaccount`, body)

      if (response.data.status === true) {
        const accountLevelNumber = body?.accountLevel

        if (accountLevelNumber === 4) {
          const current = new Date()
          const voucherYear = current.getFullYear()

          const userInfo = JSON.parse(window.localStorage.getItem('userData') || '{}')
          const createdBy = userInfo?.data?.id

          const accountIdInfo = response?.data?.data?.id
          const Newbody = [
            {
              financialYearId: financialYearId?.id,
              accountId: accountIdInfo,
              debitAmount: 0,
              creditAmount: 0,
              year: voucherYear,
              addedBy: createdBy,
              campusId,
              isHO: false
            }
          ]

          try {
            await axios.post(`${baseURL}/api/hoobv/addopening`, Newbody)
            toast.success('Opening added')
          } catch (errors: any) {
            toast.error('opening ' + errors)
          }
        }
        toast.success('Cong! chart of account save successfully')
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

export const UpdateCOAccount = createAsyncThunk<any, ChartOfAccountPayload>(
  'updatecoaccount',
  async (body, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/hochartofaccount/updateaccount`, body)

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
      let res: AxiosResponse<{ data: ChartOfAccount[] }>
      if (campusId === 0) {
        res = await axios.get(`${baseURL}/api/hochartofaccount/getchildaccount?id=${id}`)
      } else {
        res = await axios.get(
          `${baseURL}/api/hochartofaccount/getchildaccount?id=${id}&campusId=${campusId}`
        )
      }
      return res.data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
)

export const GetAccountsLevelWise = createAsyncThunk<
  ChartOfAccount[],
  GetAccountsPayload
>(
  'getaccountslevelwise',
  async ({ accountLevel, campusId }, { rejectWithValue }) => {
    try {
      const finalCampusId = campusId ?? 0; // default 0 if null/undefined
      let res: AxiosResponse<{ data: ChartOfAccount[] }>; // declare here

      if (finalCampusId !== 0) {
        res = await axios.get(
          `${baseURL}/api/HOChartOfAccount/GetChildAccountByLevel?accountLevel=${accountLevel}&campusId=${finalCampusId}`
        );
      } else {
        res = await axios.get(
          `${baseURL}/api/HOChartOfAccount/GetChildAccountByLevel?accountLevel=${accountLevel}`
        );
      }

      return res.data.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);

// --------------------
// Initial State
// --------------------
const initialState: HoCoaState = {
  list: [],
  single: null,
  regionData: [],
  message: '',
  status: false,
  loading: false
}

// --------------------
// Slice
// --------------------
const HoCoaSlice = createSlice({
  name: 'HOchartaccount',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // GetChartOfAccount
      .addCase(GetChartOfAccount.pending, state => {
        state.loading = true;
      })
      .addCase(GetChartOfAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // 🌳 TREE
      })
      .addCase(GetChartOfAccount.rejected, state => {
        state.loading = false;
      })

      // GetRegionChartOfAccount
      .addCase(GetRegionChartOfAccount.pending, state => {
        state.loading = true
      })
      .addCase(
        GetRegionChartOfAccount.fulfilled,
        (state, action: PayloadAction<ChartOfAccount[]>) => {
          state.loading = false;
          state.regionData = action.payload; // same type as ChartOfAccount[]
          state.status = true;
          state.message = '';
        }
      )
      .addCase(GetRegionChartOfAccount.rejected, state => {
        state.loading = false
        state.status = false
      })



      // GetCampusChartOfAccount
      .addCase(GetCampusChartOfAccount.pending, state => {
        state.loading = true
      })
      .addCase(GetCampusChartOfAccount.fulfilled, (state, { payload }) => {
        state.loading = false
        state.list = payload
        state.status = true
        state.message = ''
      })
      .addCase(GetCampusChartOfAccount.rejected, state => {
        state.status = false
        state.loading = false
      })


      // AddChartofAccount
      .addCase(AddChartofAccount.pending, state => {
        state.loading = true
      })
      .addCase(AddChartofAccount.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.single = action.payload
        state.status = true
        state.message = ''
      })
      .addCase(AddChartofAccount.rejected, state => {
        state.loading = false
        state.status = false
      })

      // DeleteCOAccount
      .addCase(DeleteCOAccount.pending, state => {
        state.loading = true
      })
      .addCase(DeleteCOAccount.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.single = action.payload
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
        state.single = action.payload
        state.status = true
        state.message = ''
        // Add the new account to the beginning of the list
        if (action.payload) {
          state.list.unshift(action.payload);
        }
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
      .addCase(UpdateCOAccount.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
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
        state.single = action.payload
        state.status = true
      })
      .addCase(GetChartofAccountByID.rejected, state => {
        state.loading = false
        state.status = false
      })


      .addCase(GetAccountsLevelWise.pending, state => {
        state.loading = true
      })
      .addCase(
        GetAccountsLevelWise.fulfilled,
        (state, action: PayloadAction<ChartOfAccount[]>) => {
          state.loading = false
          state.list = action?.payload ?? []
          state.status = true
        }
      )
      .addCase(GetAccountsLevelWise.rejected, state => {
        state.loading = false
        state.status = false
        state.list = []
      })

      // GetChildAccount
      .addCase(GetChildAccount.pending, state => {
        state.loading = true
      })
      .addCase(GetChildAccount.fulfilled, (state, action: PayloadAction<ChartOfAccount[]>) => {
        state.loading = false
        state.list = action.payload
        state.status = true
      })
      .addCase(GetChildAccount.rejected, state => {
        state.loading = false
        state.status = false
        state.list = []
      })
  }
})

export default HoCoaSlice.reducer
