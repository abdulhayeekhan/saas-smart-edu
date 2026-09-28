import React from "react";
import PayrollHeadList from "../payroll-heads/PayrollHeadList";
import {
  GetAllDeductions,
  AddDeduction,
  UpdateDeduction,
  DeleteDeduction,
} from "../../../store/apps/deduction";

const Deductions = () => (
  <PayrollHeadList
    title="Deduction"
    titlePlural="Deductions"
    stateKey="deduction"
    getAll={GetAllDeductions}
    add={AddDeduction}
    update={UpdateDeduction}
    remove={DeleteDeduction}
  />
);

export default Deductions;
