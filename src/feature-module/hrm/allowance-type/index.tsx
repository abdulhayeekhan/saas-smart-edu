import React from "react";
import PayrollHeadList from "../payroll-heads/PayrollHeadList";
import {
  GetAllAllowanceTypes,
  AddAllowanceType,
  UpdateAllowanceType,
  DeleteAllowanceType,
} from "../../../store/apps/allowance-type";

const AllowanceTypes = () => (
  <PayrollHeadList
    title="Allowance Type"
    titlePlural="Allowance Types"
    stateKey="allowanceType"
    getAll={GetAllAllowanceTypes}
    add={AddAllowanceType}
    update={UpdateAllowanceType}
    remove={DeleteAllowanceType}
  />
);

export default AllowanceTypes;
