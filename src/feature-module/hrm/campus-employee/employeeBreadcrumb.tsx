import React from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface Props {
  employeeId: number;
}

const EmployeeBreadcrumb: React.FC<Props> = ({ employeeId }) => {
  const routes = all_routes;
  const { selectedEmployee } = useSelector((state: RootState) => state.campusEmployee);

  const fullName = [
    selectedEmployee?.firstName,
    selectedEmployee?.middleName,
    selectedEmployee?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="col-md-12">
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">
            {fullName ? `${fullName} - Profile Details` : "Employee Details"}
          </h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={routes.adminDashboard}>Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="#">HR</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={routes.campusEmployee}>Campus Employees</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Employee Profile
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <Link
            to={routes.campusEmployee}
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <i className="ti ti-arrow-left me-1" />
            Back to List
          </Link>
          <Link
            to={`/hrm/edit-campus-employee/${employeeId}`}
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="ti ti-edit me-1" />
            Edit Profile
          </Link>
          <Link
            to={`${routes.employeeLedgerReport}?employeeId=${employeeId}`}
            className="btn btn-dark d-flex align-items-center"
          >
            <i className="ti ti-notebook me-1" />
            Full Ledger
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBreadcrumb;
