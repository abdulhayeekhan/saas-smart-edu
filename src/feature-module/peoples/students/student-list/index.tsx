import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { Studentlist } from "../../../../core/data/json/studentList";
import { AdmissionTableData } from "../../../../core/data/interface";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import StudentModals from "../studentModals";
import Table from "../../../../core/common/dataTable2/index";
import PredefinedDateRanges from "../../../../core/common/datePicker";
import {
  allClass,
  allSection,
  gender,
  names,
  status,
} from "../../../../core/common/selectoption/selectoption";
import dayjs from "dayjs";
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList"
import CommonSelect from "../../../../core/common/commonSelect";
import { useAcademicGrades } from "../../../../core/common/selectoption/academic/useAcademicGrades";
import CommonSelect2 from "../../../../core/common/commonSelect2";
import TooltipOption from "../../../../core/common/tooltipOption";
import { exportToPDF } from "../../../../core/common/exportUtils";
import { AdmissionFilter, Admission, GetAdmissions, resetAdmissionState } from '../../../../store/apps/admissions';
import { useSectionList } from '../../../../core/common/selectoption/academic/useSections';
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { Pagination, Tooltip } from "antd";
import CommonSelect3 from "../../../../core/common/commonSelect3";
import StudentFeeModel from "../student-details/editFee"
import { Popover } from "antd";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const StudentList = () => {
  const routes = all_routes;
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data
  const [regionId, setRegionId] = useState<number>(0);
  const grades = useAcademicGrades();

  const regionsList = useRegionsList();
  const statusOptions = [
    { value: 'all', label: "All Status" },
    { value: 'true', label: "Active" },
    { value: 'false', label: "Inactive" }
  ];
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const dispatch = useDispatch<AppDispatch>()
  const { data: datalist, totalCount, totalPages, currentPage, loading } = useSelector((state: RootState) => state.admissions);

  const [pageNo, setPageNo] = useState<number>(currentPage);
  const [pageSize, setPageSize] = useState<number>(25)
  const [search, setSearch] = useState<string>('');
  const [gradeId, setGradeId] = useState<number | null>(null)
  const [sectionId, setSectionId] = useState<number | null>(null)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [campusId, setCampusId] = useState(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null)
  const sections = useSectionList(campusId);
  useEffect(() => {
    const filter = {
      pageNo,
      pageSize: pageSize,
      search: search,
      gradeId,
      sectionId,
      campusId,
      isEnabled
    };
    dispatch(GetAdmissions(filter));
  }, [dispatch, pageNo, pageSize, search, gradeId, sectionId, campusId, isEnabled]);

  useEffect(() => {
    return () => {
      dispatch(resetAdmissionState());
    };
  }, [dispatch]);

  //const data = Studentlist;
  const handleTableChange = (page: number, pageSize?: number) => {
    setPageNo(page)
  };

  const handleExportPDF = () => {
    exportToPDF("Student List", columns as any, datalist);
  };

  const handleRegionId = async (value: any) => {
    await setRegionId(value)
    await setPageNo(1)
  }
  const handleCampusId = async (value: any) => {
    await setCampusId(value)
    await setPageNo(1)
  }
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  const columns = useMemo(() => [
    {
      title: "S.No",
      key: "serialNumber",
      width: 70,
      render: (_: any, __: any, index: number) => {
        // Formula: (Current Page - 1) * Page Size + (Index of row + 1)
        // return (pageNo - 1) * pageSize + (index + 1);
        const safePageNo = pageNo < 1 ? 1 : pageNo;
        return (safePageNo - 1) * pageSize + (index + 1);
      },
    },
    ...(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2
      ? [
        {
          title: "Campus",
          dataIndex: "campusName",
          sorter: (a: AdmissionTableData, b: AdmissionTableData) =>
            a.campusName.length - b.campusName.length,
        }]
      : []),
    {
      title: "Roll No",
      dataIndex: "studentNumber",
      render: (text: string, record: AdmissionTableData) => (
        <Link to={`/student/student-details/${record.id}`} className="link-primary">
          {text}
        </Link>
      ),
      sorter: (a: AdmissionTableData, b: AdmissionTableData) =>
        a.studentNumber.length - b.studentNumber.length,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (_: string, record: AdmissionTableData) => {
        // 1. Create an array of existing names
        // 2. Filter out anything that is null, undefined, or an empty string
        // 3. Join them with a space
        const fullName = [
          record?.firstName,
          record?.middleName,
          record?.lastName
        ].filter(Boolean).join(" ");

        return (
          <div className="d-flex align-items-center">
            <div className="ms-2">
              <p className="text-dark mb-0">
                <div className="d-flex align-items-center">
                  <Link to={`/student/student-details/${record.id}`}>
                    <ImageWithBasePath
                      //src="assets/img/students/student-01.jpg"
                      src={
                        record?.imageUrl
                          ? `${baseURL}/${record.imageUrl}`
                          : "assets/img/students/student-01.jpg"
                      }
                      alt="Profile"
                      className="rounded-circle"
                      width={35}
                      height={35}
                    />
                  </Link>
                  <div className="ms-2">
                    <Link to={`/student/student-details/${record.id}`}>
                      <h6 className="mb-0">{fullName || "No Name"}</h6></Link>
                  </div>
                </div>
              </p>
            </div>
          </div>
        );
      },
      // Use optional chaining in the sorter to prevent crashes if firstName is null
      sorter: (a: AdmissionTableData, b: AdmissionTableData) =>
        (a.firstName || "").localeCompare(b.firstName || ""),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      sorter: (a: AdmissionTableData, b: AdmissionTableData) => a.grade.length - b.grade.length,
    },
    {
      title: "Section",
      dataIndex: "section",
      sorter: (a: AdmissionTableData, b: AdmissionTableData) =>
        a.section.length - b.section.length,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      // 1. Logic to display "Boy" or "Girl" instead of 1 or 2
      render: (gender: number) => (gender === 1 ? "Boy" : "Girl"),

      // 2. Logic to sort by number (1 vs 2)
      sorter: (a: AdmissionTableData, b: AdmissionTableData) => a.gender - b.gender,
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <>
          {text === "admission" ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              {text}
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              {text}
            </span>
          )}
        </>
      ),
      sorter: (a: AdmissionTableData, b: AdmissionTableData) => a.status.length - b.status.length,
    },
    {
      title: "DOB",
      dataIndex: "dateOfBirth",
      render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
      sorter: (a: AdmissionTableData, b: AdmissionTableData) =>
        dayjs(a.dateOfBirth).unix() - dayjs(b.dateOfBirth).unix(),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: AdmissionTableData) => (
        <>
          <div className="d-flex align-items-center">
            {/* Chat Tooltip */}


            {/* Phone Tooltip */}
            <Popover content={<b>{record.contactNumber || "No Number"}</b>} title="Contact Number" trigger="click">
              <Link
                to="#"
                className="btn btn-outline-light bg-white btn-icon d-flex align-items-center justify-content-center rounded-circle p-0 me-2"
                onClick={(e) => e.preventDefault()} // Prevent page jump
              >
                <i className="ti ti-phone" />
              </Link>
            </Popover>

            {/* Email Tooltip */}
            <Popover content={<b>{record.email || "No Email Address"}</b>} title="Email Address" trigger="click">
              <Link
                to="#"
                className="btn btn-outline-light bg-white btn-icon d-flex align-items-center justify-content-center rounded-circle p-0 me-3"
              >
                <i className="ti ti-mail" />
              </Link>
            </Popover>
            {/* <Link
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#add_fees_collect"
              className="btn btn-light fs-12 fw-semibold me-3"
            >
              Collect Fees
            </Link> */}

            {/* ... rest of your dropdown code ... */}
          </div>
        </>
      ),
    },
  ], [pageNo, pageSize]);
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Students List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Students</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    All Students
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              {/* <TooltipOption /> */}


              <div className="mb-2">
                {/* <Link
                  to={routes.addStudent}
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-square-rounded-plus me-2" />
                  Add Student
                </Link> */}
              </div>

            </div>
          </div>
          {/* /Page Header */}
          {/* Students List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Students List {totalCount ? `(${totalCount})` : ''}</h4>
              <div className="d-flex align-items-center flex-wrap">
                {loginInfo?.userLevel === 1 && (
                  <div className="me-3 mb-3" style={{ minWidth: "150px" }}>
                    <CommonSelect3
                      className="select"
                      options={regionsList}
                      onChange={(selected) =>
                        handleRegionId(selected?.value || null)
                      }
                      value={regionId ? regionsList.find(r => r.value === regionId) : regionsList[0]}
                      placeholder="Select Region"
                    />
                  </div>
                )}
                {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                  <div className="me-3 mb-3" style={{ minWidth: "150px" }}>
                    <CommonSelect3
                      className="select"
                      options={campuses}
                      onChange={(selected) =>
                        handleCampusId(selected?.value || null)
                      }
                      value={campusId ? campuses?.find(r => r.value === campusId) : campuses[0]}
                      placeholder="Select Campus"
                    />
                  </div>
                )}
                <div className="me-3 mb-3" style={{ minWidth: "150px" }}>
                  <CommonSelect3
                    options={statusOptions}
                    name="isActive"
                    value={statusOptions.find((o) => o.value === (isEnabled ? 'true' : 'false')) || statusOptions[1]}
                    onChange={(opt) => setIsEnabled(opt?.value === 'all' ? true : opt?.value === 'true')}
                    placeholder="Select Status"
                  />
                </div>
                <TooltipOption 
                   onExportPDF={handleExportPDF} 
                   onRefresh={() => dispatch(GetAdmissions({ pageNo, pageSize, search, gradeId, sectionId, campusId, isEnabled }))} 
                   onPrint={() => window.print()} 
                />
                <div className="dropdown mb-3 me-2">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <i className="ti ti-filter me-2" />
                    Filter
                  </Link>
                  <div
                    className="dropdown-menu drop-width"
                    ref={dropdownMenuRef}
                  >
                    <form>
                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 pb-0 border-bottom">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Search</label>
                              <input type="text" name="search" placeholder="Search Student" className="form-control" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Class</label>
                              <CommonSelect3
                                className="select"
                                options={grades}
                                value={gradeId ? grades.find(g => g.value === gradeId) : grades[0]}
                                onChange={(selected) => {
                                  // 1. Check if selected exists
                                  // 2. Convert value to Number to satisfy setGradeId(number | null)
                                  const val = selected?.value;
                                  setGradeId(val !== undefined && val !== null ? Number(val) : null);
                                }}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Section</label>
                              <CommonSelect3
                                className="select"
                                options={sections}
                                value={sectionId ? sections?.find(s => s.value === sectionId) : sections[0]}
                                onChange={(selected) => {
                                  const val = selected?.value;
                                  setSectionId(val !== undefined && val !== null ? Number(val) : null);
                                }}
                              />
                            </div>
                          </div>
                          {/* <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Gender</label>
                              <CommonSelect2
                                className="select"
                                options={gender}
                                defaultValue={gender[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Status</label>
                              <CommonSelect
                                className="select"
                                options={status}
                                defaultValue={status[0]}
                              />
                            </div>
                          </div> */}
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        {/* <Link to="#" className="btn btn-light me-3">
                          Reset
                        </Link> */}
                        {/* <Link
                          to={routes.studentGrid}
                          className="btn btn-primary"
                          onClick={handleApplyClick}
                        >
                          Apply
                        </Link> */}
                      </div>
                    </form>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-white border rounded-2 p-1 mb-3 me-2">
                  <Link
                    to={routes.studentList}
                    className="active btn btn-icon btn-sm me-1 primary-hover"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  {/* <Link
                    to={routes.studentGrid}
                    className="btn btn-icon btn-sm bg-light primary-hover"
                  >
                    <i className="ti ti-grid-dots" />
                  </Link> */}
                </div>
                <div className="dropdown mb-3">
                  {/* <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />
                    Sort by A-Z
                  </Link> */}
                  <ul className="dropdown-menu p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1 active">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Viewed
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              <div className="table-top-data d-flex px-3 justify-content-between">
                <div className="page-range"></div>
                <div className="serch-global text-right">
                  <input
                    type="search"
                    className="form-control form-control-sm mb-3 w-auto float-end"
                    placeholder="Search"
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    aria-controls="DataTables_Table_0"
                  />
                </div>
              </div>
              {/* Student List */}
              <Table dataSource={datalist} columns={columns} Selection={true} loading={loading} />
              {/* /Student List */}
              <div className="mt-5 d-flex justify-content-end">
                <Pagination
                  current={pageNo}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handleTableChange}
                  showSizeChanger={false} // This enables the dropdown
                  pageSizeOptions={["10", "25", "50", "100"]} // Custom options
                  locale={{ items_per_page: "per page" }} // Optional: shortens the text
                />
              </div>
            </div>
          </div>
          {/* /Students List */}
        </div>
      </div>
      {/* /Page Wrapper */}
      <StudentModals />
    </>
  );
};

export default StudentList;
