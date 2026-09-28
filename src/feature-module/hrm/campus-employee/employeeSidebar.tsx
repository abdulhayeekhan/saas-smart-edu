import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { GetEmployeeById } from "../../../store/apps/campus-employee";
import { all_routes } from "../../router/all_routes";
import dayjs from "dayjs";
import axios from "axios";
import AddCredentialModal from "./AddCredentialModal";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const formatCNIC = (value: string | number | null | undefined): string => {
  if (!value) return "N/A";
  const str = String(value).replace(/\D/g, "");
  if (str.length === 13) {
    return `${str.slice(0, 5)}-${str.slice(5, 12)}-${str.slice(12)}`;
  }
  return String(value);
};

const EmployeeSidebar = ({ employeeId }: { employeeId: number }) => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedEmployee, loading } = useSelector((state: RootState) => state.campusEmployee);

  const [credentialUser, setCredentialUser] = useState<any>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);

  useEffect(() => {
    if (employeeId && (!selectedEmployee || selectedEmployee.id !== employeeId)) {
      dispatch(GetEmployeeById(employeeId));
    }
  }, [dispatch, employeeId, selectedEmployee?.id]);

  useEffect(() => {
    if (selectedEmployee?.userId) {
      axios
        .get(`${baseURL}/api/Account/GetUser?userId=${selectedEmployee.userId}`)
        .then((res) => {
          const u = res.data?.data || res.data;
          if (u) setCredentialUser(u);
        })
        .catch(() => {});
    } else {
      setCredentialUser(null);
    }
  }, [selectedEmployee?.userId]);

  const fullName = [
    selectedEmployee?.firstName,
    selectedEmployee?.middleName,
    selectedEmployee?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Employee";

  const genderLabel =
    selectedEmployee?.gender === 1
      ? "Male"
      : selectedEmployee?.gender === 2
      ? "Female"
      : "N/A";

  const maritalLabel = (() => {
    switch (selectedEmployee?.martialStatus) {
      case 1:
        return "Single";
      case 2:
        return "Married";
      case 3:
        return "Divorced";
      case 4:
        return "Widowed";
      default:
        return "N/A";
    }
  })();

  const age = selectedEmployee?.dob
    ? `${dayjs().diff(dayjs(selectedEmployee.dob), "year")} yrs`
    : null;

  return (
    <>
      <div className="col-xxl-3 col-xl-4 theiaStickySidebar">
        <div className="stickybar pb-4">
          <div className="card border-white shadow-sm">
            <Spin spinning={loading}>
              <div className="card-header pb-3">
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div
                  className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-3 flex-shrink-0 text-dark position-relative rounded"
                  style={{ width: 85, height: 85, overflow: "hidden", backgroundColor: "#f8f9fa" }}
                >
                  <img
                    src={
                      selectedEmployee?.imageUrl
                        ? selectedEmployee.imageUrl.startsWith("http")
                          ? selectedEmployee.imageUrl
                          : `${baseURL}/${selectedEmployee.imageUrl.replace(/\\/g, "/")}`
                        : "/assets/img/profiles/avatar-01.jpg"
                    }
                    className="img-fluid rounded"
                    alt={fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e: any) => {
                      e.currentTarget.src = "/assets/img/profiles/avatar-01.jpg";
                    }}
                  />
                </div>
                <div className="overflow-hidden flex-fill">
                  <span
                    className={`badge ${
                      selectedEmployee?.isActive ? "badge-soft-success" : "badge-soft-danger"
                    } d-inline-flex align-items-center mb-1`}
                  >
                    <i className="ti ti-circle-filled fs-5 me-1" />
                    {selectedEmployee?.isActive ? "Active" : "Inactive"}
                  </span>
                  <h5 className="mb-1 text-truncate" title={fullName}>
                    {fullName}
                  </h5>
                  <p className="text-primary mb-0 fs-13 text-truncate">
                    {selectedEmployee?.designationName || "Staff"}
                  </p>
                  <small className="text-muted fs-11">
                    {selectedEmployee?.employeeKey || "—"}
                  </small>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card-body">
              <h6 className="mb-3 fw-bold text-dark border-bottom pb-2">
                <i className="ti ti-id me-2 text-primary" />
                Basic Information
              </h6>
              <dl className="row mb-0 fs-13">
                <dt className="col-6 fw-medium text-muted mb-2">Employee Key</dt>
                <dd className="col-6 mb-2 fw-semibold text-dark text-end">
                  {selectedEmployee?.employeeKey || "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Department</dt>
                <dd className="col-6 mb-2 text-end text-truncate" title={selectedEmployee?.departmentName || ""}>
                  {selectedEmployee?.departmentName || "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Designation</dt>
                <dd className="col-6 mb-2 text-end text-truncate" title={selectedEmployee?.designationName || ""}>
                  {selectedEmployee?.designationName || "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Employee Type</dt>
                <dd className="col-6 mb-2 text-end">
                  {selectedEmployee?.employeeTypeName || "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Campus</dt>
                <dd className="col-6 mb-2 text-end text-truncate" title={selectedEmployee?.campusName || ""}>
                  {selectedEmployee?.campusName || "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Gender</dt>
                <dd className="col-6 mb-2 text-end">{genderLabel}</dd>

                <dt className="col-6 fw-medium text-muted mb-2">Joining Date</dt>
                <dd className="col-6 mb-2 text-end">
                  {selectedEmployee?.joiningDate
                    ? dayjs(selectedEmployee.joiningDate).format("DD-MMM-YYYY")
                    : "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">Date of Birth</dt>
                <dd className="col-6 mb-2 text-end">
                  {selectedEmployee?.dob
                    ? `${dayjs(selectedEmployee.dob).format("DD-MMM-YYYY")}${
                        age ? ` (${age})` : ""
                      }`
                    : "N/A"}
                </dd>

                <dt className="col-6 fw-medium text-muted mb-2">CNIC</dt>
                <dd className="col-6 mb-2 text-end">{formatCNIC(selectedEmployee?.cnic)}</dd>

                <dt className="col-6 fw-medium text-muted mb-2">Marital Status</dt>
                <dd className="col-6 mb-2 text-end">{maritalLabel}</dd>

                <dt className="col-6 fw-medium text-muted mb-2">Religion</dt>
                <dd className="col-6 mb-2 text-end">{selectedEmployee?.religionName || "N/A"}</dd>

                {selectedEmployee?.eobi && (
                  <>
                    <dt className="col-6 fw-medium text-muted mb-2">EOBI No</dt>
                    <dd className="col-6 mb-2 text-end">{selectedEmployee.eobi}</dd>
                  </>
                )}
              </dl>

              {/* Contact Information */}
              <h6 className="mt-3 mb-3 fw-bold text-dark border-bottom pb-2">
                <i className="ti ti-phone me-2 text-primary" />
                Contact Information
              </h6>
              <dl className="row mb-0 fs-13">
                <dt className="col-5 fw-medium text-muted mb-2">Phone</dt>
                <dd className="col-7 mb-2 text-end text-truncate">
                  {selectedEmployee?.contactNumber ? (
                    <a href={`tel:${selectedEmployee.contactNumber}`} className="text-dark">
                      {selectedEmployee.contactNumber}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </dd>

                <dt className="col-5 fw-medium text-muted mb-2">Email</dt>
                <dd className="col-7 mb-2 text-end text-truncate" title={selectedEmployee?.email || ""}>
                  {selectedEmployee?.email ? (
                    <a href={`mailto:${selectedEmployee.email}`} className="text-primary">
                      {selectedEmployee.email}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </dd>
              </dl>

              {/* System Credentials Information */}
              <h6 className="mt-3 mb-3 fw-bold text-dark border-bottom pb-2">
                <i className="ti ti-shield-lock me-2 text-primary" />
                System Login Access
              </h6>
              <dl className="row mb-0 fs-13">
                <dt className="col-5 fw-medium text-muted mb-2">Credentials</dt>
                <dd className="col-7 mb-2 text-end">
                  {selectedEmployee?.userId ? (
                    <span className="badge badge-soft-success">
                      <i className="ti ti-check me-1" /> Created
                    </span>
                  ) : (
                    <span className="badge badge-soft-danger">
                      <i className="ti ti-x me-1" /> Not Created
                    </span>
                  )}
                </dd>

                {selectedEmployee?.userId && credentialUser && (
                  <>
                    <dt className="col-5 fw-medium text-muted mb-2">Username</dt>
                    <dd className="col-7 mb-2 text-end fw-semibold text-primary">
                      {credentialUser.username || "—"}
                    </dd>
                  </>
                )}
              </dl>

              {!selectedEmployee?.userId ? (
                <button
                  type="button"
                  onClick={() => setCredentialModalOpen(true)}
                  className="btn btn-outline-success btn-sm w-100 mt-2 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-user-plus me-1" />
                  Create User Login
                </button>
              ) : null}

              {/* Actions */}
              <div className="mt-4 pt-2 border-top d-flex flex-column gap-2">
                <Link
                  to={`/hrm/edit-campus-employee/${employeeId}`}
                  className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-edit me-1" />
                  Edit Employee
                </Link>
                <Link
                  to={`${routes.employeeLedgerReport}?employeeId=${employeeId}`}
                  className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-file-analytics me-1" />
                  View Full Ledger
                </Link>
              </div>
            </div>
            </Spin>
          </div>
        </div>
      </div>

      <AddCredentialModal
        isOpen={credentialModalOpen}
        setIsOpen={setCredentialModalOpen}
        employee={selectedEmployee}
        onSuccess={() => {
          dispatch(GetEmployeeById(employeeId));
        }}
      />
    </>
  );
};

export default EmployeeSidebar;
