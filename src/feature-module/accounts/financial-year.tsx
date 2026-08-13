import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable/index";
import { all_routes } from "../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  GetFinancialYears,
  AddFinancialYear,
  UpdateFinancialYear,
  DeleteFinancialYear,
  FinancialYearType
} from "../../store/apps/financial-year";

const FinancialYear = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  const { data: financialYears, loading } = useSelector(
    (state: RootState) => state.financialYear
  );

  const [addForm, setAddForm] = useState<Omit<FinancialYearType, "id">>({
    name: "",
    fromDate: "",
    toDate: "",
    isEnabled: true,
  });

  const [editForm, setEditForm] = useState<FinancialYearType>({
    id: 0,
    name: "",
    fromDate: "",
    toDate: "",
    isEnabled: true,
  });

  const [selectedId, setSelectedId] = useState<number>(0);

  useEffect(() => {
    dispatch(GetFinancialYears());
  }, [dispatch]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.fromDate || !addForm.toDate) {
      toast.error("Please fill all required fields");
      return;
    }

    await dispatch(AddFinancialYear(addForm as any));
    setAddForm({ name: "", fromDate: "", toDate: "", isEnabled: true });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.fromDate || !editForm.toDate) {
      toast.error("Please fill all required fields");
      return;
    }

    await dispatch(UpdateFinancialYear(editForm));
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId !== 0) {
      await dispatch(DeleteFinancialYear(selectedId));
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: any) => (
        <Link to="#" className="link-primary">
          {text}
        </Link>
      ),
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name),
    },
    {
      title: "From Date",
      dataIndex: "fromDate",
      render: (text: string) => text ? new Date(text).toLocaleDateString() : "",
      sorter: (a: any, b: any) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime(),
    },
    {
      title: "To Date",
      dataIndex: "toDate",
      render: (text: string) => text ? new Date(text).toLocaleDateString() : "",
      sorter: (a: any, b: any) => new Date(a.toDate).getTime() - new Date(b.toDate).getTime(),
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      render: (isEnabled: boolean) => (
        <span className={`badge ${isEnabled ? "bg-success" : "bg-danger"}`}>
          {isEnabled ? "Enabled" : "Disabled"}
        </span>
      ),
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
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#edit_financial_year"
                    onClick={() =>
                      setEditForm({
                        id: record.id,
                        name: record.name,
                        fromDate: record.fromDate ? record.fromDate.split('T')[0] : "",
                        toDate: record.toDate ? record.toDate.split('T')[0] : "",
                        isEnabled: record.isEnabled,
                      })
                    }
                  >
                    <i className="ti ti-edit-circle me-2" />
                    Edit
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#delete-modal"
                    onClick={() => setSelectedId(record.id)}
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

  const tableData = Array.isArray(financialYears)
    ? financialYears.map((fy: any) => ({ ...fy, key: fy.id }))
    : [];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Financial Year</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Finance &amp; Accounts</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Financial Year
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="mb-2">
                <Link
                  to="#"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#add_financial_year"
                >
                  <i className="ti ti-square-rounded-plus me-2" />
                  Add Financial Year
                </Link>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Financial Year List</h4>
            </div>
            <div className="card-body p-0 py-3">
              <Table dataSource={tableData} columns={columns} Selection={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Financial Year */}
      <div className="modal fade" id="add_financial_year">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Financial Year</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={addForm.name}
                        onChange={(e) =>
                          setAddForm({ ...addForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">From Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={addForm.fromDate}
                        onChange={(e) =>
                          setAddForm({ ...addForm, fromDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">To Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={addForm.toDate}
                        onChange={(e) =>
                          setAddForm({ ...addForm, toDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isEnabled"
                          checked={addForm.isEnabled}
                          onChange={(e) =>
                            setAddForm({ ...addForm, isEnabled: e.target.checked })
                          }
                        />
                        <label className="form-check-label" htmlFor="isEnabled">
                          Is Enabled
                        </label>
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
                <button type="submit" className="btn btn-primary" data-bs-dismiss={addForm.name ? "modal" : ""}>
                  Add Financial Year
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Financial Year */}

      {/* Edit Financial Year */}
      <div className="modal fade" id="edit_financial_year">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Financial Year</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">From Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.fromDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, fromDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">To Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.toDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, toDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsEnabled"
                          checked={editForm.isEnabled}
                          onChange={(e) =>
                            setEditForm({ ...editForm, isEnabled: e.target.checked })
                          }
                        />
                        <label className="form-check-label" htmlFor="editIsEnabled">
                          Is Enabled
                        </label>
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
                <button type="submit" className="btn btn-primary" data-bs-dismiss={editForm.name ? "modal" : ""}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Financial Year */}

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleDelete}>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  You want to delete this financial year, this can't be undone.
                </p>
                <div className="d-flex justify-content-center">
                  <Link
                    to="#"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">
                    Yes, Delete
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </div>
  );
};

export default FinancialYear;
