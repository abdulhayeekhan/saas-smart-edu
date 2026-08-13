import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { Pagination, Tooltip } from "antd";
import { useAcademicSessions } from "../../../../core/common/selectoption/academic/useAcademicSessions";
import { GetFeeInvoices, FeeInvoiceFilter } from "../../../../store/apps/fee-invoice";
import CommonSelect3 from "../../../../core/common/commonSelect3"
import { Spin } from "antd";
import { useLastAcademicSession } from '../../../../core/common/selectoption/academic/useLastAcademicSession';

const StudentFees = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const academicYear = useAcademicSessions();
 
  const { data: datalist, totalCount, totalPages, currentPage, loading } = useSelector((state: RootState) => state.feeInvoice);

  const [pageNo, setPageNo] = useState<number>(currentPage);
  const [pageSize, setPageSize] = useState<number>(25)
  const [sessionId, setSessionId] = useState<string | number | null>(null);
   const { lastSessionId } = useLastAcademicSession();
  useEffect(() => {
    if (lastSessionId !== undefined && lastSessionId !== null) {
      setSessionId(lastSessionId);
    }
  }, [lastSessionId]);
  const [admissionId, setAdmissionId] = useState(studentId)
  const dispatch = useDispatch<AppDispatch>()
  console.log('sessionId:', sessionId)
  useEffect(() => {
    const filter: any = {
      pageNo,
      pageSize: pageSize
    };

    // 2. Helper function to only add valid values
    const addIfValid = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        filter[key] = value;
      }
    };
    // 3. Conditionally add your filters
    addIfValid('sessionId', sessionId);
    addIfValid('admissionId', admissionId);

    dispatch(GetFeeInvoices(filter as FeeInvoiceFilter))
  }, [pageNo, admissionId, sessionId])

  const handleTableChange = (page: number, pageSize?: number) => {
    setPageNo(page)
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            {/* Page Header */}
            <StudentBreadcrumb studentId={studentId} />
            {/* /Page Header */}
          </div>
          <div className="row">
            {/* Student Information */}
            <StudentSidebar studentId={studentId} />
            {/* /Student Information */}
            <div className="col-xxl-9 col-xl-8">
              <div className="row">
                <div className="col-md-12">
                  {/* List */}
                  <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                    <li>
                      <Link to={`/student/student-details/${studentId}`} className="nav-link">
                        <i className="ti ti-school me-2" />
                        Student Details
                      </Link>
                    </li>
                    <li>
                      <Link to={`/student/student-fee-discount/${studentId}`} className="nav-link">
                        <i className="ti ti-table-options me-2" />
                        Student Fee
                      </Link>
                    </li>
                    <li>
                      <Link to={`/student/student-fees/${studentId}`} className="nav-link active">
                        <i className="ti ti-report-money me-2" />
                        Fees History
                      </Link>
                    </li>
                    <li>
                      <Link to={`/student/student-ledger/${studentId}`} className="nav-link">
                        <i className="ti ti-file-description me-2" />
                        Student Ledger
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentTimeTable} className="nav-link disabled">
                        <i className="ti ti-table-options me-2" />
                        Time Table
                      </Link>
                    </li>

                    <li>
                      <Link to={routes.studentLeaves} className="nav-link disabled">
                        <i className="ti ti-calendar-due me-2" />
                        Leave &amp; Attendance
                      </Link>
                    </li>

                    <li>
                      <Link to={routes.studentResult} className="nav-link disabled">
                        <i className="ti ti-bookmark-edit me-2" />
                        Exam &amp; Results
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentLibrary} className="nav-link disabled">
                        <i className="ti ti-books me-2" />
                        Library
                      </Link>
                    </li>
                  </ul>
                  {/* /List */}
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                      <h4 className="mb-3">Fees</h4>
                      <div className="d-flex align-items-center flex-wrap">
                        <div className="dropdown mb-3 me-2">
                          <CommonSelect3
                            className="select"
                            options={academicYear}
                            value={sessionId ? academicYear?.find((y: any) => y.value === sessionId) || null : null}
                            onChange={(option) => {
                              // FIX: Check if option exists before accessing .value
                              if (option) {
                                setSessionId(option.value);
                              } else {
                                setSessionId(null);
                              }
                            }}
                          />
                          {/* <Link
                            to=""
                            className="btn btn-outline-light bg-white dropdown-toggle"
                            data-bs-toggle="dropdown"
                            data-bs-auto-close="outside"
                          >
                            <i className="ti ti-calendar-due me-2" />
                            Year : 2024 / 2025
                          </Link>
                          <ul className="dropdown-menu p-3">
                            <li>
                              <Link to="" className="dropdown-item rounded-1">
                                Year : 2024 / 2025
                              </Link>
                            </li>
                            <li>
                              <Link to="" className="dropdown-item rounded-1">
                                Year : 2023 / 2024
                              </Link>
                            </li>
                            <li>
                              <Link to="" className="dropdown-item rounded-1">
                                Year : 2022 / 2023
                              </Link>
                            </li>
                          </ul> */}
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0 py-3">
                      {/* Fees List */}
                      {loading ?
                        <div style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "50vh",
                          width: "100%",
                        }}><Spin size="small" /></div>
                        :
                        <div className="custom-datatable-filter table-responsive">

                          <table className="table datatable">
                            <thead className="thead-light">
                              <tr>
                                <th>Invoice Number</th>
                                <th>Month</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Discount%</th>
                                <th>Total Amount</th>
                                <th>Received Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {datalist?.map((data, index) => {
                                const start = dayjs(data.monthFrom);
                                const end = dayjs(data.monthTo);
                                const startLabel = start.format("MMM YYYY");
                                const endLabel = end.format("MMM YYYY");

                                // 2. Prepare Status Badge Logic
                                const statusMap: Record<string, { color: string; icon: string }> = {
                                  completed: { color: "success", icon: "ti-circle-check-filled" },
                                  partial: { color: "warning", icon: "ti-circle-half-2" },
                                  pending: { color: "danger", icon: "ti-circle-filled" },
                                };
                                const config = statusMap[data.status] || { color: "secondary", icon: "ti-circle" };
                                return (
                                  <tr>
                                    <th>{data?.invoiceNumber}</th>
                                    {/* Month / Period Column */}
                                    <td>
                                      {start.isSame(end, 'month') ? (
                                        <span className="text-dark fw-medium">
                                          {startLabel}
                                        </span>
                                      ) : (
                                        <span className="text-muted">
                                          <strong className="text-dark">{startLabel}</strong> to{" "}
                                          <strong className="text-dark">{endLabel}</strong>
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {data?.dueDate ? dayjs(data.dueDate).format("DD-MMM-YYYY") : "-"}
                                    </td>
                                    <td>{data?.totalAmount}</td>
                                    <td>{data?.totalDiscount}</td>
                                    <td>{data?.netAmount}</td>
                                    <td>{data?.amountReceived}</td>
                                    {/* Status Column */}
                                    <td>
                                      <span className={`badge badge-soft-${config.color} d-inline-flex align-items-center`}>
                                        <i className={`ti ${config.icon} fs-5 me-1`}></i>
                                        {data.status}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>


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
                      }
                      {/* /Fees List */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      <StudentModals />
    </>
  );
};

export default StudentFees;
