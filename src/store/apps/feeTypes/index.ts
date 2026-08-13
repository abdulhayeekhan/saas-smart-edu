import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ChartOfAccountPayload, AddCampusChartofAccount } from '../campus-coa'

const baseURL = process.env.REACT_APP_API_BASE_URL

export interface FeeType {
  id?: number
  name: string
  description: string
  receiptCreditAccountId?: number
  receiptDebitAccountId?: number
  invoiceDebitAccountId?: number
  invoiceCreditAccountId?: number
}

export interface FeeTypeState {
  data: FeeType[]
  single: FeeType | null
  message: string
  status: boolean
  loading: boolean
}

export const GetFeeTypes = createAsyncThunk<FeeType[]>(
  'feetype/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${baseURL}/api/FeeType/GetFeeTypes`)

      if (data.status) return data.data as FeeType[]
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const GetFeeType = createAsyncThunk<FeeType, number>(
  'feetype/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${baseURL}/api/FeeType/GetFeeType?id=${id}`
      )

      if (data.status) return data.data as FeeType
      return rejectWithValue(data.message)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const AddFeeType = createAsyncThunk<any, FeeType>(
  'feetype/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/FeeType/AddFeeType`,
        payload
      )

      if (data.status) {
        toast.success('Fee type added successfully')
        dispatch(GetFeeTypes())
        return data.data
      }

      toast.error(data.message || 'Failed to add fee type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// export const AddFeeTypeWithCOA = createAsyncThunk<any, FeeType>(
//   'feetypewithcoa/add',
//   async (payload, { rejectWithValue, dispatch }) => {
//     try {
//       const ReceivableparentId = 8; // Set appropriate parentId based on your logic
//       const ReceivableResponse = await axios.get(
//         `${baseURL}/api/BChartOfAccount/GenerateAccountCode?parentAccountId=${ReceivableparentId}`
//       );
//       const ReceivableResponseCode = ReceivableResponse.data.data;

//       // 2️⃣ Build COA body
//       const ReceivableCOABody: ChartOfAccountPayload = {
//         parentAccountId: ReceivableparentId,
//         accountTypeId: 7,
//         accountCode: ReceivableResponseCode,
//         accountName: `${payload.name} Receivable`,
//         accountLevel: 4,
//         nature: "Asset",
//         mapping: "B-1",
//         isActive: true,
//       };

//       const ReceivablecoaResult = await dispatch(
//         AddCampusChartofAccount(ReceivableCOABody)
//       ).unwrap();



//       const UnearnedparentId = 11;
//       const UnearnedResponse = await axios.get(
//         `${baseURL}/api/BChartOfAccount/GenerateAccountCode?parentAccountId=${UnearnedparentId}`
//       );
//       const UnearnedResponseCode = UnearnedResponse.data.data;

//       // 2️⃣ Build COA body
//       const UnearnedCOABody: ChartOfAccountPayload = {
//         parentAccountId: UnearnedparentId,
//         accountTypeId: 10,
//         accountCode: UnearnedResponseCode,
//         accountName: `${payload.name} Unearned`,
//         accountLevel: 4,
//         nature: "Liability",
//         mapping: "B-3",
//         isActive: true,
//       };

//       const UnearnedcoaResult = await dispatch(
//         AddCampusChartofAccount(UnearnedCOABody)
//       ).unwrap();


//       const FeeparentId = 11;
//       const FeeResponse = await axios.get(
//         `${baseURL}/api/BChartOfAccount/GenerateAccountCode?parentAccountId=${FeeparentId}`
//       );
//       const FeeResponseCode = FeeResponse.data.data;

//       // 2️⃣ Build COA body
//       const FeeCOABody: ChartOfAccountPayload = {
//         parentAccountId: FeeparentId,
//         accountTypeId: 12,
//         accountCode: FeeResponseCode,
//         accountName: `${payload.name}`,
//         accountLevel: 4,
//         nature: "Revenue",
//         mapping: "B-6",
//         isActive: true,
//       };

//       const FeecoaResult = await dispatch(
//         AddCampusChartofAccount(FeeCOABody)
//       ).unwrap();

//       const { data } = await axios.post(
//         `${baseURL}/api/FeeType/AddFeeType`,
//         {
//           name: payload.name,
//           description: payload.description,
//           receiptCreditAccountId: ReceivablecoaResult?.id,
//           invoiceCreditAccountId: FeecoaResult?.id,
//           invoiceDebitAccountId: ReceivablecoaResult?.id,
//         }
//       );

//       toast.success('Fee type added successfully')
//       await dispatch(GetFeeTypes())
//       return data.data


//       // toast.error(data.message || 'Failed to add fee type')
//       // return rejectWithValue(data.message)
//     } catch (error: any) {
//       toast.error(error.message)
//       return rejectWithValue(error.message)
//     }
//   }
// )

export const AddFeeTypeWithCOA = createAsyncThunk<
  any,
  FeeType
>(
  'feetypewithcoa/add',
  async (payload, { rejectWithValue, dispatch }) => {
    try {

      /** ---------------------------
       * Helper: Create COA
       ---------------------------- */
      const createCOA = async (
        parentAccountId: number,
        accountTypeId: number,
        name: string,
        nature: "Asset" | "Liability" | "Revenue",
        mapping: string
      ) => {
        const { data } = await axios.get(
          `${baseURL}/api/BChartOfAccount/GenerateAccountCode`,
          { params: { parentAccountId } }
        );

        const body: ChartOfAccountPayload = {
          parentAccountId,
          accountTypeId,
          accountCode: data.data,
          accountName: name,
          accountLevel: 4,
          nature,
          mapping,
          isActive: true,
        };

        return dispatch(AddCampusChartofAccount(body)).unwrap();
      };

      /** ---------------------------
       * Create All COAs (Parallel)
       ---------------------------- */
      const [
        receivableCOA,
        unearnedCOA,
        incomeCOA
      ] = await Promise.all([
        createCOA(8, 7, `${payload.name} Receivable`, "Asset", "B-1"),
        createCOA(11, 10, `${payload.name} Unearned`, "Liability", "B-3"),
        createCOA(13, 12, `${payload.name}`, "Revenue", "B-6"),
      ]);

      /** ---------------------------
       * Save Fee Type
       ---------------------------- */
      const { data } = await axios.post(
        `${baseURL}/api/FeeType/AddFeeType`,
        {
          name: payload.name,
          description: payload.description,
          receiptCreditAccountId: receivableCOA.id,
          invoiceDebitAccountId: receivableCOA.id,
          invoiceCreditAccountId: incomeCOA.id,
        }
      );

      toast.success('Fee type added successfully');
      dispatch(GetFeeTypes());

      return data.data;

    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
      return rejectWithValue(error);
    }
  }
);


export const UpdateFeeType = createAsyncThunk<any, FeeType>(
  'feetype/update',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${baseURL}/api/FeeType/UpdateFeeType`,
        payload
      )

      if (data.status) {
        toast.success('Fee type updated successfully')
        dispatch(GetFeeTypes())
        return data.data
      }

      toast.error(data.message || 'Failed to update fee type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const DeleteFeeType = createAsyncThunk<any, number>(
  'feetype/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(
        `${baseURL}/api/FeeType/Delete?id=${id}`
      )

      if (data.status) {
        toast.success('Fee type deleted successfully')
        dispatch(GetFeeTypes())
        return id
      }

      toast.error(data.message || 'Failed to delete fee type')
      return rejectWithValue(data.message)
    } catch (error: any) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

const initialState: FeeTypeState = {
  data: [],
  single: null,
  message: '',
  status: false,
  loading: false,
}

const FeeTypeSlice = createSlice({
  name: 'feetype',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // ---------- Get All ----------
      .addCase(GetFeeTypes.pending, state => {
        state.loading = true
      })
      .addCase(
        GetFeeTypes.fulfilled,
        (state, action: PayloadAction<FeeType[]>) => {
          state.loading = false
          state.status = true
          state.data = action.payload
        }
      )
      .addCase(GetFeeTypes.rejected, (state, action) => {
        state.loading = false
        state.status = false
        state.message = action.payload as string
      })

      // ---------- Get Single ----------
      .addCase(
        GetFeeType.fulfilled,
        (state, action: PayloadAction<FeeType>) => {
          state.single = action.payload
        }
      )


      // ---------- Add / Update / Delete ----------
      .addCase(AddFeeType.pending, state => {
        state.loading = true
      })
      .addCase(AddFeeType.fulfilled, state => {
        state.loading = false
      })

      .addCase(AddFeeTypeWithCOA.pending, state => {
        state.loading = true
      })
      .addCase(AddFeeTypeWithCOA.fulfilled, state => {
        state.loading = false
      })

      .addCase(UpdateFeeType.pending, state => {
        state.loading = true
      })
      .addCase(UpdateFeeType.fulfilled, state => {
        state.loading = false
      })

      .addCase(DeleteFeeType.pending, state => {
        state.loading = true
      })
      .addCase(DeleteFeeType.fulfilled, state => {
        state.loading = false
      })
  },
})

export default FeeTypeSlice.reducer
