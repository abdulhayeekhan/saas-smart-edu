import React, { useEffect, useRef, useState } from "react";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect3 from "../../../core/common/commonSelect3";
import {
    ids,
    names,
    status,
    usePermission
} from "../../../core/common/selectoption/selectoption";
import { TableData } from "../../../core/data/interface";
import Table from "../../../core/common/dataTable2/index";
import { feesData } from "../../../core/data/json/feesData";
import FeesModal from "./feemodel";
import TooltipOption from "../../../core/common/tooltipOption";
import { GetFeeByCampusSession, GetFeeByGradeSession } from "../../../store/apps/fee-structure";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { useAcademicGrades } from '../../../core/common/selectoption/academic/useAcademicGrades';
import { useAcademicSessions } from '../../../core/common/selectoption/academic/useAcademicSessions';
import { useLastAcademicSession } from '../../../core/common/selectoption/academic/useLastAcademicSession';
import toast from 'react-hot-toast'
interface FeeFilter {
    sessionId: number;
    gradeId: number;
    campusId: number
}

type SessionOption = {
    value: number;
    label: string;
};

interface FeesModalProps {
    initialData: any; // You can change 'any' to your FeeStructureType later
}

const FeesStructure = () => {
    const routes = all_routes;
    const hasPermission = usePermission("Fees Structure");
    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading } = useSelector((state: RootState) => state.feeStructure);
    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const loginInfo = userInfo?.data
    const createdBy = loginInfo?.id
    const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null)
    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevents the Link from jumping to the top of the page
        setFilter({
            sessionId: lastSessionId,
            gradeId: 0,
            campusId: campusId // or the default campus variable you are using
        });
    };
    const handleSelectRegion = (name: string, option: any) => {
        setRegionId(option?.value ?? 0);
    }
    const effectiveRegionId = loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : (regionId || loginInfo?.regionId);
    const regionsList = useRegionsList();
    const grades = useAcademicGrades(effectiveRegionId);
    const sessions = useAcademicSessions(effectiveRegionId);
    const { lastSessionId } = useLastAcademicSession();
    const campuses = useCampusesList(effectiveRegionId);
    const sessionId = lastSessionId;
    const [campusId, setCampusId] = useState(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0)
    const [filter, setFilter] = useState<FeeFilter>({
        sessionId: 0,
        gradeId: 0,
        campusId
    })
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const handleDeleteClick = (record: any) => {
        setSelectedRecord(record);
    };

    const OnSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Basic Validation: Session is always required
        if (filter.sessionId === 0) {
            toast.error("Please select a Session");
            return;
        }

        // 2. Conditional Dispatch
        if (filter.gradeId === 0 || filter.gradeId === null) {
            // CASE: No Grade Selected -> Fetch All for Campus
            dispatch(GetFeeByCampusSession({
                sessionId: filter.sessionId,
                campusId: filter.campusId
            }));
        } else {
            // CASE: Grade Selected -> Fetch Specific Grade
            dispatch(GetFeeByGradeSession({
                campusId: filter.campusId,
                sessionId: filter.sessionId,
                gradeId: filter.gradeId
            }));
        }
    };
    useEffect(() => {
        dispatch(GetFeeByCampusSession({ sessionId, campusId }));
    }, [dispatch, sessionId, campusId]);
    useEffect(() => {
        if (lastSessionId) {
            setFilter((prev) => ({
                ...prev,
                sessionId: lastSessionId
            }));
        }
    }, [lastSessionId]);
    const handleChange = (name: keyof FeeFilter, selectedOption: any) => {
        setFilter((prev) => ({
            ...prev,
            [name]: selectedOption.value,
        }));
    };
    // const [editGrade, setEditGrade] = useState<Grade>({
    //     id: 0,
    //     name: "",
    //     sortOrder: 0,
    // });
    const [editLoad, setEditLoad] = useState(false)
    const handleEdit = async (record: any) => {
        setEditLoad(true)
        setSelectedRecord(record);
        // try {
        //     const res = await dispatch(GetGrade(id)).unwrap();
        //     setEditGrade({
        //         id: res.id,
        //         name: res.name,
        //         sortOrder: res.sortOrder,
        //     });
        // } catch (err) {
        //     toast.error("Failed to load grade");
        // } finally {
        //     setEditLoad(false)
        // }
    };
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: string) => (
                <Link to="#" className="link-primary">
                    {text}
                </Link>
            ),
            sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
        },
        {
            title: "Session",
            dataIndex: ["tblSMSSession", "name"], // Nested data access
            sorter: (a: any, b: any) => a.tblSMSSession.name.localeCompare(b.tblSMSSession.name),
        },
        {
            title: "Grade",
            dataIndex: ["tblSMSGrade", "name"], // Accessing PG, Nursary, etc.
            sorter: (a: any, b: any) => a.tblSMSGrade.name.localeCompare(b.tblSMSGrade.name),
        },
        {
            title: "Fees Detail",
            dataIndex: "tblSMSFeeStructureDetails",
            render: (details: any[]) => (
                <div>
                    {details?.map((fee, index) => (
                        <div key={index}>
                            <span className="badge badge-soft-info">
                                {fee?.tblSMSFeeType?.name}: {fee?.amount}
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: ["tblSMSSession", "isActive"],
            render: (isActive: boolean) => (
                <span className={`badge ${isActive ? 'badge-soft-success' : 'badge-soft-danger'} d-inline-flex align-items-center`}>
                    <i className="ti ti-circle-filled fs-5 me-1"></i>
                    {isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        ...(hasPermission?.deleteRight || hasPermission?.editRight
            ? [
                {
                    title: "Action",
                    render: (record: any) => (
                        <div className="dropdown">
                            <Link
                                to="#"
                                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                data-bs-toggle="dropdown"
                            >
                                <i className="ti ti-dots-vertical fs-14" />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-right p-3">
                                <li>
                                    <Link
                                        className="dropdown-item rounded-1"
                                        to="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#edit_fees_master"
                                        onClick={() => handleEdit(record)}
                                    >
                                        <i className="ti ti-edit-circle me-2" /> Edit
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link className="dropdown-item rounded-1" onClick={() => handleDeleteClick(record)} to="#">
                                        <i className="ti ti-trash-x me-2" /> Delete
                                    </Link>
                                </li> */}
                            </ul>
                        </div>
                    ),
                },
            ] : []),
    ];
    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Fees Structure</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Fees Structure</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Fees Structure
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            <div className="mb-2">
                                {(hasPermission && hasPermission?.addRight) && (
                                    <Link
                                        to="#"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add_fees_group"
                                    >
                                        <i className="ti ti-square-rounded-plus me-2" />
                                        Add Fees Structure
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Students List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Fees Structure</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="input-icon-start mb-3 me-2 position-relative">
                                    {/* <PredefinedDateRanges />  */}
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
                                    <div
                                        className="dropdown-menu drop-width"
                                        ref={dropdownMenuRef}
                                    >
                                        <form onSubmit={OnSubmit}>
                                            <div className="d-flex align-items-center border-bottom p-3">
                                                <h4>Filter</h4>
                                            </div>
                                            <div className="p-3 border-bottom">
                                                <div className="row">
                                                    {loginInfo?.userLevel === 1 && (
                                                        <div className="col-md-12">
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
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label className="form-label">Campus</label>
                                                                <CommonSelect3
                                                                    className="select"
                                                                    options={campuses}
                                                                    onChange={(opt: any) => handleChange('campusId', opt)}
                                                                    value={filter?.campusId ? campuses.find(c => c.value === filter.campusId) : campuses[0]}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">Sessions</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={sessions}
                                                                onChange={(opt) => handleChange('sessionId', opt)}
                                                                value={
                                                                    filter?.sessionId
                                                                        ? sessions.find((c: SessionOption) => c.value === filter?.sessionId)
                                                                        : sessions[0]
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">Grade</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={grades}
                                                                onChange={(opt) => handleChange('gradeId', opt)}
                                                                value={
                                                                    filter?.gradeId
                                                                        ? grades.find((c: SessionOption) => c.value === filter?.gradeId)
                                                                        : grades[0]
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
                                                <button
                                                    type="submit"
                                                    disabled={filter?.campusId === 0 || filter?.sessionId === 0}
                                                    className="btn btn-primary"
                                                >
                                                    Search
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
                                        Sort by A-Z{" "}
                                    </Link> */}
                                    <ul className="dropdown-menu p-3">
                                        <li>
                                            <Link to="#" className="dropdown-item rounded-1">
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
                            {/* Student List */}
                            <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
                            {/* /Student List */}
                        </div>
                    </div>
                    {/* /Students List */}
                </div>
            </div>
            {/* /Page Wrapper */}
            <FeesModal isEditData={selectedRecord} />
        </>
    );
};

export default FeesStructure;
