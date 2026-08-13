import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Table from "../../../core/common/dataTable2/index";
import { activeList, departmentSelect } from '../../../core/common/selectoption/selectoption';
import PredefinedDateRanges from '../../../core/common/datePicker';
import CommonSelect from '../../../core/common/commonSelect';
import { all_routes } from '../../router/all_routes';
import TooltipOption from '../../../core/common/tooltipOption';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { GetAllDepartments, AddDepartment, UpdateDepartment, DeleteDepartment, Department } from '../../../store/apps/department';
import { usePermission } from '../../../core/common/selectoption/selectoption';

const Departments = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Departments");
  const { data, loading } = useSelector((state: RootState) => state.department);

  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    isOvertimeAllowed: false,
    isHO: false,
    isEnabled: true,
    isDeleted: false,
    sortOrder: 0
  });

  const [editForm, setEditForm] = useState<Department>({
    id: 0,
    name: '',
    description: '',
    isOvertimeAllowed: false,
    isHO: false,
    isEnabled: true,
    isDeleted: false,
    sortOrder: 0
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filterDept, setFilterDept] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<any>(null);

  useEffect(() => {
    dispatch(GetAllDepartments({ pageNo: 1, pageSize: 100, search: "" }));
  }, [dispatch]);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(AddDepartment(addForm)).then((res: any) => {
      if (!res.error) {
        // Reset form
        setAddForm({
          name: '',
          description: '',
          isOvertimeAllowed: false,
          isHO: false,
          isEnabled: true,
          isDeleted: false,
          sortOrder: 0
        });
        document.getElementById('close-add-modal')?.click();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateDepartment(editForm)).then((res: any) => {
      if (!res.error) {
        document.getElementById('close-edit-modal')?.click();
      }
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteId) {
      dispatch(DeleteDepartment(deleteId)).then((res: any) => {
        if (!res.error) {
          document.getElementById('close-delete-modal')?.click();
        }
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string, record: any) => (
        <Link to="#" className="link-primary">{record.id}</Link>
      ),
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Department",
      dataIndex: "name",
      sorter: (a: any, b: any) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Head Office",
      dataIndex: "isHO",
      render: (text: boolean) => (
        <span>{text ? "Yes" : "No"}</span>
      ),
    },
    {
      title: "Overtime",
      dataIndex: "isOvertimeAllowed",
      render: (text: boolean) => (
        <span>{text ? "Allowed" : "Not Allowed"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      render: (text: boolean) => (
        <>
          {text ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className='ti ti-circle-filled fs-5 me-1'></i>Active
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className='ti ti-circle-filled fs-5 me-1'></i>Inactive
            </span>
          )}
        </>
      ),
      sorter: (a: any, b: any) =>
        Number(b.isEnabled) - Number(a.isEnabled),
    },
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
                      data-bs-target="#edit_department"
                      onClick={() => setEditForm(record)}
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
  ];

  const departmentSelectOptions = [
    { value: '', label: 'All Departments' },
    ...(Array.isArray(data) ? data.map((d: any) => ({ value: d.name, label: d.name })) : [])
  ];

  const statusSelectOptions = [
    { value: '', label: 'All Status' },
    ...activeList
  ];

  let filteredData = Array.isArray(data) ? data : [];

  if (filterDept && typeof filterDept === 'string') {
    filteredData = filteredData.filter(d => d.name.toLowerCase().includes(filterDept.toLowerCase()));
  }

  if (filterStatus && filterStatus.value) {
    if (filterStatus.value === 'Active') {
      filteredData = filteredData.filter(d => d.isEnabled === true);
    } else if (filterStatus.value === 'Inactive') {
      filteredData = filteredData.filter(d => d.isEnabled === false);
    }
  }

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Department</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">HRM</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Department
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {/* <TooltipOption /> */}
              <div className="mb-2">
                {hasPermission?.addRight && (
                  <Link
                    to="#"
                    className="btn btn-primary d-flex align-items-center"
                    data-bs-toggle="modal"
                    data-bs-target="#add_department"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Department
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Department List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="input-icon-start mb-3 me-2 position-relative">
                  {/* <PredefinedDateRanges /> */}
                </div>
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
                  <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>
                    <form>
                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 border-bottom">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Search by Name</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter department name"
                                value={filterDept || ''}
                                onChange={(e) => setFilterDept(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <Link to="#" className="btn btn-light me-3" onClick={() => { setFilterDept(''); setFilterStatus(null); }}>
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
                {/* <div className="dropdown mb-3">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />
                    Sort by A-Z{" "}
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
                  </ul>
                </div> */}
              </div>
            </div>
            <div className="card-body p-0 py-3">
              <Table
                columns={columns}
                dataSource={filteredData}
                Selection={true}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      <>
        {/* Add Department */}
        <div className="modal fade" id="add_department">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Department</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="close-add-modal"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Department Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={addForm.name}
                          onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={addForm.description}
                          onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Sort Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={addForm.sortOrder}
                          onChange={(e) => setAddForm({ ...addForm, sortOrder: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="status-title">
                          <h5>Head Office</h5>
                          <p>Is this a head office department?</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={addForm.isHO}
                            onChange={(e) => setAddForm({ ...addForm, isHO: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="status-title">
                          <h5>Overtime Allowed</h5>
                          <p>Can employees get overtime?</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={addForm.isOvertimeAllowed}
                            onChange={(e) => setAddForm({ ...addForm, isOvertimeAllowed: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={addForm.isEnabled}
                            onChange={(e) => setAddForm({ ...addForm, isEnabled: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Edit Department */}
        <div className="modal fade" id="edit_department">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Department</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="close-edit-modal"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Department Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Sort Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editForm.sortOrder}
                          onChange={(e) => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="status-title">
                          <h5>Head Office</h5>
                          <p>Is this a head office department?</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={editForm.isHO}
                            onChange={(e) => setEditForm({ ...editForm, isHO: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="status-title">
                          <h5>Overtime Allowed</h5>
                          <p>Can employees get overtime?</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={editForm.isOvertimeAllowed}
                            onChange={(e) => setEditForm({ ...editForm, isOvertimeAllowed: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle</p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={editForm.isEnabled}
                            onChange={(e) => setEditForm({ ...editForm, isEnabled: e.target.checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

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
                    Are you sure you want to delete this department? This action cannot be undone.
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-light me-3"
                      data-bs-dismiss="modal"
                      id="close-delete-modal"
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
      </>
    </div>
  )
}

export default Departments
