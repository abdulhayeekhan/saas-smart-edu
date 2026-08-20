import React, { ChangeEvent, useEffect, FormEvent, useState, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
// import { feeGroup, feesTypes, paymentType } from '../../../core/common/selectoption/selectoption'
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../router/all_routes";
import {
    AdmissionNo,
    Hostel,
    PickupPoint,
    VehicleNumber,
    academicYear,
    allClass,
    allSection,
    bloodGroup,
    cast,
    gender,
    house,
    mothertongue,
    names,
    religion,
    rollno,
    roomNO,
    route,
    status,
    feesStatuses
} from "../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from "../../../core/common/selectoption/academic/useSections";
import { useAdmissions } from "../../../core/common/selectoption/academic/useAdmissions";
import { useCities } from "../../../core/common/selectoption/address/useCities";
import { TagsInput } from "react-tag-input-component";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2"
import CommonSelect3 from "../../../core/common/commonSelect3"
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { useLastAcademicSession } from '../../../core/common/selectoption/academic/useLastAcademicSession';
import { GetFeeInvoices, FeeInvoiceFilter, CancelInvoice, GetInvoiceByNumber, ManualReceiptDiscount, ManualReceiptPayload } from '../../../store/apps/fee-invoice'
import { ReceiveDeposit } from "../../../store/apps/security-deposit";
import { useCampusFeeRecAccount } from '../../../core/common/selectoption/financial/useCampusFeeRecAccount';
import toast from "react-hot-toast";
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { CompnayIcon, BrandName, PoweredBy, feeTermsConditions } from '../../../environment'
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";

const baseURL = process.env.REACT_APP_API_BASE_URL

const { RangePicker } = DatePicker;

interface InvoiceFilterPayload {
    pageNo: number;
    pageSize: number;
    gradeId: number;
    sessionId: number;
    campusId: number;
    dateFrom: string; // ISO String format
    dateTo: string;   // ISO String format
    admissionId?: number;
    status: string;
}
interface Props {
    datalist: any[];
}

interface SearchInvoice {
    invoiceNumber: number;
    campusId: number;
    receiptAccount?: number;
    referenceNo?: string;
    detail?: {
        id?: number;
        feeTypeId: number;
        month: string;
        amountReceived: number;
    }[];
}

export interface InvoiceDetail {
    id: number;
    feeInvoiceId: number;
    feeTypeId: number;
    feeName: string;
    invoiceAmount: number;
    discountAmount: number;
    receivedAmount: number;
    remainingAmount: number;
    invoiceMonth: string; // ISO Date string
}

export interface Invoice {
    id: number;
    campusId: number;
    studentNumber: string;
    fatherName: string;
    campusName: string;
    admissionId: number;
    firstName: string;
    lastName: string;
    session: string;
    grade: string;
    invoiceVoucherId: number;
    invoiceNumber: number;
    invoiceDate: string; // ISO Date string
    monthFrom: string; // ISO Date string
    monthTo: string; // ISO Date string
    dueDate: string; // ISO Date string
    totalAmount: number;
    totalDiscount: number;
    netAmount: number;
    amountReceived: number;
    invoiceStatusId: number;
    status: 'pending' | 'paid' | 'partial' | string; // Narrowed type based on data
    orderNumber: string;
    orderId: string;
    details: InvoiceDetail[];
    receipts: any[]; // Kept as any[] since the data is empty
}

const FeeReceipt = () => {
    const routes = all_routes;
    const dispatch = useDispatch<AppDispatch>();
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const userId = loginInfo?.id
    const regionsList = useRegionsList();
    const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);
    const bankOptions = bankDetails?.map((bank: any) => ({
        value: bank.accountId,
        label: `${bank.tblAccountBank?.name} (${bank.iban})`
    }));
    const feeRecAccountOptions = useCampusFeeRecAccount()
    const combinedOptions = [
        ...feeRecAccountOptions,
        ...(bankOptions || [])
    ];
    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    const handleSelectRegion = (name: string, option: any) => {
        setRegionId(option?.value ?? 0);
    }
    const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);

    const location = useLocation();

    const initialCampusId = location.state?.campusId || (loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0);
    const [campusId, setCampusId] = useState<number>(initialCampusId);

    useEffect(() => {
        if (campusId) {
            dispatch(GetCampusBanksByCampus(campusId));
        }
    }, [campusId, dispatch]);


    const [selectedSectionId, setSelectedSectionId] = useState<number>(0);
    const [selectedAdmissionId, setSelectedAdmissionId] = useState<number>(0);

    const sectionOptions = useSectionList(campusId);
    const { studentOptions = [] } = useAdmissions({
        externalCampusId: campusId,
        externalSectionId: selectedSectionId
    }) as { studentOptions: any[]; loading: boolean; setPageNo: any };

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [searchInvoice, setSearchInvoice] = useState<SearchInvoice>({
        invoiceNumber: location.state?.invoiceNumber || 0,
        campusId: campusId
    });

    const [depositDetail, setDepositDetail] = useState<any>(null);
    const [securityAmountReceived, setSecurityAmountReceived] = useState<number>(0);

    const handleSearchInvoice = (e: any) => {
        const { name, value } = e.target;
        setSearchInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [formData, setFormData] = useState<Invoice>({
        id: 0,
        campusId: campusId,
        studentNumber: '',
        fatherName: '',
        campusName: '',
        admissionId: 0,
        firstName: '',
        lastName: '',
        session: '',
        grade: '',
        invoiceVoucherId: 0,
        invoiceNumber: 0,
        invoiceDate: '',
        monthFrom: '',
        monthTo: '',
        dueDate: '',
        totalAmount: 0,
        totalDiscount: 0,
        netAmount: 0,
        amountReceived: 0,
        invoiceStatusId: 0,
        status: '',
        orderNumber: '',
        orderId: '',
        details: [],
        receipts: []
    });

    const handleChange = (name: keyof SearchInvoice, value: any) => {
        setSearchInvoice((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectCampus = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        setCampusId(selectedId);
        setSelectedSectionId(0);
        setSelectedAdmissionId(0);
        setSearchInvoice(prev => ({
            ...prev,
            campusId: selectedId
        }));
    };

    const [searching, setSearching] = useState(false);

    const populateInvoiceData = async (payload: any) => {
        if (!payload) return;
        const mappedDetails = payload.details ? payload.details.map((item: any) => ({
            id: item.id,
            feeTypeId: item.feeTypeId,
            month: item.invoiceMonth,
            amountReceived: item.remainingAmount
        })) : [];

        setSearchInvoice((prevState) => ({
            ...prevState,
            invoiceNumber: payload.invoiceNumber,
            campusId: payload.campusId || campusId,
            detail: mappedDetails
        }));

        try {
            const depData: any = await axios.get(`${baseURL}/api/SecurityDeposit/GetDepositDetail/${payload.admissionId}`);
            if (depData.data?.status && depData.data?.data) {
                setDepositDetail(depData.data.data);
                setSecurityAmountReceived(depData.data.data.amount);
            } else {
                setDepositDetail(null);
                setSecurityAmountReceived(0);
            }
        } catch (err) {
            console.error("Error fetching deposit:", err);
            setDepositDetail(null);
            setSecurityAmountReceived(0);
        }

        setFormData(payload);
    };

    const handleSelectStudent = async (admissionId: number) => {
        setSelectedAdmissionId(admissionId);
        if (!admissionId) return;

        setSearching(true);
        try {
            const filter: FeeInvoiceFilter = {
                pageNo: 1,
                pageSize: 1,
                admissionId: admissionId,
                campusId: campusId || undefined
            };
            const resultAction: any = await dispatch(GetFeeInvoices(filter));
            const invoices = resultAction?.payload?.data;

            if (invoices && Array.isArray(invoices) && invoices.length > 0) {
                const lastInvoice = invoices[0];
                const fullInvoiceData: any = await dispatch(
                    GetInvoiceByNumber({
                        invoiceNumber: lastInvoice.invoiceNumber,
                        campusId: lastInvoice.campusId || campusId
                    })
                );
                const payload = fullInvoiceData?.payload;
                if (payload) {
                    await populateInvoiceData(payload);
                    toast.success(`Loaded last fee invoice (${payload.invoiceNumber}) for student.`);
                } else {
                    toast.error("Could not fetch details for student's last invoice.");
                }
            } else {
                toast.error("No fee invoices found for the selected student.");
                handleCancel();
            }
        } catch (error) {
            console.error("Error fetching last invoice for student:", error);
            toast.error("Error fetching student invoice.");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInvoiceData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInvoice.invoiceNumber) {
            toast.error("Please enter a Voucher Number or select a student.");
            return;
        }
        setSearching(true);
        try {
            const data: any = await dispatch(GetInvoiceByNumber(searchInvoice));
            const payload = data?.payload;
            if (payload) {
                await populateInvoiceData(payload);
            } else {
                toast.error("Invoice not found. Please check the voucher number.");
            }
        } catch (error) {
            toast.error("Failed to fetch invoice data. Please check the voucher number and try again.");
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (location.state?.invoiceNumber) {
            handleSearchInvoiceData({ preventDefault: () => {} } as React.FormEvent);
            // Optional: clear state so refresh doesn't trigger it again
            window.history.replaceState({}, document.title)
        }
    }, [location.state?.invoiceNumber]);

    const handleReceiptChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        detailId: number,
        feeTypeId: number,
        month: string,
        maxAmount: number
    ) => {
        const value = parseFloat(e.target.value) || 0;

        // Validation: Don't allow values higher than remainingAmount or less than 0
        if (value > maxAmount) {
            toast.error(`Amount cannot exceed the remaining balance of ${maxAmount}`);
            return;
        }
        if (value < 0) return;

        setSearchInvoice((prev) => ({
            ...prev,
            detail: prev?.detail?.map((d) =>
                (d.id ? d.id === detailId : (d.feeTypeId === feeTypeId && d.month === month))
                    ? { ...d, amountReceived: value }
                    : d
            ),
        }));
    };
    const totalReceived = useMemo(() => {
        const detailTotal = searchInvoice?.detail?.reduce((sum, item) => {
            return sum + (Number(item.amountReceived) || 0);
        }, 0) || 0;
        return detailTotal + securityAmountReceived;
    }, [searchInvoice?.detail, securityAmountReceived]);

    const handleSelectChanges = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        setSearchInvoice(prev => ({
            ...prev,
            [name]: selectedId
        }));
    };


    // 2. Sync campusId and userId when loginInfo or user details change

    const [isActionLoading, setIsActionLoading] = useState(false);
    const handleSaveReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        // Add "|| 0" at the very end of the expression
        const totalReceivedAmount = searchInvoice?.detail?.reduce((sum, item) => {
            return sum + (Number(item?.amountReceived) || 0);
        }, 0) || 0; // This ensures the result is 0 if detail is undefined
        // --- 1. Validation Logic ---
        const hasDetails = searchInvoice.detail && searchInvoice.detail.length > 0;
        const hasAmount = totalReceived > 0;
        const hasAccount = !!searchInvoice.receiptAccount;

        if (!hasDetails) {
            toast.error("No fee details found for this invoice.");
            setIsActionLoading(false);
            return;
        }

        if (!hasAccount) {
            toast.error("Please select a Bank/Cash account.");
            setIsActionLoading(false);
            return;
        }

        if (!hasAmount) {
            toast.error("Total amount received must be greater than 0.");
            setIsActionLoading(false);
            return;
        }

        // Filter out rows where amountReceived is 0 to send clean data to API
        const finalPayload = {
            ...searchInvoice,
            detail: searchInvoice?.detail?.filter(d => d.amountReceived > 0)
        };

        try {
            // Only call ManualReceiptDiscount if there are regular fee items to pay
            if (totalReceivedAmount > 0) {
                await dispatch(ManualReceiptDiscount(finalPayload as ManualReceiptPayload));
            }

            // Call ReceiveDeposit if security amount is entered
            if (securityAmountReceived > 0 && depositDetail) {
                await dispatch(ReceiveDeposit({
                    admissionId: formData.admissionId,
                    amount: securityAmountReceived,
                    actionDate: dayjs().format("YYYY-MM-DD"),
                    userId: userId,
                    accountSettingType: "security_deposit_received"
                }));
            }

            // --- 2. Reset State as requested ---
            setSearchInvoice({
                invoiceNumber: 0,
                campusId: campusId,
                // detail, receiptAccount, and referenceNo are removed
            });
            setDepositDetail(null);
            setSecurityAmountReceived(0);

            // Clear form data to hide the invoice details UI
            // --- 3. Full Reset of formData State ---
            setFormData({
                id: 0,
                campusId: campusId,
                studentNumber: '',
                fatherName: '',
                campusName: '',
                admissionId: 0,
                firstName: '',
                lastName: '',
                session: '',
                grade: '',
                invoiceVoucherId: 0,
                invoiceNumber: 0,
                invoiceDate: '',
                monthFrom: '',
                monthTo: '',
                dueDate: '',
                totalAmount: 0,
                totalDiscount: 0,
                netAmount: 0,
                amountReceived: 0,
                invoiceStatusId: 0,
                status: '',
                orderNumber: '',
                orderId: '',
                details: [],
                receipts: []
            });

        } catch (error) {
            toast.error("Failed to save receipt.");
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedSectionId(0);
        setSelectedAdmissionId(0);
        setSearchInvoice({
            invoiceNumber: 0,
            campusId: campusId,
        });
        setFormData({
            id: 0,
            campusId: campusId,
            studentNumber: '',
            fatherName: '',
            campusName: '',
            admissionId: 0,
            firstName: '',
            lastName: '',
            session: '',
            grade: '',
            invoiceVoucherId: 0,
            invoiceNumber: 0,
            invoiceDate: '',
            monthFrom: '',
            monthTo: '',
            dueDate: '',
            totalAmount: 0,
            totalDiscount: 0,
            netAmount: 0,
            amountReceived: 0,
            invoiceStatusId: 0,
            status: '',
            orderNumber: '',
            orderId: '',
            details: [],
            receipts: []
        });
        setDepositDetail(null);
        setSecurityAmountReceived(0);
        toast.dismiss();
    };






    const statusLower = (formData?.status || "").toString().toLowerCase().trim();
    const isCompleted = statusLower === "completed" || statusLower === "paid" || formData?.invoiceStatusId === 2;
    const isCancelled = statusLower === "cancel" || statusLower === "cancelled";
    const isCompletedOrCancelled = isCompleted || isCancelled;

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
                                    Add Fee Receipt
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Link to={routes.feeReceipt} className="btn btn-primary">
                            <i className="ti ti-file-invoice me-1" /> Single Fee Receipt
                        </Link>
                        <Link to={routes.bulkFeeReceipt} className="btn btn-outline-primary">
                            <i className="ti ti-files me-1" /> Bulk Fee Receipt
                        </Link>
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <form onSubmit={handleSearchInvoiceData}>
                            <div className="card">
                                <div className="card-body pb-1">

                                    <div className="row">
                                        {loginInfo?.userLevel === 1 && (
                                            <div className="col-md-3 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Region</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={regionsList}
                                                        onChange={(option) => handleSelectRegion('regions', option)}
                                                        value={regionId ? regionsList.find(r => r.value === regionId) : regionsList[0]}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                                            <div className="col-md-3 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Campus</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={campuses}
                                                        onChange={(option) =>
                                                            handleSelectCampus('campusId', option)
                                                        }
                                                        value={searchInvoice?.campusId ? campuses.find(c => c.value === searchInvoice?.campusId) : campuses[0]}
                                                    />
                                                    {errors.campusId && <small className="text-danger">{errors.campusId}</small>}
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-md-3 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Section</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={sectionOptions}
                                                    onChange={(option) => {
                                                        const sId = Number(option?.value || 0);
                                                        setSelectedSectionId(sId);
                                                        setSelectedAdmissionId(0);
                                                    }}
                                                    value={selectedSectionId ? sectionOptions.find(s => Number(s.value) === selectedSectionId) || null : sectionOptions[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Student (Admission)</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={studentOptions}
                                                    onChange={(option) => {
                                                        const aId = Number(option?.value || 0);
                                                        handleSelectStudent(aId);
                                                    }}
                                                    value={selectedAdmissionId ? studentOptions.find(s => Number(s.value) === selectedAdmissionId) || null : studentOptions[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Voucher Number</label>
                                                <input type="text"
                                                    className="form-control"
                                                    name="invoiceNumber"
                                                    onChange={handleSearchInvoice}
                                                    value={searchInvoice.invoiceNumber || ''}
                                                    placeholder="Enter Voucher Number"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-3 mb-3 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary mt-1"
                                                disabled={searching}
                                            >
                                                {searching ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" /> Searching...</>
                                                ) : (
                                                    'Fetch Invoice'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                    {formData?.id > 0 && (
                        <>
                            <div className="col-md-12">
                                <div className="card shadow-sm mb-4">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Session :</strong>
                                                    <span>{formData?.session || ''}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Grade :</strong>
                                                    <span>{formData?.grade || ''}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Registration No :</strong>
                                                    <span>{formData?.studentNumber || ''}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Name :</strong>
                                                    <span>{formData?.firstName + ' ' + formData?.lastName || ''}</span>
                                                </div>
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Invoice Status :</strong>
                                                    <span className={`badge ${isCompleted ? 'bg-success' : isCancelled ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                                        {formData?.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Voucher Number :</strong>
                                                    <span>{formData?.invoiceNumber || ''}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Invoice Date :</strong>
                                                    <span>
                                                        {dayjs(formData?.invoiceDate).format("DD-MMM-YYYY")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="d-flex justify-content-between border-bottom pb-2">
                                                    <strong>Due Date :</strong>
                                                    <span className="text-danger">{dayjs(formData?.dueDate).format("DD-MMM-YYYY")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isCompletedOrCancelled ? (
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body text-center py-4">
                                            {isCompleted && (
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <i className="ti ti-circle-check-filled text-success" style={{ fontSize: "36px", color: "#008a00" }}></i>
                                                    <h4 className="text-success mb-0 fw-bold">Completed</h4>
                                                </div>
                                            )}
                                            {isCancelled && (
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <i className="ti ti-circle-x-filled text-primary" style={{ fontSize: "36px", color: "#0d6efd" }}></i>
                                                    <h4 className="text-primary mb-0 fw-bold">Cancelled</h4>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="card shadow-sm mb-4">
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-striped align-middle">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Fee Type</th>
                                                                <th>Invoice Amount</th>
                                                                <th>Discount</th>
                                                                <th>Balance</th>
                                                                <th style={{ width: '200px' }}>Receipt Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formData?.details?.map(item => {
                                                                // Find the corresponding state entry for this specific fee item (by unique id first, then fallback to feeTypeId+month)
                                                                const stateDetail = searchInvoice?.detail?.find(d => d.id ? d.id === item.id : (d.feeTypeId === item.feeTypeId && d.month === item.invoiceMonth));
                                                                return (
                                                                    <tr key={item?.id}>
                                                                        <td><strong>{item?.feeName}</strong> <small>({dayjs(item?.invoiceMonth).format("MMM-YYYY")})</small></td>
                                                                        <td>{item?.invoiceAmount}</td>
                                                                        <td>{item?.discountAmount}</td>
                                                                        <td>{item?.remainingAmount}</td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                // Show the value from searchInvoice state
                                                                                value={stateDetail?.amountReceived !== undefined && stateDetail?.amountReceived !== null ? stateDetail.amountReceived : ""}
                                                                                onChange={(e) => handleReceiptChange(e, item.id, item.feeTypeId, item.invoiceMonth, item.remainingAmount)}
                                                                                placeholder="RECEIPT AMOUNT"
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                            {depositDetail && depositDetail.amount > 0 && (
                                                                <tr>
                                                                    <td><strong>Security</strong></td>
                                                                    <td>{depositDetail.amount}</td>
                                                                    <td>0</td>
                                                                    <td>{depositDetail.amount}</td>
                                                                    <td>
                                                                        <div className="form-check form-switch">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                style={{ cursor: 'pointer' }}
                                                                                checked={securityAmountReceived === depositDetail.amount}
                                                                                onChange={(e) => {
                                                                                    setSecurityAmountReceived(e.target.checked ? depositDetail.amount : 0);
                                                                                }}
                                                                            />
                                                                            <label className="form-check-label">
                                                                                {securityAmountReceived === depositDetail.amount ? "Full Amount" : "Pay Full"}
                                                                            </label>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                        <tfoot className="table-dark">
                                                            <tr>
                                                                <td colSpan={3} className="text-end"><strong>TOTAL AMOUNT</strong></td>
                                                                <td>{formData?.netAmount + (depositDetail?.amount || 0)}</td>
                                                                <td><strong>{totalReceived}</strong></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card shadow-sm">
                                            <div className="card-header bg-white">
                                                <h5 className="card-title mb-0">Payment Details</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Bank/Cash <span className="text-danger">*</span></label>
                                                        <CommonSelect3
                                                            className="select"
                                                            options={combinedOptions}
                                                            onChange={(option) => handleSelectChanges('receiptAccount', option)}
                                                            value={
                                                                searchInvoice?.receiptAccount
                                                                    // Cast both sides to Number
                                                                    ? combinedOptions.find(r => Number(r?.value) === Number(searchInvoice?.receiptAccount))
                                                                    : combinedOptions[0]
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Transaction ReferenceNo</label>
                                                        <input type="text" className="form-control" onChange={e => handleChange('referenceNo', e.target.value)} name="referenceNo" placeholder="Enter Reference No" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isCompletedOrCancelled && (
                                <div className="col-md-12 text-end mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-light me-2"
                                        onClick={handleCancel}
                                        disabled={isActionLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={handleSaveReceipt}
                                        disabled={isActionLoading || totalReceived === 0}
                                    >
                                        {isActionLoading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" /> Saving...</>
                                        ) : (
                                            'Save Receipt'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >
        </div>
    );
};

export default FeeReceipt;