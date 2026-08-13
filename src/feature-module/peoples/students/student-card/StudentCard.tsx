import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { GetAdmissions, resetAdmissionState } from '../../../../store/apps/admissions';
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from '../../../../core/common/selectoption/academic/useSections';
import CommonSelect3 from "../../../../core/common/commonSelect3";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { QRCodeSVG } from "qrcode.react";
import "./studentCard.css";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const StudentCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;
  const [regionId] = useState<number>(0);
  
  // Local state for filters
  const [campusId, setCampusId] = useState<number | null>(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null);
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [template, setTemplate] = useState<string>("vertical");
  const [themeColor, setThemeColor] = useState<string>("#0d6efd");
  
  // Data for selects
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const grades = useAcademicGrades();
  const sections = useSectionList(campusId);
  
  // Fetched data
  const { data: datalist, loading } = useSelector((state: RootState) => state.admissions);

  // Template Options
  const templateOptions = [
    { value: "vertical", label: "Vertical Card (CR80)" },
    { value: "horizontal", label: "Horizontal Card (CR80)" }
  ];

  // Local filtering for searchText across multiple fields
  const filteredDatalist = datalist?.filter((student: any) => {
    if (!searchText) return true;
    const query = searchText.toLowerCase();
    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase();
    const fatherName = (student.fatherName || '').toLowerCase();
    const regNo = (student.studentNumber || '').toLowerCase();
    const rollNo = (student.admissionNumber || '').toString().toLowerCase();

    return fullName.includes(query) || fatherName.includes(query) || regNo.includes(query) || rollNo.includes(query);
  });

  const handleSearch = () => {
    // Only search if filters are provided, otherwise it fetches all students (which might be huge)
    // To be safe, we fetch page 1 with a large size when printing
    const filter = {
      pageNo: 1,
      pageSize: 500, // Large page size to print many cards at once
      search: "", // Send empty search to backend to fetch all for grade/section, then filter locally
      gradeId,
      sectionId,
      campusId,
      isEnabled: true
    };
    dispatch(GetAdmissions(filter));
  };

  useEffect(() => {
    // Component unmount
    return () => {
      dispatch(resetAdmissionState());
    };
  }, [dispatch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header - Hidden on Print */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3 no-print">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Student ID Cards</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="#">Dashboard</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Student Cards
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <button className="btn btn-primary d-flex align-items-center me-3" onClick={handlePrint}>
              <i className="ti ti-printer me-2" /> Print Cards
            </button>
          </div>
        </div>

        {/* Filters - Hidden on Print */}
        <div className="card no-print">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Filter Students</h4>
            <div className="d-flex align-items-center flex-wrap">
              {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                <div className="mb-3 me-2">
                  <CommonSelect3
                    className="select"
                    options={campuses}
                    onChange={(opt: any) => setCampusId(opt?.value || null)}
                    placeholder="Select Campus"
                  />
                </div>
              )}
              <div className="mb-3 me-2" style={{ minWidth: "200px" }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by Name or Reg/Roll No"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="mb-3 me-2">
                <CommonSelect3
                  className="select"
                  options={grades}
                  onChange={(opt: any) => setGradeId(opt?.value || null)}
                  placeholder="Select Grade"
                />
              </div>
              <div className="mb-3 me-2">
                <CommonSelect3
                  className="select"
                  options={sections}
                  onChange={(opt: any) => setSectionId(opt?.value || null)}
                  placeholder="Select Section"
                />
              </div>
              <div className="mb-3 me-2">
                <CommonSelect3
                  className="select"
                  options={templateOptions}
                  onChange={(opt: any) => setTemplate(opt?.value || "vertical")}
                  defaultValue={templateOptions[0]}
                />
              </div>
              <div className="mb-3 me-3 d-flex align-items-center">
                <input 
                  type="color" 
                  className="form-control form-control-color p-1" 
                  style={{ width: "40px", height: "40px", cursor: "pointer" }}
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)} 
                  title="Choose your card color"
                />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  {loading ? "Loading..." : "Search"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Cards Container */}
        {filteredDatalist && filteredDatalist.length > 0 ? (
          <div id="printable-cards-container" className="student-card-container">
            {filteredDatalist.map((student: any) => {
              const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
              const profileImage = student.imageUrl ? `${baseURL}/${student.imageUrl}` : "assets/img/students/student-01.jpg";

              if (template === "horizontal") {
                return (
                  <div key={student.id} className="student-id-card template-horizontal">
                    <div className="card-sidebar" style={{ backgroundColor: themeColor }}>STUDENT ID</div>
                    <div className="card-content">
                      <ImageWithBasePath src={profileImage} alt="Profile" className="card-photo" style={{ borderColor: themeColor }} />
                      <div className="card-details">
                        <div className="student-name">{fullName || "Unknown"}</div>
                        <div className="student-info"><span>Father:</span> <b>{student.fatherName || "N/A"}</b></div>
                        <div className="student-info"><span>Reg No:</span> <b>{student.studentNumber || "N/A"}</b></div>
                        {student.admissionNumber && student.admissionNumber !== 0 ? (
                          <div className="student-info"><span>Roll No:</span> <b>{student.admissionNumber}</b></div>
                        ) : null}
                        <div className="student-info"><span>Grade:</span> <b>{student.grade || "N/A"}</b></div>
                        <div className="student-info"><span>Section:</span> <b>{student.section || "N/A"}</b></div>
                      </div>
                      <div className="card-qr">
                        <QRCodeSVG value={student.studentNumber || "N/A"} size={45} />
                      </div>
                    </div>
                    <div className="card-footer text-center">
                      <div className="official-font" style={{ fontSize: '11px', lineHeight: '1.2' }}>Dar-E-Arqam {student.campusName || "Campus Manager"}</div>
                      <div style={{ fontSize: '7px', marginTop: '2px', color: '#555', fontFamily: 'sans-serif', letterSpacing: '0.2px' }}>Powered by Dev Prism (Pvt) Ltd.</div>
                    </div>
                  </div>
                );
              }

              // Default to Vertical
              return (
                <div key={student.id} className="student-id-card template-vertical">
                  <div className="card-header" style={{ backgroundColor: themeColor }}>STUDENT ID</div>
                  <ImageWithBasePath src={profileImage} alt="Profile" className="card-photo" style={{ borderColor: themeColor }} />
                  <div className="card-body">
                    <div className="student-name">{fullName || "Unknown"}</div>
                    <div className="student-info"><span>Father:</span> <b>{student.fatherName || "N/A"}</b></div>
                    <div className="student-info"><span>Reg No:</span> <b>{student.studentNumber || "N/A"}</b></div>
                    {student.admissionNumber && student.admissionNumber !== 0 ? (
                      <div className="student-info"><span>Roll No:</span> <b>{student.admissionNumber}</b></div>
                    ) : null}
                    <div className="student-info"><span>Grade:</span> <b>{student.grade || "N/A"}</b></div>
                    <div className="student-info"><span>Section:</span> <b>{student.section || "N/A"}</b></div>
                    <div className="mt-1 d-flex justify-content-center pb-1">
                      <QRCodeSVG value={student.studentNumber || "N/A"} size={45} />
                    </div>
                  </div>
                  <div className="card-footer text-center">
                    <div className="official-font" style={{ fontSize: '11px', lineHeight: '1.2' }}>Dar-E-Arqam {student.campusName || "Campus Manager"}</div>
                    <div style={{ fontSize: '7px', marginTop: '2px', color: '#555', fontFamily: 'sans-serif', letterSpacing: '0.2px' }}>Powered by Dev Prism (Pvt) Ltd.</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="alert alert-info no-print text-center">
            {loading ? "Loading students..." : "Please select filters and search to generate ID cards."}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
