import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetStudentLedgerReport, clearStudentLedgerReport } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from "../../../core/common/selectoption/academic/useSections";
import { useAdmissions } from "../../../core/common/selectoption/academic/useAdmissions";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import { BrandName, PoweredBy } from "../../../environment";

const { RangePicker } = DatePicker;

export const formatNumber = (
  value: number | string | undefined | null,
  decimals = 0
): string => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (numericValue === null || numericValue === undefined || isNaN(numericValue)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
};

const StudentLedgerReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearStudentLedgerReport());
    return () => {
      dispatch(clearStudentLedgerReport());
    };
  }, [dispatch]);

  // --- Auth & Initial State ---
  const storedUserData = window.localStorage.getItem("userData");
  const userInfo = storedUserData ? JSON.parse(storedUserData) : null;
  const loginInfo = userInfo?.data;
  const userLevel = loginInfo?.userLevel; // 1=HO, 2=Region, 3=Campus
  const userLevelId = loginInfo?.userLevelId;

  // --- Filter State ---
  const [regionId, setRegionId] = useState<number | null>(
    userLevel === 2 ? userLevelId : null
  );
  const [selectedCampusId, setSelectedCampusId] = useState<number>(
    userLevel === 3 ? userLevelId : 0
  );
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(90, "days"),
    dayjs(),
  ]);

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const gradesList = useAcademicGrades();
  const sectionsList = useSectionList(gradeId);

  // Student Options hook filtered by campus, grade, and section
  const { studentOptions, loading: studentsLoading } = useAdmissions({
    externalCampusId: selectedCampusId,
    externalGradeId: gradeId,
    externalSectionId: sectionId,
  });

  // --- Redux Data ---
  const { studentLedgerReport, loading } = useSelector(
    (state: RootState) => state.academicReport
  );

  // --- Handlers ---
  const handleRegionChange = (option: any) => {
    setRegionId(option?.value || null);
    setSelectedCampusId(0);
    setSelectedStudentId(null);
  };

  const handleCampusChange = (option: any) => {
    setSelectedCampusId(option?.value || 0);
    setSelectedStudentId(null);
  };

  const handleGradeChange = (option: any) => {
    setGradeId(option?.value || null);
    setSectionId(null);
    setSelectedStudentId(null);
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }

    const payload = {
      admissionId: selectedStudentId,
      fromDate: dateRange[0].format("YYYY-MM-DD"),
      toDate: dateRange[1].format("YYYY-MM-DD"),
      pageNo: 1,
      pageSize: 1000,
    };

    dispatch(GetStudentLedgerReport(payload));
  };

  const handlePrint = () => {
    window.print();
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find((c) => c.value === selectedCampusId)?.label || "";

  // Compute Totals
  const totalDebit = (studentLedgerReport?.details || []).reduce(
    (sum, item) => sum + (item.debit || 0),
    0
  );
  const totalCredit = (studentLedgerReport?.details || []).reduce(
    (sum, item) => sum + (item.credit || 0),
    0
  );

  const studentInfo = studentLedgerReport?.studentDetail;

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3 no-print">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Student Ledger Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={routes.reports}>Reports</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Student Ledger Report
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Filters Card */}
        <div className="row no-print">
          <div className="col-md-12">
            <form onSubmit={handleGenerateReport}>
              <div className="card pb-3">
                <div className="card-header bg-light">
                  <div className="d-flex align-items-center">
                    <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                      <i className="ti ti-filter fs-16" />
                    </span>
                    <h4 className="text-dark">Report Filters</h4>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row align-items-end">
                    {userLevel === 1 && (
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Region</label>
                        <CommonSelect3
                          options={regionsList}
                          onChange={handleRegionChange}
                          value={regionsList.find((r) => r.value === regionId) || null}
                          placeholder="Select Region"
                        />
                      </div>
                    )}
                    {(userLevel === 1 || userLevel === 2) && (
                      <div className="col-md-3 mb-3">
                        <label className="form-label text-danger">Campus *</label>
                        <CommonSelect3
                          options={campuses}
                          onChange={handleCampusChange}
                          value={campuses.find((c) => c.value === selectedCampusId) || null}
                          placeholder="Select Campus"
                          isDisabled={userLevel === 3}
                        />
                      </div>
                    )}
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Grade</label>
                      <CommonSelect3
                        options={gradesList}
                        onChange={handleGradeChange}
                        value={gradesList.find((g) => g.value === gradeId) || null}
                        placeholder="All Grades"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Section</label>
                      <CommonSelect3
                        options={sectionsList}
                        onChange={(opt: any) => {
                          setSectionId(opt?.value || null);
                          setSelectedStudentId(null);
                        }}
                        value={sectionsList.find((s) => s.value === sectionId) || null}
                        placeholder="All Sections"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-danger">Student *</label>
                      <CommonSelect3
                        options={studentOptions}
                        onChange={(opt: any) => setSelectedStudentId(opt?.value ? Number(opt.value) : null)}
                        value={studentOptions.find((s) => s.value === selectedStudentId) || null}
                        placeholder={studentsLoading ? "Loading Students..." : "Select Student"}
                        loading={studentsLoading}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date Range</label>
                      <RangePicker
                        className="form-control datetimepicker w-100"
                        style={{ height: "38px", border: "1px solid #E9EDF4", boxShadow: "none" }}
                        format="DD-MM-YYYY"
                        value={dateRange}
                        onChange={(dates) => {
                          if (dates && dates[0] && dates[1]) {
                            setDateRange([dates[0], dates[1]]);
                          }
                        }}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Ledger"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Student Info Card (Interactive View) */}
        {studentLedgerReport && (
          <div className="row">
            <div className="col-md-12">
              <div className="no-print text-center mb-3">
                <button className="btn btn-primary" onClick={handlePrint}>
                  <i className="ti ti-printer me-2" /> PRINT STUDENT LEDGER
                </button>
              </div>

              <div id="print-area">
                <style>{`
                  @media screen {
                    .report-preview {
                      background: white;
                      width: 210mm;
                      min-height: 297mm;
                      margin: 20px auto;
                      padding: 15mm;
                      box-shadow: 0 0 10px rgba(0,0,0,0.2);
                      color: #000;
                    }
                  }
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 10mm;
                    }
                    body {
                      background: #fff !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                    #print-area {
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    .report-preview {
                      width: 100% !important;
                      box-shadow: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                  }
                  .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                    margin-top: 15px;
                  }
                  .report-table th, .report-table td {
                    border: 1px solid #000;
                    padding: 6px;
                  }
                  .report-table th {
                    background-color: #000 !important;
                    color: #fff !important;
                    font-weight: bold;
                    text-transform: uppercase;
                  }
                  .text-end {
                    text-align: right !important;
                  }
                `}</style>

                <div className="report-preview">
                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>
                      {BrandName || "DAR-E-ARQAM SCHOOLS"}
                    </h2>
                    <h4 style={{ margin: "3px 0", color: "#000", fontWeight: 700 }}>
                      {selectedCampusDetails?.name || selectedCampusName}
                    </h4>
                    <div style={{ fontSize: "11px", color: "#333" }}>
                      {selectedCampusDetails?.address && <div>{selectedCampusDetails.address}</div>}
                      {selectedCampusDetails?.contactNumber && <div>Contact: {selectedCampusDetails.contactNumber}</div>}
                    </div>
                    <h3 style={{ textDecoration: "underline", marginTop: "12px", fontWeight: 700, fontSize: "17px" }}>
                      STUDENT LEDGER REPORT
                    </h3>
                  </div>

                  {/* Student Details Grid */}
                  <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "15px", fontSize: "12px", backgroundColor: "#f9f9f9" }}>
                    <div className="row">
                      <div className="col-6 mb-1">
                        <strong>Student Name: </strong> {studentInfo?.fullName || "-"}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Reg / Student No: </strong> {studentInfo?.studentNumber || "-"}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Father's Name: </strong> {studentInfo?.fatherName || "-"}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Class & Section: </strong> {studentInfo?.grade || "-"} {studentInfo?.section ? `(${studentInfo.section})` : ""}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Contact Number: </strong> {studentInfo?.contactNumber || "-"}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Admission Date: </strong> {studentInfo?.admissionDate ? dayjs(studentInfo.admissionDate).format("DD-MMM-YYYY") : "-"}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Ledger Period: </strong> {dateRange[0].format("DD-MMM-YYYY")} to {dateRange[1].format("DD-MMM-YYYY")}
                      </div>
                      <div className="col-6 mb-1">
                        <strong>Opening Balance: </strong> <strong>{formatNumber(studentLedgerReport.openingBalance)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "12%", color: "#fff" }}>Date</th>
                        <th style={{ width: "14%", color: "#fff" }}>Voucher No</th>
                        <th style={{ width: "12%", color: "#fff" }}>Type</th>
                        <th style={{ width: "26%", color: "#fff" }}>Description</th>
                        <th style={{ width: "12%", color: "#fff" }} className="text-end">Debit</th>
                        <th style={{ width: "12%", color: "#fff" }} className="text-end">Credit</th>
                        <th style={{ width: "12%", color: "#fff" }} className="text-end">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Opening Balance Row */}
                      <tr style={{ backgroundColor: "#f2f2f2", fontWeight: 600 }}>
                        <td colSpan={6} className="text-end">
                          Opening Balance:
                        </td>
                        <td className="text-end fw-bold">
                          {formatNumber(studentLedgerReport.openingBalance)}
                        </td>
                      </tr>

                      {/* Transaction Details */}
                      {studentLedgerReport.details && studentLedgerReport.details.length > 0 ? (
                        studentLedgerReport.details.map((item, index) => (
                          <tr key={index}>
                            <td>{dayjs(item.date).format("DD-MM-YYYY")}</td>
                            <td>{item.voucherNumber}</td>
                            <td className="text-capitalize">{item.voucherType}</td>
                            <td>{item.description}</td>
                            <td className="text-end text-danger">{item.debit > 0 ? formatNumber(item.debit) : "-"}</td>
                            <td className="text-end text-success">{item.credit > 0 ? formatNumber(item.credit) : "-"}</td>
                            <td className="text-end" style={{ fontWeight: "bold" }}>
                              {formatNumber(item.balance)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center p-3 text-muted">
                            No transactions found for this student in the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #000", fontWeight: "bold", backgroundColor: "#e9edf4" }}>
                        <td colSpan={4} className="text-end">Total Period Activity:</td>
                        <td className="text-end text-danger">{formatNumber(totalDebit)}</td>
                        <td className="text-end text-success">{formatNumber(totalCredit)}</td>
                        <td className="text-end fw-bold">
                          {formatNumber(
                            (studentLedgerReport.details && studentLedgerReport.details.length > 0)
                              ? studentLedgerReport.details[studentLedgerReport.details.length - 1].balance
                              : studentLedgerReport.openingBalance
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Signatures */}
                  <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "160px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "6px", fontSize: "11px", fontWeight: "bold" }}>
                      Prepared By
                    </div>
                    <div style={{ width: "160px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "6px", fontSize: "11px", fontWeight: "bold" }}>
                      Checked By
                    </div>
                    <div style={{ width: "160px", borderTop: "2px solid #000", textAlign: "center", paddingTop: "6px", fontSize: "11px", fontWeight: "bold" }}>
                      Authorized Signatory
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="d-flex justify-content-between mt-4 pt-2 border-top" style={{ fontSize: "10px", color: "#555" }}>
                    <span>Printed on: {dayjs().format("DD-MMM-YYYY HH:mm")}</span>
                    <span>Powered by: <strong>{PoweredBy}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!studentLedgerReport && !loading && (
          <div className="card mt-4 no-print">
            <div className="card-body text-center p-5">
              <i className="ti ti-notebook fs-48 text-muted mb-3" />
              <p className="text-muted">Select student and date range to view ledger details.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLedgerReport;
