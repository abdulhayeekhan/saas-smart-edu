import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { expense_data } from "../../../core/data/json/expense_data";
import Table from "../../../core/common/dataTable2/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2";
import CommonSelect3 from "../../../core/common/commonSelect3";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import {
    category2,
    expenseName,
    invoiceNumber,
    paymentMethod,
    usePermission
} from "../../../core/common/selectoption/selectoption";
import { Tag } from 'antd';
import { useLastFinancialYearId, useLastFinancialYear } from "../../../core/common/selectoption/financial/useLastFinancialYearId";
import { useHOcashAccount } from "../../../core/common/selectoption/financial/useHOcashAccount";
import { useHoChartOfAccount4thLevel } from "../../../core/common/selectoption/financial/useHoChartOfAccount4thLevel";
import axios from "axios";
import { Companylogo, Copyright, CompanyName, CoverPhoto } from '../../../environment'
import dayjs from "dayjs";
import { v4 as uuidv4 } from 'uuid'
import { TableData, VoucherTableData } from "../../../core/data/interface";
import { all_routes } from "../../router/all_routes";
import TooltipOption from "../../../core/common/tooltipOption";
import { AddNewVoucher, getSortVouchers, Voucher } from "../../../store/apps/voucher";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { numberToWords } from "../../../context/numberToWords";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { Pagination } from "antd";
const baseURL = process.env.REACT_APP_API_BASE_URL;



export interface BPVVoucher {
    regionId: number | null;
    voucherDate: string;
    voucherNumber?: number;
    isPosted: boolean;
    postedDate: string;
    voucherTypeId: number;
    voucherYear: number;
    financialYearId: number;
    reference: number;
    isReversed: boolean;
    totalAmount: number;
    createdBy: number;
    createdAt: string;
    modifiedBy?: number;
    modifiedAt?: string;
    voucherDetailList?: VoucherDetail[];
}

interface Detail {
    arrayid: string;
    debitAccountId: number | null;
    creditAccountId: number | null;
    cheaqueNo: string;
    description: string;
    departmentId: number | null;
    amount: number;
    referenceId: number | null;
    referenceTypeId: number | null;
    classId: number | null;
    budgetId: number | null;
}

interface VoucherDetail {
    arrayid: string;
    debitAccountId: number;
    creditAccountId: number;
    cheaqueNo: string;
    description: string;
    departmentId: number;
    amount: number;
    referenceId: number;
    referenceTypeId: number;
    classId: number;
    budgetId: number;
}

interface VoucherHeader {
    regionId: number | null;
    voucherDate: string;
    isPosted: boolean;
    postedDate: string;
    attachment?: string;
    voucherTypeId: number;
    voucherYear: number;
    financialYearId: number;
    reference: number;
    isReversed: boolean;
    totalAmount: number;
    createdBy: number;
    createdAt: string;
}
interface VoucherPayload extends VoucherHeader {
    details: VoucherDetail[];
}
const CashPaymentVoucher = () => {
    const [voucherTypeId, setVoucherTypeId] = useState(3); // 3 for CPV
    const { data, loading, totalCount, pageSize, totalPages, currentPage, hasNext, hasPrevious } = useSelector((state: RootState) => state.voucher);
    const hasPermission = usePermission("Cash Payment Voucher");
    const routes = all_routes;
    const regionsList = useRegionsList();
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const createdBy = loginInfo?.id
    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    let banks = (useHOcashAccount as any)(regionId ?? 0);
    const accounts4thLevel = useHoChartOfAccount4thLevel(regionId ?? 0);
    const [pageNo, setPageNo] = useState(1)
    const [pageSizes, setPageSize] = useState(10)
    const [totalCounts, setTotalCount] = useState(0)
    const [voucherNumber, setVoucherNumber] = useState<number | null>(null)

    const handleTableChange = (page: number, pageSize?: number) => {
        setPageNo(page)
        //setPageSize(pageSize ?? 25)
    };

    useEffect(() => {
        setPageSize(pageSize)
        setTotalCount(totalCount)
        const body = {
            pageNo,
            pageSize,
            type: voucherTypeId,
            voucherNumber,
            regionId,
        };
        dispatch(getSortVouchers(body));
    }, [regionId, voucherNumber, pageNo, pageSize, voucherTypeId, totalCount, banks]);

    const handleRegionId = async (value: any) => {
        await setRegionId(value);
    }
    const handleRegionIdChange = async (value: any) => {
        setRegionId(value)
        setVoucherHeader((prev) => ({
            ...prev,
            regionId: value,
        }));
    };

    const dispatch = useDispatch<AppDispatch>();
    const financialYearId = useLastFinancialYearId();
    const financialYear = useLastFinancialYear()

    useEffect(() => {
        setVoucherHeader((prev) => ({
            ...prev,
            voucherYear: financialYear ?? 0,
            financialYearId: financialYearId ?? 0,
        }));
    }, [financialYear, financialYearId])

    const [details, setDetails] = useState<Detail[]>([
        {
            arrayid: uuidv4(),
            debitAccountId: null,
            creditAccountId: null,
            cheaqueNo: '',
            description: '',
            departmentId: null,
            amount: 0,
            referenceId: null,
            referenceTypeId: null,
            classId: null,
            budgetId: null
        }
    ])
    const [voucherHeader, setVoucherHeader] = useState<VoucherHeader>({
        regionId: loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null,
        voucherDate: dayjs().format('YYYY-MM-DD'),
        isPosted: false,
        postedDate: new Date().toISOString(),
        voucherTypeId: voucherTypeId,
        voucherYear: 0,
        attachment: '',
        financialYearId: 0,
        reference: 0,
        isReversed: false,
        totalAmount: 0,
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
    });


    const handleVoucherDateChange = (field: string, value: any) => {
        setVoucherHeader((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNewRow = () => {
        setDetails((prev) => {
            const firstCreditId = prev.length > 0 ? prev[0].creditAccountId : null;
            const newRow: Detail = {
                arrayid: uuidv4(),
                debitAccountId: null,
                creditAccountId: firstCreditId, // inherit from first row
                cheaqueNo: "",
                description: "",
                departmentId: null,
                amount: 0,
                referenceId: null,
                referenceTypeId: null,
                classId: null,
                budgetId: null,
            };
            return [...prev, newRow];
        });
    };
    const handleDeleteRow = (id: string) => {
        setDetails((prev) => {
            const updated = prev.filter((row) => row.arrayid !== id);
            setVoucherHeader((prev) => ({
                ...prev,
                totalAmount: calculateTotal(updated),
            }));
            return updated;
        });
    };
    const calculateTotal = (rows: Detail[]) =>
        rows.reduce((sum, row) => sum + row.amount, 0);

    const handleChange = (id: string, field: string, value: any) => {
        setDetails((prevDetails) => {
            const updated = prevDetails.map((row) =>
                row.arrayid === id ? { ...row, [field]: value } : row
            );
            const newTotal = updated.reduce(
                (sum, row) => sum + (Number(row.amount) || 0),
                0
            );
            setVoucherHeader((prev) => ({
                ...prev,
                totalAmount: newTotal,
            }));

            return updated;
        });
    };
    const handleCreditAccountChange = (value: any) => {
        setDetails((prevDetails) => {
            const updated = prevDetails.map((row) => ({
                ...row,
                creditAccountId: value,
            }));

            // recalc total
            const newTotal = updated.reduce(
                (sum, row) => sum + (parseFloat(row.amount as any) || 0),
                0
            );

            setVoucherHeader((prev) => ({
                ...prev,
                totalAmount: newTotal,
            }));

            return updated;
        });
    };
    const [saveloading, setSaveLoading] = useState(false)
    const handleSaveVoucher = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            const payload: VoucherPayload = {
                ...voucherHeader,
                regionId: voucherHeader.regionId ?? null, // enforce number
                financialYearId: voucherHeader?.financialYearId ?? 0,
                totalAmount: voucherHeader.totalAmount ?? 0,
                reference: voucherHeader.reference ?? 0,
                voucherTypeId: voucherHeader.voucherTypeId ?? 0,
                voucherYear: voucherHeader.voucherYear ?? 0,
                details: details.map((d): VoucherDetail => ({
                    arrayid: d.arrayid,
                    creditAccountId: d.creditAccountId ?? 0,
                    debitAccountId: d.debitAccountId ?? 0,
                    amount: Number(d.amount) || 0,
                    description: d.description || "",
                    cheaqueNo: d.cheaqueNo || "",
                    referenceId: d.referenceId ?? 0,
                    referenceTypeId: d.referenceTypeId ?? 0,
                    classId: d.classId ?? 0,
                    departmentId: d.departmentId ?? 0,
                    budgetId: d.budgetId ?? 0,
                })),
            };
            //console.log('payload:', payload)
            await dispatch(AddNewVoucher(payload));
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaveLoading(false);
            setVoucherHeader({
                regionId: loginInfo?.userLevel === 2 ? loginInfo?.userLevel : null,
                voucherDate: dayjs().format('YYYY-MM-DD'),
                isPosted: false,
                postedDate: new Date().toISOString(),
                voucherTypeId: voucherTypeId,
                voucherYear: financialYear ?? 0,
                financialYearId: financialYearId ?? 0,
                reference: 0,
                isReversed: true,
                totalAmount: 0,
                createdBy: createdBy,
                createdAt: new Date().toISOString(),
            });
            setDetails([
                {
                    arrayid: uuidv4(),
                    debitAccountId: null,
                    creditAccountId: null,
                    cheaqueNo: '',
                    description: '',
                    departmentId: null,
                    amount: 0,
                    referenceId: null,
                    referenceTypeId: null,
                    classId: null,
                    budgetId: null
                }
            ])

            const closeBtn = document.querySelector<HTMLButtonElement>(
                "#add_expenses .btn-close"
            );
            closeBtn?.click();
        }
    };




    const [voucher, setVoucher] = useState<BPVVoucher | null>(null);
    const [loadingVoucher, setLoadingVoucher] = useState(false);

    const fetchVoucher = async (id: number) => {
        setVoucher(null)
        try {
            setLoadingVoucher(true);
            const res = await axios.get(`${baseURL}/api/HOVoucher/GetById?id=${id}`);
            setVoucher(res.data.data);
        } catch (error) {
            console.error("Failed to fetch voucher", error);
        } finally {
            setLoadingVoucher(false);
        }
    };

    const compressImage = (file: File, quality = 0.7): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set dimensions (optional: scale down if too large)
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convert to blob with specific quality (0.1 to 1.0)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error("Compression failed"));
                        },
                        'image/jpeg',
                        quality
                    );
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const compressedBlob = await compressImage(file, 0.7);
            const formData = new FormData();
            // Change 'Attachment' to 'file' if your backend expects that name
            formData.append('file', compressedBlob, file.name);
            const response = await axios.post(`${baseURL}/api/HOVoucher/UploadAttachment`, formData, {
                headers: {
                    // Remove manual 'Content-Type'. Let Axios set it with the boundary.
                }
            });
            if (response.status === 200) {
                setVoucherHeader((prev) => ({
                    ...prev,
                    attachment: response?.data?.data,
                }));
            }
        } catch (error: any) {
            // Log the actual error message from the server response
            console.error("Server says:", error.response?.data);
        }
    };
    const handleRemoveImage = () => {
        setVoucherHeader((prev) => ({
            ...prev,
            attachment: '',
        }));

    }


    const columns = [
        {
            title: "Voucher",
            dataIndex: "voucherNumber",
            render: (_: any, record: VoucherTableData) => (
                <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#view_invoice"
                    onClick={() => fetchVoucher(record.id)}
                    className="link-primary"
                >
                    <b>{record.voucherNumber}</b> - <small>({record.voucherYear})</small>
                </Link>
            ),
            sorter: (a: VoucherTableData, b: VoucherTableData) => {
                // first sort by year, then number
                if (a.voucherYear === b.voucherYear) {
                    return a.voucherNumber.localeCompare(b.voucherNumber);
                }
                return a.voucherYear - b.voucherYear;
            },
        },
        {
            title: "Voucher Date",
            dataIndex: "voucherDate",
            render: (text: string) => dayjs(text).format("DD-MMM-YYYY"), // e.g., 19-Sep-2025
            sorter: (a: VoucherTableData, b: VoucherTableData) =>
                dayjs(a.voucherDate).unix() - dayjs(b.voucherDate).unix(),
        },
        {
            title: "Posting Date",
            dataIndex: "postedDate",
            render: (text: string) =>
                text ? dayjs(text).format("DD-MMM-YYYY") : "-", // e.g. 19-Sep-2025
            sorter: (a: VoucherTableData, b: VoucherTableData) =>
                dayjs(a.postedDate).unix() - dayjs(b.postedDate).unix(),
        },
        {
            title: "Amount",
            dataIndex: "totalAmount",
            render: (value: number) =>
                value?.toLocaleString("en-PK", { minimumFractionDigits: 2 }),
            // Example: 10,000.00
            sorter: (a: VoucherTableData, b: VoucherTableData) =>
                a.totalAmount - b.totalAmount, // numeric sort
        },
        {
            title: "CreatedBy",
            dataIndex: "createdByName",
            render: (name: string, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{name}</span>
                    {record.regionName && (
                        <Tag color="blue" style={{ margin: 0 }}>
                            {record.regionName}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_: any, record: VoucherTableData) => (
                <>
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

                                <li>
                                    <Link
                                        className="dropdown-item rounded-1"
                                        to="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#view_invoice"
                                        onClick={() => fetchVoucher(record.id)} // pass the voucherId here
                                    >
                                        <i className="ti ti-menu me-2" />
                                        View Voucher
                                    </Link>
                                </li>
                                {hasPermission?.editRight && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#edit_expenses"
                                        >
                                            <i className="ti ti-edit-circle me-2" />
                                            Edit
                                        </Link>
                                    </li>
                                )}
                                {hasPermission?.deleteRight && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#delete-modal"
                                        >
                                            <i className="ti ti-trash-x me-2" />
                                            Delete
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </>
            ),
        },
    ];


    return (
        <div>
            {" "}
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Cash Payment Voucher</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to={routes.chartofaccounts}>Chart of Account</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Cash Payment Voucher
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            <div className="mb-2">
                                {hasPermission?.addRight && (
                                    <Link
                                        to="#"
                                        className="btn btn-primary d-flex align-items-center"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add_expenses"
                                    >
                                        <i className="ti ti-square-rounded-plus me-2" />
                                        Add CPV
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Page Header */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Cash Payment Voucher List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="input-icon-start mb-3 me-2 position-relative">
                                    {/* <PredefinedDateRanges /> */}
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
                                    <div className="dropdown-menu drop-width">
                                        <form>
                                            <div className="d-flex align-items-center border-bottom p-3">
                                                <h4>Filter</h4>
                                            </div>
                                            <div className="p-3 pb-0 border-bottom">
                                                <div className="row">
                                                    {loginInfo?.userLevel === 1 && (
                                                        <div className="col-md-12">
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
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">Voucher No</label>
                                                            <input
                                                                type="number"
                                                                value={voucherNumber ?? ''}
                                                                className="form-control"
                                                                placeholder="Search Voucher No"
                                                                onChange={(e) =>
                                                                    setVoucherNumber(
                                                                        e.target.value === '' ? null : Number(e.target.value)
                                                                    )
                                                                }
                                                            />

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
                                <div className="dropdown mb-3">
                                    {/* <Link
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
                                    </ul> */}
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            {/* CPV List */}
                            <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
                            {/* /CPV List */}

                            <div className="mt-5 d-flex justify-content-end">
                                <Pagination
                                    current={pageNo}
                                    pageSize={pageSizes}
                                    total={totalCounts}
                                    onChange={handleTableChange}
                                // showSizeChanger
                                // pageSizeOptions={["10", "20", "50", "100"]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Page Wrapper */}
            {/* Add Expenses */}
            <div className="modal fade" id="add_expenses">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Cash Payment Voucher</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveVoucher}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="row">
                                            {loginInfo?.userLevel === 1 && (
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Region</label>
                                                        <CommonSelect3
                                                            className="select"
                                                            options={regionsList}
                                                            onChange={(selected) =>
                                                                handleRegionIdChange(selected?.value || null)
                                                            }
                                                            value={voucherHeader?.regionId ? regionsList.find(r => r.value === voucherHeader?.regionId) : regionsList[0]}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Voucher Date</label>
                                                    <input
                                                        type="date"
                                                        value={voucherHeader?.voucherDate}
                                                        onChange={(e) => handleVoucherDateChange('voucherDate', e.target.value)}
                                                        className="form-control"
                                                        max={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Account (Cr)</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={banks}
                                                        value={banks[0]}
                                                        onChange={(selected) =>
                                                            handleCreditAccountChange(selected?.value || null)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="add-more-timetable">
                                            <div className="tab-content pt-0 dashboard-tab">
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="pills-monday"
                                                    role="tabpanel"
                                                    aria-labelledby="pills-monday-tab"
                                                >
                                                    {details.map((row) => (
                                                        <div className="add-timetable-row" key={row.arrayid}>
                                                            <div className="row timetable-count">
                                                                <div className="col-lg-3">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Account (Dr)</label>
                                                                        <CommonSelect2
                                                                            className="select"
                                                                            options={accounts4thLevel}
                                                                            defaultValue={accounts4thLevel[0]}
                                                                            onChange={(selected) =>
                                                                                handleChange(row.arrayid, "debitAccountId", selected?.value || null)
                                                                            }

                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-2">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Cheaque No</label>
                                                                        <input
                                                                            type="text"
                                                                            onChange={(e) =>
                                                                                handleChange(row.arrayid, "cheaqueNo", e.target.value)
                                                                            }
                                                                            className="form-control"
                                                                            placeholder="Cheaque No"
                                                                        />

                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Description</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            onChange={(e) =>
                                                                                handleChange(row.arrayid, "description", e.target.value)
                                                                            }
                                                                            placeholder="Description"
                                                                        />

                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-2">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Department (opt)</label>
                                                                        {/* <CommonSelect
                                                                            className="select"
                                                                            options={category2}
                                                                            defaultValue={category2[0]}
                                                                        /> */}

                                                                    </div>
                                                                </div>

                                                                <div className="col-lg-2">
                                                                    <div className="d-flex align-items-end">
                                                                        <div className="mb-3 flex-fill">
                                                                            <label className="form-label">Debit</label>
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    row.amount
                                                                                        ? Number(row.amount).toLocaleString("en-US")
                                                                                        : ""
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const numericValue = e.target.value.replace(/\D/g, "");
                                                                                    handleChange(row.arrayid, "amount", numericValue);
                                                                                }}
                                                                                className="form-control"
                                                                                placeholder="Debit"
                                                                            />

                                                                        </div>
                                                                        <div className="mb-3 ms-2">
                                                                            <Link to="#" className="delete-time-table"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault(); // stop page jump
                                                                                    handleDeleteRow(row.arrayid); // remove this row
                                                                                }}
                                                                            >
                                                                                <i className="ti ti-trash" />
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}


                                                    <div className="add-timetable-row" >
                                                        <div className="row timetable-count">
                                                            <div className="col-lg-3">
                                                            </div>
                                                            <div className="col-lg-2">

                                                            </div>
                                                            <div className="col-lg-3">

                                                            </div>
                                                            <div className="col-lg-2">

                                                            </div>

                                                            <div className="col-lg-2">
                                                                <div className="d-flex align-items-end">
                                                                    <div className="mb-3 flex-fill">
                                                                        <b>Rs. {Number(voucherHeader?.totalAmount).toLocaleString("en-US")}</b>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Link
                                                            to="#"
                                                            className="btn btn-primary add-new-timetable"
                                                            onClick={handleNewRow}
                                                        >
                                                            <i className="ti ti-square-rounded-plus-filled me-2" />
                                                            Add New
                                                        </Link>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    {/* Attachment Section */}
                                    <div className="col-lg-6 mt-3 mb-3">
                                        <label className="form-label">Attachment (evidence)</label>
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                            {/* {uploading && (
                                                <div className="spinner-border spinner-border-sm ms-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            )} */}
                                        </div>
                                        <small className="text-muted">Images will be automatically compressed before upload.</small>
                                        {/* Image Preview Area */}
                                        {voucherHeader?.attachment && (
                                            <div className="mt-3 position-relative" style={{ width: 'fit-content' }}>
                                                <img
                                                    src={baseURL + '/' + voucherHeader?.attachment}
                                                    alt={baseURL + '/' + voucherHeader?.attachment}
                                                    className="img-thumbnail"
                                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                    onClick={() => handleRemoveImage()}
                                                    style={{ borderRadius: '50%', transform: 'translate(50%, -50%)' }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Link
                                    to="#"
                                    className="btn btn-light me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </Link>
                                <button type="submit" disabled={saveloading} className="btn btn-success">
                                    {saveloading ? 'Loading...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Expenses */}

            {/* View Voucher Modal */}
            <div className="modal fade" id="view_invoice">
                <div className="modal-dialog modal-dialog-centered modal-xl invoice-modal">
                    <div className="modal-content">
                        <div className="modal-wrapper" id="print-area">
                            <style>{`
                                @media print {
                                    @page { size: A4; margin: 15mm; }
                                    body { background: #fff !important; -webkit-print-color-adjust: exact; }
                                    body * { visibility: hidden; }
                                    
                                    #print-area, #print-area * { visibility: visible; }
                                    #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                                    
                                    .modal { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; height: auto !important; visibility: visible !important; }
                                    .modal-dialog { max-width: 100% !important; margin: 0 !important; transform: none !important; width: 100% !important; visibility: visible !important; }
                                    .modal-content { border: none !important; box-shadow: none !important; background: transparent !important; visibility: visible !important; }
                                    .modal-backdrop { display: none !important; }
                                    
                                    .no-print, .no-print * { display: none !important; visibility: hidden !important; }
                                    
                                    table { width: 100% !important; border-collapse: collapse !important; }
                                    table, th, td { border: 1px solid #000 !important; color: #000 !important; }
                                    th { background-color: #eee !important; color: #000 !important; -webkit-print-color-adjust: exact; }
                                }
                            `}</style>
                            <div className="d-flex justify-content-end mb-3 no-print">
                                <button className="btn btn-primary" onClick={() => window.print()}>
                                    <i className="ti ti-printer me-2"></i> Print / Download PDF
                                </button>
                            </div>


                            <div className="invoice-popup-head d-flex align-items-center justify-content-between mb-4">
                                <span>
                                    <ImageWithBasePath src={Companylogo} width={250} alt="Img" />
                                </span>
                                <div className="popup-title">
                                    <h2>{CompanyName}</h2>
                                </div>
                            </div>

                            {loadingVoucher && (
                                <div className="d-flex justify-content-center align-items-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {voucher && (
                                <div className="tax-info mb-2">
                                    <div className="mb-4 text-center">
                                        <h1>Cash Payment Voucher</h1>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-4">
                                            <div className="tax-invoice-info d-flex align-items-center justify-content-between">
                                                <h5>Voucher No :</h5>
                                                <h6>{voucher.voucherNumber}</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="tax-invoice-info d-flex align-items-center justify-content-between">
                                                <h5>Voucher Date :</h5>
                                                <h6>{new Date(voucher.voucherDate).toLocaleDateString("en-GB")}</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="tax-invoice-info d-flex align-items-center justify-content-between">
                                                <h5>Year :</h5>
                                                <h6>{voucher.voucherYear}</h6>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voucher Detail Table */}
                                    <div className="invoice-product-table">
                                        <div className="table-responsive invoice-table">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>ACCOUNT</th>
                                                        <th>DESCRIPTION</th>
                                                        <th>DEBIT</th>
                                                        <th>CREDIT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {voucher?.voucherDetailList?.map((detail, index) => (
                                                        <>
                                                            <tr key={index}>
                                                                <td>
                                                                    {
                                                                        (accounts4thLevel as any[])?.find((acct) =>
                                                                            acct.value === detail?.debitAccountId
                                                                        )?.label
                                                                    }
                                                                </td>
                                                                <td>{detail?.description}</td>
                                                                <td>
                                                                    {detail.debitAccountId > 0
                                                                        ? detail.amount.toLocaleString("en-PK", {
                                                                            minimumFractionDigits: 2,
                                                                        })
                                                                        : ""}
                                                                </td>
                                                                <td>
                                                                    0
                                                                </td>
                                                            </tr>
                                                            <tr key={index}>
                                                                <td>
                                                                    {
                                                                        (accounts4thLevel as any[])?.find((acct) =>
                                                                            acct.value === detail?.creditAccountId
                                                                        )?.label
                                                                    }
                                                                </td>
                                                                <td>{detail?.description}</td>
                                                                <td>
                                                                    0
                                                                </td>
                                                                <td>
                                                                    {detail.creditAccountId > 0
                                                                        ? detail.amount.toLocaleString("en-PK", {
                                                                            minimumFractionDigits: 2,
                                                                        })
                                                                        : ""}
                                                                </td>
                                                            </tr>
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h5 className="mb-1">Total Amount (in words):</h5>
                                            <p className="text-dark fw-medium">
                                                {/* You can create a numberToWords util here */}
                                                {numberToWords(voucher.totalAmount)}
                                            </p>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="total-amount-tax mb-3">
                                                <ul className="total-amount">
                                                    <li className="text-dark">Total Amount</li>
                                                </ul>
                                                <ul className="total-amount">
                                                    <li className="text-dark">
                                                        {voucher.totalAmount.toLocaleString("en-PK", {
                                                            style: "currency",
                                                            currency: "PKR",
                                                        })}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-bottom text-center pt-4 pb-4">
                                <span className="text-dark fw-medium">Terms &amp; Conditions :</span>
                                <p>
                                    Here we can write additional notes for the client to get a
                                    better understanding of this voucher.
                                </p>
                            </div>
                            <p className="text-center pt-3">Thanks for your Business</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* /View Voucher Modal */}

            {/* Edit Expenses */}
            <div className="modal fade" id="edit_expenses">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Expense</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Expense Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Expense Name"
                                                defaultValue="Monthly Electricity"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <CommonSelect
                                                className="select"
                                                options={category2}
                                                defaultValue={category2[0]}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Date</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Date"
                                                defaultValue="25 Apr 2024"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Amount</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Amount"
                                                defaultValue="$1000"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Invoice No</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Invoice No"
                                                defaultValue="INV681537"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <CommonSelect
                                                className="select"
                                                options={paymentMethod}
                                                defaultValue={paymentMethod[0]}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                rows={4}
                                                className="form-control"
                                                placeholder="text"
                                                defaultValue={"Electricity of April month"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Link
                                    to="#"
                                    className="btn btn-light me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Expenses */}
            {/* Delete Modal */}
            <div className="modal fade" id="delete-modal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-body text-center">
                                <span className="delete-icon">
                                    <i className="ti ti-trash-x" />
                                </span>
                                <h4>Confirm Deletion</h4>
                                <p>
                                    You want to delete all the marked items, this cant be undone
                                    once you delete.
                                </p>
                                <div className="d-flex justify-content-center">
                                    <Link
                                        to="#"
                                        className="btn btn-light me-3"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn btn-danger">
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Delete Modal */}
        </div>
    );
};

export default CashPaymentVoucher;
