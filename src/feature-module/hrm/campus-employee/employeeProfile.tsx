import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Table, Spin, Tooltip, Popconfirm, Tag } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import { GetEmployeeById } from "../../../store/apps/campus-employee";
import { GetAllAllowanceTypes } from "../../../store/apps/allowance-type";
import { GetAllDeductions } from "../../../store/apps/deduction";
import {
  GetEmployeeAllowanceDeductions,
  AddEmpAllowanceDeduction,
  UpdateEmpAllowanceDeduction,
  DeleteEmpAllowanceDeduction,
  EmpAllowanceDeduction,
  EmpAllowanceDeductionPayload,
  HEAD_TYPE_ALLOWANCE,
  HEAD_TYPE_DEDUCTION,
} from "../../../store/apps/emp-allowance-deduction";
import HeadLedgerDrawer, { LedgerDrawerHead } from "./HeadLedgerDrawer";
import EmployeeSidebar from "./employeeSidebar";
import EmployeeBreadcrumb from "./employeeBreadcrumb";
import AddCredentialModal from "./AddCredentialModal";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const formatAmount = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatCNIC = (value: string | number | null | undefined): string => {
  if (!value) return "—";
  const str = String(value).replace(/\D/g, "");
  if (str.length === 13) {
    return `${str.slice(0, 5)}-${str.slice(5, 12)}-${str.slice(12)}`;
  }
  return String(value);
};

interface HeadRow {
  key: string;
  headType: number;
  headId: number;
  headName: string;
  description: string;
  assignmentId: number | null;
  amount: string;
  openingBalance: string;
  openingBalanceDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  remarks: string;
  isActive: boolean;
  currentBalance: number | null;
}

const toDateInput = (value: string | null | undefined) =>
  value ? dayjs(value).format("YYYY-MM-DD") : "";

const fingerprint = (row: HeadRow) =>
  JSON.stringify({
    amount: Number(row.amount) || 0,
    openingBalance: Number(row.openingBalance) || 0,
    openingBalanceDate: row.openingBalanceDate || "",
    effectiveFrom: row.effectiveFrom || "",
    effectiveTo: row.effectiveTo || "",
    remarks: row.remarks || "",
    isActive: row.isActive,
  });

const EmployeeProfile = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasPermission = usePermission("Campus Staff");

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const currentUserId = userInfo?.data?.id;

  const { selectedEmployee, loading: employeeLoading } = useSelector(
    (state: RootState) => state.campusEmployee
  );
  const { data: allowanceTypes, loading: allowanceTypesLoading } = useSelector(
    (state: RootState) => state.allowanceType
  );
  const { data: deductions, loading: deductionsLoading } = useSelector(
    (state: RootState) => state.deduction
  );
  const { profile, profileLoading } = useSelector((state: RootState) => state.empAllowanceDeduction);

  const loading = employeeLoading || profileLoading || allowanceTypesLoading || deductionsLoading;

  const initialTab = (searchParams.get("tab") as "details" | "allowances" | "attendance" | "payroll") || "details";
  const [activeTab, setActiveTab] = useState<"details" | "allowances" | "attendance" | "payroll">(
    ["details", "allowances", "attendance", "payroll"].includes(initialTab) ? initialTab : "details"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab") as "details" | "allowances" | "attendance" | "payroll";
    if (tabParam && ["details", "allowances", "attendance", "payroll"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: "details" | "allowances" | "attendance" | "payroll") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [rows, setRows] = useState<HeadRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [ledgerHead, setLedgerHead] = useState<LedgerDrawerHead | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [credentialUser, setCredentialUser] = useState<any>(null);
  const [debitAccountDetails, setDebitAccountDetails] = useState<any>(null);
  const [debitAccountLoading, setDebitAccountLoading] = useState(false);
  const baselineRef = useRef<Record<string, string>>({});

  const loadProfile = () => dispatch(GetEmployeeAllowanceDeductions(employeeId));

  useEffect(() => {
    if (!employeeId) return;
    dispatch(GetEmployeeById(employeeId));
    dispatch(GetAllAllowanceTypes({ pageNo: 1, pageSize: 1000, search: "" }));
    dispatch(GetAllDeductions({ pageNo: 1, pageSize: 1000, search: "" }));
    loadProfile();
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (selectedEmployee?.userId) {
      axios
        .get(`${baseURL}/api/Account/GetUser?userId=${selectedEmployee.userId}`)
        .then((res) => {
          const u = res.data?.data || res.data;
          if (u) setCredentialUser(u);
        })
        .catch(() => {});
    } else {
      setCredentialUser(null);
    }
  }, [selectedEmployee?.userId]);

  useEffect(() => {
    if (selectedEmployee?.debitAccountId) {
      setDebitAccountLoading(true);
      axios
        .get(`${baseURL}/api/BChartOfAccount/GetAccountById?id=${selectedEmployee.debitAccountId}`)
        .then((res) => {
          const acc = res.data?.data || res.data;
          if (acc && (acc.accountName || acc.name || acc.accountCode || acc.code)) {
            setDebitAccountDetails(acc);
          } else if (selectedEmployee.campusId) {
            axios
              .get(`${baseURL}/api/BChartOfAccount/GetCampusCOA?campusId=${selectedEmployee.campusId}`)
              .then((cRes) => {
                const coaList = cRes.data?.data || cRes.data || [];
                const found = coaList.find((c: any) => c.id === selectedEmployee.debitAccountId);
                if (found) {
                  setDebitAccountDetails(found);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          if (selectedEmployee.campusId) {
            axios
              .get(`${baseURL}/api/BChartOfAccount/GetCampusCOA?campusId=${selectedEmployee.campusId}`)
              .then((cRes) => {
                const coaList = cRes.data?.data || cRes.data || [];
                const found = coaList.find((c: any) => c.id === selectedEmployee.debitAccountId);
                if (found) {
                  setDebitAccountDetails(found);
                }
              })
              .catch(() => {});
          }
        })
        .finally(() => {
          setDebitAccountLoading(false);
        });
    } else {
      setDebitAccountDetails(null);
    }
  }, [selectedEmployee?.debitAccountId, selectedEmployee?.campusId]);

  // Merge master heads with assigned heads
  useEffect(() => {
    const build = (
      heads: any[],
      assignments: EmpAllowanceDeduction[],
      headType: number
    ): HeadRow[] =>
      (heads || []).map((head: any) => {
        const assignment = (assignments || []).find((a) =>
          headType === HEAD_TYPE_ALLOWANCE ? a.allowanceTypeId === head.id : a.deductionId === head.id
        );

        return {
          key: `${headType}-${head.id}`,
          headType,
          headId: head.id,
          headName: head.name,
          description: head.description || "",
          assignmentId: assignment?.id ?? null,
          amount: assignment ? String(assignment.amount ?? 0) : "0",
          openingBalance: assignment ? String(assignment.openingBalance ?? 0) : "0",
          openingBalanceDate: toDateInput(assignment?.openingBalanceDate),
          effectiveFrom: toDateInput(assignment?.effectiveFrom),
          effectiveTo: toDateInput(assignment?.effectiveTo),
          remarks: assignment?.remarks || "",
          isActive: assignment ? assignment.isActive : false,
          currentBalance: assignment ? assignment.currentBalance : null,
        };
      });

    const merged = [
      ...build(allowanceTypes as any[], profile?.allowances || [], HEAD_TYPE_ALLOWANCE),
      ...build(deductions as any[], profile?.deductions || [], HEAD_TYPE_DEDUCTION),
    ];

    baselineRef.current = merged.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = fingerprint(row);
      return acc;
    }, {});
    setRows(merged);
  }, [allowanceTypes, deductions, profile]);

  const patchRow = (key: string, patch: Partial<HeadRow>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const patchFigure = (row: HeadRow, patch: Partial<HeadRow>) => {
    const next = { ...row, ...patch };
    const hasFigure = (Number(next.amount) || 0) > 0 || (Number(next.openingBalance) || 0) > 0;
    patchRow(row.key, {
      ...patch,
      ...(!row.assignmentId && hasFigure && !row.isActive ? { isActive: true } : {}),
    });
  };

  const isDirty = (row: HeadRow) => baselineRef.current[row.key] !== fingerprint(row);
  const dirtyRows = useMemo(() => rows.filter(isDirty), [rows]);

  const allowanceRows = rows.filter((r) => r.headType === HEAD_TYPE_ALLOWANCE);
  const deductionRows = rows.filter((r) => r.headType === HEAD_TYPE_DEDUCTION);

  const sumAmount = (list: HeadRow[]) =>
    list.reduce((total, row) => (row.isActive ? total + (Number(row.amount) || 0) : total), 0);
  const sumBalance = (list: HeadRow[]) =>
    list.reduce((total, row) => total + (row.currentBalance ?? 0), 0);

  const totalAllowance = sumAmount(allowanceRows);
  const totalDeduction = sumAmount(deductionRows);

  const buildPayload = (row: HeadRow): EmpAllowanceDeductionPayload => ({
    ...(row.assignmentId ? { id: row.assignmentId } : {}),
    employeeId,
    userId: currentUserId || 0,
    headType: row.headType,
    allowanceTypeId: row.headType === HEAD_TYPE_ALLOWANCE ? row.headId : null,
    deductionId: row.headType === HEAD_TYPE_DEDUCTION ? row.headId : null,
    amount: Number(row.amount) || 0,
    openingBalance: Number(row.openingBalance) || 0,
    openingBalanceDate: row.openingBalanceDate || null,
    effectiveFrom: row.effectiveFrom || null,
    effectiveTo: row.effectiveTo || null,
    remarks: row.remarks || null,
    isActive: row.isActive,
  });

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Your session is missing a user id — sign in again before saving.");
      return;
    }
    if (dirtyRows.length === 0) return;

    setSaving(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of dirtyRows) {
      const payload = buildPayload(row);
      try {
        if (row.assignmentId) {
          await dispatch(UpdateEmpAllowanceDeduction(payload)).unwrap();
        } else {
          await dispatch(AddEmpAllowanceDeduction(payload)).unwrap();
        }
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    setSaving(false);
    if (successCount > 0) {
      toast.success(
        `Saved ${successCount} head${successCount === 1 ? "" : "s"}${
          failCount > 0 ? ` (${failCount} failed)` : ""
        }`
      );
      loadProfile();
    }
  };

  const handleReset = () => {
    setRows((prev) =>
      prev.map((row) => {
        const original = baselineRef.current[row.key];
        if (!original) return row;
        try {
          const parsed = JSON.parse(original);
          return {
            ...row,
            amount: String(parsed.amount),
            openingBalance: String(parsed.openingBalance),
            openingBalanceDate: parsed.openingBalanceDate,
            effectiveFrom: parsed.effectiveFrom,
            effectiveTo: parsed.effectiveTo,
            remarks: parsed.remarks,
            isActive: parsed.isActive,
          };
        } catch {
          return row;
        }
      })
    );
  };

  const handleDelete = async (row: HeadRow) => {
    if (!row.assignmentId) return;
    try {
      await dispatch(DeleteEmpAllowanceDeduction(row.assignmentId)).unwrap();
      toast.success(`Removed ${row.headName}`);
      loadProfile();
    } catch (err: any) {
      toast.error(err?.message || `Could not remove ${row.headName}`);
    }
  };

  const canEdit = !!hasPermission?.editRight;

  const buildColumns = (typeLabel: string) => [
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (val: boolean, row: HeadRow) => (
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={val}
            disabled={!canEdit}
            onChange={(e) => patchRow(row.key, { isActive: e.target.checked })}
          />
        </div>
      ),
    },
    {
      title: `${typeLabel} Head`,
      dataIndex: "headName",
      key: "headName",
      render: (_: any, row: HeadRow) => (
        <div>
          <div className="fw-semibold text-dark">{row.headName}</div>
          {row.description && <small className="text-muted">{row.description}</small>}
          {row.assignmentId === null && (
            <Tag color="default" className="ms-2">
              Unassigned
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Recurring Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      width: 170,
      render: (val: string, row: HeadRow) => (
        <div className="input-group input-group-sm">
          <span className="input-group-text">Rs.</span>
          <input
            type="number"
            min="0"
            step="any"
            className="form-control text-end"
            value={val}
            disabled={!canEdit}
            onChange={(e) => patchFigure(row, { amount: e.target.value })}
          />
        </div>
      ),
    },
    {
      title: "Opening Balance",
      dataIndex: "openingBalance",
      key: "openingBalance",
      align: "right" as const,
      width: 170,
      render: (val: string, row: HeadRow) => (
        <div className="input-group input-group-sm">
          <span className="input-group-text">Rs.</span>
          <input
            type="number"
            min="0"
            step="any"
            className="form-control text-end"
            value={val}
            disabled={!canEdit}
            onChange={(e) => patchFigure(row, { openingBalance: e.target.value })}
          />
        </div>
      ),
    },
    {
      title: "Current Balance",
      dataIndex: "currentBalance",
      key: "currentBalance",
      align: "right" as const,
      width: 140,
      render: (val: number | null) => (
        <span className="fw-medium">{val === null ? "—" : `Rs. ${formatAmount(val)}`}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, row: HeadRow) => (
        <div className="d-flex align-items-center">
          {row.assignmentId && (
            <Tooltip title="View transaction ledger">
              <button
                type="button"
                className="btn btn-icon btn-sm btn-soft-primary rounded-pill"
                onClick={() =>
                  setLedgerHead({
                    assignmentId: row.assignmentId as number,
                    headName: row.headName,
                    headTypeName: row.headType === HEAD_TYPE_ALLOWANCE ? "Allowance" : "Deduction",
                  })
                }
              >
                <i className="ti ti-list-details" />
              </button>
            </Tooltip>
          )}
          {row.assignmentId && hasPermission?.deleteRight && (
            <Popconfirm
              title="Remove this head?"
              description="Only heads with no ledger history can be removed."
              okText="Remove"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(row)}
            >
              <button type="button" className="btn btn-icon btn-sm btn-soft-danger rounded-pill ms-2">
                <i className="feather-trash-2" />
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const expandedRow = (row: HeadRow) => (
    <div className="row g-3">
      <div className="col-md-3">
        <label className="form-label mb-1">Opening Balance Date</label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={row.openingBalanceDate}
          disabled={!canEdit}
          onChange={(e) => patchRow(row.key, { openingBalanceDate: e.target.value })}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label mb-1">Effective From</label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={row.effectiveFrom}
          disabled={!canEdit}
          onChange={(e) => patchRow(row.key, { effectiveFrom: e.target.value })}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label mb-1">Effective To</label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={row.effectiveTo}
          disabled={!canEdit}
          onChange={(e) => patchRow(row.key, { effectiveTo: e.target.value })}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label mb-1">Remarks</label>
        <input
          type="text"
          className="form-control form-control-sm"
          maxLength={1000}
          value={row.remarks}
          disabled={!canEdit}
          onChange={(e) => patchRow(row.key, { remarks: e.target.value })}
        />
      </div>
    </div>
  );

  const renderGrid = (list: HeadRow[], typeLabel: string, totalLabel: string, total: number) => (
    <Table
      columns={buildColumns(typeLabel)}
      dataSource={list}
      rowKey="key"
      size="small"
      pagination={false}
      expandable={{ expandedRowRender: expandedRow }}
      rowClassName={(row: HeadRow) => (isDirty(row) ? "table-warning" : "")}
      locale={{ emptyText: `No ${typeLabel.toLowerCase()} heads defined yet` }}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <strong>{totalLabel}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <strong>Rs. {formatAmount(total)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right" />
            <Table.Summary.Cell index={4} align="right" />
            <Table.Summary.Cell index={5} />
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );

  const genderLabel =
    selectedEmployee?.gender === 1
      ? "Male"
      : selectedEmployee?.gender === 2
      ? "Female"
      : "—";

  const maritalLabel = (() => {
    switch (selectedEmployee?.martialStatus) {
      case 1:
        return "Single";
      case 2:
        return "Married";
      case 3:
        return "Divorced";
      case 4:
        return "Widowed";
      default:
        return "—";
    }
  })();

  const age = selectedEmployee?.dob
    ? `${dayjs().diff(dayjs(selectedEmployee.dob), "year")} Years`
    : "—";

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb Row */}
          <div className="row">
            <EmployeeBreadcrumb employeeId={employeeId} />
          </div>

          <div className="row">
            {/* Left Column: Sidebar Profile Card */}
            <EmployeeSidebar employeeId={employeeId} />

            {/* Right Column: Main Profile Tabs & Content */}
            <div className="col-xxl-9 col-xl-8">
              {/* Profile Navigation Tabs */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                <li>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                    onClick={() => handleTabChange("details")}
                  >
                    <i className="ti ti-user me-2" />
                    Employee Details
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "allowances" ? "active" : ""}`}
                    onClick={() => handleTabChange("allowances")}
                  >
                    <i className="ti ti-receipt-2 me-2" />
                    Allowances &amp; Deductions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
                    onClick={() => handleTabChange("attendance")}
                  >
                    <i className="ti ti-calendar-due me-2" />
                    Leave &amp; Attendance
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "payroll" ? "active" : ""}`}
                    onClick={() => handleTabChange("payroll")}
                  >
                    <i className="ti ti-report-money me-2" />
                    Salary &amp; Payroll
                  </button>
                </li>
              </ul>

              <Spin spinning={loading}>
                {/* ================= TAB 1: EMPLOYEE DETAILS ================= */}
                {activeTab === "details" && (
                  <div>
                    {/* Personal Information */}
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-info-circle me-2 text-primary" />
                          Personal Information
                        </h5>
                        <Link
                          to={`/hrm/edit-campus-employee/${employeeId}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="ti ti-edit me-1" /> Edit
                        </Link>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">First Name</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.firstName || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Middle Name</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.middleName || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Last Name</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.lastName || "—"}
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Father's Name</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.fatherName || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">CNIC Number</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {formatCNIC(selectedEmployee?.cnic)}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Date of Birth</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.dob
                                ? dayjs(selectedEmployee.dob).format("DD-MMM-YYYY")
                                : "—"}{" "}
                              <small className="text-muted">({age})</small>
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Gender</p>
                            <h6 className="fw-semibold mb-0 text-dark">{genderLabel}</h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Marital Status</p>
                            <h6 className="fw-semibold mb-0 text-dark">{maritalLabel}</h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Religion</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.religionName || "Islam"}
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Contact Number</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.contactNumber || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Email Address</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.email || "—"}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employment & Job Details */}
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-briefcase me-2 text-primary" />
                          Employment &amp; Job Details
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Campus</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.campusName || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Department</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.departmentName || "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Designation</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.designationName || "—"}
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Employee Type</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.employeeTypeName || "Regular"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Joining Date</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.joiningDate
                                ? dayjs(selectedEmployee.joiningDate).format("DD-MMM-YYYY")
                                : "—"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Confirmation Date</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.confirmationDate
                                ? dayjs(selectedEmployee.confirmationDate).format("DD-MMM-YYYY")
                                : "—"}
                            </h6>
                          </div>

                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">EOBI Number</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.eobi || "N/A"}
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Employment Status</p>
                            <span
                              className={`badge ${
                                selectedEmployee?.isActive
                                  ? "badge-soft-success"
                                  : "badge-soft-danger"
                              } fs-12`}
                            >
                              {selectedEmployee?.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Bank Details */}
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-credit-card me-2 text-primary" />
                          Payment &amp; Bank Information
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Payment Mode</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              <span className="badge badge-soft-info fs-12">
                                {selectedEmployee?.paymentMode || "Cash"}
                              </span>
                            </h6>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Debit Head Account</p>
                            <h6 className="fw-semibold mb-0 text-dark">
                              {selectedEmployee?.debitAccountId ? (
                                debitAccountLoading ? (
                                  <span className="text-muted fs-12">
                                    <Spin size="small" className="me-2" /> Loading account...
                                  </span>
                                ) : debitAccountDetails ? (
                                  <span className="d-inline-flex align-items-center flex-wrap gap-1">
                                    {(debitAccountDetails.accountCode || debitAccountDetails.code) && (
                                      <span className="badge badge-soft-primary fs-12">
                                        {debitAccountDetails.accountCode || debitAccountDetails.code}
                                      </span>
                                    )}
                                    <span>
                                      {debitAccountDetails.accountName || debitAccountDetails.name || `Account #${selectedEmployee.debitAccountId}`}
                                    </span>
                                  </span>
                                ) : (
                                  <span>Account #{selectedEmployee.debitAccountId}</span>
                                )
                              ) : (
                                "—"
                              )}
                            </h6>
                          </div>
                          {selectedEmployee?.paymentMode === "Bank" && (
                            <>
                              <div className="col-md-4">
                                <p className="text-muted mb-1 fs-12">Account Title</p>
                                <h6 className="fw-semibold mb-0 text-dark">
                                  {selectedEmployee?.accountTitle || "—"}
                                </h6>
                              </div>
                              <div className="col-md-4">
                                <p className="text-muted mb-1 fs-12">Account / IBAN Number</p>
                                <h6 className="fw-semibold mb-0 text-dark">
                                  {selectedEmployee?.accountNumber || "—"}
                                </h6>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* User Credentials & Access */}
                    <div className="card shadow-sm">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-lock me-2 text-primary" />
                          System Login &amp; User Credentials
                        </h5>
                        {!selectedEmployee?.userId && (
                          <button
                            type="button"
                            onClick={() => setCredentialModalOpen(true)}
                            className="btn btn-success btn-sm"
                          >
                            <i className="ti ti-user-plus me-1" /> Create Login
                          </button>
                        )}
                      </div>
                      <div className="card-body p-4">
                        {selectedEmployee?.userId ? (
                          <div className="row g-4">
                            <div className="col-md-4">
                              <p className="text-muted mb-1 fs-12">Username</p>
                              <h6 className="fw-semibold mb-0 text-primary fs-15">
                                <i className="ti ti-user-check me-1" />
                                {credentialUser?.username || "—"}
                              </h6>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-1 fs-12">User ID</p>
                              <h6 className="fw-semibold mb-0 text-dark">
                                #{selectedEmployee.userId}
                              </h6>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-1 fs-12">System Role</p>
                              <h6 className="fw-semibold mb-0 text-dark">
                                {credentialUser?.roleId ? `Role ID: ${credentialUser.roleId}` : "Campus Staff"}
                              </h6>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-1 fs-12">Login Email</p>
                              <h6 className="fw-semibold mb-0 text-dark">
                                {credentialUser?.email || selectedEmployee?.email || "—"}
                              </h6>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-1 fs-12">Account Access</p>
                              <span className="badge badge-soft-success fs-12">
                                <i className="ti ti-circle-check me-1" /> Enabled
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="avatar avatar-xl bg-soft-warning rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-warning">
                              <i className="ti ti-user-x fs-28" />
                            </div>
                            <h5 className="mb-1">No Login Credentials Created</h5>
                            <p className="text-muted fs-13 mb-3">
                              This employee does not have a user login account to access the system yet.
                            </p>
                            <button
                              type="button"
                              onClick={() => setCredentialModalOpen(true)}
                              className="btn btn-primary btn-sm"
                            >
                              <i className="ti ti-user-plus me-1" /> Create Login Credentials
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 2: ALLOWANCES & DEDUCTIONS ================= */}
                {activeTab === "allowances" && (
                  <div>
                    {/* Header Action Bar */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <div>
                        <h4 className="mb-0">Allowance &amp; Deduction Master Heads</h4>
                        <p className="text-muted fs-13 mb-0">
                          Assign recurring amounts and opening balances for this employee
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={handleReset}
                              disabled={saving || dirtyRows.length === 0}
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm d-flex align-items-center"
                              onClick={handleSave}
                              disabled={saving || dirtyRows.length === 0}
                            >
                              <i className="ti ti-device-floppy me-1" />
                              {saving
                                ? "Saving..."
                                : dirtyRows.length > 0
                                ? `Save (${dirtyRows.length})`
                                : "Save"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Totals Overview */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0 border-start border-success border-3">
                          <div className="card-body">
                            <p className="text-muted mb-1 fs-12">Total Allowances</p>
                            <h4 className="mb-0 text-success fw-bold">
                              Rs. {formatAmount(totalAllowance)}
                            </h4>
                            <small className="text-muted">
                              Balance: Rs. {formatAmount(sumBalance(allowanceRows))}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0 border-start border-danger border-3">
                          <div className="card-body">
                            <p className="text-muted mb-1 fs-12">Total Deductions</p>
                            <h4 className="mb-0 text-danger fw-bold">
                              Rs. {formatAmount(totalDeduction)}
                            </h4>
                            <small className="text-muted">
                              Balance: Rs. {formatAmount(sumBalance(deductionRows))}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0 border-start border-primary border-3">
                          <div className="card-body">
                            <p className="text-muted mb-1 fs-12">Net (Recurring)</p>
                            <h4 className="mb-0 text-primary fw-bold">
                              Rs. {formatAmount(totalAllowance - totalDeduction)}
                            </h4>
                            <small className="text-muted">Allowances − Deductions</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0 border-start border-warning border-3">
                          <div className="card-body">
                            <p className="text-muted mb-1 fs-12">Unsaved Changes</p>
                            <h4 className="mb-0 text-warning fw-bold">{dirtyRows.length}</h4>
                            <small className="text-muted">
                              {dirtyRows.length > 0 ? "Highlighted rows below" : "All changes saved"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Allowances Table */}
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-plus me-2 text-success" />
                          Allowance Heads
                        </h5>
                        <Link
                          to={routes.allowanceTypes}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Manage Allowance Heads
                        </Link>
                      </div>
                      <div className="card-body p-0 py-2">
                        <div className="table-responsive">
                          {renderGrid(allowanceRows, "Allowance", "Total Allowances", totalAllowance)}
                        </div>
                      </div>
                    </div>

                    {/* Deductions Table */}
                    <div className="card shadow-sm">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-minus me-2 text-danger" />
                          Deduction Heads
                        </h5>
                        <Link
                          to={routes.deductions}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Manage Deduction Heads
                        </Link>
                      </div>
                      <div className="card-body p-0 py-2">
                        <div className="table-responsive">
                          {renderGrid(deductionRows, "Deduction", "Total Deductions", totalDeduction)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 3: LEAVE & ATTENDANCE ================= */}
                {activeTab === "attendance" && (
                  <div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0">
                          <div className="card-body text-center">
                            <p className="text-muted mb-1 fs-12">Present Days</p>
                            <h3 className="mb-0 text-success fw-bold">24</h3>
                            <small className="text-muted">This Month</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0">
                          <div className="card-body text-center">
                            <p className="text-muted mb-1 fs-12">Absent Days</p>
                            <h3 className="mb-0 text-danger fw-bold">1</h3>
                            <small className="text-muted">This Month</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0">
                          <div className="card-body text-center">
                            <p className="text-muted mb-1 fs-12">Approved Leaves</p>
                            <h3 className="mb-0 text-info fw-bold">2</h3>
                            <small className="text-muted">This Month</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card shadow-sm mb-0">
                          <div className="card-body text-center">
                            <p className="text-muted mb-1 fs-12">Late In</p>
                            <h3 className="mb-0 text-warning fw-bold">0</h3>
                            <small className="text-muted">This Month</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card shadow-sm">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-calendar me-2 text-primary" />
                          Attendance Overview
                        </h5>
                        <Link to={routes.staffAttendance} className="btn btn-outline-primary btn-sm">
                          View Attendance Module
                        </Link>
                      </div>
                      <div className="card-body p-4 text-center">
                        <div className="avatar avatar-xxl bg-soft-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-primary">
                          <i className="ti ti-calendar-check fs-36" />
                        </div>
                        <h5 className="mb-1">Attendance Record</h5>
                        <p className="text-muted fs-13 mb-3">
                          Detailed attendance logs and monthly leave quota records are synchronized from the HR Attendance module.
                        </p>
                        <Link to={routes.staffAttendance} className="btn btn-primary btn-sm">
                          Go to Attendance Records
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 4: SALARY & PAYROLL ================= */}
                {activeTab === "payroll" && (
                  <div>
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-wallet me-2 text-primary" />
                          Salary &amp; Compensation Summary
                        </h5>
                        <Link to={routes.payroll} className="btn btn-outline-primary btn-sm">
                          Payroll Records
                        </Link>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Total Allowances</p>
                            <h5 className="fw-bold text-success mb-0">
                              Rs. {formatAmount(totalAllowance)}
                            </h5>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Total Deductions</p>
                            <h5 className="fw-bold text-danger mb-0">
                              Rs. {formatAmount(totalDeduction)}
                            </h5>
                          </div>
                          <div className="col-md-4">
                            <p className="text-muted mb-1 fs-12">Estimated Net Salary</p>
                            <h5 className="fw-bold text-primary mb-0">
                              Rs. {formatAmount(totalAllowance - totalDeduction)}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card shadow-sm">
                      <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                        <h5 className="mb-0 text-dark">
                          <i className="ti ti-file-text me-2 text-primary" />
                          Employee Ledger &amp; Transaction History
                        </h5>
                        <Link
                          to={`${routes.employeeLedgerReport}?employeeId=${employeeId}`}
                          className="btn btn-primary btn-sm"
                        >
                          <i className="ti ti-notebook me-1" /> Open Full Ledger
                        </Link>
                      </div>
                      <div className="card-body p-4 text-center">
                        <div className="avatar avatar-xxl bg-soft-success rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-success">
                          <i className="ti ti-file-analytics fs-36" />
                        </div>
                        <h5 className="mb-1">Financial Ledger Statement</h5>
                        <p className="text-muted fs-13 mb-3">
                          Generate and export statement of all transactions, allowance payments, and head balances for this employee.
                        </p>
                        <Link
                          to={`${routes.employeeLedgerReport}?employeeId=${employeeId}`}
                          className="btn btn-success btn-sm"
                        >
                          View Employee Financial Ledger
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </Spin>
            </div>
          </div>
        </div>
      </div>

      <HeadLedgerDrawer
        open={!!ledgerHead}
        onClose={() => setLedgerHead(null)}
        employeeId={employeeId}
        head={ledgerHead}
        onChanged={loadProfile}
        canEdit={canEdit}
        canDelete={!!hasPermission?.deleteRight}
      />

      <AddCredentialModal
        isOpen={credentialModalOpen}
        setIsOpen={setCredentialModalOpen}
        employee={selectedEmployee}
        onSuccess={() => {
          dispatch(GetEmployeeById(employeeId));
        }}
      />
    </>
  );
};

export default EmployeeProfile;
