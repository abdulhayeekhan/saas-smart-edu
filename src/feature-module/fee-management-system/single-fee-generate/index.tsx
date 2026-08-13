import React, { ChangeEvent, useEffect, FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { GetAdmission } from '../../../store/apps/admissions'
import axios from "axios";
import { useLastAcademicSession } from '../../../core/common/selectoption/academic/useLastAcademicSession';
import { useAdmissions } from '../../../core/common/selectoption/academic/useAdmissions';
import { BulkInvoicePayload, SingleInvoicePayload, GenerateSingleInvoice } from '../../../store/apps/fee-invoice'
import toast from "react-hot-toast";
import { useSectionList } from '../../../core/common/selectoption/academic/useSections';
import { GenerateReceivable } from "../../../store/apps/security-deposit";



const { RangePicker } = DatePicker;

interface Filter {
    externalCampusId?: number | null | undefined;
    externalGradeId: number;
    externalSectionId?: number | null | undefined;
    externalsearch?: string;
}

const SingleFeeGenerate = () => {
    const routes = all_routes;
    const { id } = useParams();
    const studentId = Number(id);


    const { isActionLoading } = useSelector((state: RootState) => state.feeInvoice);
    const { single: admissionData, loading: admissionLoading } = useSelector((state: RootState) => state.admissions);

    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        if (studentId) {
            dispatch(GetAdmission(studentId))
        }
    }, [dispatch, studentId])
    useEffect(() => {
        if (studentId && admissionData) {
            // 1. Fetch the details by ID
            // const data = await getInvoiceDetails(id); 

            // 2. Update formData so the "Students" dropdown find() works
            setFormData(prev => ({
                ...prev,
                admissionId: studentId, // or data.admissionId
                newAdmission: admissionData.status?.toLowerCase() === 'walkin'
                // ... other fields
            }));

            // 3. Update filter state so Campus/Grade/Section find() works
            setFilter(prev => ({
                ...prev,
                externalCampusId: admissionData.campusId,
                externalGradeId: admissionData.gradeId,
                externalSectionId: admissionData.sectionId
            }));
        }
    }, [admissionData, studentId]);

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
    const sections = useSectionList(campusId);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<SingleInvoicePayload>({
        admissionId: 0,
        invoiceDate: dayjs().format('YYYY-MM-DD'),
        monthFrom: dayjs().startOf('month').format('YYYY-MM-DD'),
        monthTo: dayjs().endOf('month').format('YYYY-MM-DD'),
        dueDate: dayjs().format('YYYY-MM-DD'),
        userId: userId,
        newAdmission: false,
    });
    const [createSecurityDeposit, setCreateSecurityDeposit] = useState(false);
    const [securityDepositAmount, setSecurityDepositAmount] = useState(0);


    const [filter, setFilter] = useState<Filter>({
        externalCampusId: campusId,
        externalGradeId: 0,
        externalSectionId: 0,
        externalsearch: '',
    })

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
        // setFilter(prev => ({
        //     ...prev,
        //     externalCampusId: selectedId
        // }));
        setFilter(prev => ({
            ...prev,
            externalCampusId: selectedId,
            externalGradeId: 0,      // Reset Grade
            externalSectionId: 0     // Reset Section
        }));

        setFormData(prev => ({
            ...prev,
            admissionId: 0           // Reset Student
        }));
    };
    const handleFilterSelectChanges = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        const filterKey = name.startsWith('external') ? name : `external${name.charAt(0).toUpperCase() + name.slice(1)}`;

        setFilter(prev => {
            const newFilter = { ...prev, [filterKey]: selectedId };

            // If Grade is changed, we must reset the Section to 0
            if (filterKey === 'externalGradeId') {
                newFilter.externalSectionId = 0;
            }

            return newFilter;
        });

        // Whenever Grade OR Section changes, the Student selection must be reset
        setFormData(prev => ({
            ...prev,
            admissionId: 0
        }));
    };
    useEffect(() => { }, [filter])
    const { studentOptions, loading } = useAdmissions(filter);

    const handleSelectChanges = (name: string, option: any) => {
        const selectedId = option?.value ?? 0;
        setFormData(prev => ({
            ...prev,
            [name]: selectedId,
            newAdmission: name === 'admissionId' ? (option?.status?.toLowerCase() === 'walkin') : prev.newAdmission
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
            userId: userId
        }));

        // Only re-run when these specific values change
    }, [loginInfo?.userLevel, loginInfo?.userLevelId, userId]);
    const [bulkResults, setBulkResults] = useState<any[]>([]);
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors

        // --- Validation Logic ---
        const newErrors: { [key: string]: string } = {};

        if (!formData.admissionId || formData.admissionId === 0) {
            newErrors.admissionId = "Please select an admission.";
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
            const resultAction = await dispatch(GenerateSingleInvoice(formData as SingleInvoicePayload));

            if (GenerateSingleInvoice.fulfilled.match(resultAction)) {
                const results = resultAction.payload;
                
                // Handle both array and single object responses
                const isArray = Array.isArray(results);
                setBulkResults(isArray ? results : [results]);

                const successCount = isArray 
                    ? results.filter((r: any) => r.isSuccess).length 
                    : (results ? 1 : 0);
                const failureCount = isArray 
                    ? results.filter((r: any) => !r.isSuccess).length 
                    : 0;

                console.log('successCount:', successCount, 'failureCount', failureCount);
                if (successCount > 0) {
                    console.log('inside fee generate thunk');
                    toast.success(`Successfully generated ${successCount} invoice(s).`);

                    // Generate Security Deposit if checked
                    if (createSecurityDeposit) {
                        if (securityDepositAmount > 0) {
                            await dispatch(GenerateReceivable({
                                admissionId: formData.admissionId,
                                amount: securityDepositAmount,
                                actionDate: formData.invoiceDate,
                                userId: userId,
                                accountSettingType: "security_deposit_receivable"
                            }));
                        } else {
                            toast.error("Please enter a valid security deposit amount.");
                        }
                    }
                } else {
                    console.log('fee thunk failed');
                }

                if (failureCount > 0) {
                    toast.error(`${failureCount} invoice(s) skipped (already exist or error).`);
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
                        <h3 className="mb-1">Generate Single Fee Invoice</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={routes.feeInvoices}>Fee Invoices</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Generate Single Fee Invoice
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
                                        <h4 className="text-dark">Generate Single Fee Invoice</h4>
                                    </div>
                                </div>
                                <div className="card-body pb-1">

                                    <div className="row">
                                        {loginInfo?.userLevel === 1 && !id && (
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
                                        {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && !id && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Campus</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={campuses}
                                                        onChange={(option) =>
                                                            handleSelectCampus('externalCampusId', option)
                                                        }
                                                        value={filter?.externalCampusId ? campuses.find(c => c.value === filter?.externalCampusId) : campuses[0]}
                                                    />
                                                    {errors.externalCampusId && <small className="text-danger">{errors.externalCampusId}</small>}
                                                </div>
                                            </div>
                                        )}
                                        {!id && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Grades</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={grades}
                                                        onChange={(option) => handleFilterSelectChanges('externalGradeId', option)}
                                                        value={filter?.externalGradeId ? grades.find(r => r.value === filter?.externalGradeId) : grades[0]}
                                                    />
                                                    {errors.externalGradeId && <small className="text-danger">{errors.externalGradeId}</small>}
                                                </div>
                                            </div>
                                        )}
                                        {!id && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Section</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={sections}
                                                        onChange={(option) => handleFilterSelectChanges('externalSectionId', option)}
                                                        value={filter?.externalSectionId ? sections.find(r => r.value === filter?.externalSectionId) : sections[0]}
                                                    />
                                                    {errors.externalSectionId && <small className="text-danger">{errors.externalSectionId}</small>}
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-md-6 mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Students</label>
                                                <CommonSelect3
                                                    className="select"
                                                    options={studentOptions}
                                                    onChange={(option) => handleSelectChanges('admissionId', option)}
                                                    isDisabled={id ? true : false} // Disable if ID is present (editing existing invoice)
                                                    value={formData?.admissionId ? studentOptions.find(r => r.value === formData?.admissionId) : studentOptions[0]}
                                                />
                                                {errors.admissionId && <small className="text-danger">{errors.admissionId}</small>}
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
                                        <div className="col-md-3 mb-3 mt-4">
                                            <div className="mb-3 d-flex align-items-center" style={{ height: '100%' }}>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="newAdmission"
                                                        checked={formData.newAdmission}
                                                        readOnly
                                                        disabled
                                                    />
                                                    <label className="form-check-label" htmlFor="newAdmission">
                                                        {formData?.newAdmission ? "New Admission" : "Existing Student"}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-3 mb-3 mt-4">
                                            <div className="mb-3 d-flex align-items-center" style={{ height: '100%' }}>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="createSecurityDeposit"
                                                        checked={createSecurityDeposit}
                                                        onChange={(e) => setCreateSecurityDeposit(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="createSecurityDeposit">
                                                        Create Fee Security
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {createSecurityDeposit && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Security Deposit Amount</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Enter Amount"
                                                        value={securityDepositAmount || ""}
                                                        onChange={(e) => setSecurityDepositAmount(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}


                                    </div>
                                </div>
                            </div>

                            <div className="text-end">
                                <Link
                                    to={id ? `/student/student-details/${id}` : routes.studentList}
                                    className="btn btn-light me-3"
                                >
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

export default SingleFeeGenerate;
