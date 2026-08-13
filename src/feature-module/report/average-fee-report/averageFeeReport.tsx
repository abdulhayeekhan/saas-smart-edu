import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetAverageFeeReport, clearAverageFeeReport } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../core/common/selectoption/academic/useAcademicSessions";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
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

const AverageFeeReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearAverageFeeReport());
    return () => {
      dispatch(clearAverageFeeReport());
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
  const [sessionId, setSessionId] = useState<number | null>(null);

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const sessionsList = useAcademicSessions();

  // --- Redux Data ---
  const { averageFeeReport, loading } = useSelector(
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

    const payload = {
      campusId: selectedCampusId,
      sessionId: sessionId,
    };

    dispatch(GetAverageFeeReport(payload));
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find(c => c.value === selectedCampusId)?.label || "";
  const selectedSessionName = sessionsList.find(s => s.value === sessionId)?.label || "";

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Average Fee Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Average Fee Report
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
                          placeholder="Select Region"
                        />
                      </div>
                    )}
                    {(userLevel === 1 || userLevel === 2) && (
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Campus</label>
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
                      <label className="form-label">Session</label>
                      <CommonSelect3
                        options={sessionsList}
                        onChange={(opt: any) =>
                          setSessionId(opt?.value ? Number(opt.value) : null)
                        }
                        value={sessionsList.find((s) => String(s.value) === String(sessionId)) || null}
                        placeholder="Select Session"
                      />
                    </div>
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
        {averageFeeReport && averageFeeReport.details && averageFeeReport.details.length > 0 && (
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
            `}</style>

            <div className="no-print text-center mb-3">
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ padding: '10px 25px', fontWeight: 'bold' }}
              >
                <i className="ti ti-printer me-2"></i> PRINT AVERAGE FEE REPORT
              </button>
            </div>

            <div id="print-area">
              <div className="a4-page">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h2 style={{ margin: 0, fontWeight: 700, fontFamily: "'RevuenCustom', sans-serif", fontSize: '26px' }}>
                    {BrandName || "COMPANY NAME"}
                  </h2>
                  <h4 style={{ margin: "2px 0", color: "#000", fontWeight: 700 }}>
                    {selectedCampusDetails?.name || selectedCampusName}
                  </h4>
                  <div style={{ fontSize: "11px", color: "#000", fontWeight: 500 }}>
                    {selectedCampusDetails?.address && <div>{selectedCampusDetails.address}</div>}
                    {selectedCampusDetails?.contactNumber && <div>Contact: {selectedCampusDetails.contactNumber}</div>}
                    {selectedCampusDetails?.email && <div>Email: {selectedCampusDetails.email}</div>}
                  </div>
                  <h3 style={{ textDecoration: 'underline', marginTop: '15px', fontWeight: 700, fontSize: '18px' }}>
                    AVERAGE FEE REPORT
                  </h3>

                  <div className="d-flex justify-content-between mt-3 px-3" style={{ fontSize: "12px" }}>
                    <span><strong>Session:</strong> {selectedSessionName}</span>
                    <span><strong>Date:</strong> {dayjs().format("DD-MMM-YYYY")}</span>
                  </div>
                </div>

                {/* Table */}
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%', color: '#fff' }}>S#</th>
                      <th style={{ width: '30%', color: '#fff' }} className="text-end">Fee</th>
                      <th style={{ width: '30%', color: '#fff' }} className="text-end">No of Students</th>
                      <th style={{ width: '30%', color: '#fff' }} className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {averageFeeReport.details.map((detail, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-end">{formatNumber(detail.fee)}</td>
                        <td className="text-end">{detail.noOfStudents}</td>
                        <td className="text-end">{formatNumber(detail.amount)}</td>
                      </tr>
                    ))}

                    <tr style={{ borderTop: '2px solid #000', fontWeight: "bold", backgroundColor: "#e9edf4" }}>
                      <td className="text-end">Total:</td>
                      <td></td>
                      <td className="text-end">{averageFeeReport.totalNoOfStudents}</td>
                      <td className="text-end">{formatNumber(averageFeeReport.totalAmount)}</td>
                    </tr>
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                      <td className="text-end">Average Fee:</td>
                      <td colSpan={3} className="text-end fw-bold text-primary" style={{ fontSize: '14px' }}>
                        {formatNumber(averageFeeReport.averageFee, 2)}
                      </td>
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

        {averageFeeReport && (!averageFeeReport.details || averageFeeReport.details.length === 0) && !loading && (
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

export default AverageFeeReport;
