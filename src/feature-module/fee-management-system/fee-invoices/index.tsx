import React, { useEffect, useRef, useState } from "react";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import PredefinedDateRanges from "../../../core/common/datePicker";
import PredefinedDateRanges2 from "../../../core/common/datePicker2";
import PredefinedDateRanges3 from "../../../core/common/datePicker3";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect3 from "../../../core/common/commonSelect3";
import {
    DueDate,
    feeGroup,
    feesTypes,
    fineType,
    ids,
    feesStatuses,
    usePermission
} from "../../../core/common/selectoption/selectoption";
import { TableData } from "../../../core/data/interface";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList"
import dayjs from "dayjs";
import Table from "../../../core/common/dataTable2/index";
import { useAcademicSessions } from "../../../core/common/selectoption/academic/useAcademicSessions";
import FeesModal from "./feesModal";
import { feesMasterData } from "../../../core/data/json/feesMaster";
import TooltipOption from "../../../core/common/tooltipOption";
import { GetFeeInvoices, FeeInvoiceFilter, CancelInvoice, CancelInvoicePayload, DeleteReceipts, resetFeeInvoiceState } from "../../../store/apps/fee-invoice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { Modal, Pagination, Tooltip } from "antd";
import SingleFeeVoucher from "../single-fee-voucher";

interface VoucherDetail {
    feeName: string;
    remainingAmount: number;
}


interface StudentItem {
    id: number;
    campusName: string;
    invoiceNumber: string | number;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    fatherName: string;
    studentNumber: string;
    grade: string;
    invoiceDate: string | Date;
    dueDate: string | Date;
    totalDiscount: number;
    netAmount: number;
    details: VoucherDetail[];
}

const FeesInvoices = () => {
    const routes = all_routes;
    const userInfoString = localStorage.getItem("userData");
    const cancelPermission = usePermission("Cancel Fee Invoice");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data

    const [selectedInvoice, setSelectedInvoice] = useState<StudentItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = (invoice: StudentItem) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    const userLevel = Number(loginInfo?.userLevel || 0);
    const userLevelId = Number(loginInfo?.userLevelId || 0);
    const [regionId, setRegionId] = useState<number>(userLevel === 2 ? userLevelId : 0);

    const regionsList = useRegionsList();
    const campuses = useCampusesList(userLevel === 2 ? userLevelId : regionId);

    const academicYear = useAcademicSessions();

    const { data: datalist, totalCount, totalPages, currentPage, loading } = useSelector((state: RootState) => state.feeInvoice);
    const dispatch = useDispatch<AppDispatch>()
    const grades = useAcademicGrades();

    const [pageNo, setPageNo] = useState<number>(currentPage);
    const [pageSize, setPageSize] = useState<number>(25)
    const [gradeId, setGradeId] = useState(grades[0]?.value || null);
    const [sessionId, setSessionId] = useState<string | number | null>(null);
    const [campusId, setCampusId] = useState<number | null>(userLevel === 3 ? userLevelId : null)
    const [admissionId, setAdmissionId] = useState(null)
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [status, setStatus] = useState('');
    const [cancelId, setCancelId] = useState(0)

    const isSuperAdmin =
        loginInfo?.roleName?.toLowerCase()?.replace(/\s+/g, '') === 'superadmin' ||
        loginInfo?.userLevel === 1 ||
        loginInfo?.roleId === 1;

    const [deleteReceiptTarget, setDeleteReceiptTarget] = useState<{ campusId: number | string; invoiceNumber: number | string; studentName?: string } | null>(null);
    const [isDeleteReceiptModalOpen, setIsDeleteReceiptModalOpen] = useState(false);
    const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);

    const handleDeleteReceiptClick = (record: any) => {
        setDeleteReceiptTarget({
            campusId: record.campusId,
            invoiceNumber: record.invoiceNumber,
            studentName: `${record.firstName || ''} ${record.lastName || ''}`.trim()
        });
        setIsDeleteReceiptModalOpen(true);
    };

    const handleConfirmDeleteReceipt = async () => {
        if (!deleteReceiptTarget) return;
        setIsDeletingReceipt(true);
        try {
            const res = await dispatch(DeleteReceipts({
                campusId: deleteReceiptTarget.campusId,
                invoiceNumber: deleteReceiptTarget.invoiceNumber
            }));
            if (DeleteReceipts.fulfilled.match(res)) {
                setIsDeleteReceiptModalOpen(false);
                setDeleteReceiptTarget(null);
                const filter: any = { pageNo, pageSize };
                if (gradeId) filter.gradeId = gradeId;
                if (sessionId) filter.sessionId = sessionId;
                if (campusId && Number(campusId) > 0) {
                    filter.campusId = Number(campusId);
                } else if (userLevel === 2 && userLevelId) {
                    filter.regionId = userLevelId;
                } else if (userLevel === 1 && regionId && Number(regionId) > 0) {
                    filter.regionId = Number(regionId);
                }
                if (admissionId) filter.admissionId = admissionId;
                if (dateFrom) filter.dateFrom = dateFrom;
                if (dateTo) filter.dateTo = dateTo;
                if (status) filter.status = status;
                dispatch(GetFeeInvoices(filter as FeeInvoiceFilter));
            }
        } catch (error) {
            console.error("Delete receipt error:", error);
        } finally {
            setIsDeletingReceipt(false);
        }
    };

    const handleDateChange = (start: string, end: string) => {
        setDateFrom(start);
        setDateTo(end);
    };

    const handleRegionId = async (value: any) => {
        await setRegionId(value)
        await setPageNo(1)
    }
    const handleCampusId = async (value: any) => {
        await setCampusId(value)
        await setPageNo(1)
    }

    useEffect(() => {
        if (userLevel === 2 && (!campusId || Number(campusId) <= 0)) {
            dispatch(resetFeeInvoiceState());
            return;
        }

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
        addIfValid('gradeId', gradeId);
        addIfValid('sessionId', sessionId);

        if (campusId && Number(campusId) > 0) {
            filter.campusId = Number(campusId);
        } else if (userLevel === 1 && regionId && Number(regionId) > 0) {
            filter.regionId = Number(regionId);
        }

        addIfValid('admissionId', admissionId);
        addIfValid('dateFrom', dateFrom);
        addIfValid('dateTo', dateTo);
        addIfValid('status', status);
        dispatch(GetFeeInvoices(filter as FeeInvoiceFilter))
    }, [dispatch, pageNo, pageSize, gradeId, sessionId, campusId, regionId, userLevel, userLevelId, admissionId, dateFrom, dateTo, status])
    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
    const data = feesMasterData;
    const handleApplyClick = () => {
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };
    const handleTableChange = (page: number, pageSize?: number) => {
        setPageNo(page)
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "studentNumber",
            render: (text: string, record: any) => {
                // If admissionId is missing, return just the text or a placeholder
                if (!record.admissionId) {
                    return <span className="text-muted">{text}</span>;
                }

                return (
                    <Link
                        to={`/student/student-fees/${record.admissionId}`}
                        className="link-primary fw-medium"
                    >
                        {text}
                    </Link>
                );
            },
            // Fixed sorter: comparing string lengths is risky; 
            // localeCompare is better for alphanumeric IDs.
            sorter: (a: any, b: any) => a.studentNumber.localeCompare(b.studentNumber),
        },
        {
            title: "Name",
            dataIndex: "firstName",
            sorter: (a: TableData, b: TableData) =>
                a.firstName.length - b.firstName.length,
        },
        {
            title: "Grade",
            dataIndex: "grade",
            sorter: (a: TableData, b: TableData) =>
                a.grade.length - b.grade.length,
        },
        {
            title: "Invoice Number",
            dataIndex: "invoiceNumber",

            onCell: () => ({
                style: {
                    backgroundColor: '#fffbe6', // Light yellow highlight
                    fontWeight: 'bold',
                    color: '#d46b08'
                },
            }),
            render: (_: any, record: any) => {
                return (
                    <Link
                        to={`/fee-management-system/single-fee-print/${record.id}`}
                        className="link-primary fw-medium"
                    >
                        {record.invoiceNumber}
                    </Link>
                );
            },
            sorter: (a: TableData, b: TableData) =>
                a.invoiceNumber.length - b.invoiceNumber.length,
        },
        {
            title: "Month",
            key: "period",
            render: (record: any) => {
                const start = dayjs(record.monthFrom);
                const end = dayjs(record.monthTo);

                // Format for display (e.g., "Feb 2026")
                const startLabel = start.format("MMM YYYY");
                const endLabel = end.format("MMM YYYY");

                // Check if it's the same month and year
                if (start.isSame(end, 'month')) {
                    return (
                        <span className="text-dark fw-medium">
                            <strong className="text-dark">{startLabel}</strong>
                        </span>
                    );
                }

                // Otherwise, show the range
                return (
                    <span className="text-muted">
                        <strong className="text-dark">{startLabel}</strong> to <strong className="text-dark">{endLabel}</strong>
                    </span>
                );
            }
        },

        {
            title: "Due Date",
            dataIndex: "dueDate",
            render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
            sorter: (a: TableData, b: TableData) =>
                dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
        },
        {
            title: "Amount",
            dataIndex: "totalAmount",
            sorter: (a: TableData, b: TableData) =>
                a.totalAmount.length - b.totalAmount.length,
        },
        {
            title: "Discount%",
            dataIndex: "totalDiscount"
        },
        {
            title: "Total Amount",
            dataIndex: "netAmount",
            onCell: () => ({
                style: {
                    backgroundColor: '#fffbe6', // Light yellow highlight
                    fontWeight: 'bold',
                    color: '#d46b08'
                },
            }),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text: string) => {
                const statusMap: Record<string, { color: string; icon: string; className: string }> = {
                    completed: { color: "#008a00", icon: "ti-circle-check-filled", className: "bg-success" },
                    partial: { color: "#ff8c00", icon: "ti-circle-half-2", className: "bg-warning" },
                    pending: { color: "#6c757d", icon: "ti-circle-filled", className: "bg-secondary" },
                    forward: { color: "#7b1fa2", icon: "ti-share-forward-fill", className: "bg-info" },
                    cancel: { color: "#e63946", icon: "ti-circle-x-filled", className: "bg-danger" },
                    Cancelled: { color: "#e63946", icon: "ti-circle-x-filled", className: "bg-danger" },
                };

                const config = statusMap[text] || { color: "secondary", icon: "ti-circle", className: "bg-secondary" };

                return (
                    <span 
                        className={`badge ${config.className} d-inline-flex align-items-center`}
                        style={{ 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                         }}
                    >
                        <i className={`ti ${config.icon} fs-5 me-1`}></i>
                        {text}
                    </span>
                );
            },
            // Updated sorter to alphabetical for better UX
            sorter: (a: TableData, b: TableData) => a.status.localeCompare(b.status),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_: any, record: any) => {
                // Define logic for this specific row
                const canPrint = record.status === "pending" || record.status === "partial";
                const canCancel = record.status === "pending" && cancelPermission?.deleteRight;
                const canDeleteReceipt = isSuperAdmin;

                // If this specific row has no actions, show nothing in the cell
                if (!canPrint && !canCancel && !canDeleteReceipt) return null;

                return (
                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <Link
                                to="#"
                                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="ti ti-dots-vertical fs-14" />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-right p-3">
                                {canPrint && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            // target="_blank"
                                            to={`/fee-management-system/single-fee-print/${record.id}`}
                                        //onClick={() => showModal(record)}
                                        >
                                            <i className="ti ti-printer me-2 text-primary fs-16" />
                                            Print Invoice
                                        </Link>
                                    </li>
                                )}

                                {canCancel && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#delete-modal"
                                            onClick={() => setCancelId(record.id)}
                                        >
                                            <i className="ti ti-trash-x me-2 text-danger fs-16" />
                                            Cancel
                                        </Link>
                                    </li>
                                )}

                                {canDeleteReceipt && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1 text-danger"
                                            to="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteReceiptClick(record);
                                            }}
                                        >
                                            <i className="ti ti-trash me-2 text-danger fs-16" />
                                            Delete Receipt
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                );
            },
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
                            <h3 className="page-title mb-1">Fee Invoices</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>

                                    <li className="breadcrumb-item active" aria-current="page">
                                        Fee Invoices
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            <div className="mb-2">
                                <Link
                                    to={routes.bulkFeePrint}
                                    className="btn btn-primary"
                                // data-bs-toggle="modal"
                                // data-bs-target="#add_fees_master"
                                >
                                    <i className="ti ti-printer me-2 fs-18" />
                                    Print Bulk Fee Invoices
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Students List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Fee Invoices {totalCount ? `(${totalCount})` : ''}</h4>
                            <div className="d-flex align-items-center flex-wrap">

                                <div className="input-icon-start mb-3 me-2 position-relative">
                                    <div className="mb-6">
                                        <CommonSelect3
                                            className="select"
                                            options={grades}
                                            onChange={(selected) => setGradeId(selected?.value || null)}
                                            value={gradeId ? grades?.find(r => r.value === gradeId) : grades[0]}
                                        />
                                    </div>
                                </div>
                                <div className="input-icon-start mb-3 me-2 position-relative">
                                    <div style={{ position: 'relative', width: '100%' }}>

                                        <CommonSelect3
                                            className="select"
                                            options={feesStatuses}
                                            value={status ? feesStatuses.find(s => s.value === status) : feesStatuses[0]}
                                            onChange={(selected) => {
                                                // selected will be { value: "", label: "SELECT STATUS" } or other objects
                                                setStatus(selected?.value || '');
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="input-icon-start mb-3 me-2 position-relative">
                                    <PredefinedDateRanges3 onDateChange={handleDateChange} />
                                </div>


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
                                            <div className="p-3 border-bottom">
                                                <div className="row">
                                                    {/* <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">ID</label>
                                                            <CommonSelect
                                                                className="select"
                                                                options={ids}
                                                                defaultValue={ids[0]}
                                                            />
                                                        </div>
                                                    </div> */}
                                                    {loginInfo?.userLevel === 1 && (
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label className="form-label">Region</label>
                                                                <CommonSelect3
                                                                    className="select"
                                                                    options={regionsList}
                                                                    onChange={(selected) =>
                                                                        handleRegionId(selected?.value || null)
                                                                    }
                                                                    value={regionId ? regionsList.find(r => r.value === regionId) : regionsList[0]}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label className="form-label">Campus</label>
                                                                <CommonSelect3
                                                                    className="select"
                                                                    options={campuses}
                                                                    onChange={(selected) =>
                                                                        handleCampusId(selected?.value || null)
                                                                    }
                                                                    value={campusId ? campuses?.find(r => r.value === campusId) : campuses[0]}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Session</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={academicYear}
                                                                onChange={(selected) => setSessionId(selected?.value || null)}
                                                                value={sessionId
                                                                    ? academicYear?.find((r: { value: string | number; label: string }) => r.value === sessionId)
                                                                    : academicYear[0]
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Grade</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={grades}
                                                                onChange={(selected) => setGradeId(selected?.value || null)}
                                                                value={gradeId ? grades?.find(r => r.value === gradeId) : grades[0]}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Status</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={feesStatuses}
                                                                value={status ? feesStatuses.find(s => s.value === status) : feesStatuses[0]}
                                                                onChange={(selected) => {
                                                                    // selected will be { value: "", label: "SELECT STATUS" } or other objects
                                                                    setStatus(selected?.value || '');
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Fine Type</label>
                                                            <CommonSelect
                                                                className="select"
                                                                options={fineType}
                                                                defaultValue={undefined}
                                                            />
                                                        </div>
                                                    </div> */}
                                                    {/* <div className="col-md-6">
                                                        <div className="mb-0">
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
                                            {/* <div className="p-3 d-flex align-items-center justify-content-end">
                                                <Link to="#" className="btn btn-light me-3">
                                                    Reset
                                                </Link>
                                                <Link
                                                    to="#"
                                                    className="btn btn-primary"
                                                    onClick={handleApplyClick}
                                                >
                                                    Apply
                                                </Link>
                                            </div> */}
                                        </form>
                                    </div>
                                </div>
                                {/* <div className="dropdown mb-3">
                                    <Link
                                        to="#"
                                        className="btn btn-outline-light bg-white dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                    >
                                        <i className="ti ti-sort-ascending-2 me-2" />
                                        Sort by A-Z{" "}
                                    </Link>
                                    <ul className="dropdown-menu p-3">
                                        <li>
                                            <Link to="#" className="dropdown-item rounded-1">
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
                                </div> */}
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
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
            <FeesModal isDeleted={cancelId} />

            <Modal
                title="Fee Voucher"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null} // We use the print button inside the component
                width={1200} // Set width to accommodate landscape voucher
                destroyOnClose={true} // Ensures component resets on close
            >
                {selectedInvoice && (
                    <SingleFeeVoucher data={selectedInvoice} />
                )}
            </Modal>

            {/* Delete Receipt Confirmation Modal for SuperAdmin */}
            <Modal
                title={
                    <div className="d-flex align-items-center gap-2 text-danger">
                        <i className="ti ti-trash-x fs-20"></i>
                        <span>Confirm Delete Fee Receipt</span>
                    </div>
                }
                open={isDeleteReceiptModalOpen}
                onOk={handleConfirmDeleteReceipt}
                onCancel={() => {
                    setIsDeleteReceiptModalOpen(false);
                    setDeleteReceiptTarget(null);
                }}
                confirmLoading={isDeletingReceipt}
                okText="Yes, Delete Receipt"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p className="mb-2">
                    Are you sure you want to delete the fee receipt for Invoice <strong>#{deleteReceiptTarget?.invoiceNumber}</strong> (Campus ID: {deleteReceiptTarget?.campusId})?
                </p>
                {deleteReceiptTarget?.studentName && (
                    <p className="mb-2 text-dark">
                        Student: <strong>{deleteReceiptTarget.studentName}</strong>
                    </p>
                )}
                <p className="text-muted fs-12 mb-0">
                    This action will delete the fee receipt record and cannot be undone.
                </p>
            </Modal>
        </>
    );
};

export default FeesInvoices;
