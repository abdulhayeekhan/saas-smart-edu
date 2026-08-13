// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'


import themeSettingSlice from '../core/data/redux/themeSettingSlice';
import sidebarSlice from '../core/data/redux/sidebarSlice';
// ** Reducers
import PermissionSlice from './apps/permission'
import CampusCoaSlice from './apps/campus-coa'
import VoucherSlice from './apps/voucher'
import JvVoucherReduscer from './apps/jv-voucher'
import ModuleSlice from './apps/module'
import RoleSlice from './apps/roles'
import HoCoaReducer from './apps/ho-coa'
import CampusSlice from './apps/campus-management'
import usersSlice from './apps/account'
import noticeReducer from './apps/noticeBoard'
import RegionReducer from './apps/regions'
import GradeReducer from './apps/grades'
import SessionReducer from './apps/sessions'
import SubjectReducer from './apps/subjects'
import InquiryReducer from './apps/inquiry'
import ReligionReducer from './apps/religions'
import CountryReducer from './apps/country'
import StateReducer from './apps/state';
import CityReducer from './apps/city';
import FeeTypeReducer from './apps/feeTypes';
import DiscountTypeReducer from './apps/discount-type'
import SectionReducer from './apps/section';
import FeeStructureReducer from './apps/fee-structure';
import AdmissionReducer from './apps/admissions'
import FeeInvoiceReducer from './apps/fee-invoice';
import campusBankReducer from './apps/campus-bank';
import FSReceiptDiscountReducer from './apps/FSReceiptDiscount';
import FinancialYearReducer from './apps/financial-year';
import ExpenseCategoryReducer from './apps/expense-category';
import ExpenseReducer from './apps/expense';
import AcademicReportReducer from './apps/academic-reports';
import DepartmentReducer from './apps/department';
import DesignationReducer from './apps/designation';
import EmployeeTypeReducer from './apps/employee-type';
import CampusEmployeeReducer from './apps/campus-employee';
import AccountSettingReducer from './apps/account-setting';
import SecurityDepositReducer from './apps/security-deposit';
import FeeCreationJobReducer from './apps/fee-creation-job';
import OpeningBalanceReducer from './apps/opening-balance';
import FinancialReportReducer from './apps/financial-report';
import ClassTeacherReducer from './apps/class-teacher';
import NotificationConfigReducer from './apps/notification-configuration';
import ClassTimetableReducer from './apps/class-timetable';

// Create the store
export const store = configureStore({
  reducer: {
    themeSetting: themeSettingSlice,
    sidebarSlice: sidebarSlice,
    permission: PermissionSlice,
    jvVoucher:JvVoucherReduscer,
    voucher: VoucherSlice,
    module: ModuleSlice,
    role:RoleSlice,
    campus:CampusSlice,
    users:usersSlice,
    notice:noticeReducer,
    region:RegionReducer,
    grades:GradeReducer,
    sessions:SessionReducer,
    subjects:SubjectReducer,
    inquiry:InquiryReducer,
    religion:ReligionReducer,
    country:CountryReducer,
    states:StateReducer,
    cities:CityReducer,
    admissions:AdmissionReducer, 
    hoCoa:HoCoaReducer,
    campusCoa:CampusCoaSlice,
    feeType:FeeTypeReducer,
    discountType: DiscountTypeReducer,
    section:SectionReducer,
    feeStructure:FeeStructureReducer,
    feeInvoice:FeeInvoiceReducer,
    campusBank:campusBankReducer,
    discountSettings: FSReceiptDiscountReducer,
    financialYear:FinancialYearReducer,
    expenseCategory:ExpenseCategoryReducer,
    expense:ExpenseReducer,
    academicReport: AcademicReportReducer,
    department: DepartmentReducer,
    designation: DesignationReducer,
    employeeType: EmployeeTypeReducer,
    campusEmployee: CampusEmployeeReducer,
    accountSetting: AccountSettingReducer,
    securityDeposit: SecurityDepositReducer,
    feeCreationJob: FeeCreationJobReducer,
    openingBalance: OpeningBalanceReducer,
    financialReport: FinancialReportReducer,
    classTeacher: ClassTeacherReducer,
    notificationConfig: NotificationConfigReducer,
    classTimetable: ClassTimetableReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Infer types for RootState & AppDispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch