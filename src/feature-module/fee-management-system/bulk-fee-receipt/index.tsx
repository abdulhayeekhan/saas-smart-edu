import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { all_routes } from "../../router/all_routes";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { GetFeeInvoices, FeeInvoiceFilter, BulkFeeReceipt, BulkReceiptPayload } from '../../../store/apps/fee-invoice';
import { useCampusFeeRecAccount } from '../../../core/common/selectoption/financial/useCampusFeeRecAccount';
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import toast from "react-hot-toast";
import Table from "../../../core/common/dataTable2/index";

const BulkFeeReceiptComponent = () => {
    const routes = all_routes;
    const dispatch = useDispatch<AppDispatch>();
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data;

    const regionsList = useRegionsList();
    const [regionId, setRegionId] = useState<number>(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : 0);
    const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);

    const initialCampusId = loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0;
    const [campusId, setCampusId] = useState<number>(initialCampusId);
    const [gradeId, setGradeId] = useState<number>(0);
    const [bankID, setBankID] = useState<number>(0);

    const gradesList = useAcademicGrades(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);

    const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);
    const bankOptions = bankDetails?.map((bank: any) => ({
        value: bank.accountId,
        label: `${bank.tblAccountBank?.name} (${bank.iban})`
    }));
    const feeRecAccountOptions = useCampusFeeRecAccount();
    const combinedBankOptions = [
        { value: 0, label: "-- SELECT BANK / CASH ACCOUNT --" },
        ...feeRecAccountOptions,
        ...(bankOptions || [])
    ];

    const { data: invoicesData, loading: invoicesLoading } = useSelector((state: RootState) => state.feeInvoice);

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (campusId) {
            dispatch(GetCampusBanksByCampus(campusId));
        }
    }, [campusId, dispatch]);

    const handleFetchInvoices = () => {
        if (!campusId || !gradeId) {
            toast.error("Please select Campus and Grade.");
            return;
        }
        const filter: FeeInvoiceFilter = {
            pageNo: 1,
            pageSize: 1000,
            campusId,
            gradeId
        };
        dispatch(GetFeeInvoices(filter));
        setSelectedInvoiceIds([]);
    };

    useEffect(() => {
        if (campusId && gradeId) {
            handleFetchInvoices();
        }
    }, [campusId, gradeId]);

    // Filter invoices to pending/unpaid or remaining balance > 0
    const pendingInvoices = useMemo(() => {
        if (!invoicesData || !Array.isArray(invoicesData)) return [];
        return invoicesData.filter((inv: any) => {
            const status = (inv.status || "").toLowerCase();
            return status !== "paid" && status !== "completed" && status !== "cancelled" && status !== "cancel";
        });
    }, [invoicesData]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = pendingInvoices.map((inv: any) => inv.id);
            setSelectedInvoiceIds(allIds);
        } else {
            setSelectedInvoiceIds([]);
        }
    };

    const handleSelectInvoice = (id: number) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const totalSelectedAmount = useMemo(() => {
        return pendingInvoices
            .filter((inv: any) => selectedInvoiceIds.includes(inv.id))
            .reduce((sum: number, inv: any) => sum + (inv.netAmount || inv.totalAmount || 0), 0);
    }, [pendingInvoices, selectedInvoiceIds]);

    const handleSubmitBulkReceipt = async () => {
        if (!campusId) {
            toast.error("Please select a Campus.");
            return;
        }
        if (!gradeId) {
            toast.error("Please select a Grade.");
            return;
        }
        if (!bankID) {
            toast.error("Please select a Bank / Cash Account.");
            return;
        }
        if (selectedInvoiceIds.length === 0) {
            toast.error("Please select at least one invoice.");
            return;
        }

        setSubmitting(true);
        try {
            const payload: BulkReceiptPayload = {
                campusId,
                gradeId,
                bankID,
                invoiceIds: selectedInvoiceIds
            };
            const resultAction = await dispatch(BulkFeeReceipt(payload));
            if (BulkFeeReceipt.fulfilled.match(resultAction)) {
                setSelectedInvoiceIds([]);
                handleFetchInvoices();
            }
        } catch (error) {
            console.error("Error submitting bulk fee receipt:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: (
                <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={pendingInvoices.length > 0 && selectedInvoiceIds.length === pendingInvoices.length}
                />
            ),
            dataIndex: "checkbox",
            render: (_: any, record: any) => (
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedInvoiceIds.includes(record.id)}
                    onChange={() => handleSelectInvoice(record.id)}
                />
            ),
        },
        {
            title: "Voucher #",
            dataIndex: "invoiceNumber",
            render: (text: any) => <strong>{text}</strong>,
        },
        {
            title: "Student",
            dataIndex: "firstName",
            render: (_: any, record: any) => (
                <div>
                    <div><strong>{record.firstName} {record.lastName}</strong></div>
                    <small className="text-muted">Reg #: {record.studentNumber || 'N/A'}</small>
                </div>
            ),
        },
        {
            title: "Grade",
            dataIndex: "grade",
        },
        {
            title: "Session",
            dataIndex: "session",
        },
        {
            title: "Invoice Date",
            dataIndex: "invoiceDate",
            render: (text: string) => text ? dayjs(text).format("DD-MMM-YYYY") : "-",
        },
        {
            title: "Net Amount",
            dataIndex: "netAmount",
            render: (text: number, record: any) => (
                <strong>Rs. {text || record.totalAmount || 0}</strong>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text: string) => (
                <span className="badge bg-warning text-dark">{text || 'Pending'}</span>
            ),
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Fee Receipt Management</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={routes.feeInvoices}>Fee Invoices</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Bulk Fee Receipt
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Link to={routes.feeReceipt} className="btn btn-outline-primary">
                            <i className="ti ti-file-invoice me-1" /> Single Fee Receipt
                        </Link>
                        <Link to={routes.bulkFeeReceipt} className="btn btn-primary">
                            <i className="ti ti-files me-1" /> Bulk Fee Receipt
                        </Link>
                    </div>
                </div>

                {/* Filter Controls Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body pb-1">
                        <div className="row">
                            {loginInfo?.userLevel === 1 && (
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Region</label>
                                    <CommonSelect3
                                        className="select"
                                        options={regionsList}
                                        onChange={(option) => setRegionId(Number(option?.value || 0))}
                                        value={regionId ? regionsList.find(r => Number(r.value) === regionId) : regionsList[0]}
                                    />
                                </div>
                            )}
                            {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Campus <span className="text-danger">*</span></label>
                                    <CommonSelect3
                                        className="select"
                                        options={campuses}
                                        onChange={(option) => setCampusId(Number(option?.value || 0))}
                                        value={campusId ? campuses.find(c => Number(c.value) === campusId) : campuses[0]}
                                    />
                                </div>
                            )}
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Grade <span className="text-danger">*</span></label>
                                <CommonSelect3
                                    className="select"
                                    options={gradesList}
                                    onChange={(option) => setGradeId(Number(option?.value || 0))}
                                    value={gradeId ? gradesList.find(g => Number(g.value) === gradeId) : gradesList[0]}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Bank / Cash Account <span className="text-danger">*</span></label>
                                <CommonSelect3
                                    className="select"
                                    options={combinedBankOptions}
                                    onChange={(option) => setBankID(Number(option?.value || 0))}
                                    value={bankID ? combinedBankOptions.find(b => Number(b.value) === bankID) : combinedBankOptions[0]}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices List Table Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap pb-0">
                        <h4 className="mb-3">Pending Fee Invoices</h4>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <span className="badge bg-light text-dark fs-14 p-2 border">
                                Total Selected: <strong>{selectedInvoiceIds.length}</strong>
                            </span>
                            <span className="badge bg-light text-primary fs-14 p-2 border">
                                Total Amount: <strong>Rs. {totalSelectedAmount}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="card-body p-0 py-3">
                        <Table
                            columns={columns}
                            dataSource={pendingInvoices}
                            Selection={false}
                            loading={invoicesLoading}
                        />
                    </div>
                </div>

                {/* Action Footer */}
                <div className="col-md-12 text-end mb-4">
                    <button
                        type="button"
                        className="btn btn-success btn-lg"
                        onClick={handleSubmitBulkReceipt}
                        disabled={submitting || selectedInvoiceIds.length === 0 || !bankID || !campusId || !gradeId}
                    >
                        {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2" /> Processing Receipts...</>
                        ) : (
                            <>
                                <i className="ti ti-check me-1" /> Process Bulk Receipts ({selectedInvoiceIds.length})
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkFeeReceiptComponent;
