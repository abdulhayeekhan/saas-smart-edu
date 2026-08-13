import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { expense_data } from "../../../core/data/json/expense_data";
import Table from "../../../core/common/dataTable2/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2";
import CommonSelect3 from "../../../core/common/commonSelect3";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Tag } from 'antd';
import {
    category2,
    expenseName,
    invoiceNumber,
    paymentMethod,
    usePermission
} from "../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useLastFinancialYearId, useLastFinancialYear } from "../../../core/common/selectoption/financial/useLastFinancialYearId";
import { useHOBankAccount } from "../../../core/common/selectoption/financial/useHOBankAccount";
import { useHoChartOfAccount4thLevelAll } from "../../../core/common/selectoption/financial/useHoChartOfAccount4thLevelAll";
import axios from "axios";
import { Companylogo, CompanyName } from '../../../environment'
import dayjs from "dayjs";
import { v4 as uuidv4 } from 'uuid'
import { TableData, VoucherTableData } from "../../../core/data/interface";
import { all_routes } from "../../router/all_routes";
import TooltipOption from "../../../core/common/tooltipOption";
import { AddJVNewVoucher, GetJVVouchersList, UpdateJVVoucher, Voucher } from "../../../store/apps/jv-voucher";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { numberToWords } from "../../../context/numberToWords";
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
    tblAccountHJVoucherDetails?: VoucherDetail[];
}

interface Detail {
    arrayid: string | number;
    accountId: number | null;
    debitAccountId: number | null;
    creditAccountId: number | null;
    cheaqueNo: string;
    description: string;
    departmentId: number | null;
    creditAmount: number;
    debitAmount: number;
    referenceId: number | null;
    referenceTypeId: number | null;
    classId: number | null;
    budgetId: number | null;
}

interface VoucherDetail {
    arrayid: string | number;
    debitAccountId: number | null;
    creditAccountId: number | null;
    cheaqueNo: string;
    description: string;
    departmentId: number;
    creditAmount: number;
    debitAmount: number;
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
    voucherTypeId: number;
    voucherNumber?: number;
    voucherYear: number;
    financialYearId: number;
    reference: number;
    isReversed: boolean;
    totalAmount: number;
    attachment?: string;
    createdBy: number;
    createdAt: string;
}
interface VoucherPayload extends VoucherHeader {
    details: VoucherDetail[];
}
const JournalVoucher = () => {
    const [voucherTypeId, setVoucherTypeId] = useState(5); // 2 for JV
    const routes = all_routes;
    const { data, loading, totalCount, pageSize, totalPages, currentPage, hasNext, hasPrevious } = useSelector((state: RootState) => state.jvVoucher);

    const hasPermission = usePermission("Journal Voucher");
    const dispatch = useDispatch<AppDispatch>();
    const regionsList = useRegionsList();
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const createdBy = loginInfo?.id
    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    const accounts4thLevel = useHoChartOfAccount4thLevelAll(regionId ?? 0);

    const [pageNo, setPageNo] = useState(1)
    const [pageSizes, setPageSize] = useState(10)
    const [totalCounts, setTotalCount] = useState(0)
    const [voucherNumber, setVoucherNumber] = useState<number | null>(null)

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
        dispatch(GetJVVouchersList(body));
    }, [regionId, voucherNumber, pageNo, pageSize, voucherTypeId, totalCount]);

    const handleRegionId = async (value: any) => {
        await setRegionId(value);
    }
    const financialYearId = useLastFinancialYearId();
    const financialYear = useLastFinancialYear();
    useEffect(() => {
        setVoucherHeader((prev) => ({
            ...prev,
            voucherYear: financialYear ?? 0,
            financialYearId: financialYearId ?? 0,
        }));
    }, [financialYear, financialYearId])
    const handleRegionIdChange = async (value: any) => {
        setRegionId(value)
        setVoucherHeader((prev) => ({
            ...prev,
            regionId: value,
        }));
    };


    const [details, setDetails] = useState<Detail[]>([
        {
            arrayid: uuidv4(),
            accountId: null,
            debitAccountId: null,
            creditAccountId: null,
            cheaqueNo: '',
            description: '',
            departmentId: null,
            creditAmount: 0,
            debitAmount: 0,
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
        financialYearId: 0,
        reference: 0,
        isReversed: false,
        totalAmount: 0,
        attachment: '',
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
    });

    const handleVoucherDateChange = (field: string, value: any) => {
        setVoucherHeader((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleTableChange = (page: number, pageSize?: number) => {
        setPageNo(page)
    };

    const handleNewRow = () => {
        setDetails((prev) => {
            const firstCreditId = prev.length > 0 ? prev[0].creditAccountId : null;
            const newRow: Detail = {
                arrayid: uuidv4(),
                accountId: null,
                debitAccountId: null,
                creditAccountId: firstCreditId, // inherit from first row
                cheaqueNo: "",
                description: "",
                departmentId: null,
                creditAmount: 0,
                debitAmount: 0,
                referenceId: null,
                referenceTypeId: null,
                classId: null,
                budgetId: null,
            };
            return [...prev, newRow];
        });
    };
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const calculateDebitTotal = (rows: Detail[]) =>
        rows.reduce((sum, row) => sum + row.debitAmount, 0);
    const calculateCreditTotal = (rows: Detail[]) =>
        rows.reduce((sum, row) => sum + row.creditAmount, 0);
    const handleDeleteRow = (id: string | number) => {
        setDetails((prev) => {
            const updated = prev.filter((row) => row.arrayid !== id);
            const totalDebit = calculateDebitTotal(updated);
            const totalCredit = calculateCreditTotal(updated);
            setTotalCredit(totalCredit);
            setTotalDebit(totalDebit);

            setVoucherHeader((prev) => ({
                ...prev,
                totalAmount: calculateDebitTotal(updated),
            }));
            return updated;
        });
    };

    const handleChange = (id: string | number, field: string, value: string | number | null) => {
        setDetails((prevDetails) => {
            const updated = prevDetails.map((row) =>
                row.arrayid === id ? { ...row, [field]: value } : row
            );
            const newTotal = updated.reduce(
                (sum, row) => sum + (Number(row.debitAmount) || 0),
                0
            );
            setVoucherHeader((prev) => ({
                ...prev,
                totalAmount: newTotal,
            }));

            return updated;
        });
    };

    const handleChangeRowsWithDebitPrice = (
        id: string | number,
        field: string,
        value: string
    ) => {
        const numericValue = Number(value) || 0;

        const newRows = details.map((item) =>
            item.arrayid === id
                ? {
                    ...item,
                    [field]: numericValue,
                    debitAmount: numericValue,
                    debitAccountId: item.accountId,
                    creditAmount: 0,
                    creditAccountId: null,
                }
                : item
        );

        setDetails(newRows)
        const totalDebit = calculateDebitTotal(newRows);
        setTotalDebit(totalDebit);
        setVoucherHeader((prev) => ({
            ...prev,
            totalAmount: totalDebit,
        }));
    };

    const handleChangeRowsWithCreditPrice = (
        id: string | number,
        field: string,
        value: string
    ) => {
        const numericValue = Number(value) || 0;

        const newRows = details.map((item) =>
            item.arrayid === id
                ? {
                    ...item,
                    [field]: numericValue,
                    debitAmount: 0,
                    debitAccountId: null,
                    creditAmount: numericValue,
                    creditAccountId: item.accountId,
                }
                : item
        );
        setDetails(newRows)
        const totalDebit = calculateCreditTotal(newRows);
        setTotalCredit(totalDebit);
    };


    const handleCreditAccountChange = (value: any) => {
        setDetails((prevDetails) => {
            const updated = prevDetails.map((row) => ({
                ...row,
                creditAccountId: value,
            }));

            // recalc total
            const newTotal = updated.reduce(
                (sum, row) => sum + (parseFloat(row.debitAmount as any) || 0),
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
                financialYearId: financialYearId ?? 0,
                totalAmount: voucherHeader.totalAmount ?? 0,
                reference: voucherHeader.reference ?? 0,
                voucherTypeId: voucherHeader.voucherTypeId ?? 0,
                voucherYear: voucherHeader.voucherYear ?? 0,
                details: details.map((d): VoucherDetail => ({
                    arrayid: d.arrayid ?? '',
                    creditAccountId: d.creditAccountId && d.creditAccountId !== 0 ? d.creditAccountId : null,
                    debitAccountId: d.debitAccountId && d.debitAccountId !== 0 ? d.debitAccountId : null,
                    creditAmount: Number(d.creditAmount) || 0,
                    debitAmount: Number(d.debitAmount) || 0,
                    description: d.description || "",
                    cheaqueNo: d.cheaqueNo || "",
                    referenceId: d.referenceId ?? 0,
                    referenceTypeId: d.referenceTypeId ?? 0,
                    classId: d.classId ?? 0,
                    departmentId: d.departmentId ?? 0,
                    budgetId: d.budgetId ?? 0,
                })),
            };

            await dispatch(AddJVNewVoucher(payload));
            const closeBtn = document.querySelector<HTMLButtonElement>(
                "#add_expenses .btn-close"
            );
            closeBtn?.click();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaveLoading(false);
        }
    };



    const [voucher, setVoucher] = useState<BPVVoucher | null>(null);
    const [loadingVoucher, setLoadingVoucher] = useState(false);


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
            const response = await axios.post(`${baseURL}/api/HOJVoucher/UploadAttachment`, formData, {
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

    const fetchVoucher = async (id: number) => {
        setVoucher(null)
        try {
            setLoadingVoucher(true);
            const res = await axios.get(`${baseURL}/api/HOJVoucher/GetById?id=${id}`);
            setVoucher(res.data.data);
        } catch (error) {
            console.error("Failed to fetch voucher", error);
        } finally {
            setLoadingVoucher(false);
        }
    };

    const [editingId, setEditingId] = useState<number | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editVoucherHeader, setEditVoucherHeader] = useState<VoucherHeader | null>(null);
    const [editDetails, setEditDetails] = useState<Detail[]>([]);

    // Mapping function for Edit Click
    const handleEditClick = async (id: number) => {
        setEditingId(id);
        try {
            setLoadingVoucher(true);
            const res = await axios.get(`${baseURL}/api/HOJVoucher/GetById?id=${id}`);
            const data = res.data.data;

            setEditVoucherHeader({
                regionId: data.regionId,
                voucherDate: dayjs(data.voucherDate).format('YYYY-MM-DD'),
                isPosted: data.isPosted,
                postedDate: data.postedDate,
                voucherTypeId: data.voucherTypeId,
                voucherNumber: data.voucherNumber,
                voucherYear: data.voucherYear,
                financialYearId: data.financialYearId,
                reference: data.reference,
                isReversed: data.isReversed,
                totalAmount: data.totalAmount,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
            });

            // Map backend details back to UI-friendly Detail format
            const mappedDetails = data.tblAccountHJVoucherDetails.map((d: any) => ({
                ...d,
                arrayid: uuidv4(),
                // Ensure accountId is populated for the dropdown
                accountId: d.debitAccountId || d.creditAccountId,
            }));
            setEditDetails(mappedDetails);
        } catch (error) {
            console.error("Failed to fetch JV for edit", error);
        } finally {
            setLoadingVoucher(false);
        }
    };

    // Handle submission of updated JV
    const handleUpdateVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editVoucherHeader) return;

        const totalD = editDetails.reduce((s, i) => s + Number(i.debitAmount || 0), 0);
        const totalC = editDetails.reduce((s, i) => s + Number(i.creditAmount || 0), 0);

        // JV Validation: Must balance
        if (totalD !== totalC || totalD <= 0) {
            alert("Journal Voucher must balance (Debit = Credit) and cannot be zero.");
            return;
        }

        setUpdateLoading(true);
        try {
            const payload = {
                ...editVoucherHeader,
                id: editingId,
                modifiedAt: new Date().toISOString(),
                modifiedBy: createdBy,
                regionId: Number(editVoucherHeader.regionId) === 0 ? null : Number(editVoucherHeader.regionId),
                totalAmount: totalD,
                // Re-map details to backend requirements
                details: editDetails.map((d) => ({
                    ...d,
                    creditAccountId: d.creditAmount > 0 ? d.accountId : null,
                    debitAccountId: d.debitAmount > 0 ? d.accountId : null,
                    creditAmount: Number(d.creditAmount),
                    debitAmount: Number(d.debitAmount),
                })),
            };

            await dispatch(UpdateJVVoucher(payload as Voucher));
            dispatch(GetJVVouchersList({ pageNo, pageSize, type: voucherTypeId, regionId }));
            document.querySelector<HTMLButtonElement>("#edit_expenses .btn-close")?.click();
        } catch (err) {
            console.error("JV Update failed:", err);
        } finally {
            setUpdateLoading(false);
        }
    };

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
            title: "Created By",
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
                                            onClick={() => handleEditClick(record.id)}
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
                            <h3 className="page-title mb-1">Journal Voucher</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to={routes.chartofaccounts}>Chart of Account</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Journal Voucher
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
                                        Add JV
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Page Header */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Journal Voucher List</h4>
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
                                                <button type="submit" className="btn btn-primary">
                                                    Apply
                                                </button>
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
                            {/* Expenses List */}
                            <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
                            {/* /Expenses List */}
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
                            <h4 className="modal-title">Add Journal Voucher</h4>
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
                                                <div className="col-md-6">
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

                                        </div>
                                        <div className="add-more-timetable">
                                            <div className="tab-content pt-0 dashboard-tab">
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="pills-monday"
                                                    role="tabpanel"
                                                    aria-labelledby="pills-monday-tab"
                                                >
                                                    {details.map((row, index) => (
                                                        <div className="add-timetable-row" key={row.arrayid}>
                                                            <div className="row timetable-count">
                                                                <div className="col-lg-3">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Account</label>
                                                                        <CommonSelect2
                                                                            className="select"
                                                                            options={accounts4thLevel}
                                                                            defaultValue={accounts4thLevel[0]}
                                                                            onChange={(selected) =>
                                                                                handleChange(row.arrayid, "accountId", selected?.value || null)
                                                                            }

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

                                                                <div className="col-lg-4">
                                                                    <div className="d-flex align-items-end">
                                                                        <div className="mb-3 flex-fill">
                                                                            <label className="form-label">Debit</label>
                                                                            <input
                                                                                type="text"
                                                                                value={row.debitAmount}
                                                                                onChange={(e) => {
                                                                                    const numericValue = (e.target.value ?? "").toString().replace(/\D/g, "");
                                                                                    handleChangeRowsWithDebitPrice(row.arrayid, "debitAmount", numericValue);
                                                                                }}
                                                                                disabled={row.creditAmount > 0}

                                                                                className="form-control"
                                                                                placeholder="Debit"
                                                                            />

                                                                        </div>
                                                                        <div className="mb-3 flex-fill">
                                                                            <label className="form-label">Credit</label>
                                                                            <input
                                                                                type="text"
                                                                                value={row.creditAmount}
                                                                                onChange={(e) => {
                                                                                    const numericValue = (e.target.value ?? "").toString().replace(/\D/g, "");
                                                                                    handleChangeRowsWithCreditPrice(row?.arrayid, "creditAmount", numericValue);
                                                                                }}
                                                                                disabled={row.debitAmount > 0}

                                                                                className="form-control"
                                                                                placeholder="Credit"
                                                                            />
                                                                        </div>
                                                                        {(details?.length > 1) && (
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
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}


                                                    <div className="add-timetable-row" >
                                                        <div className="row timetable-count">
                                                            <div className="col-lg-3">
                                                            </div>
                                                            <div className="col-lg-3">

                                                            </div>
                                                            <div className="col-lg-2">

                                                            </div>

                                                            <div className="col-lg-4">
                                                                <div className="d-flex align-items-end">
                                                                    <div className="mb-3 flex-fill">
                                                                        <b>Rs. {Number(totalDebit).toLocaleString("en-US")}</b>
                                                                    </div>
                                                                    <div className="mb-3 flex-fill">
                                                                        <b>Rs. {Number(totalCredit).toLocaleString("en-US")}</b>

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
                                <button type="submit" disabled={saveloading || totalDebit !== totalCredit || totalDebit <= 0} className="btn btn-success">

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
                                        <h1>Journal Voucher</h1>
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
                                                    {voucher?.tblAccountHJVoucherDetails?.map((item, index) => (
                                                        <tr key={index}>
                                                            {/* Account Code & Name Column */}
                                                            <td>
                                                                {
                                                                    (accounts4thLevel as any[])?.find((acct) =>
                                                                        acct.value === item.creditAccountId
                                                                    )?.label
                                                                }
                                                                {
                                                                    (accounts4thLevel as any[])?.find((acct) =>
                                                                        acct.value === item.debitAccountId
                                                                    )?.label
                                                                }
                                                            </td>

                                                            {/* Description Column */}
                                                            <td>{item?.description}</td>


                                                            {/* Debit Amount Column */}
                                                            <td style={{ textAlign: 'right' }}>
                                                                {Number(item.debitAmount) > 0
                                                                    ? Number(item.debitAmount).toLocaleString("en-PK", { minimumFractionDigits: 2 })
                                                                    : "0.00"}
                                                            </td>

                                                            {/* Credit Amount Column */}
                                                            <td style={{ textAlign: 'right' }}>
                                                                {Number(item.creditAmount) > 0
                                                                    ? Number(item.creditAmount).toLocaleString("en-PK", { minimumFractionDigits: 2 })
                                                                    : "0.00"}
                                                            </td>
                                                        </tr>
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
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Journal Voucher</h4>
                            <button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x" /></button>
                        </div>
                        <form onSubmit={handleUpdateVoucher}>
                            <div className="modal-body">
                                {loadingVoucher ? (
                                    <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
                                ) : (
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="row">
                                                {loginInfo?.userLevel === 1 && (
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Region</label>
                                                        <CommonSelect3
                                                            options={regionsList}
                                                            onChange={(s) => setEditVoucherHeader(p => p ? ({ ...p, regionId: s?.value ? Number(s.value) : null }) : null)}
                                                            value={regionsList.find(r => r.value === editVoucherHeader?.regionId)}
                                                        />
                                                    </div>
                                                )}
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Voucher Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        value={editVoucherHeader?.voucherDate || ''}
                                                        onChange={(e) => setEditVoucherHeader(p => p ? ({ ...p, voucherDate: e.target.value }) : null)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="add-more-timetable">
                                                {editDetails.map((row) => (
                                                    <div className="add-timetable-row" key={row.arrayid}>
                                                        <div className="row timetable-count">
                                                            <div className="col-lg-3 mb-3">
                                                                <label className="form-label">Account</label>
                                                                <CommonSelect3
                                                                    options={accounts4thLevel}
                                                                    value={(accounts4thLevel as any[]).find(a => a.value === row.accountId)}
                                                                    onChange={(s: any) => setEditDetails(prev => prev.map(d => d.arrayid === row.arrayid ? { ...d, accountId: s?.value ? Number(s.value) : null } : d))}
                                                                />
                                                            </div>
                                                            <div className="col-lg-3 mb-3">
                                                                <label className="form-label">Description</label>
                                                                <input type="text" className="form-control" value={row.description} onChange={(e) => setEditDetails(prev => prev.map(d => d.arrayid === row.arrayid ? { ...d, description: e.target.value } : d))} />
                                                            </div>
                                                            <div className="col-lg-2 mb-3">
                                                                <label className="form-label">Debit</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={Number(row.creditAmount) > 0}
                                                                    value={row.debitAmount || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, "");
                                                                        setEditDetails(prev => prev.map(d => d.arrayid === row.arrayid ? { ...d, debitAmount: Number(val), creditAmount: 0 } : d));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="col-lg-2 mb-3">
                                                                <label className="form-label">Credit</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={Number(row.debitAmount) > 0}
                                                                    value={row.creditAmount || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, "");
                                                                        setEditDetails(prev => prev.map(d => d.arrayid === row.arrayid ? { ...d, creditAmount: Number(val), debitAmount: 0 } : d));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="col-lg-1 mb-3 d-flex align-items-end">
                                                                <button type="button" className="btn btn-danger btn-sm mb-1" onClick={() => setEditDetails(prev => prev.filter(d => d.arrayid !== row.arrayid))}>
                                                                    <i className="ti ti-trash" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="d-flex justify-content-between align-items-center mt-3 bg-light p-2 rounded">
                                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditDetails([...editDetails, { arrayid: uuidv4(), accountId: null, debitAccountId: null, creditAccountId: null, cheaqueNo: '', description: '', debitAmount: 0, creditAmount: 0, departmentId: null, referenceId: null, referenceTypeId: null, classId: null, budgetId: null }])}>
                                                        <i className="ti ti-plus" /> Add Row
                                                    </button>
                                                    <div className="text-end">
                                                        <span className="me-4">Total Debit: <strong>{editDetails.reduce((s, i) => s + Number(i.debitAmount), 0).toLocaleString()}</strong></span>
                                                        <span>Total Credit: <strong>{editDetails.reduce((s, i) => s + Number(i.creditAmount), 0).toLocaleString()}</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={updateLoading || editDetails.reduce((s, i) => s + Number(i.debitAmount), 0) !== editDetails.reduce((s, i) => s + Number(i.creditAmount), 0)}
                                >
                                    {updateLoading ? 'Updating...' : 'Save Changes'}
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

export default JournalVoucher;
