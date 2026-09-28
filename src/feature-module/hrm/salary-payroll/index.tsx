import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Tooltip, Spin, Progress } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import CommonSelect3 from "../../../core/common/commonSelect3";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import {
  GetSalaryPayrolls,
  GenerateSalaryPayroll,
  DeleteSalaryPayroll,
  SalaryPayroll,
  SALARY_STATUS,
  SALARY_STATUS_COLOR,
  SALARY_STATUS_LABEL,
} from "../../../store/apps/salary-payroll";

export const formatAmount = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: String(SALARY_STATUS.DRAFT), label: "Draft" },
  { value: String(SALARY_STATUS.ACCRUED), label: "Accrued" },
  { value: String(SALARY_STATUS.PARTIALLY_PAID), label: "Partly Paid" },
  { value: String(SALARY_STATUS.PAID), label: "Paid" },
];

const SalaryPayrollList = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasPermission = usePermission("Payroll");

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;
  const currentUserId = loginInfo?.id;

  const regions = useRegionsList();
  const [regionId, setRegionId] = useState<number>(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : 0);
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const [campusId, setCampusId] = useState<number | null>(
    loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null
  );

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<number | null>(dayjs().year());

  const { data, loading, totalCount, saving } = useSelector((state: RootState) => state.salaryPayroll);

  // Generate-modal state. The month is a native month input, so it round-trips as "YYYY-MM".
  const [generateMonth, setGenerateMonth] = useState(dayjs().format("YYYY-MM"));
  const [generateCampusId, setGenerateCampusId] = useState<number | null>(
    loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null
  );
  const [generateTotalDays, setGenerateTotalDays] = useState<number>(30);
  const [generateRemarks, setGenerateRemarks] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const yearOptions = useMemo(() => {
    const thisYear = dayjs().year();
    return [
      { value: "all", label: "All Years" },
      ...Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => ({ value: String(y), label: String(y) })),
    ];
  }, []);

  const fetchPayrolls = () => {
    dispatch(
      GetSalaryPayrolls({
        pageNo,
        pageSize,
        campusId,
        month: null,
        year: yearFilter,
        status: statusFilter === "all" ? null : Number(statusFilter),
        search: "",
      })
    );
  };

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageNo, pageSize, campusId, statusFilter, yearFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generateCampusId) return;

    const res: any = await dispatch(
      GenerateSalaryPayroll({
        campusId: generateCampusId,
        // The API only reads the month, but it wants a real date.
        salaryMonth: `${generateMonth}-01`,
        totalDays: generateTotalDays,
        userId: currentUserId || 0,
        remarks: generateRemarks || null,
      })
    );

    if (!res.error) {
      document.getElementById("close-generate-modal")?.click();
      setGenerateRemarks("");
      // Straight into step 1 — a generated draft is meant to be reviewed, not filed away.
      navigate(routes.salaryPayrollProcess.replace(":id", String(res.payload.id)));
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;

    const res: any = await dispatch(DeleteSalaryPayroll(deleteId));
    if (!res.error) {
      document.getElementById("close-delete-modal")?.click();
      setDeleteId(null);
      fetchPayrolls();
    }
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "salaryMonthName",
      render: (_: any, record: SalaryPayroll) => (
        <Link
          to={routes.salaryPayrollProcess.replace(":id", String(record.id))}
          className="link-primary fw-semibold"
        >
          {record.salaryMonthName || dayjs(record.salaryMonth).format("MMM-YYYY")}
        </Link>
      ),
    },
    { title: "Campus", dataIndex: "campusName", render: (text: string) => text || "—" },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      align: "center" as const,
    },
    {
      title: "Gross",
      dataIndex: "totalAllowance",
      align: "right" as const,
      render: (value: number) => formatAmount(value),
    },
    {
      title: "Deduction",
      dataIndex: "totalDeduction",
      align: "right" as const,
      render: (value: number) => formatAmount(value),
    },
    {
      title: "Net Payable",
      dataIndex: "netPayable",
      align: "right" as const,
      render: (value: number) => <span className="fw-semibold">{formatAmount(value)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_: any, record: SalaryPayroll) => (
        <Tag color={SALARY_STATUS_COLOR[record.status] || "default"}>
          {record.statusName || SALARY_STATUS_LABEL[record.status] || record.status}
        </Tag>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paidEmployeeCount",
      render: (_: any, record: SalaryPayroll) => {
        if (!record.employeeCount) return "—";
        const percent = Math.round((record.paidEmployeeCount / record.employeeCount) * 100);
        return (
          <Tooltip title={`${record.paidEmployeeCount} of ${record.employeeCount} paid`}>
            <Progress percent={percent} size="small" style={{ minWidth: 90 }} />
          </Tooltip>
        );
      },
    },
    {
      title: "Accrual Voucher",
      dataIndex: "accrualVoucherNumber",
      render: (value: number | null) => (value ? `HR-${value}` : "—"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: SalaryPayroll) => (
        <div className="d-flex align-items-center">
          <Tooltip title="Process">
            <Link
              to={routes.salaryPayrollProcess.replace(":id", String(record.id))}
              className="btn btn-icon btn-sm btn-soft-primary rounded-pill"
            >
              <i className="ti ti-arrow-right" />
            </Link>
          </Tooltip>
          {hasPermission?.deleteRight && record.canEdit && (
            <Tooltip title="Delete draft">
              <Link
                to="#"
                className="btn btn-icon btn-sm btn-soft-danger rounded-pill ms-2"
                data-bs-toggle="modal"
                data-bs-target="#delete-modal"
                onClick={() => setDeleteId(record.id)}
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
              <h3 className="page-title mb-1">Salary Payroll</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">HRM</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Salary Payroll
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
                    data-bs-target="#generate-salary-modal"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Generate Salary
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* How the three steps fit together — the list is where a run is picked up again. */}
          <div className="alert alert-light border d-flex align-items-center flex-wrap gap-3 mb-3">
            <span className="badge bg-secondary">1</span>
            <span>Generate as draft — edit days, allowances and deductions</span>
            <i className="ti ti-arrow-right text-muted" />
            <span className="badge bg-primary">2</span>
            <span>Post to accrual — hits the ledger, figures freeze</span>
            <i className="ti ti-arrow-right text-muted" />
            <span className="badge bg-success">3</span>
            <span>Post to account — pay by cash / cheque per payment mode</span>
          </div>

          <div className="card">
            <div className="card-header d-flex flex-wrap align-items-center pb-0 border-0">
              <div className="d-flex align-items-center flex-wrap mb-2">
                <h4 className="card-title fw-semibold me-4 mb-2">Filter By:</h4>
                {loginInfo?.userLevel === 1 && (
                  <div className="me-3 mb-2" style={{ minWidth: "200px" }}>
                    <CommonSelect3
                      options={regions}
                      name="regionId"
                      value={regions.find((r: any) => r.value === regionId) || null}
                      onChange={(opt) => setRegionId(Number(opt?.value) || 0)}
                      placeholder="Select Region"
                    />
                  </div>
                )}
                {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                  <div className="me-3 mb-2" style={{ minWidth: "220px" }}>
                    <CommonSelect3
                      options={campuses}
                      name="campusId"
                      value={campuses.find((c: any) => c.value === campusId) || null}
                      onChange={(opt) => {
                        setCampusId(Number(opt?.value) || null);
                        setPageNo(1);
                      }}
                      placeholder="Select Campus"
                    />
                  </div>
                )}
                <div className="me-3 mb-2" style={{ minWidth: "160px" }}>
                  <CommonSelect3
                    options={yearOptions}
                    name="year"
                    value={yearOptions.find((o) => o.value === String(yearFilter ?? "all")) || null}
                    onChange={(opt) => {
                      setYearFilter(opt?.value === "all" ? null : Number(opt?.value));
                      setPageNo(1);
                    }}
                    placeholder="Year"
                  />
                </div>
                <div className="me-3 mb-2" style={{ minWidth: "170px" }}>
                  <CommonSelect3
                    options={statusFilterOptions}
                    name="status"
                    value={statusFilterOptions.find((o) => o.value === statusFilter) || null}
                    onChange={(opt) => {
                      setStatusFilter(String(opt?.value ?? "all"));
                      setPageNo(1);
                    }}
                    placeholder="Status"
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <Spin spinning={loading}>
                  <Table
                    columns={columns}
                    dataSource={data || []}
                    rowKey="id"
                    pagination={{
                      current: pageNo,
                      pageSize,
                      total: totalCount,
                      showSizeChanger: true,
                    }}
                    onChange={(pagination: any) => {
                      setPageNo(pagination.current);
                      setPageSize(pagination.pageSize);
                    }}
                    className="table datatable nowrap"
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate */}
      <div className="modal fade" id="generate-salary-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Generate Salary</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-generate-modal"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Campus <span className="text-danger">*</span>
                      </label>
                      <CommonSelect3
                        options={campuses}
                        name="generateCampusId"
                        value={campuses.find((c: any) => c.value === generateCampusId) || null}
                        onChange={(opt) => setGenerateCampusId(Number(opt?.value) || null)}
                        placeholder="Select Campus"
                        isDisabled={loginInfo?.userLevel === 3}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Salary Month <span className="text-danger">*</span>
                      </label>
                      <input
                        type="month"
                        className="form-control"
                        required
                        value={generateMonth}
                        onChange={(e) => setGenerateMonth(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Total Days <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={31}
                        required
                        value={generateTotalDays}
                        onChange={(e) => setGenerateTotalDays(Number(e.target.value) || 30)}
                      />
                      <small className="text-muted">
                        Unified to 30 so every month pays the same monthly figure.
                      </small>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={generateRemarks}
                        onChange={(e) => setGenerateRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="alert alert-info mb-0 py-2">
                      Every active employee of the campus with at least one allowance or deduction
                      on their profile is pulled in. Nothing is posted — you can edit the draft
                      before it goes to accrual.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || !generateCampusId}>
                  {saving ? "Generating..." : "Generate Draft"}
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
            <form onSubmit={handleDelete}>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  Delete this draft salary run? Nothing has been posted to the accounts, so it can
                  simply be generated again.
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
                  <button type="submit" className="btn btn-danger">
                    Yes, Delete
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

export default SalaryPayrollList;
