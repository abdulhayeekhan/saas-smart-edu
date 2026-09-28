import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Spin, Tooltip } from "antd";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import { GetAccountsLevelWise, ChartOfAccount } from "../../../store/apps/campus-coa";

/**
 * Allowance types and deductions are the same table with a different name and API prefix,
 * so both master screens render this component with their own slice actions.
 */
export interface PayrollHead {
  id?: number;
  name: string;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  createdBy?: number;
  modifiedBy?: number | null;
  debitAccountName?: string | null;
  debitAccountCode?: string | null;
  creditAccountName?: string | null;
  creditAccountCode?: string | null;
}

interface PayrollHeadListProps {
  /** "Allowance Type" / "Deduction" — also the module name checked for rights. */
  title: string;
  titlePlural: string;
  /** Slice to read `{ data, loading }` from. */
  stateKey: "allowanceType" | "deduction";
  getAll: (payload: { pageNo: number; pageSize: number; search: string }) => any;
  add: (payload: Partial<PayrollHead>) => any;
  update: (payload: Partial<PayrollHead>) => any;
  remove: (id: number) => any;
}

const emptyForm: PayrollHead = {
  name: "",
  description: "",
  debitAccountId: 0,
  creditAccountId: 0,
};

const PayrollHeadList: React.FC<PayrollHeadListProps> = ({
  title,
  titlePlural,
  stateKey,
  getAll,
  add,
  update,
  remove,
}) => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission(title);

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const currentUserId = userInfo?.data?.id;

  const { data, loading } = useSelector((state: RootState) => (state as any)[stateKey]);

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState<PayrollHead>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchHeads = () => {
    dispatch(getAll({ pageNo: 1, pageSize: 1000, search: "" }));
  };

  useEffect(() => {
    fetchHeads();
    // Both accounts live on the branch chart of accounts — the API validates them against it.
    dispatch(GetAccountsLevelWise({ accountLevel: 4 })).then((res: any) => {
      if (res.payload) setAccounts(res.payload as ChartOfAccount[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const accountOptions = useMemo(
    () =>
      (accounts ?? []).map((acc: any) => ({
        value: acc.id as number,
        label: `${acc.accountCode} - ${acc.accountName}`,
      })),
    [accounts]
  );

  const openAdd = () => setForm(emptyForm);

  const openEdit = (record: PayrollHead) =>
    setForm({
      id: record.id,
      name: record.name || "",
      description: record.description || "",
      debitAccountId: record.debitAccountId || 0,
      creditAccountId: record.creditAccountId || 0,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.debitAccountId) {
      toast.error("Please select a debit account");
      return;
    }
    if (!form.creditAccountId) {
      toast.error("Please select a credit account");
      return;
    }

    const payload: Partial<PayrollHead> = {
      ...form,
      createdBy: currentUserId || 0,
      modifiedBy: currentUserId || 0,
    };

    const action = form.id ? update(payload) : add(payload);
    const res: any = await dispatch(action);

    if (!res.error) {
      document.getElementById("close-head-modal")?.click();
      setForm(emptyForm);
      fetchHeads();
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;

    const res: any = await dispatch(remove(deleteId));
    if (!res.error) {
      document.getElementById("close-delete-modal")?.click();
      setDeleteId(null);
    }
  };

  const rows = useMemo(() => {
    const list: PayrollHead[] = Array.isArray(data) ? data : [];
    if (!searchText.trim()) return list;
    const needle = searchText.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(needle) ||
        item.description?.toLowerCase().includes(needle)
    );
  }, [data, searchText]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a: PayrollHead, b: PayrollHead) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text: string) => text || "—",
    },
    {
      title: "Debit Account",
      dataIndex: "debitAccountName",
      render: (_: any, record: PayrollHead) =>
        record.debitAccountName ? `${record.debitAccountCode} - ${record.debitAccountName}` : "—",
    },
    {
      title: "Credit Account",
      dataIndex: "creditAccountName",
      render: (_: any, record: PayrollHead) =>
        record.creditAccountName ? `${record.creditAccountCode} - ${record.creditAccountName}` : "—",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: PayrollHead) => (
        <div className="d-flex align-items-center">
          {hasPermission?.editRight && (
            <Tooltip title="Edit">
              <Link
                to="#"
                className="btn btn-icon btn-sm btn-soft-info rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#head-modal"
                onClick={() => openEdit(record)}
              >
                <i className="feather-edit" />
              </Link>
            </Tooltip>
          )}
          {hasPermission?.deleteRight && (
            <Tooltip title="Delete">
              <Link
                to="#"
                className="btn btn-icon btn-sm btn-soft-danger rounded-pill ms-2"
                data-bs-toggle="modal"
                data-bs-target="#delete-modal"
                onClick={() => setDeleteId(record.id ?? null)}
              >
                <i className="feather-trash-2" />
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
              <h3 className="page-title mb-1">{titlePlural}</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">HRM</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {titlePlural}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {hasPermission?.addRight && (
                <div className="mb-2">
                  <Link
                    to="#"
                    className="btn btn-primary d-flex align-items-center"
                    data-bs-toggle="modal"
                    data-bs-target="#head-modal"
                    onClick={openAdd}
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add {title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">{titlePlural} List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="search-input mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Search ${titlePlural}...`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              <div className="table-responsive">
                <Spin spinning={loading}>
                  <Table
                    columns={columns}
                    dataSource={rows}
                    rowKey="id"
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    className="table datatable nowrap"
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit */}
      <div className="modal fade" id="head-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                {form.id ? `Edit ${title}` : `Add ${title}`}
              </h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-head-modal"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Debit Account <span className="text-danger">*</span>
                      </label>
                      <CommonSelect3
                        options={accountOptions}
                        name="debitAccountId"
                        value={accountOptions.find((o) => o.value === form.debitAccountId) || null}
                        onChange={(opt) => setForm({ ...form, debitAccountId: Number(opt?.value) || 0 })}
                        placeholder="Select Debit Account"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Credit Account <span className="text-danger">*</span>
                      </label>
                      <CommonSelect3
                        options={accountOptions}
                        name="creditAccountId"
                        value={accountOptions.find((o) => o.value === form.creditAccountId) || null}
                        onChange={(opt) => setForm({ ...form, creditAccountId: Number(opt?.value) || 0 })}
                        placeholder="Select Credit Account"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : form.id ? "Save Changes" : `Add ${title}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete */}
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
                  Are you sure you want to delete this {title.toLowerCase()}? Employees already
                  assigned to it will be affected.
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
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayrollHeadList;
