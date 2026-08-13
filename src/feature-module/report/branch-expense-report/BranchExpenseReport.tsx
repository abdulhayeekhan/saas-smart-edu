import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetBranchExpenseReport, clearBranchExpenseReport, BranchExpenseReportData } from "../../../store/apps/financial-report";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { DatePicker } from "antd";
import toast from "react-hot-toast";
import { BrandName, PoweredBy } from "../../../environment";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

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

const BranchExpenseReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearBranchExpenseReport());
    return () => {
      dispatch(clearBranchExpenseReport());
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
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);

  // --- Redux Data ---
  const { branchExpenseReport, loading } = useSelector(
    (state: RootState) => state.financialReport
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

    if (!fromDate || !toDate) {
      toast.error("Please select a date range");
      return;
    }

    const payload = {
      campusId: selectedCampusId,
      fromDate: fromDate,
      toDate: toDate,
    };

    dispatch(GetBranchExpenseReport(payload));
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find((c: any) => c.value === selectedCampusId)?.label || "";

  const totalExpense = branchExpenseReport?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Branch Expense Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Branch Expense Report
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
                          value={regionsList.find((r: any) => r.value === regionId) || null}
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
                          value={campuses.find((c: any) => c.value === selectedCampusId) || null}
                          placeholder="Select Campus"
                        />
                      </div>
                    )}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date Range</label>
                      <RangePicker
                        className="form-control datetimepicker w-100"
                        style={{ height: '38px', border: '1px solid #E9EDF4', boxShadow: 'none' }}
                        format="DD-MM-YYYY"
                        value={[
                          fromDate ? dayjs(fromDate) : null,
                          toDate ? dayjs(toDate) : null,
                        ]}
                        onChange={(dates) => {
                          if (dates && dates[0] && dates[1]) {
                            setFromDate(dates[0].format("YYYY-MM-DD"));
                            setToDate(dates[1].format("YYYY-MM-DD"));
                          } else {
                            setFromDate("");
                            setToDate("");
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

        {/* Report Preview */}
        {branchExpenseReport && (
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  <i className="ti ti-printer me-2" />
                  Print Report
                </button>
              </div>

              {/* Adobe PDF Print Area */}
              <div className="adobe-print-area">
                <style>
                  {`
                    @media print {
                      @page {
                        size: A4 portrait;
                        margin: 10mm;
                      }
                      body * {
                        visibility: hidden;
                      }
                      .adobe-print-area, .adobe-print-area * {
                        visibility: visible;
                      }
                      .adobe-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                      }
                      
                      .print-header {
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                        position: relative;
                      }
                      .print-header-content {
                        text-align: center;
                        flex-grow: 1;
                      }
                      .print-header h2 {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                        text-transform: uppercase;
                      }
                      .print-header h4 {
                        font-size: 16px;
                        margin: 0 0 5px 0;
                        font-weight: normal;
                      }
                      .print-header p {
                        font-size: 14px;
                        margin: 0;
                      }
                      
                      .meta-table {
                        width: 100%;
                        margin-bottom: 15px;
                        border-collapse: collapse;
                      }
                      .meta-table td {
                        padding: 4px 0;
                        font-size: 12px;
                      }
                      
                      table.report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 11px;
                      }
                      table.report-table th,
                      table.report-table td {
                        border: 1px solid #000;
                        padding: 6px 8px;
                        text-align: left;
                        vertical-align: middle;
                      }
                      table.report-table th {
                        background-color: #f2f2f2 !important;
                        font-weight: bold;
                        -webkit-print-color-adjust: exact;
                      }
                      
                      .print-footer {
                        margin-top: 30px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                      }
                      
                      /* Hide standard app elements in print */
                      .page-header, .sidebar, .header, .filters-card {
                        display: none !important;
                      }
                    }

                    /* Screen styling for the preview container */
                    .adobe-print-area {
                      background: white;
                      padding: 40px;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                      min-height: 800px;
                    }
                    .print-header {
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin-bottom: 30px;
                      border-bottom: 2px solid #333;
                      padding-bottom: 20px;
                      position: relative;
                    }
                    .print-header-content {
                      text-align: center;
                    }
                    .meta-table {
                      width: 100%;
                      margin-bottom: 20px;
                    }
                    table.report-table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 20px;
                    }
                    table.report-table th, table.report-table td {
                      border: 1px solid #ddd;
                      padding: 10px 12px;
                      font-size: 13px;
                    }
                    table.report-table th {
                      background-color: #f8f9fa;
                      font-weight: 600;
                    }
                  `}
                </style>

                {/* Print Document Content */}
                <div className="print-document">
                  {/* Header */}
                  <div className="print-header">
                    <div className="print-header-content">
                      <h2 style={{ margin: 0, fontWeight: 700, fontFamily: "'RevuenCustom', sans-serif", fontSize: '26px' }}>
                        {BrandName || "COMPANY NAME"}
                      </h2>
                      <h4 style={{ margin: "2px 0", color: "#000", fontWeight: 700 }}>
                        {selectedCampusName}
                      </h4>
                      <p>
                        <strong>Branch Expense Report</strong>
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <table className="meta-table">
                    <tbody>
                      <tr>
                        <td width="33%"><strong>From Date:</strong> {dayjs(fromDate).format("DD MMM YYYY")}</td>
                        <td width="33%"><strong>To Date:</strong> {dayjs(toDate).format("DD MMM YYYY")}</td>
                        <td width="33%"><strong>Total Expense:</strong> {formatNumber(totalExpense)}</td>
                      </tr>
                      <tr>
                        <td><strong>Generated On:</strong> {dayjs().format('DD MMM, YYYY HH:mm')}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Data Table */}
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>S#</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Bank / Cash Account</th>
                        <th>Financial Year</th>
                        <th>Created By</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchExpenseReport.map((detail: BranchExpenseReportData, index: number) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{dayjs(detail.date).format("DD MMM YYYY")}</td>
                          <td>{detail.expenseCategoryName}</td>
                          <td>{detail.description}</td>
                          <td>{detail.bankAccountName}</td>
                          <td>{detail.financialYearName}</td>
                          <td>{detail.createdByName}</td>
                          <td className="text-end">{formatNumber(detail.amount)}</td>
                        </tr>
                      ))}
                      {branchExpenseReport.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-4">No records found</td>
                        </tr>
                      )}
                    </tbody>
                    {branchExpenseReport.length > 0 && (
                      <tfoot>
                        <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                          <td colSpan={7} className="text-end">Total Amount:</td>
                          <td className="text-end">{formatNumber(totalExpense)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>

                  {/* Footer */}
                  <div className="print-footer mt-5">
                    <div><strong>Powered By:</strong> {PoweredBy}</div>
                    <div style={{ textAlign: "right" }}>Page 1 of 1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchExpenseReport;
