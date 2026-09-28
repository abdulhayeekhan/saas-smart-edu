import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tooltip, Popconfirm, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { GetAllAllowanceTypes } from "../../../store/apps/allowance-type";
import { GetAllDeductions } from "../../../store/apps/deduction";
import {
  SalaryPayrollDetailed,
  SalaryPayrollEmployee,
  UpdateDraftPayload,
  HEAD_TYPE_ALLOWANCE,
  HEAD_TYPE_DEDUCTION,
} from "../../../store/apps/salary-payroll";
import { formatAmount } from "./index";

/**
 * Step 1 of the salary cycle: the draft editor.
 *
 * Everything is edited locally and sent in one save, because a payslip's figures are all
 * interdependent — changing days re-prorates every allowance on the row, so a per-cell save
 * would show the operator half-applied numbers. The amounts shown here are computed with the
 * same rule the API uses (`prorated ? base x days / totalDays : base`) so the preview matches
 * what gets stored.
 */

interface DraftHeadRow {
  key: string;
  /** Existing line id, or null for a line added in this session. */
  id: number | null;
  headType: number;
  allowanceTypeId: number | null;
  deductionId: number | null;
  headName: string;
  /** Kept as a string so the input can be cleared while typing. */
  baseAmount: string;
  isProrated: boolean;
}

interface DraftRow {
  detailId: number;
  employeeId: number;
  employeeKey: string | null;
  employeeName: string | null;
  designationName: string | null;
  departmentName: string | null;
  paymentMode: string;
  payableDays: string;
  remarks: string;
  heads: DraftHeadRow[];
}

interface SalaryDraftTableProps {
  payroll: SalaryPayrollDetailed;
  totalDays: number;
  saving: boolean;
  canEdit: boolean;
  onSave: (payload: Omit<UpdateDraftPayload, "id" | "userId">) => void;
  onRemoveEmployee: (detailId: number) => void;
  /** Raised whenever the local edits diverge from what the server holds. */
  onDirtyChange: (dirty: boolean) => void;
}

const toRow = (detail: SalaryPayrollEmployee): DraftRow => ({
  detailId: detail.id,
  employeeId: detail.employeeId,
  employeeKey: detail.employeeKey,
  employeeName: detail.employeeName,
  designationName: detail.designationName,
  departmentName: detail.departmentName,
  paymentMode: detail.paymentMode,
  payableDays: String(detail.payableDays ?? 0),
  remarks: detail.remarks || "",
  heads: [...detail.allowances, ...detail.deductions].map((head) => ({
    key: `h-${head.id}`,
    id: head.id,
    headType: head.headType,
    allowanceTypeId: head.allowanceTypeId,
    deductionId: head.deductionId,
    headName: head.headName,
    baseAmount: String(head.baseAmount ?? 0),
    isProrated: head.isProrated,
  })),
});

/** The one proration rule, mirrored from HRSalaryPayrollRepository.RecalculateDetail. */
const headAmount = (head: DraftHeadRow, payableDays: number, totalDays: number) => {
  const base = Number(head.baseAmount) || 0;
  if (!head.isProrated) return base;
  const divisor = totalDays > 0 ? totalDays : 30;
  return Math.round(((base * payableDays) / divisor) * 100) / 100;
};

const rowTotals = (row: DraftRow, totalDays: number) => {
  const days = Number(row.payableDays) || 0;
  const gross = row.heads
    .filter((h) => h.headType === HEAD_TYPE_ALLOWANCE)
    .reduce((sum, h) => sum + headAmount(h, days, totalDays), 0);
  const deduction = row.heads
    .filter((h) => h.headType === HEAD_TYPE_DEDUCTION)
    .reduce((sum, h) => sum + headAmount(h, days, totalDays), 0);
  return { gross, deduction, net: gross - deduction };
};

const SalaryDraftTable: React.FC<SalaryDraftTableProps> = ({
  payroll,
  totalDays,
  saving,
  canEdit,
  onSave,
  onRemoveEmployee,
  onDirtyChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: allowanceTypes } = useSelector((state: RootState) => state.allowanceType);
  const { data: deductions } = useSelector((state: RootState) => state.deduction);

  const [rows, setRows] = useState<DraftRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [baseline, setBaseline] = useState("");

  useEffect(() => {
    dispatch(GetAllAllowanceTypes({ pageNo: 1, pageSize: 1000, search: "" }));
    dispatch(GetAllDeductions({ pageNo: 1, pageSize: 1000, search: "" }));
  }, [dispatch]);

  // Re-seed from the server whenever the run reloads (a save, an accrual, added employees).
  useEffect(() => {
    const seeded = (payroll.details || []).map(toRow);
    setRows(seeded);
    setBaseline(JSON.stringify(seeded));
  }, [payroll]);

  const dirty = useMemo(() => baseline !== "" && JSON.stringify(rows) !== baseline, [rows, baseline]);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const patchRow = (detailId: number, patch: Partial<DraftRow>) =>
    setRows((prev) => prev.map((row) => (row.detailId === detailId ? { ...row, ...patch } : row)));

  const patchHead = (detailId: number, key: string, patch: Partial<DraftHeadRow>) =>
    setRows((prev) =>
      prev.map((row) =>
        row.detailId === detailId
          ? { ...row, heads: row.heads.map((h) => (h.key === key ? { ...h, ...patch } : h)) }
          : row
      )
    );

  const removeHead = (detailId: number, key: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.detailId === detailId ? { ...row, heads: row.heads.filter((h) => h.key !== key) } : row
      )
    );

  const addHead = (detailId: number, headType: number, headId: number) => {
    const master =
      headType === HEAD_TYPE_ALLOWANCE
        ? (allowanceTypes || []).find((x: any) => x.id === headId)
        : (deductions || []).find((x: any) => x.id === headId);

    if (!master) return;

    setRows((prev) =>
      prev.map((row) =>
        row.detailId === detailId
          ? {
              ...row,
              heads: [
                ...row.heads,
                {
                  key: `new-${headType}-${headId}-${Date.now()}`,
                  id: null,
                  headType,
                  allowanceTypeId: headType === HEAD_TYPE_ALLOWANCE ? headId : null,
                  deductionId: headType === HEAD_TYPE_DEDUCTION ? headId : null,
                  headName: master.name,
                  baseAmount: "0",
                  // Same default the API applies when a run is generated.
                  isProrated: headType === HEAD_TYPE_ALLOWANCE,
                },
              ],
            }
          : row
      )
    );
  };

  const handleSave = () => {
    onSave({
      totalDays,
      remarks: payroll.remarks || null,
      details: rows.map((row) => ({
        id: row.detailId,
        payableDays: Number(row.payableDays) || 0,
        remarks: row.remarks || null,
        heads: row.heads.map((head) => ({
          id: head.id,
          headType: head.headType,
          allowanceTypeId: head.allowanceTypeId,
          deductionId: head.deductionId,
          baseAmount: Number(head.baseAmount) || 0,
          isProrated: head.isProrated,
        })),
      })),
    });
  };

  const visibleRows = useMemo(() => {
    if (!searchText.trim()) return rows;
    const needle = searchText.trim().toLowerCase();
    return rows.filter(
      (row) =>
        row.employeeName?.toLowerCase().includes(needle) ||
        row.employeeKey?.toLowerCase().includes(needle) ||
        row.designationName?.toLowerCase().includes(needle)
    );
  }, [rows, searchText]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const { gross, deduction, net } = rowTotals(row, totalDays);
        return { gross: acc.gross + gross, deduction: acc.deduction + deduction, net: acc.net + net };
      },
      { gross: 0, deduction: 0, net: 0 }
    );
  }, [rows, totalDays]);

  const renderHeadSection = (row: DraftRow, headType: number) => {
    const isAllowance = headType === HEAD_TYPE_ALLOWANCE;
    const heads = row.heads.filter((h) => h.headType === headType);
    const days = Number(row.payableDays) || 0;

    const used = new Set(
      heads.map((h) => (isAllowance ? h.allowanceTypeId : h.deductionId)).filter(Boolean) as number[]
    );

    const options = ((isAllowance ? allowanceTypes : deductions) || [])
      .filter((master: any) => !used.has(master.id))
      .map((master: any) => ({ value: master.id as number, label: master.name as string }));

    return (
      <div className="col-md-6">
        <h6 className={`mb-2 ${isAllowance ? "text-success" : "text-danger"}`}>
          {isAllowance ? "Allowances" : "Deductions"}
        </h6>
        <table className="table table-sm table-bordered mb-2">
          <thead>
            <tr>
              <th style={{ width: "36%" }}>Head</th>
              <th style={{ width: "22%" }} className="text-end">
                Monthly
              </th>
              <th style={{ width: "14%" }} className="text-center">
                Prorate
              </th>
              <th style={{ width: "20%" }} className="text-end">
                This Month
              </th>
              {canEdit && <th style={{ width: "8%" }} />}
            </tr>
          </thead>
          <tbody>
            {heads.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 5 : 4} className="text-center text-muted">
                  None
                </td>
              </tr>
            )}
            {heads.map((head) => (
              <tr key={head.key}>
                <td>
                  {head.headName}
                  {head.id === null && (
                    <Tag color="purple" className="ms-1">
                      new
                    </Tag>
                  )}
                </td>
                <td className="text-end">
                  {canEdit ? (
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="form-control form-control-sm text-end"
                      value={head.baseAmount}
                      onChange={(e) => patchHead(row.detailId, head.key, { baseAmount: e.target.value })}
                    />
                  ) : (
                    formatAmount(Number(head.baseAmount))
                  )}
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    disabled={!canEdit}
                    checked={head.isProrated}
                    onChange={(e) => patchHead(row.detailId, head.key, { isProrated: e.target.checked })}
                  />
                </td>
                <td className="text-end fw-semibold">
                  {formatAmount(headAmount(head, days, totalDays))}
                </td>
                {canEdit && (
                  <td className="text-center">
                    <Tooltip title="Remove from this payslip">
                      <Link
                        to="#"
                        className="text-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          removeHead(row.detailId, head.key);
                        }}
                      >
                        <i className="ti ti-trash" />
                      </Link>
                    </Tooltip>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {canEdit && options.length > 0 && (
          <CommonSelect3
            options={options}
            name={`add-head-${headType}-${row.detailId}`}
            value={null}
            onChange={(opt) => opt?.value && addHead(row.detailId, headType, Number(opt.value))}
            placeholder={isAllowance ? "+ Add allowance" : "+ Add deduction"}
          />
        )}
      </div>
    );
  };

  const columns = [
    { title: "Employee ID", dataIndex: "employeeKey", render: (text: string) => text || "—" },
    { title: "Name", dataIndex: "employeeName", render: (text: string) => text || "—" },
    { title: "Designation", dataIndex: "designationName", render: (text: string) => text || "—" },
    {
      title: "Mode",
      dataIndex: "paymentMode",
      render: (text: string) => <Tag color={text === "Cash" ? "green" : "blue"}>{text || "Cash"}</Tag>,
    },
    {
      title: `Days / ${totalDays}`,
      dataIndex: "payableDays",
      width: 110,
      render: (_: any, row: DraftRow) =>
        canEdit ? (
          <input
            type="number"
            step="0.5"
            min={0}
            max={totalDays}
            className="form-control form-control-sm text-end"
            value={row.payableDays}
            onChange={(e) => patchRow(row.detailId, { payableDays: e.target.value })}
          />
        ) : (
          row.payableDays
        ),
    },
    {
      title: "Gross",
      align: "right" as const,
      render: (_: any, row: DraftRow) => formatAmount(rowTotals(row, totalDays).gross),
    },
    {
      title: "Deduction",
      align: "right" as const,
      render: (_: any, row: DraftRow) => formatAmount(rowTotals(row, totalDays).deduction),
    },
    {
      title: "Net",
      align: "right" as const,
      render: (_: any, row: DraftRow) => (
        <span className="fw-semibold">{formatAmount(rowTotals(row, totalDays).net)}</span>
      ),
    },
    ...(canEdit
      ? [
          {
            title: "Action",
            key: "action",
            render: (_: any, row: DraftRow) => (
              <Popconfirm
                title="Remove this employee from the salary run?"
                onConfirm={() => onRemoveEmployee(row.detailId)}
                okText="Remove"
                cancelText="Cancel"
              >
                <Link to="#" className="btn btn-icon btn-sm btn-soft-danger rounded-pill">
                  <i className="feather-trash-2" />
                </Link>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
        <h4 className="mb-3">
          Payslips <span className="text-muted fs-14">({rows.length} employees)</span>
        </h4>
        <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
          <div className="search-input">
            <input
              type="text"
              className="form-control"
              placeholder="Search employee..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {canEdit && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? "Saving..." : dirty ? "Save Draft" : "Saved"}
            </button>
          )}
        </div>
      </div>

      <div className="card-body p-0 py-3">
        <div className="table-responsive">
          <Table
            columns={columns}
            dataSource={visibleRows}
            rowKey="detailId"
            pagination={{ pageSize: 25, showSizeChanger: true }}
            className="table datatable nowrap"
            expandable={{
              expandedRowRender: (row: DraftRow) => (
                <div className="row g-3 px-2 py-2">
                  {renderHeadSection(row, HEAD_TYPE_ALLOWANCE)}
                  {renderHeadSection(row, HEAD_TYPE_DEDUCTION)}
                  <div className="col-md-12">
                    <label className="form-label mb-1">Remarks</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      disabled={!canEdit}
                      value={row.remarks}
                      onChange={(e) => patchRow(row.detailId, { remarks: e.target.value })}
                    />
                  </div>
                </div>
              ),
            }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  {/* The expand-icon column is a real column but is not part of `columns`, so
                      the totals row has to account for it or every figure lands one cell left. */}
                  <Table.Summary.Cell index={0} colSpan={6}>
                    <span className="fw-semibold">Total</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <span className="fw-semibold">{formatAmount(totals.gross)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right">
                    <span className="fw-semibold">{formatAmount(totals.deduction)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} align="right">
                    <span className="fw-bold text-primary">{formatAmount(totals.net)}</span>
                  </Table.Summary.Cell>
                  {canEdit && <Table.Summary.Cell index={9} />}
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default SalaryDraftTable;
