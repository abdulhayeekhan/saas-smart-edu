import { DatePicker, Spin } from "antd";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { classSection } from "../../../core/data/json/class-section";
import Table from "../../../core/common/dataTable2/index";
import {
  activeList,
  usePermission
} from "../../../core/common/selectoption/selectoption";
import dayjs from "dayjs";
import Select from "react-select";
import { TableData } from "../../../core/data/interface";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import type { RootState, AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast'
import { GetSessions, SessionType, GetSession, AddSession, UpdateSession, DeleteSession } from '../../../store/apps/sessions'
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
const ClassSessions = () => {
  const routes = all_routes;
  const { data, loading } = useSelector((state: RootState) => state.sessions);
  const hasPermission = usePermission("Sessions");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(DeleteSession(deleteId))
      .unwrap()
      .then(() => {
        toast.success("Session deleted successfully");
        setDeleteId(null); // reset after delete
        // CLOSE MODAL
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to delete session");
      });
  };
  const [sessionInfo, setSessionInfo] = useState<SessionType>({
    name: "",
    description: "",
    calenderYear: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: true
  })

  const handleChange = (field: keyof SessionType, value: any) => {
    if (field === "startDate" || field === "endDate") {
      value = new Date(value).toISOString();
    }
    setSessionInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);
    // ---- VALIDATION ----
    if (!sessionInfo.name?.trim()) {
      toast.error("Session name is required");
      setIsSave(false);
      return;
    }

    if (!sessionInfo.calenderYear?.trim()) {
      toast.error("Calender Year is required");
      setIsSave(false);
      return;
    }
    if (!sessionInfo.startDate?.trim()) {
      toast.error("Start Date is required");
      setIsSave(false);
      return;
    }
    if (!sessionInfo.endDate?.trim()) {
      toast.error("End Date is required");
      setIsSave(false);
      return;
    }

    // ---- CALL API ----
    const targetRegionId = userLevel === 2 ? userLevelId : (sessionInfo.regionId || 0);
    const payload = {
      id: 0,
      name: sessionInfo.name,
      description: sessionInfo.description || "",
      calenderYear: sessionInfo.calenderYear || "",
      startDate: sessionInfo.startDate,
      endDate: sessionInfo.endDate,
      isActive: sessionInfo.isActive !== undefined ? sessionInfo.isActive : true,
      regionId: targetRegionId
    };
    await dispatch(AddSession(payload as any))
      .unwrap()
      .then(() => {
        // Reset input
        setSessionInfo({
          name: "",
          description: "",
          calenderYear: "",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isActive: true
        })

        // Close modal AFTER success
        closeBtnRef.current?.click();

        toast.success("Session added successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to add grade");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
      });
  };
  const [editSession, setEditSession] = useState<SessionType>({
    id: 0,
    name: "",
    description: "",
    calenderYear: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: true
  });
  const handleClose = () => {
    setSessionInfo({
      name: "",
      description: "",
      calenderYear: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isActive: true
    })
    setEditSession({
      id: 0,
      name: "",
      description: "",
      calenderYear: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isActive: true
    });
  }
  const handleEditChange = (field: keyof SessionType, value: any) => {
    if (field === "startDate" || field === "endDate") {
      value = new Date(value).toISOString();
    }
    setEditSession((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const [editLoad, setEditLoad] = useState(false)
  const handleEdit = async (id: number) => {
    setEditLoad(true)
    try {
      const res = await dispatch(GetSession(id)).unwrap();

      setEditSession({
        id: res.id,
        name: res.name,
        description: res.description,
        calenderYear: res.calenderYear,
        startDate: res.startDate,
        endDate: res.endDate,
        isActive: res.isActive,
      });
    } catch (err) {
      toast.error("Failed to load grade");
    } finally {
      setEditLoad(false)
    }
  };
  const [isUpdating, setIsUpdating] = useState(false)
  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true);
    // ---- VALIDATION ----
    if (!editSession.name?.trim()) {
      toast.error("Session name is required");
      setIsUpdating(false);
      return;
    }

    if (!editSession.calenderYear?.trim()) {
      toast.error("Calender Year is required");
      setIsUpdating(false);
      return;
    }
    if (!editSession.startDate?.trim()) {
      toast.error("Start Date is required");
      setIsUpdating(false);
      return;
    }
    if (!editSession.endDate?.trim()) {
      toast.error("End Date is required");
      setIsUpdating(false);
      return;
    }

    // ---- CALL API ----
    const targetRegionId = userLevel === 2 ? userLevelId : (editSession.regionId || 0);
    const updatePayload = {
      id: editSession.id,
      name: editSession.name,
      description: editSession.description || "",
      calenderYear: editSession.calenderYear || "",
      startDate: editSession.startDate,
      endDate: editSession.endDate,
      isActive: editSession.isActive !== undefined ? editSession.isActive : true,
      regionId: targetRegionId
    };
    await dispatch(UpdateSession(updatePayload as any))
      .unwrap()
      .then(() => {
        // Reset input
        setEditSession({
          id: 0,
          name: "",
          description: "",
          calenderYear: "",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isActive: true
        });

        // Close modal AFTER success
        closeBtnRef.current?.click();

        toast.success("Session Update successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to update session");
      })
      .finally(() => {
        setIsUpdating(false); // always reset loading
      });
  };
  const regionsOptions = useRegionsList();

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo") || "{}");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const userLevel = loginInfo?.userLevel || userData?.data?.userLevel;
  const userLevelId = loginInfo?.userLevelId || userData?.data?.userLevelId;

  const userRegionId = userLevel === 2 ? userLevelId : (loginInfo?.regionId || userData?.data?.regionId || userData?.data?.tblCampus?.regionId || userData?.data?.campus?.regionId);

  const [selectedFilterRegion, setSelectedFilterRegion] = useState<number | null>(userLevel === 2 ? userLevelId : (userLevel === 3 ? Number(userRegionId || 0) : null));

  const effectiveRegionId = (userLevel === 2 || userLevel === 3) ? Number(userRegionId || 0) : selectedFilterRegion;

  useEffect(() => {
    if (effectiveRegionId) {
      dispatch(GetSessions(effectiveRegionId));
    } else {
      dispatch(GetSessions());
    }
  }, [dispatch, effectiveRegionId]);

  const filteredSessions = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (effectiveRegionId) {
      return data.filter((item: any) => Number(item.regionId) === Number(effectiveRegionId));
    }
    return data;
  }, [data, effectiveRegionId]);
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  const route = all_routes
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string, record: any, index: number) => (
        <>
          <Link to="#" className="link-primary">{record.id}</Link>
        </>
      ),
      sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
    },

    {
      title: "Session",
      dataIndex: "name",
      sorter: (a: TableData, b: TableData) => a.name.length - b.name.length,
    },
    {
      title: "Calender Year",
      dataIndex: "calenderYear",
      sorter: (a: TableData, b: TableData) => a.calenderYear.length - b.calenderYear.length,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
      sorter: (a: TableData, b: TableData) =>
        dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
      sorter: (a: TableData, b: TableData) =>
        dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: () => (
        <>
          <span className="badge badge-soft-success d-inline-flex align-items-center"><i
            className="ti ti-circle-filled fs-5 me-1"></i>Active</span>
        </>
      ),
      sorter: (a: TableData, b: TableData) => a.status.length - b.status.length,
    },
    ...(hasPermission?.deleteRight || hasPermission?.editRight
      ? [
        {
          title: "Action",
          dataIndex: "action",
          render: (_: any, record: any) => (
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
                    {hasPermission?.editRight && (
                      <li>
                        <Link
                          className="dropdown-item rounded-1"
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_class_section"
                          onClick={() => handleEdit(record.id)}
                        >
                          <i className="ti ti-edit-circle me-2" />
                          Edit
                        </Link>
                      </li>
                    )}
                    {hasPermission?.deleteRight && (
                      <li>
                        <Link
                          className="dropdown-item rounded-1"
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete-modal"
                          onClick={() => setDeleteId(record.id)}
                        >
                          <i className="ti ti-trash-x me-2" />
                          Delete
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          ),
        },
      ]
      : []),
  ];
  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Session's</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">Academic </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Session's
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                {(hasPermission && hasPermission?.addRight) && (
                  <div className="mb-2">
                    <Link
                      to="#"
                      className="btn btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#add_class_section"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-2" />
                      Add Session
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* /Page Header */}
            {/* Guardians List */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Session's</h4>
                <div className="d-flex align-items-center flex-wrap mb-3">
                  {userLevel === 1 && (
                    <div style={{ minWidth: '220px' }}>
                      <Select
                        className="select"
                        classNamePrefix="react-select"
                        options={regionsOptions}
                        value={regionsOptions.find((opt: any) => opt.value === selectedFilterRegion) || regionsOptions[0]}
                        onChange={(option: any) => setSelectedFilterRegion(option ? option.value : null)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body p-0 py-3">
                {/* Guardians List */}
                <Table columns={columns} dataSource={filteredSessions} Selection={true} loading={loading} />
                {/* /Guardians List */}
              </div>
            </div>
            {/* /Guardians List */}
          </div>
        </div>
        {/* /Page Wrapper */}
      </>
      <div>
        {/* Add Class Section */}
        <div className="modal fade" id="add_class_section">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Session</h4>
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
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      {userLevel === 1 && (
                        <div className="mb-3">
                          <label className="form-label">Region</label>
                          <Select
                            className="select"
                            classNamePrefix="react-select"
                            options={regionsOptions}
                            value={regionsOptions.find((opt: any) => opt.value === sessionInfo?.regionId) || null}
                            onChange={(option: any) => handleChange('regionId', option ? option.value : null)}
                          />
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label">Session Name</label>
                        <input type="text" name="name" value={sessionInfo?.name} onChange={(e) => handleChange('name', e.target.value)} className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <input type="text" name="description" value={sessionInfo?.description} onChange={(e) => handleChange('description', e.target.value)} className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Calender Year</label>
                        <input type="text" name="calenderYear" value={sessionInfo?.calenderYear} onChange={(e) => handleChange('calenderYear', e.target.value)} className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <div className="date-pic">
                          <DatePicker
                            className="form-control datetimepicker"
                            placeholder="Select Date"
                            onChange={(date, dateString) =>
                              handleChange("startDate", dateString)
                            }
                          />
                          <span className="cal-icon">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <div className="date-pic">
                          <DatePicker
                            className="form-control datetimepicker"
                            placeholder="Select Date"
                            onChange={(date, dateString) =>
                              handleChange("endDate", dateString)
                            }
                          />
                          <span className="cal-icon">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={sessionInfo?.isActive}
                            onChange={(e) => handleChange('isActive', e.target.checked)}
                            id="switch-sm"
                          />
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
                  <button type="submit" disabled={isSave} className="btn btn-primary" data-bs-dismiss="modal">
                    {isSave ? 'Loading...' : 'Add Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Class Section */}
        {/* Edit Class Section */}
        <div className="modal fade" id="edit_class_section">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Section</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={closeBtnRef}
                  onClick={handleClose}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              {editLoad ?
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                  width: "100%",
                }}><Spin size="small" /></div> :
                <form onSubmit={handleUpdateSave}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-12">
                        {userLevel === 1 && (
                          <div className="mb-3">
                            <label className="form-label">Region</label>
                            <Select
                              className="select"
                              classNamePrefix="react-select"
                              options={regionsOptions}
                              value={regionsOptions.find((opt: any) => opt.value === editSession?.regionId) || null}
                              onChange={(option: any) => handleEditChange('regionId', option ? option.value : null)}
                            />
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Session Name</label>
                          <input type="text" name="name" value={editSession?.name} onChange={(e) => handleEditChange('name', e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <input type="text" name="description" value={editSession?.description} onChange={(e) => handleEditChange('description', e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Calender Year</label>
                          <input type="text" name="calenderYear" value={editSession?.calenderYear} onChange={(e) => handleEditChange('calenderYear', e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Start Date</label>
                          <div className="date-pic">
                            <DatePicker
                              className="form-control datetimepicker"
                              placeholder="Select Date"
                              onChange={(date, dateString) =>
                                handleEditChange("startDate", dateString)
                              }
                              value={editSession?.startDate ? dayjs(editSession?.startDate) : undefined}
                            />
                            <span className="cal-icon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">End Date</label>
                          <div className="date-pic">
                            <DatePicker
                              className="form-control datetimepicker"
                              placeholder="Select Date"
                              onChange={(date, dateString) =>
                                handleEditChange("endDate", dateString)
                              }
                              value={editSession?.endDate ? dayjs(editSession?.endDate) : undefined}
                            />
                            <span className="cal-icon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>Status</h5>
                            <p>Change the Status by toggle </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={editSession?.isActive}
                              onChange={(e) => handleEditChange('isActive', e.target.checked)}
                              id="switch-sm"
                            />
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
                      onClick={handleClose}
                    >
                      Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"
                    >
                      {editLoad ? 'Loading...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
        {/* /Edit Class Section */}
        {/* Delete Modal */}
        <div className="modal fade" id="delete-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form >
                <div className="modal-body text-center">
                  <span className="delete-icon">
                    <i className="ti ti-trash-x" />
                  </span>
                  <h4>Confirm Deletion</h4>
                  <p>
                    You want to delete all the marked items, this cant be undone
                    once you delete.
                  </p>
                  <div className="d-flex justify-content-center">
                    <Link
                      to="#"
                      className="btn btn-light me-3"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <Link to="#" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal">
                      Yes, Delete
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
      </div>
    </div>
  );
};

export default ClassSessions;
