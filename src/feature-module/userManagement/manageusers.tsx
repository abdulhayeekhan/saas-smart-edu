import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable2/index";
import { manageusersData } from "../../core/data/json/manageuser";
import { TableData } from "../../core/data/interface";
import PredefinedDateRanges from "../../core/common/datePicker";
import CommonSelect from "../../core/common/commonSelect";
import { Reason, userLevels } from "../../core/common/selectoption/selectoption";
import { useRolesList } from "../../core/common/selectoption/rolerights/useRolesList";
import { useCampusesList } from "../../core/common/selectoption/master/useCampusesList";
import useRegionsList from "../../core/common/selectoption/master/useRegions";
import { all_routes } from "../router/all_routes";
import TooltipOption from "../../core/common/tooltipOption";
import { useDispatch, useSelector } from "react-redux";
import { GetUsers, AddUser, UpdateUser, DecryptPassword } from '../../store/apps/account'
import type { AppDispatch, RootState } from '../../store';
import Swal from "sweetalert2";
import CommonSelect2 from "../../core/common/commonSelect2";
import CommonSelect3 from "../../core/common/commonSelect3";
import { Pagination } from "antd";

export interface User {
  id: number;
  userLevel: number;
  userLevelId: number | null;
  roleId: number;
  username: string;
  firstname: string;
  lastname: string;
  password?: string;
  email: string;
  contactNumber: string;
  isEnabled: boolean;
}

const Manageusers = () => {
  const routes = all_routes;
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch<AppDispatch>()
  const { data, totalCount, pageSize, currentPage, loading, error } = useSelector((state: RootState) => state.users);
  const [pageNo, setPageNo] = useState(1);
  const [pageSizes, setPageSize] = useState(10)
  const [totalCounts, setTotalCount] = useState(0)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('')

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const currentUserLevel = userInfo?.data?.userLevel;
  const currentUserLevelId = userInfo?.data?.userLevelId;

  const filteredUserLevels = React.useMemo(() => {
    if (currentUserLevel === 1) {
      return userLevels;
    }
    return userLevels.filter((item: any) => item.value !== 1);
  }, [currentUserLevel]);

  useEffect(() => {
    setPageSize(pageSize)
    setTotalCount(totalCount)
    const filter = {
      pageNo,
      pageSize,
      username,
      email,
      contactNumber,
      name,
      ...(currentUserLevel === 2 && currentUserLevelId ? { regionId: currentUserLevelId } : {})
    }
    dispatch(GetUsers(filter))
  }, [username, email, contactNumber, name, dispatch, pageNo, pageSize, totalCount, currentUserLevel, currentUserLevelId])
  //const { data, loading } = useSelector((state: RootState) => state.users);

  const [confirmPass, setConfirmPass] = useState('')

  const [usersInfo, setUsersInfo] = useState({
    userLevel: 0,
    userLevelId: 0,
    roleId: 0,
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    contactNumber: '',
    isEnabled: true
  })

  const [selectedRegionId, setSelectedRegionId] = useState<number>(0);

  const rolesList = useRolesList(usersInfo?.userLevel)
  const effectiveAddRegionId = currentUserLevel === 2 ? currentUserLevelId : selectedRegionId;
  const campusesList = useCampusesList(effectiveAddRegionId);
  const regionsList = useRegionsList();

  // --- Edit User State & Hooks ---
  const editCloseBtnRef = useRef<HTMLButtonElement>(null);
  const [editUsersInfo, setEditUsersInfo] = useState<{
    id: number;
    userLevel: number;
    userLevelId: number;
    roleId: number;
    username: string;
    firstname: string;
    lastname: string;
    password?: string;
    email: string;
    contactNumber: string;
    isEnabled: boolean;
  }>({
    id: 0,
    userLevel: 0,
    userLevelId: 0,
    roleId: 0,
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    contactNumber: '',
    isEnabled: true
  });
  const [editConfirmPass, setEditConfirmPass] = useState('');
  const [editSelectedRegionId, setEditSelectedRegionId] = useState<number>(0);
  const [editSaveLoading, setEditSaveLoading] = useState(false);

  const editRolesList = useRolesList(editUsersInfo?.userLevel);
  const effectiveEditRegionId = currentUserLevel === 2 ? currentUserLevelId : editSelectedRegionId;
  const editCampusesList = useCampusesList(effectiveEditRegionId);

  const handleEditUserLevel = (value: string | number) => {
    const userLevel = Number(value);
    setEditSelectedRegionId(0);
    setEditUsersInfo((prev) => ({
      ...prev,
      userLevel: userLevel,
      userLevelId: currentUserLevel === 2 && userLevel === 2 ? (currentUserLevelId || 0) : 0,
      roleId: 0,
    }));
  };

  const handleEditUserRole = (value: string | number) => {
    const roleId = Number(value);
    setEditUsersInfo((prev) => ({
      ...prev,
      roleId: roleId,
    }));
  };

  const handleEditUserLevelId = (value: number) => {
    setEditUsersInfo((prev) => ({
      ...prev,
      userLevelId: value,
    }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "username") {
      newValue = value.toLowerCase().replace(/\s+/g, "");
    }
    setEditUsersInfo((prev) => ({
      ...prev,
      [name]:
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : newValue,
    }));
  };

  const handleEditClick = (record: User) => {
    setEditUsersInfo({
      id: record.id,
      userLevel: record.userLevel || 0,
      userLevelId: record.userLevelId ? Number(record.userLevelId) : 0,
      roleId: record.roleId || 0,
      username: record.username || '',
      firstname: record.firstname || '',
      lastname: record.lastname || '',
      password: '',
      email: record.email || '',
      contactNumber: record.contactNumber || '',
      isEnabled: record.isEnabled ?? true
    });
    setEditConfirmPass('');
    setEditSelectedRegionId(0);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaveLoading(true);
    try {
      const payload: any = {
        id: editUsersInfo.id,
        userLevel: editUsersInfo.userLevel,
        userLevelId:
          currentUserLevel === 2 && editUsersInfo.userLevel === 2
            ? currentUserLevelId
            : editUsersInfo.userLevelId,
        roleId: editUsersInfo.roleId,
        username: editUsersInfo.username,
        firstname: editUsersInfo.firstname,
        lastname: editUsersInfo.lastname,
        email: editUsersInfo.email,
        contactNumber: editUsersInfo.contactNumber,
        isEnabled: editUsersInfo.isEnabled
      };

      if (editUsersInfo.password && editUsersInfo.password.trim() !== '') {
        payload.password = editUsersInfo.password;
      }

      const resultAction = await dispatch(UpdateUser(payload));
      if (UpdateUser.fulfilled.match(resultAction)) {
        editCloseBtnRef.current?.click();
        const filter = {
          pageNo,
          pageSize,
          username,
          email,
          contactNumber,
          name,
          ...(currentUserLevel === 2 && currentUserLevelId ? { regionId: currentUserLevelId } : {})
        };
        dispatch(GetUsers(filter));
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setEditSaveLoading(false);
    }
  };


  const handleUserLevel = async (value: string | number) => {
    const userLevel = Number(value);
    setSelectedRegionId(0);
    setUsersInfo((prev) => ({
      ...prev,
      userLevel: userLevel,
      userLevelId: currentUserLevel === 2 && userLevel === 2 ? (currentUserLevelId || 0) : 0,
      roleId: 0,
    }));
  }
  const handleUserRole = async (value: string | number) => {
    const roleId = Number(value);
    setUsersInfo((prev) => ({
      ...prev,
      roleId: roleId,
    }));
  }
  const handleUserLevelId = (value: number) => {
    setUsersInfo(prev => ({
      ...prev,
      userLevelId: value,
    }));
  };

  const handleAddChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let newValue = value;

    // Apply lowercase + remove spaces only for username field
    if (name === "username") {
      newValue = value.toLowerCase().replace(/\s+/g, "");
    }

    setUsersInfo((prev) => ({
      ...prev,
      [name]:
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : newValue,
    }));
  };


  const [saveloading, setSaveLoading] = useState(false)
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true)
    try {
      const payload = {
        ...usersInfo,
        userLevelId:
          currentUserLevel === 2 && usersInfo.userLevel === 2
            ? currentUserLevelId
            : usersInfo.userLevelId,
      };
      await dispatch(AddUser(payload))
      setUsersInfo({
        userLevel: 0,
        userLevelId: 0,
        roleId: 0,
        username: '',
        firstname: '',
        lastname: '',
        password: '',
        email: '',
        contactNumber: '',
        isEnabled: true
      })
      closeBtnRef.current?.click();
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Error creating role!");
    } finally {
      setSaveLoading(false)
    }
  };
  const handleTableChange = (page: number, pageSize?: number) => {
    setPageNo(page)
    //setPageSize(pageSize ?? 25)
  };

  const handleViewPassword = async (userId: number) => {
    try {
      const resultAction = await dispatch(DecryptPassword(userId));
      if (DecryptPassword.fulfilled.match(resultAction)) {
        Swal.fire({
          title: "User Password",
          text: resultAction.payload,
          icon: "info",
        });
      }
    } catch (error) {
      console.error("Failed to decrypt password", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string, record: any, index: number) => (
        <>
          <Link to="#" className="link-primary">
            {record.id}
          </Link>
        </>
      ),
      sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
    },

    {
      title: "Name",
      dataIndex: "firstname",
      sorter: (a: User, b: User) =>
        (a.firstname + " " + a.lastname).localeCompare(b.firstname + " " + b.lastname),
      render: (_: any, record: User) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Username",
      dataIndex: "username",
      sorter: (a: TableData, b: TableData) => a.class.length - b.class.length,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a: TableData, b: TableData) =>
        a.section.length - b.section.length,
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      sorter: (a: TableData, b: TableData) =>
        a.dateOfJoined.length - b.dateOfJoined.length,
    },
    {
      title: "userLevel",
      dataIndex: "userLevel",
      render: (text: number) => (
        <>
          {text === 1 && (
            <span className="badge badge-soft-primary d-inline-flex align-items-center">
              Head Office
            </span>
          )}
          {text === 2 && (
            <span className="badge badge-soft-primary d-inline-flex align-items-center">
              Region
            </span>
          )}
          {text === 3 && (
            <span className="badge badge-soft-warning d-inline-flex align-items-center">
              Campus
            </span>
          )}
        </>
      ),
      sorter: (a: any, b: any) => a.status.length - b.status.length,
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      render: (text: boolean) => (
        <>
          {text === true ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              Active
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              In-Active
            </span>
          )}
        </>
      ),
      sorter: (a: any, b: any) => a.status.length - b.status.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: User) => (
        <>
          <div className="d-flex align-items-center">
            <div className="dropdown">
              <Link
                to="#"
                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ti ti-dots-vertical fs-14" />
              </Link>
              <ul className="dropdown-menu dropdown-menu-right p-3">
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_role"
                    to="#"
                    onClick={() => handleEditClick(record)}
                  >
                    <i className="ti ti-edit-circle me-2" />
                    Edit
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewPassword(record.id);
                    }}
                  >
                    <i className="ti ti-eye me-2" />
                    View Password
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                  >
                    <i className="ti ti-trash-x me-2" />
                    Delete
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
  ];
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Users</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">User Management</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Users
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                {/* <TooltipOption /> */}
                <div className="mb-2">
                  <Link
                    to="#"
                    className="btn btn-primary d-flex align-items-center"
                    data-bs-toggle="modal"
                    data-bs-target="#add_role"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add User
                  </Link>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            {/* Filter Section */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Users List</h4>
                <div className="d-flex align-items-center flex-wrap">
                  {/* <div className="input-icon-start mb-3 me-2 position-relative">
                    <PredefinedDateRanges />
                  </div> */}
                  <div className="dropdown mb-3 me-2">
                    <Link
                      to="#"
                      className="btn btn-outline-light bg-white dropdown-toggle"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-filter me-2" />
                      Filter
                    </Link>
                    <div
                      className="dropdown-menu drop-width"
                      ref={dropdownMenuRef}
                    >

                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 border-bottom">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-0">
                              <label className="form-label">User</label>
                              <input type="text" className="form-control" placeholder="Search Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-0 mt-2">
                              <label className="form-label">Email</label>
                              <input type="text" className="form-control" placeholder="Search Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-0 mt-2">
                              <label className="form-label">Contact No</label>
                              <input type="text" className="form-control" placeholder="Search Contact No" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown mb-3">
                    <Link
                      to="#"
                      className="btn btn-outline-light bg-white dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2" />
                      Sort by A-Z
                    </Link>
                    <ul className="dropdown-menu p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1 active">
                          Ascending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Descending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Recently Viewed
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Recently Added
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* User List */}
              <div className="card-body p-0 py-3">
                <Table
                  columns={columns}
                  dataSource={
                    currentUserLevel === 2 && currentUserLevelId
                      ? data.filter(
                          (u: any) =>
                            Number(u.userLevelId) === Number(currentUserLevelId) ||
                            (u.userLevel === 2 && Number(u.userLevelId) === Number(currentUserLevelId))
                        )
                      : data
                  }
                  Selection={true}
                  loading={loading}
                />
                <div className="mt-5 d-flex justify-content-end">
                  <Pagination
                    current={pageNo}
                    pageSize={pageSizes}
                    total={totalCounts}
                    onChange={handleTableChange}
                  // showSizeChanger
                  // pageSizeOptions={["10", "20", "50", "100"]}
                  />
                </div>
              </div>
              {/* /User List */}
            </div>
            {/* /Filter Section */}
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="datatable-paginate mt-4" />
              </div>
            </div>
          </div>
        </div>
        {/* /Page Wrapper */}
        <div className="modal fade" id="add_role">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add User</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={closeBtnRef}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleSaveSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-2">
                        <label className="form-label">User Name <span className="text-danger">*</span></label>
                        <input type="text" name="username" value={usersInfo?.username} placeholder="Enter User Name" onChange={handleAddChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">First Name <span className="text-danger">*</span></label>
                        <input type="text" name="firstname" value={usersInfo?.firstname} onChange={handleAddChange} placeholder="Enter First Name" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Last Name <span className="text-danger">*</span></label>
                        <input type="text" name="lastname" value={usersInfo?.lastname} onChange={handleAddChange} placeholder="Enter Last Name" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input type="text" name="email" value={usersInfo?.email} onChange={handleAddChange} placeholder="Enter Email" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Contact Number <span className="text-danger">*</span></label>
                        <input type="text" name="contactNumber" value={usersInfo?.contactNumber} onChange={handleAddChange} placeholder="Enter Contact Number" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">UserLevel <span className="text-danger">*</span></label>
                        <CommonSelect2
                          className="select"
                          options={filteredUserLevels}
                          onChange={(option) => handleUserLevel(option ? option.value : 0)}
                          defaultValue={filteredUserLevels[0]}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Roles <span className="text-danger">*</span></label>
                        <CommonSelect2
                          className="select"
                          options={rolesList}
                          onChange={(option) => handleUserRole(option ? option.value : 0)}
                          defaultValue={rolesList[0]}
                        />
                      </div>
                    </div>
                    {usersInfo?.userLevel === 2 && currentUserLevel !== 2 && (
                      <div className="col-md-12">
                        <div className="mb-2">
                          <label className="form-label">Region <span className="text-danger">*</span></label>
                          <CommonSelect3
                            className="select"
                            options={regionsList}
                            onChange={(option) => handleUserLevelId(Number(option?.value || 0))}
                            value={usersInfo?.userLevelId ? regionsList.find(region => region.value === usersInfo.userLevelId) || null : null}
                          />
                        </div>
                      </div>
                    )}
                    {usersInfo?.userLevel === 3 && (
                      <>
                        {currentUserLevel !== 2 && (
                          <div className="col-md-12">
                            <div className="mb-2">
                              <label className="form-label">Region <span className="text-danger">*</span></label>
                              <CommonSelect3
                                className="select"
                                options={regionsList}
                                onChange={(option) => {
                                  const rId = Number(option?.value || 0);
                                  setSelectedRegionId(rId);
                                  setUsersInfo((prev) => ({ ...prev, userLevelId: 0 }));
                                }}
                                value={selectedRegionId ? regionsList.find(region => region.value === selectedRegionId) || null : null}
                              />
                            </div>
                          </div>
                        )}
                        <div className="col-md-12">
                          <div className="mb-2">
                            <label className="form-label">Campus <span className="text-danger">*</span></label>
                            <CommonSelect3
                              className="select"
                              options={campusesList}
                              onChange={(option) => handleUserLevelId(Number(option?.value || 0))}
                              value={usersInfo?.userLevelId ? campusesList.find(campus => Number(campus.value) === Number(usersInfo.userLevelId)) || null : null}
                            />
                          </div>
                        </div>
                      </>
                    )}



                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Password <span className="text-danger">*</span></label>
                        <input type="password" name="password" value={usersInfo?.password} onChange={handleAddChange} placeholder="Enter Password" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirmPass" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Enter Confirm Password" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>Status IsEnabled</h5>
                            <p>Change the Status by toggle </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isEnabled"
                              checked={usersInfo?.isEnabled}
                              onChange={handleAddChange}
                              role="switch"
                              id="switch-sm2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" disabled={saveloading || usersInfo?.password !== confirmPass || usersInfo?.username === '' || confirmPass === '' || (usersInfo?.userLevel === 3 && !usersInfo?.userLevelId)} className="btn btn-primary" >
                    {saveloading ? 'Loading...' : 'Add Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="modal fade" id="edit_role">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit User</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={editCloseBtnRef}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-2">
                        <label className="form-label">User Name <span className="text-danger">*</span></label>
                        <input type="text" name="username" value={editUsersInfo?.username} placeholder="Enter User Name" onChange={handleEditInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">First Name <span className="text-danger">*</span></label>
                        <input type="text" name="firstname" value={editUsersInfo?.firstname} onChange={handleEditInputChange} placeholder="Enter First Name" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Last Name <span className="text-danger">*</span></label>
                        <input type="text" name="lastname" value={editUsersInfo?.lastname} onChange={handleEditInputChange} placeholder="Enter Last Name" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input type="text" name="email" value={editUsersInfo?.email} onChange={handleEditInputChange} placeholder="Enter Email" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Contact Number <span className="text-danger">*</span></label>
                        <input type="text" name="contactNumber" value={editUsersInfo?.contactNumber} onChange={handleEditInputChange} placeholder="Enter Contact Number" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">UserLevel <span className="text-danger">*</span></label>
                        <CommonSelect3
                          className="select"
                          options={filteredUserLevels}
                          onChange={(option) => handleEditUserLevel(option ? option.value : 0)}
                          value={filteredUserLevels.find(ul => Number(ul.value) === Number(editUsersInfo?.userLevel)) || null}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Roles <span className="text-danger">*</span></label>
                        <CommonSelect3
                          className="select"
                          options={editRolesList}
                          onChange={(option) => handleEditUserRole(option ? option.value : 0)}
                          value={editRolesList.find((r: any) => Number(r.value) === Number(editUsersInfo?.roleId)) || null}
                        />
                      </div>
                    </div>

                    {editUsersInfo?.userLevel === 2 && currentUserLevel !== 2 && (
                      <div className="col-md-12">
                        <div className="mb-2">
                          <label className="form-label">Region <span className="text-danger">*</span></label>
                          <CommonSelect3
                            className="select"
                            options={regionsList}
                            onChange={(option) => handleEditUserLevelId(Number(option?.value || 0))}
                            value={editUsersInfo?.userLevelId ? regionsList.find(region => Number(region.value) === Number(editUsersInfo.userLevelId)) || null : null}
                          />
                        </div>
                      </div>
                    )}
                    {editUsersInfo?.userLevel === 3 && (
                      <>
                        {currentUserLevel !== 2 && (
                          <div className="col-md-12">
                            <div className="mb-2">
                              <label className="form-label">Region <span className="text-danger">*</span></label>
                              <CommonSelect3
                                className="select"
                                options={regionsList}
                                onChange={(option) => {
                                  const rId = Number(option?.value || 0);
                                  setEditSelectedRegionId(rId);
                                  setEditUsersInfo((prev) => ({ ...prev, userLevelId: 0 }));
                                }}
                                value={editSelectedRegionId ? regionsList.find(region => Number(region.value) === Number(editSelectedRegionId)) || null : null}
                              />
                            </div>
                          </div>
                        )}
                        <div className="col-md-12">
                          <div className="mb-2">
                            <label className="form-label">Campus <span className="text-danger">*</span></label>
                            <CommonSelect3
                              className="select"
                              options={editCampusesList}
                              onChange={(option) => handleEditUserLevelId(Number(option?.value || 0))}
                              value={editUsersInfo?.userLevelId ? editCampusesList.find(campus => Number(campus.value) === Number(editUsersInfo.userLevelId)) || null : null}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">New Password (Optional)</label>
                        <input type="password" name="password" value={editUsersInfo?.password || ''} onChange={handleEditInputChange} placeholder="Leave blank to keep current password" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <label className="form-label">Confirm New Password</label>
                        <input type="password" name="confirmPass" value={editConfirmPass} onChange={(e) => setEditConfirmPass(e.target.value)} placeholder="Confirm New Password" className="form-control" />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>Status IsEnabled</h5>
                            <p>Change the Status by toggle </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isEnabled"
                              checked={editUsersInfo?.isEnabled}
                              onChange={handleEditInputChange}
                              role="switch"
                              id="switch-edit-enabled"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={editSaveLoading || Boolean(editUsersInfo?.password && editUsersInfo?.password !== editConfirmPass) || editUsersInfo?.username === '' || (editUsersInfo?.userLevel === 3 && !editUsersInfo?.userLevelId)}
                    className="btn btn-primary"
                  >
                    {editSaveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Manageusers;
