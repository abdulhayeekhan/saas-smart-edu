import React, { useEffect, useState } from "react";
import { Drawer, Table, Spin, Popconfirm, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import {
  GetHeadLedger,
  AddLedgerEntry,
  DeleteLedgerEntry,
  clearHeadLedger,
  LedgerLine,
} from "../../../store/apps/emp-allowance-deduction";

const formatAmount = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export interface LedgerDrawerHead {
  assignmentId: number;
  headName: string;
  headTypeName: string;
}

interface HeadLedgerDrawerProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  head: LedgerDrawerHead | null;
  /** Called after a posted/deleted entry so the profile can refresh its balances. */
  onChanged: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const emptyEntry = {
  entryDate: dayjs().format("YYYY-MM-DD"),
  movement: "debit" as "debit" | "credit",
  amount: "",
  description: "",
  referenceNumber: "",
};

const HeadLedgerDrawer: React.FC<HeadLedgerDrawerProps> = ({
  open,
  onClose,
  employeeId,
  head,
  onChanged,
  canEdit,
  canDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { headLedger, headLedgerLoading } = useSelector((state: RootState) => state.empAllowanceDeduction);

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const currentUserId = userInfo?.data?.id;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entry, setEntry] = useState(emptyEntry);
  const [posting, setPosting] = useState(false);

  const loadLedger = (from = fromDate, to = toDate) => {
    if (!head) return;
    dispatch(
      GetHeadLedger({
        employeeId,
        empAllowanceDeductionId: head.assignmentId,
        fromDate: from || null,
        toDate: to || null,
      })
    );
  };

  useEffect(() => {
    if (open && head) {
      setEntry(emptyEntry);
      loadLedger();
    }
    if (!open) {
      dispatch(clearHeadLedger());
      setFromDate("");
      setToDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, head?.assignmentId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!head) return;

    const amount = Number(entry.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }

    setPosting(true);
    // Debit and Credit are mutually exclusive on the API, hence the single amount field.
    const res: any = await dispatch(
      AddLedgerEntry({
        empAllowanceDeductionId: head.assignmentId,
        userId: currentUserId || 0,
        entryDate: entry.entryDate || null,
        debit: entry.movement === "debit" ? amount : 0,
        credit: entry.movement === "credit" ? amount : 0,
        description: entry.description,
        referenceNumber: entry.referenceNumber || null,
      })
    );
    setPosting(false);

    if (!res.error) {
      setEntry({ ...emptyEntry, movement: entry.movement });
      loadLedger();
      onChanged();
    }
  };

  const handleDeleteEntry = async (id: number) => {
    const res: any = await dispatch(DeleteLedgerEntry(id));
    if (!res.error) {
      loadLedger();
      onChanged();
    }
  };

  const summary = headLedger?.head;

  const columns = [
    {
      title: "Date",
      dataIndex: "entryDate",
      width: 110,
      render: (value: string) => (value ? dayjs(value).format("DD-MMM-YYYY") : "—"),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text: string) => text || "—",
    },
    {
      title: "Source",
      dataIndex: "sourceTypeName",
      width: 120,
      render: (text: string) => (
        <Tag color={text === "Manual" ? "default" : "blue"}>{text || "—"}</Tag>
      ),
    },
    {
      title: "Reference",
      dataIndex: "referenceNumber",
      width: 120,
      render: (text: string) => text || "—",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      align: "right" as const,
      width: 110,
      render: (value: number) => (value ? formatAmount(value) : "—"),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      align: "right" as const,
      width: 110,
      render: (value: number) => (value ? formatAmount(value) : "—"),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right" as const,
      width: 120,
      render: (value: number) => <strong>{formatAmount(value)}</strong>,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: LedgerLine) =>
        canDelete && record.sourceTypeName === "Manual" ? (
          <Popconfirm
            title="Delete this entry?"
            description="Entries are history — deleting re-computes every balance after it."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteEntry(record.id)}
          >
            <button type="button" className="btn btn-icon btn-sm btn-soft-danger rounded-pill">
              <i className="feather-trash-2" />
            </button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <Drawer
      title={
        head ? (
          <div>
            <div className="fw-semibold">{head.headName}</div>
            <small className="text-muted">{head.headTypeName} ledger</small>
          </div>
        ) : (
          "Ledger"
        )
      }
      placement="right"
      width={920}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={headLedgerLoading}>
        {/* Period */}
        <div className="d-flex align-items-end flex-wrap gap-2 mb-3">
          <div>
            <label className="form-label mb-1">From</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label mb-1">To</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => loadLedger()}>
            Apply
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              setFromDate("");
              setToDate("");
              loadLedger("", "");
            }}
          >
            Reset
          </button>
        </div>

        {/* Summary */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="card mb-0">
              <div className="card-body p-3">
                <p className="mb-1 text-muted">
                  Opening{" "}
                  <Tooltip title="The head's own opening balance plus every movement before the From date.">
                    <i className="ti ti-info-circle" />
                  </Tooltip>
                </p>
                <h5 className="mb-0">{formatAmount(headLedger?.openingBalance)}</h5>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card mb-0">
              <div className="card-body p-3">
                <p className="mb-1 text-muted">Debit</p>
                <h5 className="mb-0">{formatAmount(headLedger?.totalDebit)}</h5>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card mb-0">
              <div className="card-body p-3">
                <p className="mb-1 text-muted">Credit</p>
                <h5 className="mb-0">{formatAmount(headLedger?.totalCredit)}</h5>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card mb-0">
              <div className="card-body p-3">
                <p className="mb-1 text-muted">Closing</p>
                <h5 className="mb-0 text-primary">{formatAmount(headLedger?.closingBalance)}</h5>
              </div>
            </div>
          </div>
        </div>

        {summary && (
          <p className="text-muted mb-3">
            Recurring amount <strong>{formatAmount(summary.amount)}</strong> · {summary.entryCount}{" "}
            entry(ies) · {summary.isActive ? "Active" : "Inactive"}
          </p>
        )}

        {/* Post an entry */}
        {canEdit && (
          <div className="card mb-3">
            <div className="card-header pb-0">
              <h5 className="mb-3">Post an entry</h5>
            </div>
            <div className="card-body pt-0">
              <form onSubmit={handlePost}>
                <div className="row g-2 align-items-end">
                  <div className="col-md-2">
                    <label className="form-label mb-1">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={entry.entryDate}
                      onChange={(e) => setEntry({ ...entry, entryDate: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mb-1">Movement</label>
                    <select
                      className="form-control"
                      value={entry.movement}
                      onChange={(e) =>
                        setEntry({ ...entry, movement: e.target.value as "debit" | "credit" })
                      }
                    >
                      <option value="debit">Debit (charge)</option>
                      <option value="credit">Credit (settle)</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control text-end"
                      value={entry.amount}
                      onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label mb-1">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength={500}
                      value={entry.description}
                      onChange={(e) => setEntry({ ...entry, description: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mb-1">Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength={100}
                      value={entry.referenceNumber}
                      onChange={(e) => setEntry({ ...entry, referenceNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-md-1">
                    <button type="submit" className="btn btn-primary w-100" disabled={posting}>
                      {posting ? "..." : "Post"}
                    </button>
                  </div>
                </div>
                <small className="text-muted d-block mt-2">
                  Debit increases what is outstanding on this head; credit settles it.
                </small>
              </form>
            </div>
          </div>
        )}

        {/* Entries */}
        <Table
          columns={columns}
          dataSource={headLedger?.details || []}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: "No movement in this period" }}
        />
      </Spin>
    </Drawer>
  );
};

export default HeadLedgerDrawer;
