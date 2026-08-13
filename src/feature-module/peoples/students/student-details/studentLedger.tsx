import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { GetStudentLedgerReport, clearStudentLedgerReport } from '../../../../store/apps/academic-reports';
import StudentSidebar from './studentSidebar';
import StudentBreadcrumb from './studentBreadcrumb';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker, Table } from 'antd';
const { RangePicker } = DatePicker;

const StudentLedger = () => {
    const { id } = useParams<{ id: string }>();
    const studentId = Number(id);
    const dispatch = useDispatch<AppDispatch>();

    const { studentLedgerReport, loading } = useSelector((state: RootState) => state.academicReport);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        if (studentId) {
            dispatch(GetStudentLedgerReport({
                admissionId: studentId,
                fromDate: dateRange[0].format('YYYY-MM-DD'),
                toDate: dateRange[1].format('YYYY-MM-DD'),
                pageNo: pageNo,
                pageSize: pageSize
            }));
        }
        return () => {
            dispatch(clearStudentLedgerReport());
        };
    }, [dispatch, studentId, dateRange, pageNo, pageSize]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text: string) => dayjs(text).format('DD-MMM-YYYY'),
        },
        {
            title: 'Voucher No',
            dataIndex: 'voucherNumber',
            key: 'voucherNumber',
        },
        {
            title: 'Type',
            dataIndex: 'voucherType',
            key: 'voucherType',
            render: (text: string) => <span className="text-capitalize">{text}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Debit',
            dataIndex: 'debit',
            key: 'debit',
            className: 'text-danger',
            render: (value: number) => value > 0 ? value.toLocaleString() : '-',
        },
        {
            title: 'Credit',
            dataIndex: 'credit',
            key: 'credit',
            className: 'text-success',
            render: (value: number) => value > 0 ? value.toLocaleString() : '-',
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            render: (value: number) => <strong>{value.toLocaleString()}</strong>,
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="row">
                    <StudentBreadcrumb studentId={studentId} />
                </div>
                <div className="row">
                    <StudentSidebar studentId={studentId} />
                    <div className="col-xxl-9 col-xl-8">
                        <div className="row">
                            <div className="col-md-12">
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
                                        <Link to={`/student/student-fees/${studentId}`} className="nav-link">
                                            <i className="ti ti-report-money me-2" />
                                            Fees History
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`/student/student-ledger/${studentId}`} className="nav-link active">
                                            <i className="ti ti-file-description me-2" />
                                            Student Ledger
                                        </Link>
                                    </li>
                                </ul>

                                <div className="card">
                                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                        <h4 className="card-title">Student Ledger</h4>
                                        <div className="d-flex align-items-center flex-wrap row-gap-3">
                                            <RangePicker
                                                className="form-control mb-0 me-2"
                                                value={dateRange}
                                                onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                                                format="DD-MMM-YYYY"
                                            />
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <Table
                                                columns={columns}
                                                dataSource={studentLedgerReport?.details || []}
                                                loading={loading}
                                                pagination={{
                                                    current: pageNo,
                                                    pageSize: pageSize,
                                                    total: studentLedgerReport?.totalCount || 0,
                                                    onChange: (page, size) => {
                                                        setPageNo(page);
                                                        setPageSize(size);
                                                    },
                                                    showSizeChanger: true,
                                                }}
                                                rowKey={(record, index) => index || 0}
                                                summary={() => (
                                                    <Table.Summary fixed>
                                                        <Table.Summary.Row className="bg-light">
                                                            <Table.Summary.Cell index={0} colSpan={6} className="text-end fw-bold">
                                                                Opening Balance:
                                                            </Table.Summary.Cell>
                                                            <Table.Summary.Cell index={1} className="fw-bold">
                                                                {studentLedgerReport?.openingBalance?.toLocaleString() || 0}
                                                            </Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    </Table.Summary>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLedger;
