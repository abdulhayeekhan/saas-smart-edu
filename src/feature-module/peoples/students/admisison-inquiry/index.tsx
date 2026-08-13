import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { Studentlist } from "../../../../core/data/json/studentList";
import { TableData } from "../../../../core/data/interface";
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
  usePermission,
} from "../../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList"
import dayjs from "dayjs";
import CommonSelect from "../../../../core/common/commonSelect";
import CommonSelect2 from "../../../../core/common/commonSelect2";
import CommonSelect3 from "../../../../core/common/commonSelect3";
import TooltipOption from "../../../../core/common/tooltipOption";
import { exportToPDF } from "../../../../core/common/exportUtils";
import { InquiryType, GetInquiries } from '../../../../store/apps/inquiry'
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { Popover } from "antd";
import { Pagination } from "antd";

const InquiryList = () => {
  const routes = all_routes;
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data
  const [regionId, setRegionId] = useState<number>(0);
  const regionsList = useRegionsList();
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const dispatch = useDispatch<AppDispatch>()
  const { data, totalCount, pageSize, currentPage, loading } = useSelector((state: RootState) => state.inquiry);
  const [pageNo, setPageNo] = useState(currentPage || 1);
  const [search, setSearch] = useState('');
  const [gradeId, setGradeId] = useState(0)
  const [campusId, setCampusId] = useState(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null)
  const hasPermission = usePermission("Inquiries");
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const filter = {
      pageNo,
      pageSize,
      search,
      campusId
    }
    dispatch(GetInquiries(filter))
  }, [pageNo, search, campusId])

  const handleTableChange = (page: number, size?: number) => {
    setPageNo(page)
    // If we wanted to dispatch size change, we could handle it here.
  };

  const handleExportPDF = () => {
    exportToPDF("Admission Inquiry List", columns as any, data);
  };
  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  const handleRegionId = async (value: any) => {
    await setRegionId(value)
    await setPageNo(1)
  }
  const handleCampusId = async (value: any) => {
    await setCampusId(value)
    await setPageNo(1)
  }
  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 70,
      render: (_: any, __: any, index: number) => {
        // Formula: (Current Page - 1) * Page Size + (Index of row + 1)
        return (pageNo - 1) * pageSize + (index + 1);
      },
    },
    ...(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2
      ? [
        {
          title: "Campus",
          dataIndex: "campusName",
          sorter: (a: TableData, b: TableData) => a.sessionName.length - b.sessionName.length,
        },
      ]
      : []),
    {
      title: "Inquiry No",
      dataIndex: "id",
      sorter: (a: TableData, b: TableData) =>
        a.id.length - b.id.length,
    },

    {
      title: "Session",
      dataIndex: "sessionName",
      sorter: (a: TableData, b: TableData) => a.sessionName.length - b.sessionName.length,
    },
    {
      title: "Name",
      key: "name",
      sorter: (a: InquiryType, b: InquiryType) => {
        const nameA = `${a.firstName} ${a.middleName ?? ""} ${a.familyName}`.trim()
        const nameB = `${b.firstName} ${b.middleName ?? ""} ${b.familyName}`.trim()
        return nameA.localeCompare(nameB)
      },
      render: (_: any, record: InquiryType) =>
        `${record.firstName} ${record.middleName ?? ""} ${record.familyName}`.trim(),
    },
    {
      title: "FatherName",
      dataIndex: "fatherName",
      sorter: (a: TableData, b: TableData) => a.fatherName.length - b.fatherName.length,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      sorter: (a: TableData, b: TableData) => a.grade.length - b.grade.length,
    },

    {
      title: "Date of Inquiry",
      dataIndex: "inquiryDate",
      render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
      sorter: (a: TableData, b: TableData) =>
        dayjs(a.inquiryDate).unix() - dayjs(b.inquiryDate).unix(),
    },


    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <>
          {text === "Admission" ? (
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
      sorter: (a: TableData, b: TableData) => a.status.length - b.status.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: InquiryType) => (
        <div className="d-flex align-items-center">
          {/* Phone Popover */}
          <Popover content={<b>{record.contactNumber || "No Number"}</b>} title="Contact Number" trigger="click">
            <Link
              to="#"
              className="btn btn-outline-light bg-white btn-icon d-flex align-items-center justify-content-center rounded-circle p-0 me-2"
              onClick={(e) => e.preventDefault()} // Prevent page jump
            >
              <i className="ti ti-phone" />
            </Link>
          </Popover>

          {/* Email Popover */}
          <Popover content={<b>{record.email || "No Email"}</b>} title="Email Address" trigger="click">
            <Link
              to="#"
              className="btn btn-outline-light bg-white btn-icon d-flex align-items-center justify-content-center rounded-circle p-0 me-3"
              onClick={(e) => e.preventDefault()}
            >
              <i className="ti ti-mail" />
            </Link>
          </Popover>
          {record.status !== "Admission" && (
            <Link to={`/student/add-student-admission/${record.id}`} className="btn btn-light fs-12 fw-semibold me-3">
              Admission Process
            </Link>
          )}

          {/* ... rest of your dropdown code ... */}
        </div>
      ),
    }
  ];
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Inquiries List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Students</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    All Inquiries
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {/* <TooltipOption /> */}

              <div className="mb-2">
                {hasPermission?.addRight && (
                  <Link
                    to={routes.addstudentInquiry}
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Inquiry
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Students List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Inquiries List</h4>
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
                <TooltipOption 
                  onExportPDF={handleExportPDF} 
                  onRefresh={() => dispatch(GetInquiries({ pageNo, pageSize, search, campusId }))} 
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


                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <Link to="#" className="btn btn-light me-3">
                          Reset
                        </Link>

                      </div>
                    </form>
                  </div>
                </div>
                {/* <div className="d-flex align-items-center bg-white border rounded-2 p-1 mb-3 me-2">
                  <Link
                    to={routes.studentList}
                    className="active btn btn-icon btn-sm me-1 primary-hover"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link
                    to={routes.studentGrid}
                    className="btn btn-icon btn-sm bg-light primary-hover"
                  >
                    <i className="ti ti-grid-dots" />
                  </Link>
                </div> */}
                <div className="dropdown mb-3">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />
                    Sort by A-Z
                  </Link>
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
              {/* Student List */}
              <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
              {/* /Student List */}
              <div className="mt-5 d-flex justify-content-end">
                <Pagination
                  current={pageNo}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handleTableChange}
                  // showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
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

export default InquiryList;
