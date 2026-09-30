import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetDefaulterReport, clearDefaulterReport } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../core/common/selectoption/academic/useAcademicSessions";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from "../../../core/common/selectoption/academic/useSections";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { BrandName, PoweredBy } from "../../../environment";

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

const DefaulterSummaryReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearDefaulterReport());
    return () => {
      dispatch(clearDefaulterReport());
    };
  }, [dispatch]);

  // --- Auth & Initial State ---
  const storedUserData = window.localStorage.getItem("userData");
  const userInfo = storedUserData ? JSON.parse(storedUserData) : null;
  const loginInfo = userInfo?.data;
  const userLevel = loginInfo?.userLevel;
  const userLevelId = loginInfo?.userLevelId;

  // --- Filter State ---
  const [regionId, setRegionId] = useState<number | null>(
    userLevel === 2 ? userLevelId : null
  );
  const [selectedCampusId, setSelectedCampusId] = useState<number>(
    userLevel === 3 ? userLevelId : 0
  );
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const sessionsList = useAcademicSessions();
  const gradesList = useAcademicGrades();
  const sectionsList = useSectionList(gradeId);

  // --- Redux Data ---
  const { defaulterReportData, loading } = useSelector(
    (state: RootState) => state.academicReport
  );

  // --- Handlers ---
  const handleRegionChange = (option: any) => {
    setRegionId(option?.value || null);
    setSelectedCampusId(0);
  };

  const handleCampusChange = (option: any) => {
    setSelectedCampusId(option?.value || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampusId) {
      toast.error("Please select a campus");
      return;
    }
    if (!sessionId) {
      toast.error("Please select a session");
      return;
    }
    if (!asOfDate) {
      toast.error("Please select an as of date");
      return;
    }

    const payload = {
      campusId: selectedCampusId,
      sessionId: sessionId,
      gradeId: gradeId || null,
      sectionId: sectionId || null,
      asOfDate: new Date(asOfDate).toISOString(),
    };

    dispatch(GetDefaulterReport(payload));
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find((c) => c.value === selectedCampusId)?.label || "";
  const selectedSessionName = sessionsList.find((s) => s.value === sessionId)?.label || "";

  // Group defaulters by Grade for class-level summary
  const gradeSummary = React.useMemo(() => {
    if (!defaulterReportData?.defaulters) return [];
    const map: { [grade: string]: { gradeName: string; studentCount: number; tuitionDue: number; annualDue: number; otherDue: number; totalDue: number } } = {};
    
    defaulterReportData.defaulters.forEach((d) => {
      const g = d.gradeName || "Other";
      if (!map[g]) {
        map[g] = { gradeName: g, studentCount: 0, tuitionDue: 0, annualDue: 0, otherDue: 0, totalDue: 0 };
      }
      map[g].studentCount += 1;
      map[g].tuitionDue += d.tuitionFeeDue || 0;
      map[g].annualDue += d.annualChargesDue || 0;
      map[g].otherDue += d.otherChargesDue || 0;
      map[g].totalDue += d.totalPendingAmount || 0;
    });

    return Object.values(map);
  }, [defaulterReportData]);

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Breadcrumbs */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3 no-print">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Defaulter Summary Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={routes.reports}>Reports</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Defaulter Summary Report
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="card no-print">
          <div className="card-header bg-light pb-2">
            <div className="d-flex align-items-center">
              <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                <i className="ti ti-filter fs-16" />
              </span>
              <h4 className="text-dark">Report Filters</h4>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleGenerateReport}>
              <div className="row">
                {userLevel === 1 && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Region</label>
                    <CommonSelect3
                      options={regionsList}
                      value={regionsList.find((r) => r.value === regionId)}
                      onChange={handleRegionChange}
                      placeholder="Select Region"
                    />
                  </div>
                )}
                {(userLevel === 1 || userLevel === 2) && (
                  <div className="col-md-3 mb-3">
                    <label className="form-label text-danger">Campus *</label>
                    <CommonSelect3
                      options={campuses}
                      value={campuses.find((c) => c.value === selectedCampusId)}
                      onChange={handleCampusChange}
                      placeholder="Select Campus"
                    />
                  </div>
                )}
                <div className="col-md-3 mb-3">
                  <label className="form-label text-danger">Session *</label>
                  <CommonSelect3
                    options={sessionsList}
                    value={sessionsList.find((s) => s.value === sessionId)}
                    onChange={(opt: any) => setSessionId(opt?.value || null)}
                    placeholder="Select Session"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Grade</label>
                  <CommonSelect3
                    options={gradesList}
                    value={gradesList.find((g) => g.value === gradeId)}
                    onChange={(opt: any) => {
                      setGradeId(opt?.value || null);
                      setSectionId(null);
                    }}
                    placeholder="Select Grade"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Section</label>
                  <CommonSelect3
                    options={sectionsList}
                    value={sectionsList.find((s) => s.value === sectionId)}
                    onChange={(opt: any) => setSectionId(opt?.value || null)}
                    placeholder="Select Section"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label text-danger">As Of Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3 d-flex align-items-end">
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
                      "Generate Defaulter Summary"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Executive KPI Cards */}
        {defaulterReportData && (
          <div className="row no-print mb-3">
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="card bg-white flex-fill border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-lg bg-danger-transparent text-danger rounded-circle me-3">
                      <i className="ti ti-users-minus fs-24" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Defaulters</h6>
                      <h3 className="mb-0 text-dark fw-bold">{defaulterReportData.totalDefaultersCount}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="card bg-white flex-fill border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-lg bg-warning-transparent text-warning rounded-circle me-3">
                      <i className="ti ti-cash-off fs-24" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Tuition Fee Due</h6>
                      <h3 className="mb-0 text-dark fw-bold">{formatNumber(defaulterReportData.overallTuitionFeeDue)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="card bg-white flex-fill border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-lg bg-info-transparent text-info rounded-circle me-3">
                      <i className="ti ti-calendar-due fs-24" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Annual Charges Due</h6>
                      <h3 className="mb-0 text-dark fw-bold">{formatNumber(defaulterReportData.overallAnnualChargesDue)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="card bg-white flex-fill border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-lg bg-danger text-white rounded-circle me-3">
                      <i className="ti ti-report-money fs-24" />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Outstanding</h6>
                      <h3 className="mb-0 text-danger fw-bold">{formatNumber(defaulterReportData.overallPendingAmount)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        {defaulterReportData && (
          <div className="report-container" style={{ padding: "20px", backgroundColor: "#525659", minHeight: "100vh", marginTop: "20px" }}>
            <style>{`
              @media screen {
                .a4-page {
                  background: white;
                  width: 210mm;
                  min-height: 297mm;
                  margin: 20px auto;
                  padding: 15mm;
                  padding-bottom: 25mm;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                  box-sizing: border-box;
                  color: #000;
                  position: relative;
                }
              }

              @media print {
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body {
                  background: #fff !important;
                  -webkit-print-color-adjust: exact;
                  color: #000 !important;
                }
                body * {
                  visibility: hidden;
                  color: #000 !important;
                  border-color: #000 !important;
                }
                #print-area, #print-area * {
                  visibility: visible;
                }
                #print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .a4-page {
                  padding: 15mm;
                  padding-bottom: 25mm;
                  box-sizing: border-box;
                }
                .no-print {
                  display: none !important;
                }
                .powered-by-footer {
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  width: 100%;
                  text-align: center;
                  border-top: 1px solid #000 !important;
                  padding: 5px 0;
                }
              }

              .report-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                color: #000 !important;
                border: 1px solid #000 !important;
              }
              .report-table th {
                background-color: #000 !important;
                color: #fff !important;
                padding: 6px;
                border: 1px solid #000 !important;
                font-weight: bold;
                text-align: left;
                text-transform: uppercase;
              }
              .report-table td {
                padding: 5px 6px;
                border: 1px solid #000 !important;
                color: #000 !important;
              }
              p, div, h2, h3, h4, h5, span, small, strong {
                color: #000 !important;
              }

              .powered-by-footer {
                margin-top: 40px;
                font-size: 10px;
                color: #000 !important;
                text-align: center;
                font-style: italic;
              }
              .text-end {
                text-align: right !important;
              }
            `}</style>

            <div className="no-print text-center mb-3">
              <button
                className="btn btn-primary"
                onClick={handlePrint}
                style={{ padding: "10px 25px", fontWeight: "bold" }}
              >
                <i className="ti ti-printer me-2"></i> PRINT DEFAULTER SUMMARY REPORT
              </button>
            </div>

            <div id="print-area">
              <div className="a4-page">
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>
                    {BrandName || "DAR-E-ARQAM SCHOOLS"}
                  </h2>
                  <h4 style={{ margin: "2px 0", color: "#000", fontWeight: 700 }}>
                    {selectedCampusDetails?.name || selectedCampusName}
                  </h4>
                  <div style={{ fontSize: "11px", color: "#000", fontWeight: 500 }}>
                    {selectedCampusDetails?.address && <div>{selectedCampusDetails.address}</div>}
                    {selectedCampusDetails?.contactNumber && <div>Contact: {selectedCampusDetails.contactNumber}</div>}
                  </div>
                  <h3 style={{ textDecoration: "underline", marginTop: "12px", fontWeight: 700, fontSize: "17px" }}>
                    DEFAULTER SUMMARY REPORT
                  </h3>

                  <div className="d-flex justify-content-between mt-3 px-2" style={{ fontSize: "12px" }}>
                    <span><strong>Session:</strong> {selectedSessionName}</span>
                    <span><strong>As Of Date:</strong> {dayjs(asOfDate).format("DD-MMM-YYYY")}</span>
                    <span><strong>Total Defaulters:</strong> {defaulterReportData.totalDefaultersCount} Students</span>
                  </div>
                </div>

                {/* Class-wise Summary Table */}
                <h5 style={{ fontWeight: "bold", marginTop: "15px", marginBottom: "6px", fontSize: "13px" }}>
                  Class-Wise Defaulters Summary:
                </h5>
                <table className="report-table mb-4">
                  <thead>
                    <tr>
                      <th style={{ width: "6%", color: "#fff" }}>S#</th>
                      <th style={{ width: "24%", color: "#fff" }}>Grade / Class</th>
                      <th style={{ width: "16%", color: "#fff" }} className="text-end">Defaulter Students</th>
                      <th style={{ width: "18%", color: "#fff" }} className="text-end">Tuition Due</th>
                      <th style={{ width: "18%", color: "#fff" }} className="text-end">Annual Due</th>
                      <th style={{ width: "18%", color: "#fff" }} className="text-end">Total Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeSummary.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{item.gradeName}</td>
                        <td className="text-end">{item.studentCount}</td>
                        <td className="text-end">{formatNumber(item.tuitionDue)}</td>
                        <td className="text-end">{formatNumber(item.annualDue)}</td>
                        <td className="text-end fw-bold">{formatNumber(item.totalDue)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid #000", fontWeight: "bold", backgroundColor: "#e9edf4" }}>
                      <td colSpan={2} className="text-end">Grand Summary Total:</td>
                      <td className="text-end">{defaulterReportData.totalDefaultersCount}</td>
                      <td className="text-end">{formatNumber(defaulterReportData.overallTuitionFeeDue)}</td>
                      <td className="text-end">{formatNumber(defaulterReportData.overallAnnualChargesDue)}</td>
                      <td className="text-end fw-bold text-danger">{formatNumber(defaulterReportData.overallPendingAmount)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Student Listing Table */}
                <h5 style={{ fontWeight: "bold", marginTop: "20px", marginBottom: "6px", fontSize: "13px" }}>
                  Student Dues Breakdown:
                </h5>
                {defaulterReportData.defaulters && defaulterReportData.defaulters.length > 0 ? (
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th style={{ width: "4%", color: "#fff" }}>S#</th>
                        <th style={{ width: "12%", color: "#fff" }}>Reg No</th>
                        <th style={{ width: "18%", color: "#fff" }}>Student Name</th>
                        <th style={{ width: "16%", color: "#fff" }}>Father Name</th>
                        <th style={{ width: "12%", color: "#fff" }}>Class</th>
                        <th style={{ width: "12%", color: "#fff" }} className="text-end">Tuition Due</th>
                        <th style={{ width: "12%", color: "#fff" }} className="text-end">Annual Due</th>
                        <th style={{ width: "14%", color: "#fff" }} className="text-end">Total Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaulterReportData.defaulters.map((defaulter, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{defaulter.studentNumber}</td>
                          <td style={{ fontWeight: 500 }}>{defaulter.studentName}</td>
                          <td>{defaulter.fatherName || "-"}</td>
                          <td>{defaulter.gradeName} - {defaulter.sectionName}</td>
                          <td className="text-end">{formatNumber(defaulter.tuitionFeeDue)}</td>
                          <td className="text-end">{formatNumber(defaulter.annualChargesDue)}</td>
                          <td className="text-end fw-bold">{formatNumber(defaulter.totalPendingAmount)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid #000", fontWeight: "bold", backgroundColor: "#e9edf4" }}>
                        <td colSpan={5} className="text-end">Total ({defaulterReportData.totalDefaultersCount} Students):</td>
                        <td className="text-end">{formatNumber(defaulterReportData.overallTuitionFeeDue)}</td>
                        <td className="text-end">{formatNumber(defaulterReportData.overallAnnualChargesDue)}</td>
                        <td className="text-end fw-bold text-danger">{formatNumber(defaulterReportData.overallPendingAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center p-4" style={{ border: "1px solid #000", marginTop: "15px" }}>
                    <p className="mb-0">No defaulters found for the selected criteria.</p>
                  </div>
                )}

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

                {/* Print Footer */}
                <div className="powered-by-footer d-print-block">
                  Printed on: {dayjs().format("DD-MMM-YYYY hh:mm A")} | Powered by {PoweredBy}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaulterSummaryReport;
