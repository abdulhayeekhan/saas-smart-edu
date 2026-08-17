import React, { ChangeEvent, useEffect, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
// import { feeGroup, feesTypes, paymentType } from '../../../core/common/selectoption/selectoption'
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../../router/all_routes";
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
} from "../../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../../core/common/selectoption/academic/useAcademicSessions";
import { useAcademicGrades } from "../../../../core/common/selectoption/academic/useAcademicGrades";
import { useCities } from "../../../../core/common/selectoption/address/useCities";
import { TagsInput } from "react-tag-input-component";
import CommonSelect from "../../../../core/common/commonSelect";
import CommonSelect2 from "../../../../core/common/commonSelect2"
import CommonSelect3 from "../../../../core/common/commonSelect3"
import { useLocation } from "react-router-dom";
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { BulkImportAdmissions } from '../../../../store/apps/admissions';
import axios from "axios";
import { useLastAcademicSession } from '../../../../core/common/selectoption/academic/useLastAcademicSession';
import FeesModal from "../../../acdemic-manager/fee-structure/feemodel";
import { GetCampusByID } from "../../../../store/apps/campus-management";
const baseURL = process.env.REACT_APP_API_BASE_URL

interface BulkUploadProps {
    campusId: number;
    userId: number;
}

export interface GradeFeeStructureVerifyType {
    gradeId: number;
    gradeName: string;
    sortOrder: number;
    isFeeStructureDefined: boolean;
    feeStructureId: number | null; // Nullable since many entries are null
}

const BulkImportStudents = () => {
    const routes = all_routes;
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { lastSessionId } = useLastAcademicSession();

    const loginInfoObj = JSON.parse(localStorage.getItem("loginInfo") || "{}");
    const userDataObj = JSON.parse(localStorage.getItem("userData") || "{}");

    const userLevel = Number(loginInfoObj?.userLevel || userDataObj?.data?.userLevel || 0);
    const userLevelId = Number(loginInfoObj?.userLevelId || userDataObj?.data?.userLevelId || 0);
    const loginInfo = userDataObj?.data || loginInfoObj;
    const userId = loginInfo?.id;

    const regionsList = useRegionsList();
    const [feeStructureVerify, setFeeStructureVerify] = useState<GradeFeeStructureVerifyType[]>([]);
    const [regionId, setRegionId] = useState<number>(userLevel === 2 ? userLevelId : 0);

    const handleSelectRegion = (name: string, option: any) => {
        const rId = Number(option?.value ?? 0);
        setRegionId(rId);
        setCampusId(0);
    };

    const effectiveRegionId = userLevel === 2 ? userLevelId : regionId;
    const campuses = useCampusesList(effectiveRegionId);
    const regionGradesOptions = useAcademicGrades(effectiveRegionId);

    const rawGrades = regionGradesOptions.filter(
        (g: any) => g.value !== 0 && g.value !== "" && g.label !== "SELECT GRADE"
    );
    const availableGradeNames = rawGrades.map((g: any) => g.label);

    const earlyKeywords = ["pg", "nursery", "nursary", "prep", "playgroup", "kg", "kindergarten"];
    const primaryKeywords = ["one", "two", "three", "four", "five", "six", "seven", "eight", "primary", "1", "2", "3", "4", "5", "6", "7", "8"];
    const highKeywords = ["9th", "10th", "11th", "12th", "pre-9th", "matric", "inter", "college", "high", "9", "10"];
    const religiousKeywords = ["hifz", "quran", "tajweed", "nazra", "religious"];

    const earlyGradesList = availableGradeNames.filter((name: string) =>
        earlyKeywords.some(k => name.toLowerCase().includes(k))
    );
    const primaryGradesList = availableGradeNames.filter((name: string) =>
        !earlyGradesList.includes(name) && primaryKeywords.some(k => name.toLowerCase().includes(k))
    );
    const highGradesList = availableGradeNames.filter((name: string) =>
        !earlyGradesList.includes(name) && !primaryGradesList.includes(name) && highKeywords.some(k => name.toLowerCase().includes(k))
    );
    const religiousGradesList = availableGradeNames.filter((name: string) =>
        religiousKeywords.some(k => name.toLowerCase().includes(k))
    );
    const otherGradesList = availableGradeNames.filter((name: string) =>
        !earlyGradesList.includes(name) &&
        !primaryGradesList.includes(name) &&
        !highGradesList.includes(name) &&
        !religiousGradesList.includes(name)
    );
    const [campusId, setCampusId] = useState<number>(userLevel === 3 ? userLevelId : 0);
    const handleSelectCampus = (name: string, option: any) => {
        setCampusId(Number(option?.value ?? 0));
    };

    const [allowBulkImport, setAllowBulkImport] = useState<boolean>(true);
    useEffect(() => {
        if (campusId && campusId !== 0) {
            dispatch(GetCampusByID(campusId)).then((res: any) => {
                if (res.payload && res.payload.allowBulkImport === false) {
                    setAllowBulkImport(false);
                } else {
                    setAllowBulkImport(true);
                }
            });
        } else {
            setAllowBulkImport(true);
        }
    }, [campusId, dispatch]);

    // Accessing loading state from our AdmissionSlice
    const { isActionLoading: loading, message, status } = useSelector((state: RootState) => state.admissions);

    const downloadTemplate = () => {
        // Path to your template file in the 'public' folder
        const templatePath = "/document/import_students_format.xlsx";
        const link = document.createElement("a");
        link.href = templatePath;
        link.download = "Admission_Import_Template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processFile = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];
        const isExcel = validTypes.includes(selectedFile.type) ||
                        selectedFile.name.endsWith('.xlsx') ||
                        selectedFile.name.endsWith('.xls');

        if (isExcel) {
            setFile(selectedFile);
            setImportErrors([]);
        } else {
            alert("Please upload a valid Excel file (.xlsx or .xls)");
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const [importErrors, setImportErrors] = useState<any[]>([]);

    // const handleUpload = async (e: FormEvent): Promise<void> => {
    //     e.preventDefault();
    //     if (!file) return;

    //     try {
    //         const resultAction = await dispatch(
    //             BulkImportAdmissions({ campusId, userId, file })
    //         );
    //         if (BulkImportAdmissions.fulfilled.match(resultAction)) {
    //             setFile(null); // Clear selection on success
    //         }
    //     } catch (error) {
    //         console.error("Upload failed", error);
    //     }
    // };

    const handleUpload = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        if (!file) return;

        setImportErrors([]); // Clear previous errors

        const resultAction = await dispatch(
            BulkImportAdmissions({ campusId, userId, file })
        );

        if (BulkImportAdmissions.fulfilled.match(resultAction)) {
            setFile(null);
        } else if (BulkImportAdmissions.rejected.match(resultAction)) {
            const payload = resultAction.payload as any;
            // If the payload contains the errors array we sent from rejectWithValue
            if (payload?.errors) {
                setImportErrors(payload.errors);
            }
        }
    };

    useEffect(() => {
        if (campusId !== 0 && lastSessionId !== 0) {
            handleCheckFeeStrucutture()
        }
    }, [campusId, lastSessionId]);
    const handleCheckFeeStrucutture = async () => {
        const { data } = await axios.get(`${baseURL}/api/FeeStructure/ValidateFeeStructure?campusId=${campusId}&sessionId=${lastSessionId}`)
        setFeeStructureVerify(data?.data || []);
    }

    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Bulk Import Admission</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to={routes.studentList}>Students</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Bulk Import Admission
                                </li>
                            </ol>
                        </nav>
                    </div>
                    {/* 👉 DOWNLOAD TEMPLATE BUTTON */}
                    <div className="mb-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={downloadTemplate}
                        >
                            <i className="ti ti-download me-2" />
                            Download Excel Format
                        </button>
                    </div>
                </div>
                {/* /Page Header */}
                {/* 👉 ERROR DISPLAY */}
                {/* 👉 ERROR DISPLAY */}
                {message && !status && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="ti ti-alert-triangle me-2 fs-20" />
                            <strong>Upload Error:</strong> {message}
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
                    </div>
                )}

                <div className="row">
                    <div className="col-md-12">
                        <form onSubmit={handleUpload}>
                            <div className="card">
                                <div className="card-header bg-light">
                                    <div className="d-flex align-items-center">
                                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                                            <i className="ti ti-info-square-rounded fs-16" />
                                        </span>
                                        <h4 className="text-dark">Bulk Admission Import</h4>
                                    </div>
                                </div>
                                <div className="card-body pb-1">

                                    <div className="row">
                                        {userLevel === 1 && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Region</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={regionsList}
                                                        onChange={(option) => handleSelectRegion('regions', option)}
                                                        value={regionId ? regionsList.find(r => Number(r.value) === Number(regionId)) : regionsList[0]}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(userLevel === 1 || userLevel === 2) && (
                                            <div className="col-md-6 mb-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Campus</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={campuses}
                                                        onChange={(option) =>
                                                            handleSelectCampus('campusId', option)
                                                        }
                                                        value={campusId ? campuses.find(c => Number(c.value) === Number(campusId)) : campuses[0]}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!allowBulkImport ? (
                                            <div className="col-md-12 mb-4">
                                                <div className="alert alert-danger">
                                                    Bulk Import Admission is not allowed for this campus.
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* --- UPLOAD INSTRUCTIONS SECTION --- */}
                                        <div className="col-md-12 mb-4">
                                            <div className="alert alert-info border-0 pb-0">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="ti ti-help-circle-filled me-2 fs-20 text-info"></i>
                                                    <h5 className="mb-0 text-info">Crucial Data Formatting Rules</h5>
                                                </div>

                                                <p className="fs-13 mb-3">
                                                    To ensure your student data imports correctly, please format your Excel file exactly as follows:
                                                </p>

                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered bg-white fs-12 mb-3">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th style={{ width: '20%' }}>Field Name</th>
                                                                <th>Required Format / Exact Values</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="fw-bold">CNIC No</td>
                                                                <td>
                                                                    Must be 13 digits, **no dashes (-)**.
                                                                    <br /><span className="badge bg-success-light text-success">Example: 35202XXXXXXXX</span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Contact No</td>
                                                                <td>
                                                                    Must be 11 digits, **no dashes (-)**.
                                                                    <br /><span className="badge bg-success-light text-success">Example: 0300XXXXXXX</span>
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td className="fw-bold text-danger">Gender</td>
                                                                <td>Use <span className="badge bg-primary-light text-primary">Boy</span> or <span className="badge bg-pink-light text-danger">Girl</span> (No Male/Female)</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Section</td>
                                                                <td>
                                                                    Must match system records exactly.
                                                                    <br />
                                                                    <Link to={'/academic/class-section'} className="text-decoration-underline text-primary fw-medium">
                                                                        <i className="ti ti-external-link me-1"></i>
                                                                        Click here to check/manage your Sections
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Grades (Early)</td>
                                                                <td>
                                                                    {earlyGradesList.length > 0
                                                                        ? earlyGradesList.join(", ")
                                                                        : (availableGradeNames.length > 0 ? "None in this region" : "PG, Nursary, Prep")}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Grades (Primary)</td>
                                                                <td>
                                                                    {primaryGradesList.length > 0
                                                                        ? primaryGradesList.join(", ")
                                                                        : (availableGradeNames.length > 0 ? "None in this region" : "One, Two, Three, Four, Five, Six, Seven, Eight")}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">High/College</td>
                                                                <td>
                                                                    {highGradesList.length > 0
                                                                        ? highGradesList.join(", ")
                                                                        : (availableGradeNames.length > 0 ? "None in this region" : "Pre-9th, Grade 9th, Grade 10th, 1st Year, 2nd Year")}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold">Religious</td>
                                                                <td>
                                                                    {religiousGradesList.length > 0
                                                                        ? religiousGradesList.join(", ")
                                                                        : (availableGradeNames.length > 0 ? "None in this region" : "Hifz-e-Quran (Boys), Hifz-e-Quran (Girls)")}
                                                                </td>
                                                            </tr>
                                                            {otherGradesList.length > 0 && (
                                                                <tr>
                                                                    <td className="fw-bold">Other Region Grades</td>
                                                                    <td>{otherGradesList.join(", ")}</td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td className="fw-bold text-primary">All Active Region Grades</td>
                                                                <td>
                                                                    {availableGradeNames.length > 0 ? (
                                                                        <div className="d-flex flex-wrap gap-1">
                                                                            {availableGradeNames.map((gName: string, idx: number) => (
                                                                                <span key={idx} className="badge bg-primary-light text-primary fs-11">
                                                                                    {gName}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted">Loading region grades...</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan={2}>
                                                                    <Link to={'/academic/class-grade'} className="text-decoration-underline text-primary fw-medium">
                                                                        <i className="ti ti-external-link me-1"></i>
                                                                        Click here to check/manage your Grade
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        {/* --- END INSTRUCTIONS SECTION --- */}

                                        {feeStructureVerify.length > 0 && feeStructureVerify.some(f => !f.isFeeStructureDefined) && (
                                            <div className="col-12 mb-3">
                                                <div className="alert alert-warning">
                                                    <h5 className="alert-heading">Fee Structure Warning</h5>
                                                    <p>The following grades do not have fee structures defined for the selected campus and academic session. Please define fee structures to ensure proper billing.</p>
                                                    <ul>
                                                        {feeStructureVerify.filter(f => !f.isFeeStructureDefined).map(fee => (
                                                            <li key={fee.gradeId}>{fee.gradeName}</li>
                                                        ))}
                                                    </ul>
                                                    <Link
                                                        to="#"
                                                        className="btn btn-primary"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#add_fees_group"
                                                    >
                                                        <i className="ti ti-square-rounded-plus me-2" />
                                                        Add Fees Structure
                                                    </Link>
                                                </div>
                                            </div>
                                        )}


                                        {importErrors.length > 0 && (
                                            <div className="col-md-12">
                                                <div className="error-log-container" style={{ marginTop: '20px', color: 'red' }}>
                                                    <h3>Validation Errors ({importErrors.length})</h3>
                                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ffcccb', padding: '10px' }}>
                                                        {importErrors.map((err, index) => (
                                                            <p key={index} style={{ fontSize: '12px', borderBottom: '1px solid #eee' }}>
                                                                <strong>Row {err.row}:</strong> {err.studentName} - {err.message}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                         <div className="col-md-12 mb-4">
                                             <div
                                                 className={`border-2 border-dashed rounded-3 p-4 text-center position-relative transition-all ${
                                                     isDragging
                                                         ? 'border-primary bg-soft-primary'
                                                         : file
                                                         ? 'border-success bg-soft-success'
                                                         : 'border-secondary-subtle bg-light'
                                                 }`}
                                                 onDragOver={handleDragOver}
                                                 onDragLeave={handleDragLeave}
                                                 onDrop={handleDrop}
                                                 style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                                             >
                                                 <input
                                                     type="file"
                                                     className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                                     accept=".xlsx, .xls"
                                                     onChange={handleFileChange}
                                                     style={{ cursor: 'pointer', zIndex: 5 }}
                                                 />

                                                 {file ? (
                                                     <div className="d-flex align-items-center justify-content-between p-2" style={{ zIndex: 10, position: 'relative' }}>
                                                         <div className="d-flex align-items-center">
                                                             <div className="avatar avatar-lg bg-success text-white rounded me-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                                                                 <i className="ti ti-file-spreadsheet fs-24" />
                                                             </div>
                                                             <div className="text-start">
                                                                 <h6 className="mb-0 text-success fw-bold">{file.name}</h6>
                                                                 <small className="text-muted">{(file.size / 1024).toFixed(1)} KB • Ready to upload</small>
                                                             </div>
                                                         </div>
                                                         <button
                                                             type="button"
                                                             className="btn btn-sm btn-outline-danger"
                                                             onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 setFile(null);
                                                             }}
                                                             style={{ zIndex: 15 }}
                                                         >
                                                             <i className="ti ti-trash me-1" /> Remove
                                                         </button>
                                                     </div>
                                                 ) : (
                                                     <div className="py-3">
                                                         <div className="avatar avatar-xl bg-soft-primary text-primary rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center">
                                                             <i className="ti ti-cloud-upload fs-32" />
                                                         </div>
                                                         <h5 className="mb-1 text-dark">
                                                             {isDragging ? "Drop your Excel file here" : "Drag & Drop your Excel file here"}
                                                         </h5>
                                                         <p className="text-muted fs-13 mb-2">or <span className="text-primary text-decoration-underline fw-medium">browse to choose a file</span></p>
                                                         <span className="badge bg-light text-secondary border">Supported Formats: .xlsx, .xls (Max: 10MB)</span>
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                            </>
                                        )}
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
                                    disabled={!file || loading || !allowBulkImport}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Importing...
                                        </>
                                    ) : (
                                        "Upload Admissions"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <FeesModal isEditData={selectedRecord} />
        </div>
    );
};

export default BulkImportStudents;
