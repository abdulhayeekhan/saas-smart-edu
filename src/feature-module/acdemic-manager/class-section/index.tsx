import React, { useEffect, useRef, useState } from "react";
import { classSection } from "../../../core/data/json/class-section";
import Table from "../../../core/common/dataTable2/index";
import { DatePicker, Spin } from "antd";
import {
  activeList,
  usePermission
} from "../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import Select from "react-select";
import { TableData } from "../../../core/data/interface";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import type { RootState, AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast'
import { GetSections, GetSectionsByCampus, SectionType, GetSection, AddSection, UpdateSection, DeleteSection } from '../../../store/apps/section'


const ClassSection = () => {
  const routes = all_routes;

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data

  const regions = useRegionsList();
  const [regionId, setRegionId] = useState<number>(0);
  const handleSelectRegion = (name: string, option: any) => {
    setRegionId(option?.value ?? 0);
  }
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);

  const { data, loading } = useSelector((state: RootState) => state.section);
  const hasPermission = usePermission("Section");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(DeleteSection(deleteId))
      .unwrap()
      .then(() => {
        setDeleteId(null); // reset after delete
        // CLOSE MODAL
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to delete session");
      });
  };
  const [campusId, setCampusId] = useState(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0)
  const [sectionInfo, setSectionInfo] = useState<SectionType>({
    name: "",
    campusId: loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0,
    displayName: "",
    sortOrder: 0
  })

  const handleChange = (field: keyof SectionType, value: any) => {
    if (field === 'campusId') {
      setCampusId(Number(value))
    }

    setSectionInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);
    // ---- VALIDATION ----
    if (!sectionInfo.name.trim()) {
      toast.error("Section name is required");
      setIsSave(false);
      return;
    }

    if (!sectionInfo.displayName.trim()) {
      toast.error("Display Name is required");
      setIsSave(false);
      return;
    }

    // ---- CALL API ----
    await dispatch(AddSection(sectionInfo))
      .unwrap()
      .then(() => {
        // Reset input
        setSectionInfo({
          name: "",
          campusId: 0,
          displayName: "",
          sortOrder: 0
        })

        // Close modal AFTER success
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to add grade");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
      });
  };

  const [editSection, setEditSection] = useState<SectionType>({
    id: 0,
    name: "",
    campusId: 0,
    displayName: "",
    sortOrder: 0
  });

  const handleClose = () => {
    setSectionInfo({
      name: "",
      campusId: 0,
      displayName: "",
      sortOrder: 0
    })
    setEditSection({
      id: 0,
      name: "",
      campusId: 0,
      displayName: "",
      sortOrder: 0
    });
  }

  const handleEditChange = (field: keyof SectionType, value: any) => {
    setEditSection((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const [editLoad, setEditLoad] = useState(false)
  const handleEdit = async (id: number) => {
    setEditLoad(true)
    try {
      const res = await dispatch(GetSection(id)).unwrap();
      setEditSection({
        id: res?.id,
        name: res?.name,
        campusId: res?.campusId,
        displayName: res?.displayName,
        sortOrder: res?.sortOrder
      });
    } catch (err) {
      toast.error("Failed to load section");
    } finally {
      setEditLoad(false)
    }
  };

  const [isUpdating, setIsUpdating] = useState(false)
  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true);
    // ---- VALIDATION ----
    if (!editSection.name.trim()) {
      toast.error("Section name is required");
      setIsUpdating(false);
      return;
    }

    if (!editSection.displayName.trim()) {
      toast.error("Display Name is required");
      setIsUpdating(false);
      return;
    }

    // ---- CALL API ----
    await dispatch(UpdateSection(editSection))
      .unwrap()
      .then(() => {
        // Reset input
        setEditSection({
          id: 0,
          name: "",
          campusId: 0,
          displayName: "",
          sortOrder: 0
        });

        // Close modal AFTER success
        closeBtnRef.current?.click();

      })
      .catch((err) => {
        toast.error(err || "Failed to update section");
      })
      .finally(() => {
        setIsUpdating(false); // always reset loading
      });
  };
  useEffect(() => {
    dispatch(GetSectionsByCampus(campusId))
  }, [dispatch, campusId])

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
      title: "Section Name",
      dataIndex: "name",
      sorter: (a: TableData, b: TableData) => a.name.length - b.name.length,
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      sorter: (a: TableData, b: TableData) => a.displayName.length - b.displayName.length,
    },
    {
      title: "Sort Order",
      dataIndex: "sortOrder"
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
                          onClick={() => {
                            handleEdit(record.id)
                            setRegionId(0)
                          }}
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
                <h3 className="page-title mb-1">Sections</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">Academic </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Sections
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                {/* <TooltipOption /> */}
                <div className="mb-2">
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_class_section"
                  >
                    <i className="ti ti-square-rounded-plus-filled me-2" />
                    Add Section
                  </Link>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            {/* Guardians List */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Class Section</h4>
                <div className="d-flex align-items-center flex-wrap">
                  <div className="input-icon-start mb-3 me-2 position-relative">
                    {/* <PredefinedDateRanges /> */}
                  </div>
                  <div className="dropdown mb-3 me-2">
                    {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                      <Link
                        to="#"
                        className="btn btn-outline-light bg-white dropdown-toggle"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                      >
                        <i className="ti ti-filter me-2" />
                        Filter
                      </Link>
                    )}
                    <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>
                      <form >
                        <div className="d-flex align-items-center border-bottom p-3">
                          <h4>Filter</h4>
                        </div>
                        <div className="p-3 border-bottom pb-0">
                          <div className="row">
                            {loginInfo?.userLevel === 1 && (
                              <div className="col-md-12">
                                <div className="mb-3">
                                  <label className="form-label">Region</label>
                                  <CommonSelect3
                                    className="select"
                                    options={regions}
                                    onChange={(option) => handleSelectRegion('regions', option)}
                                    value={regionId ? regions.find(region => region.value === regionId) : regions[0]}
                                  />
                                </div>
                              </div>
                            )}
                            {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                            <div className="col-md-12">
                              <div className="mb-3">
                                <label className="form-label">Campus</label>
                                <CommonSelect3
                                  className="select"
                                  options={campuses}
                                  onChange={(option) => setCampusId(option?.value)}
                                  value={campusId ? campuses.find(campus => campus.value === campusId) : campuses[0]}
                                />
                              </div>
                            </div>
                            )}
                          </div>
                        </div>
                        <div className="p-3 d-flex align-items-center justify-content-end">
                          <Link to="#" className="btn btn-light me-3">
                            Reset
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-primary"
                            onClick={handleApplyClick}
                          >
                            Apply
                          </Link>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="dropdown mb-3">
                    {/* <Link
                      to="#"
                      className="btn btn-outline-light bg-white dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2" />
                      Sort by A-Z
                    </Link> */}
                    <ul className="dropdown-menu p-3">
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 active"
                        >
                          Ascending
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                        >
                          Descending
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                        >
                          Recently Viewed
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                        >
                          Recently Added
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body p-0 py-3">
                {/* Guardians List */}
                <Table columns={columns} dataSource={data} Selection={true} loading={loading} />
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
                <h4 className="modal-title">Add Section</h4>
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
                    {loginInfo?.userLevel === 1 && (
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Region</label>
                          <CommonSelect3
                            className="select"
                            options={regions}
                            onChange={(option) => handleSelectRegion('regions', option)}
                            value={regionId ? regions.find(region => region.value === regionId) : regions[0]}
                          />
                        </div>
                      </div>
                    )}
                    {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Campus</label>
                          <CommonSelect3
                            className="select"
                            options={campuses}
                            onChange={(option) => handleChange('campusId', option?.value)}
                            value={sectionInfo?.campusId ? campuses.find(campus => campus.value === sectionInfo?.campusId) : campuses[0]}
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Section Name</label>
                        <input type="text" className="form-control" placeholder="Enter Section Name" name="name" value={sectionInfo?.name} onChange={(e) => handleChange('name', e.target.value)} />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Display Name</label>
                        <input type="text" placeholder="Enter Display Name" className="form-control" name="displayName" value={sectionInfo?.displayName} onChange={(e) => handleChange('displayName', e.target.value)} />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Sort Order</label>
                        <input type="number" placeholder="Enter sort Order" className="form-control" name="sortOrder" value={sectionInfo?.sortOrder} onChange={(e) => handleChange('sortOrder', e.target.value)} />
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
                  <button disabled={isSave || sectionInfo?.name === '' || sectionInfo?.displayName === ''} type="submit" className="btn btn-primary" >
                    {isSave ? 'Saving...' : 'Add Section'}
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
                      {loginInfo?.userLevel === 1 && (
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Region</label>
                            <CommonSelect3
                              className="select"
                              options={regions}
                              onChange={(option) => handleSelectRegion('regions', option)}
                              value={regionId ? regions.find(region => region.value === regionId) : regions[0]}
                            />
                          </div>
                        </div>
                      )}
                      {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Campus</label>
                            <CommonSelect3
                              className="select"
                              options={campuses}
                              onChange={(option) => handleChange('campusId', option?.value)}
                              value={editSection?.campusId ? campuses.find(campus => campus.value === editSection?.campusId) : campuses[0]}
                            />
                          </div>
                        </div>
                      )}
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Section Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Section"
                            value={editSection?.name}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Display Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Section"
                            value={editSection?.displayName}
                            onChange={(e) => handleEditChange('displayName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">sortOrder</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter Section"
                            value={editSection?.sortOrder}
                            onChange={(e) => handleEditChange('sortOrder', e.target.value)}
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
                    <button type="submit" disabled={isUpdating || editSection?.name === '' || editSection?.displayName === ''} className="btn btn-primary"
                    >
                      {isUpdating ? 'Updating...' : 'Save Changes'}
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

export default ClassSection;
