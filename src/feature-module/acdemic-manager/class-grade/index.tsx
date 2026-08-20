import React, { useEffect, useRef, useState, useMemo } from "react";
import { Spin } from "antd";
import { classSection } from "../../../core/data/json/class-section";
import Table from "../../../core/common/dataTable2/index";
import {
  activeList,
  usePermission
} from "../../../core/common/selectoption/selectoption";
import Select from "react-select";
import { TableData } from "../../../core/data/interface";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { GetGrades, Grade, AddGrade, GetGrade, UpdateGrade, DeleteGrade } from '../../../store/apps/grades'
import toast from 'react-hot-toast'
import useRegionsList from "../../../core/common/selectoption/master/useRegions";

const ClassGrade = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Grades");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { data, loading } = useSelector((state: RootState) => state.grades);

  const getNextSortOrder = (): number => {
    if (!data || data.length === 0) return 1;
    const orders = data.map((item: any) => Number(item.sortOrder) || 0);
    const maxOrder = Math.max(...orders, 0);
    return maxOrder + 1;
  };

  const [gradeAdd, setGradeAdd] = useState<Grade>({
    name: '',
    sortOrder: 1
  });

  useEffect(() => {
    if (data) {
      const nextOrder = getNextSortOrder();
      setGradeAdd(prev => ({
        ...prev,
        sortOrder: prev.name === '' ? nextOrder : (prev.sortOrder || nextOrder)
      }));
    }
  }, [data]);

  const handleOpenAddModal = () => {
    const nextOrder = getNextSortOrder();
    setGradeAdd({
      name: '',
      sortOrder: nextOrder
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGradeAdd(prev => ({
      ...prev,
      [name]: name === "sortOrder" ? (value === "" ? "" as any : Number(value)) : value
    }));
  };
  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);

    // ---- VALIDATION ----
    if (!gradeAdd.name.trim()) {
      toast.error("Grade name is required");
      setIsSave(false);
      return;
    }

    if (!gradeAdd.sortOrder || Number(gradeAdd.sortOrder) <= 0) {
      toast.error("Sort order must be greater than 0");
      setIsSave(false);
      return;
    }

    // ---- CALL API ----
    const targetRegionId = userLevel === 2 ? userLevelId : (gradeAdd.regionId || 0);
    const payload = {
      id: 0,
      name: gradeAdd.name,
      sortOrder: Number(gradeAdd.sortOrder),
      regionId: targetRegionId
    };
    await dispatch(AddGrade(payload as any))
      .unwrap()
      .then(() => {
        // Reset input
        setGradeAdd({
          name: "",
          sortOrder: getNextSortOrder(),
        });

        // Close modal AFTER success
        closeBtnRef.current?.click();

        toast.success("Grade added successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to add grade");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
      });
  };

  const [editGrade, setEditGrade] = useState<Grade>({
    id: 0,
    name: "",
    sortOrder: 0,
  });
  const [editLoad, setEditLoad] = useState(false)
  const handleEdit = async (id: number) => {
    setEditLoad(true)
    try {
      const res = await dispatch(GetGrade(id)).unwrap();
      setEditGrade({
        id: res.id,
        name: res.name,
        sortOrder: res.sortOrder,
        regionId: res.regionId,
      });
    } catch (err) {
      toast.error("Failed to load grade");
    } finally {
      setEditLoad(false)
    }
  };
  const handleClose = () => {
    setEditGrade({ id: 0, name: "", sortOrder: 0 });
    setGradeAdd({ name: '', sortOrder: getNextSortOrder() });
  }
  const [isUpdating, setIsUpdating] = useState(false)
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    if (!editGrade.name.trim()) {
      toast.error("Grade name is required");
      setIsUpdating(false)
      return;
    }

    if (!editGrade.sortOrder || editGrade.sortOrder <= 0) {
      toast.error("Sort order must be greater than 0");
      setIsUpdating(false)
      return;
    }

    const targetRegionId = userLevel === 2 ? userLevelId : (editGrade.regionId || 0);
    const updatePayload = {
      id: editGrade.id || 0,
      name: editGrade.name,
      sortOrder: Number(editGrade.sortOrder),
      regionId: targetRegionId
    };
    dispatch(UpdateGrade(updatePayload as any))
      .unwrap()
      .then(() => {
        // RESET
        setEditGrade({ id: 0, name: "", sortOrder: 0 });
        // CLOSE MODAL
        closeBtnRef.current?.click();
      })
      .catch(() => {
        toast.error("Failed to update grade");
      })
      .finally(() => {
        setIsUpdating(false)
      });
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(DeleteGrade(deleteId))
      .unwrap()
      .then(() => {
        toast.success("Grade deleted successfully");
        setDeleteId(null); // reset after delete
        // CLOSE MODAL
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to delete grade");
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
      dispatch(GetGrades(effectiveRegionId));
    } else {
      dispatch(GetGrades());
    }
  }, [dispatch, effectiveRegionId]);

  const filteredGrades = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (effectiveRegionId) {
      return data.filter((item: any) => Number(item.regionId) === Number(effectiveRegionId));
    }
    return data;
  }, [data, effectiveRegionId]);
  //const data = classSection;
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
      title: "Grade Name",
      dataIndex: "name",
      sorter: (a: TableData, b: TableData) => a.name.length - b.name.length,
    },
    {
      title: "Sort Order",
      dataIndex: "sortOrder",
      sorter: (a: TableData, b: TableData) => a.sortOrder - b.sortOrder,
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
      ] : []),
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
                <h3 className="page-title mb-1">Grades</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">Academic </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Grades
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
                      onClick={handleOpenAddModal}
                    >
                      <i className="ti ti-square-rounded-plus-filled me-2" />
                      Add Grade
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* /Page Header */}
            {/* Guardians List */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Class Grade's</h4>
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
                <Table columns={columns} dataSource={filteredGrades} Selection={true} loading={loading} />
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
                <h4 className="modal-title">Add Grade</h4>
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
                            value={regionsOptions.find((opt: any) => opt.value === gradeAdd?.regionId) || null}
                            onChange={(option: any) => setGradeAdd(prev => ({ ...prev, regionId: option ? option.value : 0 }))}
                          />
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label">Grade</label>
                        <input type="text" value={gradeAdd.name} onChange={handleChange} className="form-control" name="name" placeholder="Enter Grade Name" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Order</label>
                        <input type="number" className="form-control" value={gradeAdd.sortOrder} onChange={handleChange} name="sortOrder" placeholder="sort Order" />
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
                  <button disabled={isSave} type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                    {isSave ? 'Loading...' : 'Add Grade'}
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
                <h4 className="modal-title">Edit Grade</h4>
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
                <form onSubmit={handleUpdate}>
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
                              value={regionsOptions.find((opt: any) => opt.value === editGrade?.regionId) || null}
                              onChange={(option: any) => setEditGrade(prev => ({ ...prev, regionId: option ? option.value : 0 }))}
                            />
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Grade</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Grade"
                            value={editGrade.name}
                            onChange={(e) =>
                              setEditGrade({ ...editGrade, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Sort Order</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Sort Order"
                            value={editGrade.sortOrder}
                            onChange={(e) =>
                              setEditGrade({ ...editGrade, sortOrder: Number(e.target.value) })
                            }
                          />
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
                    <button disabled={isUpdating} type="submit" className="btn btn-primary" data-bs-dismiss="modal"
                    >
                      {isUpdating ? 'Loading...' : 'Save Changes'}
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

export default ClassGrade;
