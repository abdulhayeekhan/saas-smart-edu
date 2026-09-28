import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tooltip, Spin, Popconfirm } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import CommonSelect3 from "../../../core/common/commonSelect3";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
// import CampusEmployeeModal from "./CampusEmployeeModal";
import { GetAllEmployees, DeleteEmployee, UpdateEmployeeStatus } from "../../../store/apps/campus-employee";
import TooltipOption from "../../../core/common/tooltipOption";
import { exportToPDF } from "../../../core/common/exportUtils";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import { GetSingleUser, UpdateUser } from "../../../store/apps/account";
import AddCredentialModal from "./AddCredentialModal";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const AppCampusEmployee = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasPermission = usePermission("Campus Staff");

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;

  // Regional and Campus setup
  const regions = useRegionsList();
  const [regionId, setRegionId] = useState<number>(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : 0);
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const [campusId, setCampusId] = useState<number | null>(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null);

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string | null>(null);
  const [usernamesMap, setUsernamesMap] = useState<Record<number, string>>({});

  const statusOptions = [
    { value: 'all', label: "All Status" },
    { value: 'true', label: "Active" },
    { value: 'false', label: "Inactive" }
  ];

  const { data, loading, totalCount } = useSelector((state: RootState) => state.campusEmployee);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const userIdsToFetch = data
      .map((emp) => emp.userId)
      .filter((uid): uid is number => !!uid && uid > 0 && !usernamesMap[uid]);

    if (userIdsToFetch.length === 0) return;

    const uniqueIds = Array.from(new Set(userIdsToFetch));
    uniqueIds.forEach(async (uid) => {
      try {
        const res = await axios.get(`${baseURL}/api/Account/GetUser?userId=${uid}`);
        const userObj = res.data?.data || res.data;
        if (userObj?.username) {
          setUsernamesMap((prev) => ({ ...prev, [uid]: userObj.username }));
        }
      } catch (err) {
        // silent fallback
      }
    });
  }, [data]);

  const fetchEmployees = () => {
    dispatch(
      GetAllEmployees({
        pageNo: pageNo,
        pageSize: pageSize,
        search: searchText,
        campusId: campusId,
        departmentId: null,
        designationId: null,
        employeeTypeId: null,
        gender: null,
        isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : null,
        joiningDateFrom: "",
        joiningDateTo: "",
      })
    );
  };

  useEffect(() => {
    fetchEmployees();
  }, [pageNo, pageSize, searchText, campusId, isActiveFilter, dispatch]);

  const handleTableChange = (pagination: any) => {
    setPageNo(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedEmployeeForCredential, setSelectedEmployeeForCredential] = useState<any>(null);

  const handleAdd = () => {
    navigate(routes.addCampusEmployee);
  };

  const handleEdit = (id: number) => {
    navigate(routes.editCampusEmployee.replace(":id", id.toString()));
  };

  const handleProfile = (id: number) => {
    navigate(routes.campusEmployeeProfile.replace(":id", id.toString()));
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteId) {
      await dispatch(DeleteEmployee(deleteId)).then((res: any) => {
        if (!res.error) {
          document.getElementById('close-delete-modal')?.click();
          setDeleteId(null);
        }
      });
    }
  };

  const handleStatusToggle = async (record: any) => {
    const newStatus = !record.isActive;
    dispatch(UpdateEmployeeStatus({ employeeId: record.id, isActive: newStatus }));

    if (record.userId) {
      try {
        const userRes = await dispatch(GetSingleUser(record.userId));
        if (userRes.payload && (userRes.payload as any).id) {
          const userObj = userRes.payload as any;
          const updatedUser = {
            ...userObj,
            isEnabled: newStatus
          };
          dispatch(UpdateUser(updatedUser));
        }
      } catch (err) {
        console.error("Failed to update user status", err);
      }
    }
  };

  const handleExportPDF = () => {
    exportToPDF("Campus Employees", columns as any, data);
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employeeKey",
      key: "employeeKey",
      render: (text: string, record: any) => (
        <Link
          to={routes.campusEmployeeProfile.replace(":id", record.id?.toString())}
          className="link-primary fw-medium"
        >
          {text || "—"}
        </Link>
      ),
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (text: string, record: any) => {
        const fullName = `${record.firstName || ""} ${record.middleName || ""} ${record.lastName || ""}`.trim();
        const imgSrc = record.imageUrl
          ? record.imageUrl.startsWith("http")
            ? record.imageUrl
            : `${baseURL}/${record.imageUrl.replace(/\\/g, "/")}`
          : "/assets/img/profiles/avatar-01.jpg";

        return (
          <div className="d-flex align-items-center">
            <Link
              to={routes.campusEmployeeProfile.replace(":id", record.id?.toString())}
              className="avatar avatar-md me-2 flex-shrink-0 rounded-circle overflow-hidden bg-light border"
              style={{ width: 36, height: 36 }}
            >
              <img
                src={imgSrc}
                alt={fullName}
                className="img-fluid"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e: any) => {
                  e.currentTarget.src = "/assets/img/profiles/avatar-01.jpg";
                }}
              />
            </Link>
            <div>
              <Link
                to={routes.campusEmployeeProfile.replace(":id", record.id?.toString())}
                className="fw-medium text-dark d-block"
              >
                {fullName}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      title: "Designation",
      dataIndex: "designationName",
      key: "designationName",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Campus",
      dataIndex: "campusName",
      key: "campusName",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Credentials Created",
      dataIndex: "userId",
      key: "userId",
      render: (userId: any, record: any) => {
        const username = userId ? usernamesMap[userId] || record.userName || null : null;
        return userId ? (
          <div>
            <span className="badge badge-soft-success d-inline-flex align-items-center px-2 py-1 fs-12">
              <i className="ti ti-user-check me-1 fs-14" />
              {username || `User ID: ${userId}`}
            </span>
          </div>
        ) : (
          <span className="badge badge-soft-danger d-inline-flex align-items-center px-2 py-1 fs-12">
            <i className="ti ti-user-x me-1 fs-14" /> Not Created
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: any) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            role="switch"
            checked={isActive}
            onChange={() => hasPermission?.editRight && handleStatusToggle(record)}
            disabled={!hasPermission?.editRight}
          />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center">
          <Tooltip title="View Details">
            <Link
              to="#"
              className="btn btn-icon btn-sm btn-soft-primary rounded-pill me-2"
              onClick={(e) => {
                e.preventDefault();
                handleProfile(record.id);
              }}
            >
              <i className="ti ti-eye fs-16" />
            </Link>
          </Tooltip>
          {!record.userId && hasPermission?.editRight && (
            <Tooltip title={record.isActive ? "Create Credentials" : "Enable employee to create credentials"}>
              <Link
                to="#"
                className={`btn btn-icon btn-sm btn-soft-success rounded-pill ${!record.isActive ? 'disabled' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (record.isActive) {
                    setSelectedEmployeeForCredential(record);
                    setCredentialModalOpen(true);
                  }
                }}
                style={!record.isActive ? { pointerEvents: 'none', opacity: 0.5 } : {}}
              >
                <i className="ti ti-key fs-16" />
              </Link>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Campus Employees</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">HR</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Campus Employees
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <TooltipOption 
                onExportPDF={handleExportPDF} 
                onRefresh={fetchEmployees} 
                onPrint={() => window.print()} 
              />
              {hasPermission?.addRight && (
                <div className="pe-1 mb-2">
                  <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={handleAdd}
                  >
                    <i className="ti ti-plus me-2" />
                    Add Employee
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex flex-wrap align-items-center pb-0 border-0">
              <div className="d-flex align-items-center flex-wrap mb-2">
                <h4 className="card-title fw-semibold me-4 mb-2">Filter By:</h4>
                {loginInfo?.userLevel === 1 && (
                  <div className="me-3 mb-2" style={{ minWidth: "200px" }}>
                    <CommonSelect3
                      options={regions}
                      name="regionId"
                      value={regions.find((r: any) => r.value === regionId) || null}
                      onChange={(opt) => setRegionId(Number(opt?.value) || 0)}
                      placeholder="Select Region"
                    />
                  </div>
                )}
                {loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2 ? (
                  <div className="me-3 mb-2" style={{ minWidth: "200px" }}>
                    <CommonSelect3
                      options={campuses}
                      name="campusId"
                      value={campuses.find((c: any) => c.value === campusId) || null}
                      onChange={(opt) => setCampusId(Number(opt?.value) || null)}
                      placeholder="Select Campus"
                    />
                  </div>
                ) : null}
                <div className="me-3 mb-2" style={{ minWidth: "150px" }}>
                  <CommonSelect3
                    options={statusOptions}
                    name="isActive"
                    value={statusOptions.find((o) => o.value === (isActiveFilter || 'all')) || null}
                    onChange={(opt) => setIsActiveFilter(opt?.value === 'all' ? null : opt?.value || null)}
                    placeholder="Select Status"
                  />
                </div>
                <div className="search-input mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Employee..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <Spin spinning={loading}>
                  <Table
                    columns={columns}
                    dataSource={data || []}
                    rowKey="id"
                    pagination={{
                      current: pageNo,
                      pageSize: pageSize,
                      total: totalCount,
                      showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                    className="table datatable nowrap"
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal instance removed, using separate pages now */}

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleDeleteSubmit}>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  Are you sure you want to delete this employee? This cannot be undone.
                </p>
                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                    id="close-delete-modal"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AddCredentialModal 
        isOpen={credentialModalOpen} 
        setIsOpen={setCredentialModalOpen} 
        employee={selectedEmployeeForCredential} 
        onSuccess={fetchEmployees} 
      />
    </>
  );
};

export default AppCampusEmployee;
