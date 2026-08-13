import React, { ChangeEvent, useEffect, FormEvent, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { useCities } from "../../../core/common/selectoption/address/useCities";
import { TagsInput } from "react-tag-input-component";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2"
import CommonSelect3 from "../../../core/common/commonSelect3"
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { useLastAcademicSession } from '../../../core/common/selectoption/academic/useLastAcademicSession';
import { BulkInvoicePayload, GenerateBulkInvoice, GetFeeInvoices, FeeInvoiceFilter, CancelInvoice, CancelInvoicePayload } from '../../../store/apps/fee-invoice'
import { useAcademicSessions } from '../../../core/common/selectoption/academic/useAcademicSessions';
import toast from "react-hot-toast";
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { CompnayIcon, BrandName, PoweredBy, feeTermsConditions, getRegionLogoUrl } from '../../../environment'
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

const BulkFeePrint = () => {
    const routes = all_routes;
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false); // New state
    const { data: datalist, totalCount, totalPages, currentPage, loading } = useSelector((state: RootState) => state.feeInvoice);
    const dispatch = useDispatch<AppDispatch>();
    const sessions = useAcademicSessions();
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const userId = loginInfo?.id
    const regionsList = useRegionsList();

    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    const handleSelectRegion = (name: string, option: any) => {
        setRegionId(option?.value ?? 0);
    }
    const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
    const grades = useAcademicGrades()

    const [campusId, setCampusId] = useState<number>(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0);


    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<InvoiceFilterPayload>({
        pageNo: 1, // Usually starts at 1 for pagination
        pageSize: 10000, // Default page size
        gradeId: 0,
        sessionId: 0,
        campusId: 0,
        // Setting dates to start and end of current day in ISO format
        dateFrom: dayjs().startOf('day').toISOString(),
        dateTo: dayjs().endOf('day').toISOString(),
        // admissionId: 0,
        status: "pending", // Default status
    });



    // useEffect(() => {
    //     dispatch(GetFeeInvoices(formData as FeeInvoiceFilter))
    // }, [dispatch, formData])
    const handleChange = (name: keyof InvoiceFilterPayload, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 3. Update handleSelectCampus to also update formData
    const handleSelectCampus = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        setCampusId(selectedId);
        setFormData(prev => ({
            ...prev,
            campusId: selectedId
        }));
    };
    const handleSelectChanges = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        setFormData(prev => ({
            ...prev,
            [name]: selectedId
        }));
    };


    // 2. Sync campusId and userId when loginInfo or user details change
    useEffect(() => {
        // 1. Guard clause: Wait until loginInfo is actually available
        if (!loginInfo || !userId) return;
        // 2. Determine Campus ID (Ensure it defaults to 0 if not Level 3)
        const effectiveCampusId = loginInfo.userLevel === 3 ? loginInfo.userLevelId : 0;
        // 3. Update states
        setCampusId(effectiveCampusId);
        setFormData(prev => ({
            ...prev,
            campusId: effectiveCampusId
        }));

        // Only re-run when these specific values change
    }, [loginInfo?.userLevel, loginInfo?.userLevelId, userId]);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        setErrors({}); // Clear previous errors

        // --- Validation Logic ---
        const newErrors: { [key: string]: string } = {};

        if (!formData.campusId || formData.campusId === 0) {
            newErrors.campusId = "Please select a campus.";

        }
        if (!formData.gradeId || formData.gradeId === 0) {
            newErrors.gradeId = "Please select a grade.";
        }
        if (!formData.dateFrom || !formData.dateTo) {
            newErrors.period = "Invoice period is required.";
        }
        if (!formData.status) {
            newErrors.status = "Status is required.";
        }
        // If there are errors, stop execution
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields.");
            setIsActionLoading(false);
            return;
        }
        try {
            await dispatch(GetFeeInvoices(formData as FeeInvoiceFilter));
            setHasSearched(true);
            // if (GenerateBulkInvoice.fulfilled.match(resultAction)) {
            //     const results = resultAction.payload; // This is the array of { isSuccess, message, etc. }


            //     // Check if there were any actual successes
            //     const successCount = results.filter((r: any) => r.isSuccess).length;
            //     const failureCount = results.filter((r: any) => !r.isSuccess).length;

            //     if (successCount > 0) {
            //         toast.success(`Successfully generated ${successCount} invoices.`);
            //     }

            //     if (failureCount > 0) {
            //         toast.error(`${failureCount} invoices skipped (already exist or error).`);
            //     }
            // }
        } catch (error) {
            console.error("Failed to generate invoices", error);
        } finally {
            setIsActionLoading(false);
        }
    }






    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Print Bulk Fee Invoices</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={routes.feeInvoices}>Fee Invoices</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Print Bulk Fee Invoices
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <form onSubmit={handleSave}>
                            <div className="card pb-5">
                                <div className="card-header bg-light">
                                    <div className="d-flex align-items-center">
                                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                                            <i className="ti ti-printer fs-16" />
                                        </span>
                                        <h4 className="text-dark">Print Bulk Fee Invoices</h4>
                                    </div>
                                </div>
                                <div className="card-body pb-1">

                                    <div className="row">
                                        {loginInfo?.userLevel === 1 && (
                                            <div className="col-md-6 mb-3">
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
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Campus</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={campuses}
                                                        onChange={(option) =>
                                                            handleSelectCampus('campusId', option)
                                                        }
                                                        value={formData?.campusId ? campuses.find(c => c.value === formData?.campusId) : campuses[0]}
                                                    />
                                                    {errors.campusId && <small className="text-danger">{errors.campusId}</small>}
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Sessions</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={sessions}
                                                    onChange={(option) => handleSelectChanges('sessionId', option)}
                                                    value={formData?.sessionId ? sessions.find(r => r.value === formData?.sessionId) : sessions[0]}
                                                />
                                                {errors.sessionId && <small className="text-danger">{errors.sessionId}</small>}
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Grades</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={grades}
                                                    onChange={(option) => handleSelectChanges('gradeId', option)}
                                                    value={formData?.gradeId ? grades.find(r => r.value === formData?.gradeId) : grades[0]}
                                                />
                                                {errors.gradeId && <small className="text-danger">{errors.gradeId}</small>}
                                            </div>
                                        </div>



                                        <div className="col-md-6 mb-3">
                                            <div className="input-icon position-relative">
                                                <label className="form-label mb-0">Invoice Months</label>
                                                {/* Use 'row' to create a horizontal container and 'align-items-center' for vertical alignment */}
                                                <div className="row align-items-center mt-2">
                                                    <div className="input-icon position-relative">
                                                        <RangePicker
                                                            className="form-control datetimepicker w-100"
                                                            format="DD-MM-YYYY"
                                                            // CHANGE: Set a border color instead of 'none'
                                                            style={{
                                                                border: '1px solid #E9EDF4',
                                                                boxShadow: 'none',
                                                                height: '38px' // Matching your previous div height
                                                            }}
                                                            value={[
                                                                formData.dateFrom ? dayjs(formData.dateFrom) : null,
                                                                formData.dateTo ? dayjs(formData.dateTo) : null
                                                            ]}
                                                            onChange={(dates) => {
                                                                if (dates && dates[0] && dates[1]) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        dateFrom: dates[0]?.format('YYYY-MM-DD') ?? '',
                                                                        dateTo: dates[1]?.format('YYYY-MM-DD') ?? ''
                                                                    }));
                                                                } else {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        dateFrom: '',
                                                                        dateTo: ''
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-icon-addon" style={{ zIndex: 5 }}>
                                                            <i className="ti ti-calendar" />
                                                        </span>
                                                    </div>
                                                    {errors.period && <small className="text-danger">{errors.period}</small>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={feesStatuses}
                                                    onChange={(option) => handleSelectChanges('status', option?.value)}
                                                    value={formData?.status ? feesStatuses.find(r => r.value === formData?.status) : feesStatuses[0]}
                                                />
                                                {errors.status && <small className="text-danger">{errors.status}</small>}

                                            </div>
                                        </div> */}
                                        <div className="col-md-6 mb-3 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" /> Generating...</>
                                                ) : (
                                                    'Show Invoices'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        {hasSearched && datalist && datalist.length > 0 ? (
                            <LandscapeFeeVoucher datalist={datalist} />
                        ) : hasSearched && !loading ? (
                            <div className="card p-4 text-center">
                                <h5>No invoices found for the selected criteria.</h5>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div >
        </div>
    );
};

interface VoucherData {
    id: number;
    school: string;
    campus: string;
    voucherNo: string;
    studentName: string;
    studentImage: string;
    fatherName: string;
    regNo: string;
    grade: string;
    month: string;
    dueDate: string;
    validityDate: string;
    bankName: string;
    accTitle: string;
    iban: string;
    tuitionFee: number;
    annualCharges: number;
    discount: number;
    totalPayable: number;
}

interface Props {
    datalist: any[];
}

const LandscapeFeeVoucher: React.FC<Props> = ({ datalist }) => {
    // 1. CALL ALL HOOKS FIRST
    const dispatch = useDispatch<AppDispatch>();
    const contentRef = useRef<HTMLDivElement>(null);
    const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);

    // Fetch bank details when datalist changes
    useEffect(() => {
        if (datalist && datalist.length > 0) {
            const campusId = datalist[0].campusId;
            if (campusId) {
                dispatch(GetCampusBanksByCampus(campusId));
            }
        }
    }, [datalist, dispatch]);
    const [deposits, setDeposits] = useState<any[]>([]);
    // Fetch security deposits for all students in the list
    useEffect(() => {
        const fetchDeposits = async () => {
            if (datalist && datalist.length > 0) {
                try {
                    const admissionIds = datalist.map(item => item.admissionId).filter((v, i, a) => a.indexOf(v) === i);
                    const depositPromises = admissionIds.map(id =>
                        axios.get(`${baseURL}/api/SecurityDeposit/GetDepositDetail/${id}`)
                            .then(res => res.data)
                            .catch(() => ({ status: false }))
                    );
                    const results = await Promise.all(depositPromises);
                    const validDeposits = results
                        .filter(r => r.status && r.data)
                        .map(r => r.data);
                    setDeposits(validDeposits);
                } catch (error) {
                    console.error("Error fetching deposits:", error);
                }
            }
        };
        fetchDeposits();
    }, [datalist]);

    // Transform your datalist into the voucher format
    const vouchersData = useMemo(() => {
        return datalist?.map((item) => {
            const deposit = deposits.find(d => d.admissionId === item.admissionId);
            const details = item.details ? [...item.details] : [];
            let totalPayable = item.netAmount;

            if (deposit && deposit.amount > 0 && deposit.depositedAt === null) {
                // Check if already added to avoid duplicates if re-rendered
                const exists = details.find(d => d.feeName === "Security");
                if (!exists) {
                    details.push({
                        feeName: "Security",
                        remainingAmount: deposit.amount
                    });
                    totalPayable += deposit.amount;
                }
            }

            return {
                id: item.id,
                school: BrandName, // Static or from item if available
                campus: item.campusName?.toUpperCase() || "CENTRAL CAMPUS",
                voucherNo: item.invoiceNumber?.toString(),
                studentName: `${item.firstName} ${item.lastName}`.toUpperCase(),
                studentImage: item.imageUrl
                    ? (item.imageUrl.startsWith('http')
                        ? item.imageUrl
                        : `${baseURL}/${item.imageUrl.replace(/^\//, '')}`)
                    : "/assets/img/students/student-01.jpg",
                fatherName: item.fatherName?.toUpperCase(),
                regNo: item.studentNumber,
                grade: item.grade,
                // Format: "Feb-2026"
                month: dayjs(item.monthFrom).format("MMM-YYYY"),
                dueDate: dayjs(item.dueDate).format("YYYY-MM-DD"),
                validityDate: dayjs(item.dueDate).add(5, 'day').format("YYYY-MM-DD"), // Assuming 5 days validity after due
                logoPath: item.logoPath || item.regionLogoPath || item.tblRegion?.logoPath || item.tblCampus?.tblRegion?.logoPath,
                bankName: bankDetails[0]?.tblAccountBank?.name || "N/A",
                accTitle: bankDetails[0]?.accountTitle || "N/A",
                iban: bankDetails[0]?.iban || "N/A",
                discount: item.totalDiscount,
                totalPayable: totalPayable - (item.amountReceived || 0),
                details: details
            };
        });
    }, [datalist, deposits, bankDetails]);

    if (!datalist || datalist.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>
                <h5>No voucher data available to display.</h5>
            </div>
        );
    }




    const handlePrint = () => {
        window.print();
    };

    const VoucherSection: React.FC<{ title: string; data: any }> = ({ title, data }) => (
        <div style={{
            width: '33.333%',
            padding: '8mm 6mm',
            borderRight: title !== 'PARENT COPY' ? '1px dashed #000' : 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxSizing: 'border-box',
            fontSize: '10.5px',
            backgroundColor: '#fff',
            WebkitPrintColorAdjust: 'exact',
            color: '#000',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.01em'
        }}>
            {/* Header Section with Logo */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '4px'
                }}>
                    {/* Region / Company Logo */}
                    <img
                        src={getRegionLogoUrl(data.logoPath)}
                        alt="Logo"
                        style={{
                            width: '40px',
                            height: '60px',
                            objectFit: 'contain'
                        }}
                    />

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontFamily: "'RevuenCustom', sans-serif", fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {BrandName}
                        </h2>
                        <p style={{ margin: 0, fontFamily: "'RevuenCustom', sans-serif", fontSize: '12px', fontWeight: 500 }}>{data.campus}</p>
                    </div>
                </div>

                {/* Curved Title Box */}
                <div style={{
                    border: '2px solid #000',
                    padding: '4px',
                    fontWeight: 700,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    borderRadius: '6px'
                }}>
                    {title}
                </div>
            </div>

            {/* Barcode */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <Barcode renderer="svg" value={data.voucherNo} width={0.8} height={25} fontSize={10} margin={0} lineColor="#000" />
            </div>

            {/* Student Details Row */}
            <div style={{ display: 'flex', marginBottom: '10px', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, lineHeight: '1.5' }}>
                    <strong>Voucher No:</strong> {data.voucherNo} <br />
                    <strong>Student:</strong> <span style={{ fontWeight: 700, fontSize: '11px' }}>{data.studentName}</span> <br />
                    <strong>Father:</strong> {data.fatherName} <br />
                    <strong>Reg #:</strong> {data.regNo} <br />
                    <strong>Grade:</strong> {data.grade} <br />
                    <strong>Month:</strong> {data.month}
                </div>

                {/* Curved Image Box */}
                <div style={{ border: '1.5px solid #000', padding: '1px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={data.studentImage} alt="Profile" style={{ width: '55px', height: '60px', objectFit: 'cover', display: 'block' }} />
                </div>
            </div>

            {/* Fee Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', color: '#000' }}>
                <thead>
                    <tr style={{ borderBottom: '2.5px solid #000' }}>
                        <th align="left" style={{ padding: '4px 0', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Description</th>
                        <th align="right" style={{ padding: '4px 0', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Amount</th>
                    </tr>
                </thead>
                <tbody style={{ fontWeight: 500 }}>
                    {data?.details?.map((data: any) => (
                        <tr>
                            <td style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}> <b>{data?.feeName}</b> {data?.invoiceMonth ? `(${dayjs(data.invoiceMonth).format("MMM-YYYY")})` : ""}</td>
                            <td align="right" style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>{data.remainingAmount}</td>
                        </tr>
                    ))}



                    {/* Discount Row */}
                    <tr>
                        <td style={{ padding: '4px 0', borderBottom: '1px solid #ddd' }}><strong>Discount</strong></td>
                        <td align="right" style={{ padding: '4px 0', borderBottom: '1px solid #ddd' }}><strong>({data?.discount})</strong></td>
                    </tr>

                    {/* Total Payable Row */}
                    <tr style={{ fontSize: '13px' }}>
                        <td style={{ padding: '6px 0' }}><strong>Amount payable:</strong></td>
                        <td align="right" style={{ padding: '6px 0' }}><strong style={{ fontSize: '14px' }}>{data?.totalPayable}</strong></td>
                    </tr>
                    {/* <tr style={{ fontSize: '10px' }}>
                        <td style={{ borderBottom: '2.5px solid #000' }}><strong>Amount Paid:</strong></td>
                        <td align="right" style={{ borderBottom: '2.5px solid #000' }}><strong style={{ fontSize: '10px' }}>{data.totalPayable.toLocaleString()}</strong></td>
                    </tr> */}
                </tbody>
            </table>

            {/* Curved Due Date Box */}
            <div style={{
                border: '2px solid #000',
                padding: '8px',
                marginBottom: '10px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
            }}>
                <div style={{ fontSize: '13px', fontWeight: 800 }}>DUE DATE: {data.dueDate}</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>VALID FOR BANK: {data.validityDate}</div>
            </div>

            {/* Curved Bank Details Section */}
            {bankDetails?.length > 0 && (
                <div style={{
                    fontSize: '9px',
                    border: '1.5px solid #000',
                    padding: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '8px'
                }}>
                    <div style={{ lineHeight: '1.6' }}>
                        <strong style={{ fontSize: '10px', textTransform: 'uppercase' }}>Bank Details</strong><br />
                        Bank: {data.bankName}<br />
                        Title: {data.accTitle}<br />
                        IBAN: <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '10px' }}>{data.iban}</span>
                    </div>
                    <QRCodeCanvas value={`${data.iban}`} size={50} level="H" fgColor="#000" />
                </div>
            )}

            {/* Fee Instructions */}
            <div style={{ fontSize: '7.8px', lineHeight: '1.3', fontWeight: 500, whiteSpace: 'pre-line' }}>
                {feeTermsConditions}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '9px', borderTop: '1px solid #000', paddingTop: '5px', fontWeight: 600 }}>
                Powered by <span style={{ fontWeight: 800 }}>{PoweredBy}</span>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', backgroundColor: '#525659', minHeight: '100vh' }}>
            <style>{`
        @media screen {
          .voucher-page {
            background: white;
            display: flex;
            margin: 20px auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
            width: 297mm;
            height: 210mm;
          }
        }

        @media print {
          /* 1. Force Landscape and Strip Margins */
          @page {
            size: landscape;
            margin: 0 !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important; /* Allow body to span multiple pages  */
            overflow: visible !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden;
          }

          #print-area, #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
          }

          .voucher-page {
            width: 297mm !important;
            /* 2. Safety Buffer: Set to 200mm (A4 is 210mm) to prevent blank pages  */
            height: 200mm !important; 
            display: flex !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important; /* Lock content inside the safety zone  */
          }

          /* 3. Logic: Only break pages AFTER vouchers that are NOT the last one  */
          .voucher-page:not(:last-child) {
            page-break-after: always !important;
            break-after: page !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

            <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={handlePrint}
                    style={{ padding: '12px 24px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Print Vouchers
                </button>
            </div>

            <div id="print-area" ref={contentRef}>
                {vouchersData.map((student) => (
                    <div key={student.id} className="voucher-page">
                        <VoucherSection title="BANK COPY" data={student} />
                        <VoucherSection title="SCHOOL COPY" data={student} />
                        <VoucherSection title="PARENT COPY" data={student} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BulkFeePrint;






