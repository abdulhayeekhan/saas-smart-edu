import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetCollectionReport, clearCollectionReport } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useFeeTypes } from "../../../core/common/selectoption/academic/useFeeTypes";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import { CompnayIcon, BrandName, PoweredBy, getRegionLogoUrl } from "../../../environment";

const { RangePicker } = DatePicker;

const CollectionReport = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearCollectionReport());
    return () => {
      dispatch(clearCollectionReport());
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
    feeTypeId: null as string | number | null,
    gradeId: null as string | number | null,
  });

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const gradesList = useAcademicGrades();
  const feeTypesList = useFeeTypes();

  // --- Redux Data ---
  const { collectionReport, loading } = useSelector(
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
      feeTypeId: (filter.feeTypeId && filter.feeTypeId !== "0" && filter.feeTypeId !== "") ? Number(filter.feeTypeId) : null,
      gradeId: (filter.gradeId && filter.gradeId !== 0 && filter.gradeId !== "0") ? Number(filter.gradeId) : null,
      campusId: selectedCampusId,
    };

    dispatch(GetCollectionReport(payload));
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = collectionReport.reduce(
    (sum, item) => sum + (item.amountReceived || 0),
    0
  );

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find(c => c.value === selectedCampusId)?.label || "";

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Collection Report</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Collection Report
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
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Fee Type</label>
                      <CommonSelect3
                        options={feeTypesList}
                        onChange={(opt: any) =>
                          setFilter({ ...filter, feeTypeId: opt?.value ?? null })
                        }
                        value={feeTypesList.find((f) => String(f.value) === String(filter.feeTypeId)) || null}
                        placeholder="All Fee Types"
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

        {/* Report Preview */}
        {collectionReport.length > 0 && (
          <div className="row">
            <div className="col-md-12">
              <div className="no-print text-center mb-3">
                <button className="btn btn-secondary me-2" onClick={handlePrint}>
                  <i className="ti ti-printer me-1" /> Direct Print
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
                      padding: 10mm;
                      box-shadow: 0 0 10px rgba(0,0,0,0.1);
                      color: #000;
                    }
                  }
                  @media print {
                    @page {
                      size: A4;
                      margin: 10mm;
                    }
                    body * {
                      visibility: hidden;
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
                    .no-print {
                      display: none !important;
                    }
                  }
                  .report-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                  }
                  .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                    font-family: Arial, sans-serif;
                  }
                  .report-table th, .report-table td {
                    border: 1px solid #000;
                    padding: 4px;
                    text-align: left;
                  }
                  .report-table th {
                    background-color: #000 !important;
                    color: #fff !important;
                    -webkit-print-color-adjust: exact;
                    text-transform: uppercase;
                    font-weight: bold;
                  }
                  .text-end { text-align: right !important; }
                  .report-footer {
                    margin-top: 20px;
                    font-size: 10px;
                  }
                `}</style>

                <div className="report-preview">
                  <div className="report-header">
                    <div className="text-center mb-2">
                      <img
                        src={getRegionLogoUrl()}
                        alt="Logo"
                        style={{ maxHeight: '60px', marginBottom: '8px', objectFit: 'contain' }}
                      />
                      <div>
                        <h2 style={{ margin: 0, fontWeight: 700, fontFamily: "'RevuenCustom', sans-serif", fontSize: '26px' }}>
                          {BrandName}
                        </h2>
                        <h4 style={{ margin: "2px 0", color: "#000", fontWeight: 700 }}>
                          {selectedCampusDetails?.name || selectedCampusName}
                        </h4>
                        <div style={{ fontSize: "11px", color: "#000", fontWeight: 500 }}>
                          {selectedCampusDetails?.address && <div>{selectedCampusDetails.address}</div>}
                          {selectedCampusDetails?.contactNumber && <div>Contact: {selectedCampusDetails.contactNumber}</div>}
                          {selectedCampusDetails?.email && <div>Email: {selectedCampusDetails.email}</div>}
                        </div>
                      </div>
                    </div>
                    <h3 style={{ margin: "10px 0", textDecoration: "underline", fontWeight: "bold" }}>
                      COLLECTION REPORT
                    </h3>
                    <div className="d-flex justify-content-between mt-2 px-3" style={{ fontSize: "12px" }}>
                      <span><strong>From:</strong> {dayjs(filter.fromDate).format("DD-MMM-YYYY")}</span>
                      <span><strong>To:</strong> {dayjs(filter.toDate).format("DD-MMM-YYYY")}</span>
                    </div>
                  </div>

                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>S#</th>
                        <th>ROLL NO</th>
                        <th>NAME</th>
                        <th>FATHER NAME</th>
                        <th>GRADE</th>
                        <th>CONTACT #</th>
                        <th>INVOICE DATE</th>
                        <th>RECEIPT DATE</th>
                        <th className="text-end">RECEIVABLE</th>
                        <th className="text-end">RECEIVED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionReport.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.studentNumber}</td>
                          <td>{item.studentName}</td>
                          <td>{item.fatherName || "-"}</td>
                          <td>{item.grade}</td>
                          <td>{item.contactNumber}</td>
                          <td>{dayjs(item.invoiceDate).format("DD-MM-YY")}</td>
                          <td>{dayjs(item.receiptDate).format("DD-MM-YY")}</td>
                          <td className="text-end">{item.amountReceivable ? item.amountReceivable.toLocaleString() : "-"}</td>
                          <td className="text-end" style={{ fontWeight: "bold" }}>{item.amountReceived?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: "bold", backgroundColor: "#000", color: "#fff" }}>
                        <td colSpan={9} className="text-end" style={{ color: "#fff" }}>TOTAL AMOUNT RECEIVED:</td>
                        <td className="text-end" style={{ color: "#fff" }}>{totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="report-footer d-flex justify-content-between mt-5 pt-3 border-top">
                    <div>
                      <span>Printed on: {dayjs().format("DD-MMM-YYYY HH:mm")}</span>
                    </div>
                    <div>
                      <span>Powered by: <strong>{PoweredBy}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {collectionReport.length === 0 && !loading && (
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

export default CollectionReport;
