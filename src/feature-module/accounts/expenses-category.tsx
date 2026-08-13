import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable/index";
import CommonSelect from "../../core/common/commonSelect";
import { category2 } from "../../core/common/selectoption/selectoption";
import PredefinedDateRanges from "../../core/common/datePicker";
import { all_routes } from "../router/all_routes";
import TooltipOption from "../../core/common/tooltipOption";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { GetAccountsLevelWise, ChartOfAccount } from "../../store/apps/campus-coa";
import {
  GetAllExpenseCategories,
  AddExpenseCategory,
  UpdateExpenseCategory,
  DeleteExpenseCategory,
} from "../../store/apps/expense-category";

const ExpensesCategory = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  const { data: categories, loading } = useSelector(
    (state: RootState) => state.expenseCategory
  );

  const [expenseList, setExpenseList] = useState<ChartOfAccount[]>([]);
  const [liabilityList, setLiabilityList] = useState<ChartOfAccount[]>([]);

  const [addForm, setAddForm] = useState({
    name: "",
    expenseAccountId: 0,
    payableAccountId: 0,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    name: "",
    expenseAccountId: 0,
    payableAccountId: 0,
  });

  const [selectedId, setSelectedId] = useState<number>(0);

  useEffect(() => {
    dispatch(GetAllExpenseCategories());

    dispatch(GetAccountsLevelWise({ accountLevel: 4 })).then((res: any) => {
      if (res.payload) {
        const allAccounts = res.payload as ChartOfAccount[];
        setExpenseList(allAccounts.filter((acc) => acc.nature === "Expense"));
        setLiabilityList(allAccounts.filter((acc) => acc.nature === "Liability"));
      }
    });
  }, [dispatch]);

  const expenseOptions = expenseList.map((acc) => ({
    value: acc.id,
    label: acc.accountName,
  }));

  const liabilityOptions = liabilityList.map((acc) => ({
    value: acc.id,
    label: acc.accountName,
  }));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addForm.expenseAccountId || addForm.expenseAccountId === 0) {
      toast.error("Please select an Expense Account");
      return;
    }

    const alwaysCreatePayable = addForm.payableAccountId !== 0;
    const payload = {
      ...addForm,
      payableAccountId: addForm.payableAccountId === 0 ? null : addForm.payableAccountId,
      alwaysCreatePayable,
    };

    await dispatch(AddExpenseCategory(payload));
    dispatch(GetAllExpenseCategories());
    setAddForm({ name: "", expenseAccountId: 0, payableAccountId: 0 });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.expenseAccountId || editForm.expenseAccountId === 0) {
      toast.error("Please select an Expense Account");
      return;
    }

    const alwaysCreatePayable = editForm.payableAccountId !== 0;
    const payload = {
      ...editForm,
      payableAccountId: editForm.payableAccountId === 0 ? null : editForm.payableAccountId,
      alwaysCreatePayable,
    };

    console.log('alwaysCreatePayable:', alwaysCreatePayable);
    console.log('editForm:', editForm);
    
    await dispatch(UpdateExpenseCategory(payload));
    dispatch(GetAllExpenseCategories());
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId !== 0) {
      await dispatch(DeleteExpenseCategory(selectedId));
      dispatch(GetAllExpenseCategories());
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
      title: "Category",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name),
    },
    {
      title: "Expense Account",
      dataIndex: "expenseAccountName",
      sorter: (a: any, b: any) => a.expenseAccountName?.localeCompare(b.expenseAccountName),
    },
    {
      title: "Payable Account",
      dataIndex: "payableAccountName",
      sorter: (a: any, b: any) => a.payableAccountName?.localeCompare(b.payableAccountName),
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
                    data-bs-target="#edit_expenses_category"
                    onClick={() =>
                      setEditForm({
                        id: record.id,
                        name: record.name,
                        expenseAccountId: record.expenseAccountId || 0,
                        payableAccountId: record.payableAccountId || 0,
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

  const tableData = Array.isArray(categories)
    ? categories.map((cat: any) => ({ ...cat, key: cat.id }))
    : [];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Expense Category</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Finance &amp; Accounts</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Expense Category
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <TooltipOption />
              <div className="mb-2">
                <Link
                  to="#"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#add_expenses_category"
                >
                  <i className="ti ti-square-rounded-plus me-2" />
                  Add Category
                </Link>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Expense Category List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
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
                  <div className="dropdown-menu drop-width">
                    <form>
                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 pb-0 border-bottom">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Category</label>
                              <CommonSelect
                                className="select"
                                options={category2}
                                defaultValue={category2[0]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <Link to="#" className="btn btn-light me-3">
                          Reset
                        </Link>
                        <button type="button" className="btn btn-primary">
                          Apply
                        </button>
                      </div>
                    </form>
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
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              <Table dataSource={tableData} columns={columns} Selection={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Expenses Category */}
      <div className="modal fade" id="add_expenses_category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Category</h4>
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
                      <label className="form-label">Category Name <span className="text-danger">*</span></label>
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
                      <label className="form-label">Expense Account <span className="text-danger">*</span></label>
                      <Select
                        classNamePrefix="react-select"
                        options={expenseOptions}
                        value={expenseOptions.find(opt => opt.value === addForm.expenseAccountId) || null}
                        onChange={(option: any) =>
                          setAddForm({
                            ...addForm,
                            expenseAccountId: option ? option.value : 0,
                          })
                        }
                        isSearchable={true}
                        placeholder="Select Expense Account"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Payable Account</label>
                      <Select
                        classNamePrefix="react-select"
                        options={liabilityOptions}
                        value={liabilityOptions.find(opt => opt.value === addForm.payableAccountId) || null}
                        onChange={(option: any) =>
                          setAddForm({
                            ...addForm,
                            payableAccountId: option ? option.value : 0,
                          })
                        }
                        isSearchable={true}
                        isClearable={true}
                        placeholder="Select Payable Account (Optional)"
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
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" data-bs-dismiss={addForm.expenseAccountId !== 0 ? "modal" : ""}>
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Expenses Category */}

      {/* Edit Expenses Category */}
      <div className="modal fade" id="edit_expenses_category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Category</h4>
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
                      <label className="form-label">Category Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Category"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Expense Account <span className="text-danger">*</span></label>
                      <Select
                        classNamePrefix="react-select"
                        options={expenseOptions}
                        value={expenseOptions.find(opt => opt.value === editForm.expenseAccountId) || null}
                        onChange={(option: any) =>
                          setEditForm({
                            ...editForm,
                            expenseAccountId: option ? option.value : 0,
                          })
                        }
                        isSearchable={true}
                        placeholder="Select Expense Account"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Payable Account</label>
                      <Select
                        classNamePrefix="react-select"
                        options={liabilityOptions}
                        value={liabilityOptions.find(opt => opt.value === editForm.payableAccountId) || null}
                        onChange={(option: any) =>
                          setEditForm({
                            ...editForm,
                            payableAccountId: option ? option.value : 0,
                          })
                        }
                        isSearchable={true}
                        isClearable={true}
                        placeholder="Select Payable Account (Optional)"
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
                >
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" data-bs-dismiss={editForm.expenseAccountId !== 0 ? "modal" : ""}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Expenses Category */}

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
                  You want to delete this category, this can't be undone.
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

export default ExpensesCategory;
