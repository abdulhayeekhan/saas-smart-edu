import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { DatePicker, Spin, Tag, message } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AppDispatch, RootState } from "../../store";
import { GetEmployeeById } from "../../store/apps/campus-employee";
import {
  GetEmployeeLedger,
  clearEmployeeLedger,
  HEAD_TYPE_ALLOWANCE,
  HEAD_TYPE_DEDUCTION,
  LedgerHeadSummary,
} from "../../store/apps/emp-allowance-deduction";
import CommonSelect3 from "../../core/common/commonSelect3";
import { useCampusesList } from "../../core/common/selectoption/master/useCampusesList";
import { useEmployeesList } from "../../core/common/selectoption/master/useEmployeesList";
import useRegionsList from "../../core/common/selectoption/master/useRegions";
import { BrandName, PoweredBy } from "../../environment";

const { RangePicker } = DatePicker;

/**
 * One employee's complete allowance/deduction statement — every head interleaved by date on a
 * single running balance, with the per-head roll-ups and the allowance/deduction split beside
 * it. The per-head drawer on the employee profile answers "what happened on this head"; this
 * answers "what happened to this employee".
 *
 * The figures come straight from GetEmployeeLedger and are not recomputed here: the API folds
 * movement before the From date into the opening balance, so opening + period movement equals
 * closing whatever window is asked for. Re-deriving any of it in the browser is how the two
 * drift apart.
 */

const HEAD_TYPE_OPTIONS = [
  { value: "", label: "Allowances & Deductions" },
  { value: String(HEAD_TYPE_ALLOWANCE), label: "Allowances only" },
  { value: String(HEAD_TYPE_DEDUCTION), label: "Deductions only" },
];

const money = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const dash = (value: number | null | undefined) => (value ? money(value) : "-");

const EmployeeLedgerReport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;

  const [regionId, setRegionId] = useState<number | null>(
    loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null
  );
  const [campusId, setCampusId] = useState<number | null>(
    loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null
  );
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [headType, setHeadType] = useState<string>("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const regionsList = useRegionsList();
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const employees = useEmployeesList(campusId);

  const { employeeLedger: ledger, employeeLedgerLoading: loading } = useSelector(
    (state: RootState) => state.empAllowanceDeduction
  );

  useEffect(() => () => { dispatch(clearEmployeeLedger()); }, [dispatch]);

  /**
   * The sheet is stamped with the employee it was run for, so a changed selection has to drop
   * it rather than leave last employee's figures under the new name. Done on the selection
   * handlers, not in an effect on [employeeId] — an effect would also fire for the deep link's
   * own state change and wipe the ledger it just requested.
   */
  const selectEmployee = (id: number | null) => {
    setEmployeeId(id);
    dispatch(clearEmployeeLedger());
  };

  const selectCampus = (id: number | null) => {
    setCampusId(id);
    setEmployeeId(null);
    dispatch(clearEmployeeLedger());
  };

  const runLedger = (id: number) =>
    dispatch(
      GetEmployeeLedger({
        employeeId: id,
        headType: headType ? Number(headType) : null,
        fromDate: range?.[0] ? range[0]!.format("YYYY-MM-DD") : null,
        toDate: range?.[1] ? range[1]!.format("YYYY-MM-DD") : null,
      })
    );

  // Deep link from the employee profile's "Full Ledger" button. Only the employee id travels
  // in the URL, so their campus is resolved first — the employee dropdown is campus-scoped and
  // would otherwise render the selection blank. Guarded so it runs once.
  const [searchParams] = useSearchParams();
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    const linked = Number(searchParams.get("employeeId"));
    if (!linked || deepLinkHandled.current) return;
    deepLinkHandled.current = true;

    dispatch(GetEmployeeById(linked))
      .unwrap()
      .then((employee: any) => {
        if (employee?.campusId) setCampusId(Number(employee.campusId));
        setEmployeeId(linked);
        runLedger(linked);
      })
      .catch(() => {
        /* The API already toasted; the operator can pick the employee by hand. */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchParams]);

  const handleGenerate = () => {
    if (!employeeId) {
      message.warning("Select an employee");
      return;
    }

    runLedger(employeeId);
  };

  const allowanceHeads = useMemo(
    () => (ledger?.headSummaries || []).filter((x) => x.headType === HEAD_TYPE_ALLOWANCE),
    [ledger]
  );
  const deductionHeads = useMemo(
    () => (ledger?.headSummaries || []).filter((x) => x.headType === HEAD_TYPE_DEDUCTION),
    [ledger]
  );

  const periodLabel = ledger
    ? `${ledger.fromDate ? dayjs(ledger.fromDate).format("DD-MMM-YYYY") : "Inception"} to ${
        ledger.toDate ? dayjs(ledger.toDate).format("DD-MMM-YYYY") : dayjs().format("DD-MMM-YYYY")
      }`
    : "";

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header no-print">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title mb-1">Employee Ledger Report</h3>
              <p className="text-muted mb-0">
                Every allowance and deduction transaction of one employee on a single statement.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card no-print">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {loginInfo?.userLevel === 1 && (
                <div className="col-md-3">
                  <label className="form-label">Region</label>
                  <CommonSelect3
                    options={regionsList}
                    onChange={(selected: any) => {
                      setRegionId(selected?.value ? Number(selected.value) : null);
                      selectCampus(null);
                    }}
                    value={regionId ? regionsList?.find((r: any) => r.value === regionId) : null}
                    placeholder="Select Region"
                  />
                </div>
              )}

              <div className="col-md-3">
                <label className="form-label">Campus</label>
                <CommonSelect3
                  options={campuses}
                  onChange={(selected: any) => selectCampus(selected?.value ? Number(selected.value) : null)}
                  value={campusId ? campuses?.find((r: any) => r.value === campusId) : null}
                  placeholder="Select Campus"
                  isDisabled={loginInfo?.userLevel === 3}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Employee</label>
                <CommonSelect3
                  options={employees}
                  onChange={(selected: any) => selectEmployee(selected?.value ? Number(selected.value) : null)}
                  value={employeeId ? employees?.find((r: any) => r.value === employeeId) : null}
                  placeholder="Select Employee"
                  isDisabled={!campusId}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Heads</label>
                <CommonSelect3
                  options={HEAD_TYPE_OPTIONS}
                  onChange={(selected: any) => setHeadType(selected?.value ? String(selected.value) : "")}
                  value={HEAD_TYPE_OPTIONS.find((o) => o.value === headType)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Period</label>
                <RangePicker
                  className="w-100"
                  style={{ height: "38px" }}
                  value={range as any}
                  onChange={(values) => setRange(values as [Dayjs | null, Dayjs | null] | null)}
                />
              </div>

              <div className="col-md-3">
                <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" /> Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </button>
                {ledger && (
                  <button type="button" className="btn btn-light ms-2" onClick={() => window.print()}>
                    <i className="ti ti-printer me-1" /> Print
                  </button>
                )}
              </div>
            </div>
            <small className="text-muted d-block mt-2">
              Leave the period empty for the whole history. With a From date, everything before it is
              folded into the opening balance instead of being listed.
            </small>
          </div>
        </div>

        <Spin spinning={loading}>
          {ledger && (
            <EmployeeLedgerSheet
              ledger={ledger}
              periodLabel={periodLabel}
              allowanceHeads={allowanceHeads}
              deductionHeads={deductionHeads}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

interface SheetProps {
  ledger: NonNullable<RootState["empAllowanceDeduction"]["employeeLedger"]>;
  periodLabel: string;
  allowanceHeads: LedgerHeadSummary[];
  deductionHeads: LedgerHeadSummary[];
}

const EmployeeLedgerSheet: React.FC<SheetProps> = ({
  ledger,
  periodLabel,
  allowanceHeads,
  deductionHeads,
}) => {
  const employee = ledger.employeeDetail;

  return (
    <div className="report-container" style={{ padding: "20px", backgroundColor: "#525659" }}>
      <style>{`
        @media screen {
          .a4-page {
            background: white;
            width: 297mm;
            margin: 20px auto;
            padding: 12mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            box-sizing: border-box;
            color: #000;
          }
        }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; color: #000 !important; }
          body * { visibility: hidden; color: #000 !important; border-color: #000 !important; }
          #emp-ledger-print, #emp-ledger-print * { visibility: visible; }
          #emp-ledger-print { position: absolute; left: 0; top: 0; width: 100%; }
          .a4-page { width: 100%; margin: 0; padding: 0; box-shadow: none; }
          .no-print { display: none !important; }
          .ledger-table { page-break-inside: auto; }
          .ledger-table tr { page-break-inside: avoid; page-break-after: auto; }
          .ledger-table thead { display: table-header-group; }
        }
        .ledger-table { width: 100%; border-collapse: collapse; font-size: 11px; color: #000 !important; border: 1px solid #000 !important; }
        .ledger-table th { background-color: #000 !important; color: #fff !important; padding: 6px; border: 1px solid #000 !important; }
        .ledger-table td { padding: 4px 6px; border: 1px solid #000 !important; color: #000 !important; }
        .ledger-summary { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #000 !important; }
        .ledger-summary th { background-color: #333 !important; color: #fff !important; padding: 5px; border: 1px solid #000 !important; }
        .ledger-summary td { padding: 4px 6px; border: 1px solid #000 !important; color: #000 !important; }
        .a4-page p, .a4-page div, .a4-page h2, .a4-page h4, .a4-page span, .a4-page strong, .a4-page small { color: #000 !important; }
        .powered-by-footer { margin-top: 30px; font-size: 10px; text-align: center; font-style: italic; }
      `}</style>

      <div id="emp-ledger-print">
        <div className="a4-page">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>{BrandName || "COMPANY NAME"}</h2>
            <h4 style={{ textDecoration: "underline", marginTop: "4px", fontWeight: 700 }}>
              EMPLOYEE ALLOWANCE &amp; DEDUCTION LEDGER
            </h4>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "12px" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "15px" }}>
                {employee.employeeName} ({employee.employeeKey})
              </p>
              {employee.fatherName && (
                <p style={{ margin: 0 }}>
                  <strong>Father:</strong> {employee.fatherName}
                </p>
              )}
              <p style={{ margin: 0 }}>
                <strong>Designation:</strong> {employee.designationName || "—"} &nbsp;·&nbsp;
                <strong>Department:</strong> {employee.departmentName || "—"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0 }}>
                <strong>Campus:</strong> {employee.campusName || "—"}
              </p>
              {employee.cnic && (
                <p style={{ margin: 0 }}>
                  <strong>CNIC:</strong> {employee.cnic}
                </p>
              )}
              <p style={{ margin: 0 }}>
                <strong>Period:</strong> {periodLabel}
              </p>
            </div>
          </div>

          {/* Per-head roll-ups. A single running balance mixes the two sides, so each head is
              also stated on its own — this is where "what is outstanding on Fuel Allowance"
              is answered. */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <table className="ledger-summary">
                <thead>
                  <tr>
                    <th colSpan={5}>ALLOWANCES</th>
                  </tr>
                  <tr>
                    <th>Head</th>
                    <th className="text-end">Opening</th>
                    <th className="text-end">Debit</th>
                    <th className="text-end">Credit</th>
                    <th className="text-end">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {allowanceHeads.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No allowance head
                      </td>
                    </tr>
                  )}
                  {allowanceHeads.map((head) => (
                    <tr key={head.empAllowanceDeductionId}>
                      <td>
                        {head.headName}
                        {!head.isActive && <span style={{ fontSize: "9px" }}> (inactive)</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>{money(head.openingBalance)}</td>
                      <td style={{ textAlign: "right" }}>{dash(head.totalDebit)}</td>
                      <td style={{ textAlign: "right" }}>{dash(head.totalCredit)}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(head.closingBalance)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid #000" }}>
                    <td style={{ fontWeight: "bold" }}>Total</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.allowanceOpeningBalance)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.allowanceTotalDebit)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.allowanceTotalCredit)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.allowanceClosingBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <table className="ledger-summary">
                <thead>
                  <tr>
                    <th colSpan={5}>DEDUCTIONS</th>
                  </tr>
                  <tr>
                    <th>Head</th>
                    <th className="text-end">Opening</th>
                    <th className="text-end">Debit</th>
                    <th className="text-end">Credit</th>
                    <th className="text-end">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {deductionHeads.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No deduction head
                      </td>
                    </tr>
                  )}
                  {deductionHeads.map((head) => (
                    <tr key={head.empAllowanceDeductionId}>
                      <td>
                        {head.headName}
                        {!head.isActive && <span style={{ fontSize: "9px" }}> (inactive)</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>{money(head.openingBalance)}</td>
                      <td style={{ textAlign: "right" }}>{dash(head.totalDebit)}</td>
                      <td style={{ textAlign: "right" }}>{dash(head.totalCredit)}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(head.closingBalance)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid #000" }}>
                    <td style={{ fontWeight: "bold" }}>Total</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.deductionOpeningBalance)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.deductionTotalDebit)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.deductionTotalCredit)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.deductionClosingBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions */}
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: "9%" }}>Date</th>
                <th style={{ width: "16%" }}>Head</th>
                <th style={{ width: "8%" }}>Type</th>
                <th style={{ width: "27%" }}>Description</th>
                <th style={{ width: "10%" }}>Source</th>
                <th style={{ width: "10%" }}>Reference</th>
                <th style={{ width: "10%" }} className="text-end">
                  Debit
                </th>
                <th style={{ width: "10%" }} className="text-end">
                  Credit
                </th>
                <th style={{ width: "10%" }} className="text-end">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <td colSpan={8} style={{ textAlign: "right", fontWeight: "bold" }}>
                  Opening Balance
                </td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.openingBalance)}</td>
              </tr>

              {ledger.details.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    No movement in this period
                  </td>
                </tr>
              )}

              {ledger.details.map((line) => (
                <tr key={line.id}>
                  <td>{dayjs(line.entryDate).format("DD-MMM-YY")}</td>
                  <td>{line.headName}</td>
                  <td>{line.headTypeName}</td>
                  <td>{line.description || "—"}</td>
                  <td>{line.sourceTypeName || "—"}</td>
                  <td>{line.referenceNumber || "—"}</td>
                  <td style={{ textAlign: "right" }}>{dash(line.debit)}</td>
                  <td style={{ textAlign: "right" }}>{dash(line.credit)}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(line.balance)}</td>
                </tr>
              ))}

              <tr style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
                <td colSpan={6} style={{ textAlign: "right", fontWeight: "bold" }}>
                  Period Total
                </td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.totalDebit)}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.totalCredit)}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.closingBalance)}</td>
              </tr>
            </tbody>
          </table>

          {/* The combined closing balance runs allowances and deductions together, so the
              meaningful net is stated separately. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", fontSize: "12px" }}>
            <table className="ledger-summary" style={{ width: "340px" }}>
              <tbody>
                <tr>
                  <td>Allowance outstanding</td>
                  <td style={{ textAlign: "right" }}>{money(ledger.allowanceClosingBalance)}</td>
                </tr>
                <tr>
                  <td>Less: deduction outstanding</td>
                  <td style={{ textAlign: "right" }}>{money(ledger.deductionClosingBalance)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>Net payable to employee</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{money(ledger.netClosingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="no-print mt-2">
            <Tag color="blue">{ledger.totalEntries} transaction(s)</Tag>
            <small className="text-muted ms-2">
              Debit increases what is outstanding on a head; credit settles it.
            </small>
          </div>

          <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "180px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "8px", fontSize: "12px", fontWeight: "bold" }}>
              Prepared By
            </div>
            <div style={{ width: "180px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "8px", fontSize: "12px", fontWeight: "bold" }}>
              Checked By
            </div>
            <div style={{ width: "180px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "8px", fontSize: "12px", fontWeight: "bold" }}>
              Authorized Signatory
            </div>
          </div>

          <div className="powered-by-footer">
            Powered by <strong>{PoweredBy}</strong> | {dayjs().format("DD-MMM-YYYY HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLedgerReport;
