import React, { ChangeEvent, useEffect, FormEvent, useState, useRef } from "react";
import { Link } from "react-router-dom";
// import { feeGroup, feesTypes, paymentType } from '../../../core/common/selectoption/selectoption'
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../router/all_routes";

import useRegionsList from "../../../core/common/selectoption/master/useRegions";

import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2"
import CommonSelect3 from "../../../core/common/commonSelect3"
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { useLastAcademicSession } from '../../../core/common/selectoption/academic/useLastAcademicSession';
import { BulkInvoicePayload, GenerateBulkInvoice, GetFeeInvoices, FeeInvoiceFilter, CancelInvoice, CancelInvoicePayload } from '../../../store/apps/fee-invoice'
import { useHoChartOfAccount4thLevelAll } from '../../../core/common/selectoption/financial/useHoChartOfAccount4thLevelAll';
import toast from "react-hot-toast";
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { CompnayIcon, BrandName, PoweredBy, feeTermsConditions, getRegionLogoUrl } from '../../../environment'
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import { ex } from "@fullcalendar/core/internal-common";
import { GetFinancialYears } from "../../../store/apps/financial-year";
import { useReactToPrint } from 'react-to-print';

const baseURL = process.env.REACT_APP_API_BASE_URL

const { RangePicker } = DatePicker;

const getVoucherShortCode = (voucherType: string) => {
    if (!voucherType) return "";

    // Logic: Split by space and take the first letter of each word
    return voucherType
        .split(' ')
        .map(word => word[0].toUpperCase())
        .join('');
};

/**
 * Formats a number for financial reporting.
 * Handles decimals and wraps negative values in parentheses.
 */
export const formatNumber = (
    value: number | string | undefined | null,
    locale: string = 'en-US',
    options: Intl.NumberFormatOptions = {},
    includeDecimals: boolean = false
): string => {
    // Ensure value is a valid number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numericValue === null || numericValue === undefined || isNaN(numericValue as number)) {
        return '0';
    }

    const num = numericValue as number;

    const defaultOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits: includeDecimals ? 2 : 0,
        maximumFractionDigits: includeDecimals ? 2 : 0,
        ...options,
    };

    // Format the number
    const formattedNumber = new Intl.NumberFormat(locale, defaultOptions).format(num);

    // Financial Standard: Wrap negative values in parentheses
    if (num < 0) {
        return `(${formattedNumber.replace('-', '')})`;
    }

    return formattedNumber;
};

interface FormData {
    financialYearId: number;
    accountId: number;
    fromDate: string;
    toDate: string;
}
const LedgerReports = () => {
    const routes = all_routes;
    const dispatch = useDispatch<AppDispatch>();
    const { data: financialYears, loading } = useSelector((state: RootState) => state.financialYear);
    const reportRef = useRef<HTMLDivElement>(null);
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const createdBy = loginInfo?.id
    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    const accounts4thLevel = useHoChartOfAccount4thLevelAll(regionId ?? 0)
    useEffect(() => {
        dispatch(GetFinancialYears());
    }, [dispatch])

  
    const [formData, setFormData] = useState<FormData>({
        financialYearId: 0,
        accountId: 0,
        fromDate: '',
        toDate: '',
    });

    useEffect(() => {
        // Check if the array exists and has at least one item
        if (financialYears && financialYears.length > 0) {

            // Get the very last item in the array
            const lastYear = financialYears[financialYears.length - 1];

            // Update the form state with the last index data
            setFormData((prev) => ({
                ...prev,
                financialYearId: lastYear.id,
                // Format dates to 'YYYY-MM-DD' so they work with HTML5 date inputs
                fromDate: dayjs(lastYear.fromDate).format('YYYY-MM-DD'),
                toDate: dayjs(lastYear.toDate).format('YYYY-MM-DD'),
            }));
        }
    }, [financialYears]);


    const handleSelectChanges = (field: string, option: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: option?.value || 0,
        }));
    }
    const [searching, setSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearching(true);
        try {
            const response = await axios.post(`${baseURL}/api/HOReport/GeneralLedger`, formData);
            setReportData(response.data); // Store the JSON data
            toast.success("Report data fetched successfully!");
        } catch (error) {
            toast.error("An error occurred while generating the report. Please try again.");
        } finally {
            setSearching(false);
        }

    }
    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Ledger Reports</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                {/* <li className="breadcrumb-item">
                                            <Link to={routes.feeInvoices}>Fee Invoices</Link>
                                        </li> */}
                                <li className="breadcrumb-item active" aria-current="page">
                                    Ledger Reports
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <form onSubmit={handleGenerateReport}>
                            <div className="card pb-5">
                                <div className="card-header bg-light">
                                    <div className="d-flex align-items-center">
                                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                                            <i className="ti ti-printer fs-16" />
                                        </span>
                                        <h4 className="text-dark">Ledger Reports</h4>
                                    </div>
                                </div>
                                <div className="card-body pb-1">

                                    <div className="row">

                                        <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Chart of Account</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={accounts4thLevel}
                                                    onChange={(option) => handleSelectChanges('accountId', option)}
                                                    value={
                                                        formData?.accountId
                                                            ? accounts4thLevel.find(r => r.value === formData.accountId.toString())
                                                            : accounts4thLevel[0]
                                                    }
                                                />
                                            </div>
                                        </div>


                                        <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Financial Year</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={financialYears?.map((year) => ({
                                                        value: year.id, // This is a number
                                                        label: year.name
                                                    })) || []}
                                                    onChange={(option) => handleSelectChanges('financialYearId', option)}
                                                    value={
                                                        formData?.financialYearId
                                                            ? financialYears
                                                                ?.filter(year => year.id === formData.financialYearId) // Find the original record
                                                                .map(year => ({ value: year.id, label: year.name }))[0] // Map it to match the Select structure
                                                            : {
                                                                value: financialYears?.[financialYears.length - 1]?.id,
                                                                label: financialYears?.[financialYears.length - 1]?.name
                                                            }
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="input-icon position-relative">
                                                <label className="form-label mb-0">Date Range</label>
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
                                                                formData.fromDate ? dayjs(formData.fromDate) : null,
                                                                formData.toDate ? dayjs(formData.toDate) : null
                                                            ]}
                                                            onChange={(dates) => {
                                                                if (dates && dates[0] && dates[1]) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        fromDate: dates[0]?.format('YYYY-MM-DD') ?? '',
                                                                        toDate: dates[1]?.format('YYYY-MM-DD') ?? ''
                                                                    }));
                                                                } else {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        fromDate: '',
                                                                        toDate: ''
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-icon-addon" style={{ zIndex: 5 }}>
                                                            <i className="ti ti-calendar" />
                                                        </span>
                                                    </div>
                                                    {/* {errors.period && <small className="text-danger">{errors.period}</small>} */}
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
                                                disabled={searching}
                                            >
                                                {searching ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" /> GENERATING...</>
                                                ) : (
                                                    'GENERATE REPORT'
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


                        <GeneralLedgerReport reportData={reportData} BrandName={BrandName} />
                    </div>
                </div>
            </div >
        </div>
    )
}
export default LedgerReports;


const GeneralLedgerReport: React.FC<{ reportData: any, BrandName: string }> = ({ reportData, BrandName }) => {
    const reportRef = useRef<HTMLDivElement>(null);

    if (!reportData?.data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="report-container" style={{ padding: '20px', backgroundColor: '#525659', minHeight: '100vh' }}>
            <style>{`
        @media screen {
            .a4-page {
                background: white;
                width: 210mm;
                min-height: 297mm;
                margin: 20px auto;
                padding: 15mm;
                padding-bottom: 25mm; /* Space for the footer */
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                box-sizing: border-box;
                color: #000;
                position: relative;
            }
        }

        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
            body {
                background: #fff !important;
                -webkit-print-color-adjust: exact;
                color: #000 !important;
            }
            body * {
                visibility: hidden;
                color: #000 !important;
                border-color: #000 !important;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            .a4-page {
                padding: 15mm;
                padding-bottom: 25mm;
                box-sizing: border-box;
            }
            .no-print {
                display: none !important;
            }
            .powered-by-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                text-align: center;
                border-top: 1px solid #000 !important;
                padding: 5px 0;
            }
        }

        .report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            color: #000 !important;
            border: 1px solid #000 !important;
        }
        .report-table th {
            background-color: #000 !important;
            color: #fff !important;
            padding: 8px;
            border: 1px solid #000 !important;
        }
        .report-table td {
            padding: 6px 8px;
            border: 1px solid #000 !important;
            color: #000 !important;
        }
        p, div, h2, h4, span, small, strong {
            color: #000 !important;
        }

        .powered-by-footer {
            margin-top: 40px;
            font-size: 10px;
            color: #000 !important;
            text-align: center;
            font-style: italic;
        }
    `}</style>

            <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                    style={{ padding: '10px 25px', fontWeight: 'bold' }}
                >
                    <i className="ti ti-printer me-2"></i> PRINT GENERAL LEDGER
                </button>
            </div>

            <div id="print-area">
                <div className="a4-page">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <img
                            src={getRegionLogoUrl()}
                            alt="Logo"
                            style={{ maxHeight: '60px', marginBottom: '10px', objectFit: 'contain' }}
                        />
                        <h2 style={{ margin: 0, fontWeight: 700, fontFamily: "'RevuenCustom', sans-serif", fontSize: '26px' }}>
                            {BrandName || "COMPANY NAME"}
                        </h2>
                        <h4 style={{ textDecoration: 'underline', marginTop: '5px', fontWeight: 700 }}>
                            GENERAL LEDGER
                        </h4>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', textAlign: 'left' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '17px' }}>
                                    Account: {reportData.data.accountName}
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong>Nature:</strong> {reportData.data.nature}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0 }}><strong>From:</strong> {dayjs(reportData.data.from).format('DD-MMM-YYYY')}</p>
                                <p style={{ margin: 0 }}><strong>To:</strong> {dayjs(reportData.data.to).format('DD-MMM-YYYY')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th style={{ width: '12%', color: '#fff' }}>Date</th>
                                <th style={{ width: '15%', color: '#fff' }}>Voucher No</th>
                                <th style={{ width: '33%', color: '#fff' }}>Description</th>
                                <th style={{ width: '13%', color: '#fff' }} className="text-end">Debit</th>
                                <th style={{ width: '13%', color: '#fff' }} className="text-end">Credit</th>
                                <th style={{ width: '14%', color: '#fff' }} className="text-end">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Opening Balance:</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{reportData.data.openingBalance.toLocaleString()}</td>
                            </tr>

                            {(() => {
                                let runningBalance = reportData.data.openingBalance;
                                const isCreditNature = ['Liability', 'Equity', 'Revenue'].includes(reportData.data.nature);
                                let sumDebit = 0;
                                let sumCredit = 0;

                                const rows = reportData.data.detail.map((item: any, index: number) => {
                                    const isDebit = item.debitAccountID === reportData.data.accountId;
                                    const debitAmount = isDebit ? item.amount : 0;
                                    const creditAmount = !isDebit ? item.amount : 0;

                                    sumDebit += debitAmount;
                                    sumCredit += creditAmount;

                                    if (isCreditNature) {
                                        runningBalance += (creditAmount - debitAmount);
                                    } else {
                                        runningBalance += (debitAmount - creditAmount);
                                    }

                                    return (
                                        <tr key={index}>
                                            <td>{dayjs(item.voucherDate).format('DD-MM-YY')}</td>
                                            <td style={{ fontWeight: 'bold' }}>{item.voucherNumber} {getVoucherShortCode(item?.voucherType)}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{item.description}</div>
                                                {item.cheaque && <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Chq: {item.cheaque}</div>}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{debitAmount > 0 ? debitAmount.toLocaleString() : '-'}</td>
                                            <td style={{ textAlign: 'right' }}>{creditAmount > 0 ? creditAmount.toLocaleString() : '-'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(runningBalance)}</td>
                                        </tr>
                                    );
                                });

                                return (
                                    <>
                                        {rows}
                                        <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{sumDebit.toLocaleString()}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{sumCredit.toLocaleString()}</td>
                                            <td></td>
                                        </tr>
                                    </>
                                );
                            })()}
                        </tbody>
                    </table>

                    {/* Signatures */}
                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>Prepared By</div>
                        <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>Checked By</div>
                        <div style={{ width: '180px', borderTop: '2px solid #000', textAlign: 'center', paddingTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>Authorized Signatory</div>
                    </div>

                    {/* Powered By Footer */}
                    <div className="powered-by-footer">
                        Powered by <strong>{PoweredBy}</strong> | {dayjs().format('DD-MMM-YYYY HH:mm')}
                    </div>
                </div>
            </div>
        </div>
    );
};