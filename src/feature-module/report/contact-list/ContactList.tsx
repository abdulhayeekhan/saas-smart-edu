import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { all_routes } from "../../router/all_routes";
import { GetBranchContactList, clearBranchContactList, BranchContactListData } from "../../../store/apps/academic-reports";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../core/common/selectoption/academic/useAcademicSessions";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from "../../../core/common/selectoption/academic/useSections";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import { BrandName, PoweredBy } from "../../../environment";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ContactList = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearBranchContactList());
    return () => {
      dispatch(clearBranchContactList());
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
  const [sessionId, setSessionId] = useState<number>(0);
  const [gradeId, setGradeId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);
  const [statusId, setStatusId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [age, setAge] = useState<number | "">("");

  // --- Column Visibility State ---
  const [showAdmissionDate, setShowAdmissionDate] = useState<boolean>(true);
  const [showContactNo, setShowContactNo] = useState<boolean>(true);
  const [showCnic, setShowCnic] = useState<boolean>(true);
  const [showStatus, setShowStatus] = useState<boolean>(true);
  const [showEmail, setShowEmail] = useState<boolean>(true);
  const [showAge, setShowAge] = useState<boolean>(false);

  // --- Dropdown Data ---
  const regionsList = useRegionsList();
  const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);
  const sessionsList = useAcademicSessions();
  const gradesList = useAcademicGrades();
  const sectionsList = useSectionList(selectedCampusId);

  // --- Redux Data ---
  const { branchContactList, loading } = useSelector(
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

  const handleSessionChange = (option: any) => {
    setSessionId(option?.value || 0);
  };

  const handleGradeChange = (option: any) => {
    setGradeId(option?.value || 0);
  };

  const handleSectionChange = (option: any) => {
    setSectionId(option?.value || 0);
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
      gradeId: gradeId || null,
      sectionId: sectionId || null,
    };

    dispatch(GetBranchContactList(payload));
  };

  const handlePrint = () => {
    window.print();
  };

  const campusData = useSelector((state: RootState) => state.campus.data);
  const selectedCampusDetails = campusData.find((c: any) => c.id === selectedCampusId);
  const selectedCampusName = campuses.find((c: any) => c.value === selectedCampusId)?.label || "";
  const selectedSessionName = sessionsList.find((s: any) => s.value === sessionId)?.label || "";

  const statusOptions = [
    { value: "", label: "All" },
    { value: "admission", label: "Admission" },
    { value: "walkin", label: "Walkin" },
    { value: "new", label: "New" },
    { value: "left", label: "Left" },
  ];

  const filteredContactList = branchContactList?.filter((detail: BranchContactListData) => {
    let match = true;
    if (statusId && detail.status !== statusId) {
      if (statusId === "left" && detail.isLeft) {
        match = true;
      } else if (statusId === "left" && !detail.isLeft) {
        match = false;
      } else if (statusId !== "left" && (detail.status !== statusId || detail.isLeft)) {
        match = false;
      }
    }
    if (fromDate && dayjs(detail.admissionDate).isBefore(dayjs(fromDate), 'day')) {
      match = false;
    }
    if (toDate && dayjs(detail.admissionDate).isAfter(dayjs(toDate), 'day')) {
      match = false;
    }
    if (age !== "") {
      if (detail.dateOfBirth) {
        const studentAge = dayjs().diff(dayjs(detail.dateOfBirth), 'year');
        if (studentAge !== age) {
          match = false;
        }
      } else {
        match = false;
      }
    }
    return match;
  });

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="mb-1">Contact List</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Contact List
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
                      <div className="col-md-2 mb-3">
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
                      <div className="col-md-2 mb-3">
                        <label className="form-label">Campus</label>
                        <CommonSelect3
                          options={campuses}
                          onChange={handleCampusChange}
                          value={campuses.find((c: any) => c.value === selectedCampusId) || null}
                          placeholder="Select Campus"
                        />
                      </div>
                    )}
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Session</label>
                      <CommonSelect3
                        options={sessionsList}
                        onChange={handleSessionChange}
                        value={sessionsList.find((s: any) => s.value === sessionId) || null}
                        placeholder="Select Session"
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Grade (Optional)</label>
                      <CommonSelect3
                        options={gradesList}
                        onChange={handleGradeChange}
                        value={gradesList.find((g: any) => g.value === gradeId) || null}
                        placeholder="Select Grade"
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Section (Optional)</label>
                      <CommonSelect3
                        options={sectionsList}
                        onChange={handleSectionChange}
                        value={sectionsList.find((s: any) => s.value === sectionId) || null}
                        placeholder="Select Section"
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Status (Optional)</label>
                      <CommonSelect3
                        options={statusOptions}
                        onChange={(opt: any) => setStatusId(opt?.value || "")}
                        value={statusOptions.find((s: any) => s.value === statusId) || null}
                        placeholder="Select Status"
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Age (Optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={age}
                        onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Enter Age"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Admission Date (Optional)</label>
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
                    <div className="col-md-12 mb-3">
                      <div className="d-flex align-items-center gap-4">
                        <label className="form-label mb-0 fw-bold">Show Columns in Print:</label>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showContactNo}
                            onChange={(e) => setShowContactNo(e.target.checked)}
                            id="chk-contact-no"
                          />
                          <label className="form-check-label" htmlFor="chk-contact-no">
                            Contact No
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showCnic}
                            onChange={(e) => setShowCnic(e.target.checked)}
                            id="chk-cnic"
                          />
                          <label className="form-check-label" htmlFor="chk-cnic">
                            CNIC / B-Form
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showAdmissionDate}
                            onChange={(e) => setShowAdmissionDate(e.target.checked)}
                            id="chk-admission-date"
                          />
                          <label className="form-check-label" htmlFor="chk-admission-date">
                            Admission Date
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showStatus}
                            onChange={(e) => setShowStatus(e.target.checked)}
                            id="chk-status"
                          />
                          <label className="form-check-label" htmlFor="chk-status">
                            Status
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showEmail}
                            onChange={(e) => setShowEmail(e.target.checked)}
                            id="chk-email"
                          />
                          <label className="form-check-label" htmlFor="chk-email">
                            Email
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            className="form-check-input mt-0 me-2"
                            type="checkbox"
                            checked={showAge}
                            onChange={(e) => setShowAge(e.target.checked)}
                            id="chk-age"
                          />
                          <label className="form-check-label" htmlFor="chk-age">
                            Age
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
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
        {branchContactList && (
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePrint}
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
                        size: A4 landscape;
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
                        font-size: 10px;
                      }
                      table.report-table th,
                      table.report-table td {
                        border: 1px solid #000;
                        padding: 4px 6px;
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
                      padding: 8px 12px;
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
                        <strong>Contact List</strong>
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <table className="meta-table">
                    <tbody>
                      <tr>
                        <td width="33%"><strong>Session:</strong> {selectedSessionName}</td>
                        <td width="33%"><strong>Grade:</strong> {gradesList.find((g: any) => g.value === gradeId)?.label || "All"}</td>
                        <td width="33%"><strong>Section:</strong> {sectionsList.find((s: any) => s.value === sectionId)?.label || "All"}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong> {statusOptions.find(s => s.value === statusId)?.label || "All"}</td>
                        <td><strong>Date Range:</strong> {fromDate && toDate ? `${dayjs(fromDate).format('DD MMM YYYY')} to ${dayjs(toDate).format('DD MMM YYYY')}` : "All Time"}</td>
                        <td><strong>Total Students:</strong> {filteredContactList?.length || 0}</td>
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
                        <th>Student Name</th>
                        <th>Father Name</th>
                        {showContactNo && <th>Contact No</th>}
                        {showEmail && <th>Email</th>}
                        {showCnic && <th>CNIC / B-Form</th>}
                        {showAge && <th>Age</th>}
                        <th>Grade</th>
                        <th>Section</th>
                        {showAdmissionDate && <th>Admission Date</th>}
                        {showStatus && <th>Status</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContactList?.map((detail: BranchContactListData, index: number) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="text-uppercase">{detail.fullName}</td>
                          <td className="text-uppercase">{detail.fatherName}</td>
                          {showContactNo && <td>{detail.contactNumber}</td>}
                          {showEmail && <td>{detail.email}</td>}
                          {showCnic && <td>{detail.cnic || detail.bForm || '-'}</td>}
                          {showAge && <td>{detail.dateOfBirth ? dayjs().diff(dayjs(detail.dateOfBirth), 'year') : "-"}</td>}
                          <td>{detail.gradeName}</td>
                          <td>{detail.sectionName}</td>
                          {showAdmissionDate && <td>{detail.admissionDate ? dayjs(detail.admissionDate).format("DD MMM YYYY") : "-"}</td>}
                          {showStatus && (
                            <td>
                              <span className="text-capitalize">
                                {detail.status} {detail.isLeft ? "(Left)" : ""}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredContactList?.length === 0 && (
                        <tr>
                          <td colSpan={10} className="text-center py-4">No records found</td>
                        </tr>
                      )}
                    </tbody>
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

export default ContactList;
