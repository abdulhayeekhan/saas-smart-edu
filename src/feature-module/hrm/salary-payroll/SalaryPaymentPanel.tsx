import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Spin } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { useCampusFeeRecAccount } from "../../../core/common/selectoption/financial/useCampusFeeRecAccount";
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import {
  SalaryPaymentGroup,
  SalaryPaymentList,
  SalaryPaymentRow,
  PostPaymentPayload,
} from "../../../store/apps/salary-payroll";
import { formatAmount } from "./index";

/**
 * Step 3 of the salary cycle.
 *
 * The API buckets the run's payslips by the payment mode on each employee's profile, and each
 * bucket is paid as its own batch — cash employees on a cash payment voucher, bank employees on
 * a bank payment voucher with one cheque number each. So this panel posts one group at a time
 * rather than offering a single "pay everyone" button.
 */

interface SalaryPaymentPanelProps {
  paymentList: SalaryPaymentList;
  campusId: number;
  loading: boolean;
  saving: boolean;
  canPay: boolean;
  onPay: (payload: Omit<PostPaymentPayload, "salaryPayrollId" | "userId">) => void;
}

const SalaryPaymentPanel: React.FC<SalaryPaymentPanelProps> = ({
  paymentList,
  campusId,
  loading,
  saving,
  canPay,
  onPay,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const cashHeads = useCampusFeeRecAccount();
  const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);

  // Per group: which rows are ticked, which account pays them, and the cheque numbers.
  const [selected, setSelected] = useState<Record<string, number[]>>({});
  const [accountByMode, setAccountByMode] = useState<Record<string, number | null>>({});
  const [cheques, setCheques] = useState<Record<number, string>>({});
  const [paymentDate, setPaymentDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [bulkCheque, setBulkCheque] = useState("");

  useEffect(() => {
    if (campusId) dispatch(GetCampusBanksByCampus(campusId));
  }, [dispatch, campusId]);

  const bankOptions = useMemo(
    () =>
      (bankDetails || []).map((bank: any) => ({
        value: bank.accountId as number,
        label: `${bank.tblAccountBank?.name} (${bank.iban})`,
      })),
    [bankDetails]
  );

  // Cash is paid out of a cash head, a cheque out of a campus bank account — but both lists are
  // offered either way, since a campus may keep petty cash on a bank-mapped head. The cash-head
  // hook is untyped JS and leads with a blank placeholder, so drop that and coerce the ids.
  const accountOptions = useMemo<{ value: number; label: string }[]>(
    () => [
      ...(cashHeads || [])
        .filter((option: any) => option?.value !== "" && option?.value != null)
        .map((option: any) => ({ value: Number(option.value), label: String(option.label) })),
      ...bankOptions,
    ],
    [cashHeads, bankOptions]
  );

  const toggleSelection = (mode: string, detailIds: number[]) =>
    setSelected((prev) => ({ ...prev, [mode]: detailIds }));

  const handlePay = (group: SalaryPaymentGroup) => {
    const chosen = selected[group.paymentMode] || [];
    if (chosen.length === 0) {
      toast.error("Select at least one employee to pay");
      return;
    }

    const accountId = accountByMode[group.paymentMode];
    if (!accountId) {
      toast.error(`Select the account the ${group.paymentMode.toLowerCase()} batch is paid from`);
      return;
    }

    if (group.requiresCheque) {
      const missing = chosen.filter((id) => !(cheques[id] || "").trim());
      if (missing.length > 0) {
        toast.error(`Enter a cheque number for every selected employee (${missing.length} missing)`);
        return;
      }
    }

    onPay({
      paymentAccountId: accountId,
      paymentDate,
      paymentMode: group.paymentMode,
      payments: chosen.map((detailId) => ({
        detailId,
        chequeNumber: group.requiresCheque ? (cheques[detailId] || "").trim() : null,
      })),
    });

    setSelected((prev) => ({ ...prev, [group.paymentMode]: [] }));
    setBulkCheque("");
  };

  /** Fills every selected row with sequential cheque numbers from a starting one. */
  const applySequentialCheques = (group: SalaryPaymentGroup) => {
    const start = bulkCheque.trim();
    if (!start) return;

    const chosen = selected[group.paymentMode] || [];
    const numeric = Number(start);

    setCheques((prev) => {
      const next = { ...prev };
      chosen.forEach((detailId, index) => {
        next[detailId] = Number.isFinite(numeric) && start !== ""
          ? String(numeric + index).padStart(start.length, "0")
          : start;
      });
      return next;
    });
  };

  const buildColumns = (group: SalaryPaymentGroup) => [
    { title: "Employee ID", dataIndex: "employeeKey", render: (text: string) => text || "—" },
    { title: "Name", dataIndex: "employeeName", render: (text: string) => text || "—" },
    { title: "Designation", dataIndex: "designationName", render: (text: string) => text || "—" },
    ...(group.requiresCheque
      ? [
          {
            title: "Bank Account",
            dataIndex: "accountNumber",
            render: (_: any, row: SalaryPaymentRow) =>
              row.accountNumber ? (
                <>
                  <div>{row.accountTitle || "—"}</div>
                  <small className="text-muted">
                    {row.accountNumber}
                    {row.bankName ? ` · ${row.bankName}` : ""}
                  </small>
                </>
              ) : (
                <span className="text-warning">No bank details on profile</span>
              ),
          },
        ]
      : []),
    {
      title: "Net Amount",
      dataIndex: "netAmount",
      align: "right" as const,
      render: (value: number) => <span className="fw-semibold">{formatAmount(value)}</span>,
    },
    ...(group.requiresCheque
      ? [
          {
            title: "Cheque No",
            key: "cheque",
            width: 160,
            render: (_: any, row: SalaryPaymentRow) =>
              row.isPaid ? (
                row.chequeNumber || "—"
              ) : (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Cheque no"
                  disabled={!canPay}
                  value={cheques[row.detailId] || ""}
                  onChange={(e) =>
                    setCheques((prev) => ({ ...prev, [row.detailId]: e.target.value }))
                  }
                />
              ),
          },
        ]
      : []),
    {
      title: "Status",
      dataIndex: "status",
      render: (_: any, row: SalaryPaymentRow) =>
        row.isPaid ? (
          <Tag color="green">
            Paid{row.paymentVoucherNumber ? ` · ${group.voucherTypeShortName}-${row.paymentVoucherNumber}` : ""}
          </Tag>
        ) : (
          <Tag color="orange">Unpaid</Tag>
        ),
    },
    {
      title: "Paid On",
      dataIndex: "paymentDate",
      render: (value: string | null) => (value ? dayjs(value).format("DD-MMM-YYYY") : "—"),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="mb-1">Post to Account</h5>
            <p className="mb-0 text-muted">
              Employees are grouped by the payment mode on their profile. Pay each group as its own
              voucher.
            </p>
          </div>
          <div style={{ minWidth: 200 }}>
            <label className="form-label mb-1">Payment Date</label>
            <input
              type="date"
              className="form-control"
              disabled={!canPay}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="text-end">
            <div className="text-muted">Outstanding</div>
            <h4 className="mb-0 text-primary">{formatAmount(paymentList.totalOutstanding)}</h4>
          </div>
        </div>
      </div>

      {paymentList.groups.length === 0 && (
        <div className="alert alert-warning">This salary run has no payslips to pay.</div>
      )}

      {paymentList.groups.map((group) => {
        const unpaid = group.employees.filter((x) => !x.isPaid);
        const chosen = selected[group.paymentMode] || [];

        return (
          <div className="card mb-3" key={group.paymentMode}>
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">
                {group.paymentMode} Payment{" "}
                <Tag color={group.requiresCheque ? "blue" : "green"} className="ms-1">
                  {group.voucherTypeShortName}
                </Tag>
                <span className="text-muted fs-14 ms-2">
                  {group.pendingCount} unpaid · {formatAmount(group.pendingAmount)}
                </span>
              </h4>
              <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                {group.requiresCheque && canPay && unpaid.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: 150 }}
                      placeholder="First cheque no"
                      value={bulkCheque}
                      onChange={(e) => setBulkCheque(e.target.value)}
                    />
                    <button
                      className="btn btn-light"
                      onClick={() => applySequentialCheques(group)}
                      disabled={chosen.length === 0}
                    >
                      Number selected
                    </button>
                  </div>
                )}
                <div style={{ minWidth: 260 }}>
                  <CommonSelect3
                    options={accountOptions}
                    name={`account-${group.paymentMode}`}
                    value={
                      accountOptions.find((o: any) => o.value === accountByMode[group.paymentMode]) || null
                    }
                    onChange={(opt) =>
                      setAccountByMode((prev) => ({
                        ...prev,
                        [group.paymentMode]: Number(opt?.value) || null,
                      }))
                    }
                    placeholder={`Paid from (${group.paymentMode.toLowerCase()} account)`}
                    isDisabled={!canPay || unpaid.length === 0}
                  />
                </div>
                <button
                  className="btn btn-success"
                  disabled={!canPay || saving || chosen.length === 0}
                  onClick={() => handlePay(group)}
                >
                  {saving ? "Posting..." : `Post ${chosen.length || ""} to Account`}
                </button>
              </div>
            </div>

            <div className="card-body p-0 py-3">
              <div className="table-responsive">
                <Table
                  columns={buildColumns(group)}
                  dataSource={group.employees}
                  rowKey="detailId"
                  pagination={{ pageSize: 25, showSizeChanger: true }}
                  className="table datatable nowrap"
                  rowSelection={
                    canPay
                      ? {
                          selectedRowKeys: chosen,
                          onChange: (keys) => toggleSelection(group.paymentMode, keys as number[]),
                          getCheckboxProps: (row: SalaryPaymentRow) => ({ disabled: row.isPaid }),
                        }
                      : undefined
                  }
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        {/* The checkbox column is rendered but is not in `columns`, so the totals
                            row has to allow for it whenever the batch is selectable. */}
                        <Table.Summary.Cell
                          index={0}
                          colSpan={(group.requiresCheque ? 4 : 3) + (canPay ? 1 : 0)}
                        >
                          <span className="fw-semibold">Selected {chosen.length}</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span className="fw-bold text-primary">
                            {formatAmount(
                              group.employees
                                .filter((x) => chosen.includes(x.detailId))
                                .reduce((sum, x) => sum + x.netAmount, 0)
                            )}
                          </span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} colSpan={group.requiresCheque ? 3 : 2} />
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </Spin>
  );
};

export default SalaryPaymentPanel;
