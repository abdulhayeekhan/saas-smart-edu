import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetInvoiceReceiptSummaryReport, clearInvoiceReceiptSummaryReport } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import { BrandName, PoweredBy } from "../../../environment";

const { RangePicker } = DatePicker;

export const formatNumber = (
  value: number | string | undefined | null
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numericValue === null || numericValue === undefined || isNaN(numericValue)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const InvoiceReceiptSummaryReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearInvoiceReceiptSummaryReport());
    return () => {
      dispatch(clearInvoiceReceiptSummaryReport());
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

  const [filter, setFilter] = useState({
    fromDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    toDate: dayjs().format("YYYY-MM-DD"),
    gradeId: null as string | number | null,
  });

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const gradesList = useAcademicGrades();

  // --- Redux Data ---
  const { invoiceReceiptSummaryReport, loading } = useSelector(
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

    const payload = {
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      gradeId: (filter.gradeId && filter.gradeId !== 0 && filter.gradeId !== "0") ? Number(filter.gradeId) : null,
      campusId: selectedCampusId,
    };

    dispatch(GetInvoiceReceiptSummaryReport(payload));
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find(c => c.value === selectedCampusId)?.label || "";

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Invoice Receipt Summary Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Invoice Receipt Summary Report
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
                      <label className="form-label">Grade</label>
                      <CommonSelect3
                        options={gradesList}
                        onChange={(opt: any) =>
                          setFilter({ ...filter, gradeId: opt?.value ?? null })
                        }
                        value={gradesList.find((g) => String(g.value) === String(filter.gradeId)) || null}
                        placeholder="All Grades"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date Range</label>
                      <RangePicker
                        className="form-control datetimepicker w-100"
                        style={{ height: '38px', border: '1px solid #E9EDF4', boxShadow: 'none' }}
                        format="DD-MM-YYYY"
                        value={[
                          filter.fromDate ? dayjs(filter.fromDate) : null,
                          filter.toDate ? dayjs(filter.toDate) : null,
                        ]}
                        onChange={(dates) => {
                          if (dates && dates[0] && dates[1]) {
                            setFilter({
                              ...filter,
                              fromDate: dates[0].format("YYYY-MM-DD"),
                              toDate: dates[1].format("YYYY-MM-DD"),
                            });
                          }
                        }}
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
        {invoiceReceiptSummaryReport && invoiceReceiptSummaryReport.details && invoiceReceiptSummaryReport.details.length > 0 && (
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
                <i className="ti ti-printer me-2"></i> PRINT INVOICE RECEIPT SUMMARY
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
                    INVOICE & RECEIPT SUMMARY REPORT
                  </h3>

                  <div className="d-flex justify-content-between mt-3 px-3" style={{ fontSize: "12px" }}>
                    <span><strong>From:</strong> {dayjs(filter.fromDate).format("DD-MMM-YYYY")}</span>
                    <span><strong>To:</strong> {dayjs(filter.toDate).format("DD-MMM-YYYY")}</span>
                  </div>
                </div>

                {/* Table */}
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%', color: '#fff' }}>S#</th>
                      <th style={{ width: '12%', color: '#fff' }}>Student No</th>
                      <th style={{ width: '22%', color: '#fff' }}>Student Name</th>
                      <th style={{ width: '14%', color: '#fff' }}>Class/Sec</th>
                      <th style={{ width: '11%', color: '#fff' }}>Inv No</th>
                      <th style={{ width: '11%', color: '#fff' }} className="text-end">Inv Amt</th>
                      <th style={{ width: '11%', color: '#fff' }}>Rec No</th>
                      <th style={{ width: '11%', color: '#fff' }} className="text-end">Rec Amt</th>
                      <th style={{ width: '11%', color: '#fff' }} className="text-end">Balance.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceReceiptSummaryReport.details.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.studentNumber}</td>
                        <td style={{ fontWeight: 500 }}>{item.studentName}</td>
                        <td>{item.gradeSection}</td>
                        <td>{item.invoiceNumber}</td>
                        <td className="text-end">{formatNumber(item.invoiceAmount)}</td>
                        <td>{item.receiptNumber || "-"}</td>
                        <td className="text-end">{formatNumber(item.receiptAmount)}</td>
                        <td className="text-end" style={{ fontWeight: 'bold' }}>{formatNumber(item.netReceivable)}</td>
                      </tr>
                    ))}

                    <tr style={{ borderTop: '2px solid #000', fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                      <td colSpan={5} className="text-end">Total Amount:</td>
                      <td className="text-end">{formatNumber(invoiceReceiptSummaryReport.totalInvoiceAmount)}</td>
                      <td></td>
                      <td className="text-end">{formatNumber(invoiceReceiptSummaryReport.totalReceiptAmount)}</td>
                      <td className="text-end">{formatNumber(invoiceReceiptSummaryReport.totalNetReceivable)}</td>
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

        {invoiceReceiptSummaryReport && (!invoiceReceiptSummaryReport.details || invoiceReceiptSummaryReport.details.length === 0) && !loading && (
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

export default InvoiceReceiptSummaryReport;
