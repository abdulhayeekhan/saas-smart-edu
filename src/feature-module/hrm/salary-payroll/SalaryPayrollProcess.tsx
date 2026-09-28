import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Steps, Tag, Spin, Popconfirm, Modal } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import {
  GetSalaryPayrollById,
  GetSalaryPaymentList,
  UpdateSalaryDraft,
  AddSalaryPayrollEmployees,
  DeleteSalaryPayrollDetail,
  PostSalaryAccrual,
  RevertSalaryAccrual,
  PostSalaryPayment,
  clearCurrentSalaryPayroll,
  SALARY_STATUS,
  SALARY_STATUS_COLOR,
  SALARY_STATUS_LABEL,
  UpdateDraftPayload,
  PostPaymentPayload,
} from "../../../store/apps/salary-payroll";
import SalaryDraftTable from "./SalaryDraftTable";
import SalaryPaymentPanel from "./SalaryPaymentPanel";
import AddEmployeesModal from "./AddEmployeesModal";
import { formatAmount } from "./index";

/**
 * The three-step process screen. Which step is live is decided by the run's status, not by
 * local navigation — the API owns the workflow rules and reports them back as canEdit /
 * canAccrue / canPay, so the UI never offers a step the server would refuse.
 */
const SalaryPayrollProcess = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();
  const payrollId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasPermission = usePermission("Payroll");

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const currentUserId = userInfo?.data?.id;

  const { current, paymentList, detailLoading, saving } = useSelector(
    (state: RootState) => state.salaryPayroll
  );

  const [totalDays, setTotalDays] = useState(30);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [accrualOpen, setAccrualOpen] = useState(false);
  const [accrualDate, setAccrualDate] = useState("");

  useEffect(() => {
    if (payrollId) dispatch(GetSalaryPayrollById(payrollId));
    return () => {
      dispatch(clearCurrentSalaryPayroll());
    };
  }, [dispatch, payrollId]);

  useEffect(() => {
    if (!current) return;

    setTotalDays(current.totalDays);
    // The accrual belongs to the month being paid, so it defaults to that month's last day.
    setAccrualDate(dayjs(current.salaryMonth).endOf("month").format("YYYY-MM-DD"));

    // The payment list only matters once there is something to pay.
    if (current.canPay) dispatch(GetSalaryPaymentList(current.id));
  }, [dispatch, current]);

  const step = useMemo(() => {
    if (!current) return 0;
    if (current.status === SALARY_STATUS.PAID) return 3;
    if (current.canPay) return 2;
    return 0;
  }, [current]);

  const handleSaveDraft = async (payload: Omit<UpdateDraftPayload, "id" | "userId">) => {
    await dispatch(UpdateSalaryDraft({ ...payload, id: payrollId, userId: currentUserId || 0 }));
  };

  const handleAddEmployees = async (employeeIds: number[]) => {
    const res: any = await dispatch(
      AddSalaryPayrollEmployees({ salaryPayrollId: payrollId, userId: currentUserId || 0, employeeIds })
    );
    if (!res.error) setAddOpen(false);
  };

  const handleRemoveEmployee = async (detailId: number) => {
    const res: any = await dispatch(DeleteSalaryPayrollDetail(detailId));
    if (!res.error) dispatch(GetSalaryPayrollById(payrollId));
  };

  const handleAccrual = async () => {
    const res: any = await dispatch(
      PostSalaryAccrual({ id: payrollId, userId: currentUserId || 0, voucherDate: accrualDate || null })
    );
    if (!res.error) {
      setAccrualOpen(false);
      dispatch(GetSalaryPaymentList(payrollId));
    }
  };

  const handleRevert = async () => {
    await dispatch(RevertSalaryAccrual({ id: payrollId, userId: currentUserId || 0 }));
  };

  const handlePay = async (payload: Omit<PostPaymentPayload, "salaryPayrollId" | "userId">) => {
    const res: any = await dispatch(
      PostSalaryPayment({ ...payload, salaryPayrollId: payrollId, userId: currentUserId || 0 })
    );
    if (!res.error) dispatch(GetSalaryPaymentList(payrollId));
  };

  if (!current) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <Spin spinning={detailLoading}>
            <div className="card">
              <div className="card-body text-center py-5">
                {detailLoading ? "Loading salary run..." : "Salary run not found."}
              </div>
            </div>
          </Spin>
        </div>
      </div>
    );
  }

  const canEdit = current.canEdit && !!hasPermission?.editRight;
  const canPay = current.canPay && !!hasPermission?.editRight;

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">
                Salary — {current.salaryMonthName}{" "}
                <Tag color={SALARY_STATUS_COLOR[current.status] || "default"} className="ms-2">
                  {current.statusName || SALARY_STATUS_LABEL[current.status]}
                </Tag>
              </h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={routes.salaryPayroll}>Salary Payroll</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {current.campusName}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <button className="btn btn-light" onClick={() => navigate(routes.salaryPayroll)}>
                <i className="ti ti-arrow-left me-1" /> Back
              </button>

              {canEdit && (
                <button className="btn btn-outline-primary" onClick={() => setAddOpen(true)}>
                  <i className="ti ti-user-plus me-1" /> Add Employees
                </button>
              )}

              {current.canAccrue && hasPermission?.editRight && (
                <button
                  className="btn btn-primary"
                  onClick={() => setAccrualOpen(true)}
                  disabled={dirty}
                  title={dirty ? "Save the draft before posting it to accrual" : undefined}
                >
                  <i className="ti ti-file-check me-1" /> Post to Accrual
                </button>
              )}

              {current.status === SALARY_STATUS.ACCRUED && hasPermission?.editRight && (
                <Popconfirm
                  title="Revert this accrual?"
                  description="The accrual voucher and its ledger entries are deleted and the run returns to draft."
                  okText="Revert"
                  cancelText="Cancel"
                  onConfirm={handleRevert}
                >
                  <button className="btn btn-outline-danger" disabled={saving}>
                    <i className="ti ti-arrow-back-up me-1" /> Revert Accrual
                  </button>
                </Popconfirm>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <Steps
                current={step}
                size="small"
                items={[
                  { title: "Draft", description: "Edit days, allowances & deductions" },
                  {
                    title: "Accrual",
                    description: current.accrualVoucherNumber
                      ? `HR-${current.accrualVoucherNumber} · ${dayjs(current.accrualDate).format("DD-MMM-YYYY")}`
                      : "Post to the ledger",
                  },
                  {
                    title: "Payment",
                    description: `${current.paidEmployeeCount} of ${current.employeeCount} paid`,
                  },
                ]}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            {[
              { label: "Campus", value: current.campusName || "—", muted: true },
              { label: "Employees", value: String(current.employeeCount), muted: true },
              { label: "Gross", value: formatAmount(current.totalAllowance) },
              { label: "Deduction", value: formatAmount(current.totalDeduction) },
              { label: "Net Payable", value: formatAmount(current.netPayable), highlight: true },
              { label: "Paid", value: formatAmount(current.paidAmount) },
            ].map((card) => (
              <div className="col-md-2 col-6" key={card.label}>
                <div className="card h-100 mb-0">
                  <div className="card-body py-3">
                    <p className="text-muted mb-1">{card.label}</p>
                    <h5 className={`mb-0 ${card.highlight ? "text-primary" : ""}`}>{card.value}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="card mb-3">
              <div className="card-body d-flex flex-wrap align-items-center gap-3">
                <div>
                  <label className="form-label mb-1">Total Days in Month</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="form-control"
                    style={{ width: 120 }}
                    value={totalDays}
                    onChange={(e) => setTotalDays(Number(e.target.value) || 30)}
                  />
                </div>
                <p className="mb-0 text-muted flex-grow-1">
                  The divisor every prorated allowance is calculated against. Unified to 30 so a
                  short month does not pay less than a long one — change it only if this campus
                  runs a calendar-day payroll. Saving the draft re-prorates every payslip.
                </p>
              </div>
            </div>
          )}

          {!current.canEdit && (
            <div className="alert alert-info">
              This run has been {current.statusName?.toLowerCase()} — its figures are frozen. The
              accrual can still be reverted while no employee on it has been paid.
            </div>
          )}

          <Spin spinning={detailLoading}>
            <SalaryDraftTable
              payroll={current}
              totalDays={totalDays}
              saving={saving}
              canEdit={canEdit}
              onSave={handleSaveDraft}
              onRemoveEmployee={handleRemoveEmployee}
              onDirtyChange={setDirty}
            />
          </Spin>

          {current.canPay && paymentList && (
            <div className="mt-3">
              <SalaryPaymentPanel
                paymentList={paymentList}
                campusId={current.campusId}
                loading={detailLoading}
                saving={saving}
                canPay={canPay}
                onPay={handlePay}
              />
            </div>
          )}
        </div>
      </div>

      <AddEmployeesModal
        isOpen={addOpen}
        setIsOpen={setAddOpen}
        campusId={current.campusId}
        salaryPayrollId={current.id}
        saving={saving}
        onAdd={handleAddEmployees}
      />

      <Modal
        title="Post Salary to Accrual"
        open={accrualOpen}
        onCancel={() => setAccrualOpen(false)}
        onOk={handleAccrual}
        okText="Post to Accrual"
        okButtonProps={{ loading: saving }}
      >
        <p>
          This writes the accounting for the whole run: one HR voucher using each allowance and
          deduction head's own debit/credit accounts, plus a debit on every employee's ledger.
        </p>
        <p className="mb-3">
          <strong>The figures freeze once this is posted.</strong> It can be reverted only while no
          employee on the run has been paid.
        </p>
        <label className="form-label">Voucher Date</label>
        <input
          type="date"
          className="form-control"
          value={accrualDate}
          onChange={(e) => setAccrualDate(e.target.value)}
        />
        <small className="text-muted">
          Defaults to the last day of {current.salaryMonthName} — salary is earned across the
          month, not on the day it is processed.
        </small>
      </Modal>
    </>
  );
};

export default SalaryPayrollProcess;
