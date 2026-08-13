import React, { ChangeEvent, useEffect, FormEvent, useState } from "react";
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
} from "../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../core/common/selectoption/academic/useAcademicSessions";
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
import { BulkInvoicePayload, GenerateBulkInvoice } from '../../../store/apps/fee-invoice'
import toast from "react-hot-toast";

const baseURL = process.env.REACT_APP_API_BASE_URL

const { RangePicker } = DatePicker;

const FeeGenerate = () => {
    const routes = all_routes;
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const { isActionLoading } = useSelector((state: RootState) => state.feeInvoice);
    const dispatch = useDispatch<AppDispatch>();
    const { lastSessionId } = useLastAcademicSession();
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
    const [formData, setFormData] = useState<BulkInvoicePayload>({
        gradeId: 0,
        campusId: 0,
        invoiceDate: dayjs().format('YYYY-MM-DD'),
        // First day of current month (e.g., 2026-02-01)
        monthFrom: dayjs().startOf('month').format('YYYY-MM-DD'),
        // Last day of current month (e.g., 2026-02-28)
        monthTo: dayjs().endOf('month').format('YYYY-MM-DD'),
        // Setting due date usually to the 10th or 15th, or just today:
        dueDate: dayjs().format('YYYY-MM-DD'),
        userId: userId,
        bankId: null,
        customFees: []
    });

    const handleChange = (name: keyof BulkInvoicePayload, value: any) => {
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
            userId: userId,
            campusId: effectiveCampusId
        }));

        // Only re-run when these specific values change
    }, [loginInfo?.userLevel, loginInfo?.userLevelId, userId]);
    const [bulkResults, setBulkResults] = useState<any[]>([]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors

        // --- Validation Logic ---
        const newErrors: { [key: string]: string } = {};

        if (!formData.campusId || formData.campusId === 0) {
            newErrors.campusId = "Please select a campus.";
        }
        if (!formData.gradeId || formData.gradeId === 0) {
            newErrors.gradeId = "Please select a grade.";
        }
        if (!formData.monthFrom || !formData.monthTo) {
            newErrors.period = "Invoice period is required.";
        }
        if (!formData.dueDate) {
            newErrors.dueDate = "Due date is required.";
        }
        // If there are errors, stop execution
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            const resultAction = await dispatch(GenerateBulkInvoice(formData));

            if (GenerateBulkInvoice.fulfilled.match(resultAction)) {
                const results = resultAction.payload; // This is the array of { isSuccess, message, etc. }
                setBulkResults(results);

                // Check if there were any actual successes
                const successCount = results.filter((r: any) => r.isSuccess).length;
                const failureCount = results.filter((r: any) => !r.isSuccess).length;

                if (successCount > 0) {
                    toast.success(`Successfully generated ${successCount} invoices.`);
                }

                if (failureCount > 0) {
                    toast.error(`${failureCount} invoices skipped (already exist or error).`);
                }
            }
        } catch (error) {
            console.error("Failed to generate invoices", error);
        }
    }






    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Generate Fee Invoice</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={routes.feeInvoices}>Fee Invoices</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Generate Fee Invoice
                                </li>
                            </ol>
                        </nav>
                    </div>
                    {/* 👉 DOWNLOAD TEMPLATE BUTTON */}
                    {/* <div className="mb-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={downloadTemplate}
                        >
                            <i className="ti ti-download me-2" />
                            Download Excel Format
                        </button>
                    </div> */}
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <form onSubmit={handleSave}>
                            <div className="card pb-5">
                                <div className="card-header bg-light">
                                    <div className="d-flex align-items-center">
                                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                                            <i className="ti ti-info-square-rounded fs-16" />
                                        </span>
                                        <h4 className="text-dark">Generate Fee Invoice</h4>
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
                                            <div className="mb-3">
                                                <label className="form-label">Due Date</label>
                                                <div className="input-icon position-relative">
                                                    <DatePicker
                                                        className="form-control datetimepicker"
                                                        format={{
                                                            format: "DD-MM-YYYY",
                                                            type: "mask",
                                                        }}
                                                        value={formData.dueDate ? dayjs(formData.dueDate) : null}
                                                        onChange={(date) => {
                                                            // Pass the field name and the formatted string value
                                                            handleChange(
                                                                'dueDate',
                                                                date ? dayjs(date).format('YYYY-MM-DD') : ''
                                                            );
                                                        }}
                                                        placeholder="Select Date"
                                                    />
                                                    <span className="input-icon-addon">
                                                        <i className="ti ti-calendar" />
                                                    </span>
                                                </div>
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
                                                                formData.monthFrom ? dayjs(formData.monthFrom) : null,
                                                                formData.monthTo ? dayjs(formData.monthTo) : null
                                                            ]}
                                                            onChange={(dates) => {
                                                                if (dates && dates[0] && dates[1]) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        monthFrom: dates[0]?.format('YYYY-MM-DD') ?? '',
                                                                        monthTo: dates[1]?.format('YYYY-MM-DD') ?? ''
                                                                    }));
                                                                } else {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        monthFrom: '',
                                                                        monthTo: ''
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

                                    </div>
                                </div>
                            </div>

                            <div className="text-end">
                                <Link to={routes.studentList} className="btn btn-light me-3">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? (
                                        <><span className="spinner-border spinner-border-sm me-2" /> Generating...</>
                                    ) : (
                                        'Generate Invoices'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default FeeGenerate;
