import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../../core/common/dataTable2/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import { all_routes } from "../../router/all_routes";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { GetAllDesignations, AddDesignation, UpdateDesignation, DeleteDesignation, Designation as DesignationType } from '../../../store/apps/designation';
import { usePermission } from "../../../core/common/selectoption/selectoption";

const Designation = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Designations"); // Plural or singular based on system pattern
  const { data, loading } = useSelector((state: RootState) => state.designation);

  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const [addForm, setAddForm] = useState<Omit<DesignationType, 'id'>>({
    name: '',
    isHO: false,
    sortOrder: 0
  });

  const [editForm, setEditForm] = useState<DesignationType>({
    id: 0,
    name: '',
    isHO: false,
    sortOrder: 0
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    dispatch(GetAllDesignations({ pageNo: 1, pageSize: 100, search: "" }));
  }, [dispatch]);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(AddDesignation(addForm)).then((res: any) => {
      if (!res.error) {
        setAddForm({
          name: '',
          isHO: false,
          sortOrder: 0
        });
        document.getElementById('close-add-modal')?.click();
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(UpdateDesignation(editForm)).then((res: any) => {
      if (!res.error) {
        document.getElementById('close-edit-modal')?.click();
      }
    });
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteId) {
      await dispatch(DeleteDesignation(deleteId)).then((res: any) => {
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
      sorter: (a: any, b: any) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "Designation",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name || ""),
    },
    {
      title: "Head Office",
      dataIndex: "isHO",
      render: (text: boolean) => (
        <span>{text ? "Yes" : "No"}</span>
      ),
    },
    {
      title: "Sort Order",
      dataIndex: "sortOrder",
      sorter: (a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <>
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
                      data-bs-target="#edit_designation"
                      onClick={() => setEditForm(record as DesignationType)}
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
        </>
      ),
    },
  ];

  let filteredData = Array.isArray(data) ? data : [];
  if (filterName) {
    filteredData = filteredData.filter(d => d.name?.toLowerCase().includes(filterName.toLowerCase()));
  }

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Designation</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">HRM</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Designation
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
                    data-bs-target="#add_designation"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Designation
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Designation List</h4>
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
                                placeholder="Enter designation name"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <button type="button" className="btn btn-light me-3" onClick={() => setFilterName('')}>
                          Reset
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleApplyClick}
                        >
                          Apply
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* Sort logic removed to match department style */}
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
        {/* Add Designation */}
        <div className="modal fade" id="add_designation">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Designation</h4>
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
                        <label className="form-label">Designation <span className="text-danger">*</span></label>
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
                          <p>Is this a Head Office Designation?</p>
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
                    
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Designation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Edit Designation */}
        <div className="modal fade" id="edit_designation">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Designation</h4>
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
                        <label className="form-label">Designation Name <span className="text-danger">*</span></label>
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
                          <p>Is this a Head Office Designation?</p>
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

                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
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
                    Are you sure you want to delete this designation? This cannot be undone.
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
  );
};

export default Designation;
