import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import { GetAdmission } from "../../../../store/apps/admissions";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store";
import { GetFeeByGradeSession } from "../../../../store/apps/fee-structure";


const StudentFeeDiscount = () => {
    const routes = all_routes;
    const { id } = useParams<{ id: string }>();
    const studentId = Number(id);
    const { single, loading } = useSelector((state: RootState) => state.admissions);
    const { data: feeStructures } = useSelector((state: RootState) => state.feeStructure);
    const [feeStructureDetails, setFeeStructureDetails] = useState<any>({
        feeName: '',
        amount: 0
    })
    // Access the first element of the array before mapping the details
    const mergedFees = feeStructures[0]?.tblSMSFeeStructureDetails?.map(fee => {
        const discount = single?.admissionDiscountList?.find(
            (d: any) => Number(d.feeTypeId) === Number(fee.feeTypeId)
        );
        const dAmount = discount?.discountAmount || 0;
        return {
            ...fee,
            discountName: discount ? discount.discountTypeName : "No Discount",
            discountAmount: dAmount,
            netAmount: fee.amount - dAmount
        };
    }) || []; // Fallback to empty array if data is missing
    const totalGross = mergedFees.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalDiscount = mergedFees.reduce((acc, curr) => acc + (curr.discountAmount || 0), 0);
    const totalNet = totalGross - totalDiscount;
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        dispatch(GetAdmission(studentId))
    }, [dispatch, studentId])

    useEffect(() => {
        if (single?.campusId && single?.sessionId && single?.gradeId) {
            const body = {
                campusId: single.campusId,
                sessionId: single.sessionId,
                gradeId: single.gradeId
            };
            // Ensure this is dispatched if it's a Redux action
            dispatch(GetFeeByGradeSession(body));
        }
    }, [dispatch, single?.campusId, single?.sessionId, single?.gradeId]);

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
                                            <Link to={`/student/student-fee-discount/${studentId}`} className="nav-link active">
                                                <i className="ti ti-table-options me-2" />
                                                Student Fee
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/student/student-fees/${studentId}`} className="nav-link">
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
                                            <h4 className="mb-3">Fee Discount</h4>
                                            <div className="d-flex align-items-center flex-wrap">
                                                {/* <div className="dropdown mb-3 me-2">
                                                    <Link
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
                                                    </ul>
                                                </div> */}
                                            </div>
                                        </div>
                                        <div className="card-body p-0 py-3">
                                            {/* Fees List */}
                                            <div className="custom-datatable-filter table-responsive">
                                                <table className="table datatable">
                                                    <thead className="thead-light">
                                                        <tr>
                                                            <th>Fee Type</th>
                                                            <th>Amount</th>
                                                            <th>Discount Type</th>
                                                            <th>Discount %</th>

                                                            <th>Cur. Fee</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {mergedFees?.map((fee: any) => (
                                                            <tr key={fee.feeTypeId}>
                                                                <td>
                                                                    <p className="text-primary fees-group">
                                                                        {fee?.tblSMSFeeType?.name || 'N/A'}
                                                                    </p>
                                                                </td>
                                                                <td>{fee.amount}</td>
                                                                <td>{fee.discountName}</td>
                                                                <td>{fee.discountAmount}</td>

                                                                <td>{fee.netAmount}</td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <th className="text-success">
                                                                Total
                                                            </th>
                                                            <th className="text-danger">{totalGross}</th>
                                                            <td>-</td>
                                                            <th className="text-success">{totalDiscount}</th>
                                                            <th className="text-success">{totalNet}</th>
                                                        </tr>


                                                    </tbody>
                                                </table>
                                            </div>
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

export default StudentFeeDiscount;
