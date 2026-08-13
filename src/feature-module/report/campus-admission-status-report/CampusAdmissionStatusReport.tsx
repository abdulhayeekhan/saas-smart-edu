import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetCampusAdmissionStatusReport, clearCampusAdmissionStatusReport, CampusAdmissionStatusReportData } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { BrandName, PoweredBy } from "../../../environment";
import dayjs from "dayjs";

export const formatNumber = (
  value: number | string | undefined | null,
  decimals = 0
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numericValue === null || numericValue === undefined || isNaN(numericValue)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
};

const CampusAdmissionStatusReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearCampusAdmissionStatusReport());
    return () => {
      dispatch(clearCampusAdmissionStatusReport());
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

  // --- Dropdown Data ---
  const regionsList = useRegionsList();

  // --- Redux Data ---
  const { campusAdmissionStatusReport, loading } = useSelector(
    (state: RootState) => state.academicReport
  );

  // --- Handlers ---
  const handleRegionChange = (option: any) => {
    setRegionId(option?.value || null);
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      regionId: regionId,
    };

    dispatch(GetCampusAdmissionStatusReport(payload));
  };

  // Helper to extract all unique status keys from the report data
  const getAllStatusKeys = () => {
    if (!campusAdmissionStatusReport) return [];
    const keys = new Set<string>();
    campusAdmissionStatusReport.forEach((campus: CampusAdmissionStatusReportData) => {
      if (campus.statusCounts) {
        Object.keys(campus.statusCounts).forEach(key => keys.add(key));
      }
    });
    // Optional: Sort keys so they appear consistently (e.g., admission, walkin, new, left)
    return Array.from(keys).sort();
  };

  const statusKeys = getAllStatusKeys();

  // Calculate totals
  const totalAverageFee = campusAdmissionStatusReport?.reduce((acc: number, curr: CampusAdmissionStatusReportData) => acc + (curr.averageFee || 0), 0) || 0;
  
  const statusTotals = statusKeys.reduce((acc: Record<string, number>, key: string) => {
    acc[key] = campusAdmissionStatusReport?.reduce((sum: number, curr: CampusAdmissionStatusReportData) => sum + (curr.statusCounts?.[key] || 0), 0) || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Campus Admission Status Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Campus Admission Status Report
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Filters Card */}
        <div className="row">
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
                          placeholder="All Regions"
                        />
                      </div>
                    )}
                    <div className="col-md-2 mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Generating...</>
                        ) : (
                          "Generate Report"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Report Preview in Adobe/Ledger style */}
        {campusAdmissionStatusReport && campusAdmissionStatusReport.length > 0 && (
          <div className="report-container" style={{ padding: '20px', backgroundColor: '#525659', minHeight: '100vh', marginTop: '20px' }}>
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
                font-size: 12px;
                color: #000 !important;
                border: 1px solid #000 !important;
              }
              .report-table th {
                background-color: #000 !important;
                color: #fff !important;
                padding: 8px;
                border: 1px solid #000 !important;
                font-weight: bold;
                text-align: left;
                text-transform: uppercase;
              }
              .report-table td {
                padding: 6px 8px;
                border: 1px solid #000 !important;
                color: #000 !important;
              }
              p, div, h2, h4, span, small, strong {
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
              .text-center {
                text-align: center !important;
              }
            `}</style>

            <div className="no-print text-center mb-3">
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ padding: '10px 25px', fontWeight: 'bold' }}
              >
                <i className="ti ti-printer me-2"></i> PRINT STATUS REPORT
              </button>
            </div>

            <div id="print-area">
              <div className="a4-page">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h2 style={{ margin: 0, fontWeight: 700, fontFamily: "'RevuenCustom', sans-serif", fontSize: '26px' }}>
                    {BrandName || "COMPANY NAME"}
                  </h2>
                  <h3 style={{ textDecoration: 'underline', marginTop: '15px', fontWeight: 700, fontSize: '18px' }}>
                    CAMPUS ADMISSION STATUS REPORT
                  </h3>

                  <div className="d-flex justify-content-between mt-3 px-3" style={{ fontSize: "12px" }}>
                    <span><strong>Region:</strong> {regionId ? (regionsList.find((r) => r.value === regionId)?.label || "Selected Region") : "All Regions"}</span>
                    <span><strong>Date:</strong> {dayjs().format("DD-MMM-YYYY")}</span>
                  </div>
                </div>

                {/* Table */}
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%', color: '#fff' }}>S#</th>
                      <th style={{ width: '25%', color: '#fff' }}>Campus Name</th>
                      <th style={{ width: '15%', color: '#fff' }} className="text-end">Average Fee</th>
                      {statusKeys.map(key => (
                        <th key={key} style={{ color: '#fff' }} className="text-center">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campusAdmissionStatusReport.map((detail: CampusAdmissionStatusReportData, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{detail.campusName}</td>
                        <td className="text-end">{formatNumber(detail.averageFee, 2)}</td>
                        {statusKeys.map(key => (
                          <td key={key} className="text-center">{detail.statusCounts?.[key] || 0}</td>
                        ))}
                      </tr>
                    ))}

                    <tr style={{ borderTop: '2px solid #000', fontWeight: "bold", backgroundColor: "#e9edf4" }}>
                      <td colSpan={2} className="text-end">Total:</td>
                      <td className="text-end">{formatNumber(totalAverageFee, 2)}</td>
                      {statusKeys.map(key => (
                        <td key={key} className="text-center">{statusTotals[key]}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div style={{ marginTop: '70px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '11px', fontWeight: 'bold' }}>Prepared By</div>
                  <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '11px', fontWeight: 'bold' }}>Checked By</div>
                  <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '11px', fontWeight: 'bold' }}>Authorized Signatory</div>
                </div>

                {/* Powered By Footer */}
                <div className="powered-by-footer">
                  Powered by <strong>{PoweredBy}</strong> | Printed on: {dayjs().format('DD-MMM-YYYY HH:mm')}
                </div>
              </div>
            </div>
          </div>
        )}

        {campusAdmissionStatusReport && campusAdmissionStatusReport.length === 0 && !loading && (
          <div className="card mt-4">
            <div className="card-body text-center p-5">
              <i className="ti ti-report-analytics fs-48 text-muted mb-3" />
              <p className="text-muted">No report data found for the selected filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusAdmissionStatusReport;
