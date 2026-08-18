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
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import { CompnayIcon, BrandName, PoweredBy, feeTermsConditions, getRegionLogoUrl } from '../../../environment'

const baseURL = process.env.REACT_APP_API_BASE_URL

interface VoucherDetail {
    feeName: string;
    remainingAmount: number;
    invoiceMonth?: string;
}

interface StudentItem {
    id: number;
    campusName: string;
    invoiceNumber: string | number;
    firstName: string;
    campusId?: number;
    admissionId?: number;
    lastName: string;
    imageUrl?: string;
    fatherName: string;
    studentNumber: string;
    grade: string;
    invoiceDate: string | Date;
    dueDate: string | Date;
    totalDiscount: number;
    netAmount: number;
    amountReceived?: number;
    details: VoucherDetail[];
}

// 1. Updated Props to expect a single item instead of a list
interface Props {
    data: StudentItem;
}

const SingleFeeVoucher: React.FC<Props> = ({ data }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);
    useEffect(() => {
        const campusId = data?.campusId;// Debug log to check extracted campusId
        if (campusId) {
            dispatch(GetCampusBanksByCampus(campusId));
        }
    }, [data, dispatch]);

    const [deposit, setDeposit] = useState<any>(null);
    useEffect(() => {
        const fetchDeposit = async () => {
            if (data?.admissionId) {
                try {
                    const res = await axios.get(`${baseURL}/api/SecurityDeposit/GetDepositDetail/${data.admissionId}`);
                    if (res.data.status && res.data.data) {
                        setDeposit(res.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching deposit:", error);
                }
            }
        };
        fetchDeposit();
    }, [data?.admissionId]);

    // 3. Transform single data item
    const voucher = useMemo(() => {
        if (!data) return null;
        const details = data.details ? [...data.details] : [];
        let netAmount = data.netAmount;

        if (deposit && deposit.amount > 0 && deposit.depositedAt === null) {
            const exists = details.find(d => d.feeName === "Security");
            if (!exists) {
                details.push({
                    feeName: "Security",
                    remainingAmount: deposit.amount
                });
                netAmount += deposit.amount;
            }
        }

        return {
            id: data.id,
            school: BrandName,
            campus: data.campusName?.toUpperCase() || "CENTRAL CAMPUS",
            voucherNo: data.invoiceNumber?.toString(),
            studentName: `${data.firstName} ${data.lastName}`.toUpperCase(),
            studentImage: data.imageUrl
                ? (data.imageUrl.startsWith('http')
                    ? data.imageUrl
                    : `${baseURL}/${data.imageUrl.replace(/^\//, '')}`)
                : "/assets/img/students/student-01.jpg",
            fatherName: data.fatherName?.toUpperCase(),
            regNo: data.studentNumber,
            grade: data.grade,
            month: dayjs(data.invoiceDate).format("MMM-YYYY"),
            dueDate: dayjs(data.dueDate).format("YYYY-MM-DD"),
            validityDate: dayjs(data.dueDate).add(5, 'day').format("YYYY-MM-DD"),
            logoPath: (data as any)?.logoPath || (data as any)?.regionLogoPath || (data as any)?.tblRegion?.logoPath,
            bankName: bankDetails[0]?.tblAccountBank?.name || "N/A",
            accTitle: bankDetails[0]?.accountTitle || "N/A",
            iban: bankDetails[0]?.iban || "N/A",
            discount: data.totalDiscount,
            totalPayable: netAmount - (data.amountReceived || 0),
            details: details
        };
    }, [data, deposit, bankDetails]);

    // 2. Simple check for existence of data
    if (!data || !voucher) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#000' }}>
                <h5>No voucher data available to display.</h5>
            </div>
        );
    }


    const handlePrint = () => {
        window.print();
    };

    // 4. VoucherSection component remains the same
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
                    {data?.details?.map((detail: VoucherDetail, index: number) => (
                        <tr key={index}>
                            <td style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}><b>{detail.feeName}</b>  {detail?.invoiceMonth ? `(${dayjs(detail.invoiceMonth).format("MMM-YYYY")})` : ""}</td>
                            <td align="right" style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>{detail.remainingAmount}</td>
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
        <div className="print-container" style={{ padding: '20px', backgroundColor: '#525659', minHeight: '100vh' }}>
            <style>{`
        @media screen {
          .voucher-page {
            background: white;
            display: flex;
            margin: 20px auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
            width: 297mm;
            height: 210mm;
            overflow: hidden;
          }
        }

        @media print {
          @page {
            size: landscape;
            margin: 0 !important; /* Force no margin */
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100%;
            overflow: hidden; /* Prevent scrolling */
          }
          
          /* Remove background color and padding from the container */
          .print-container {
            padding: 0 !important;
            background: white !important;
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
            height: 210mm !important;
          }

          .voucher-page {
            width: 297mm !important;
            height: 210mm !important; /* Match A4 Landscape */
            display: flex !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            page-break-after: avoid; /* Force single page */
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
                    Print Voucher
                </button>
            </div>

            <div id="print-area" ref={contentRef}>
                <div key={voucher.id} className="voucher-page">
                    <VoucherSection title="BANK COPY" data={voucher} />
                    <VoucherSection title="SCHOOL COPY" data={voucher} />
                    <VoucherSection title="PARENT COPY" data={voucher} />
                </div>
            </div>
        </div>
    );
};

export default SingleFeeVoucher;