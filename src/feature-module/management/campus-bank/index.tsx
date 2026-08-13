import React, { useEffect, useRef, useState } from "react";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { usePermission } from "../../../core/common/selectoption/selectoption";
import Table from "../../../core/common/dataTable2/index";
import CampusBankModel from "./model"; // Import your new Model
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
// Import the CampusBank thunks
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import toast from 'react-hot-toast'

const CampusBank = () => {
    const routes = all_routes;
    const hasPermission = usePermission("Campus Banks"); // Update permission string if needed
    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    // Select from your new campusBank slice
    const { data, loading } = useSelector((state: RootState) => state.campusBank);
    const userInfo = JSON.parse(localStorage.getItem("userData") || "{}")?.data;

    const [regionId, setRegionId] = useState(userInfo?.userLevel === 2 ? userInfo?.userLevelId : null);
    const [campusId, setCampusId] = useState(userInfo?.userLevel === 3 ? userInfo?.userLevelId : 0);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const regionsList = useRegionsList();
    const campuses = useCampusesList(userInfo?.userLevel === 2 ? userInfo?.userLevelId : regionId);

    // Initial Fetch
    useEffect(() => {
        if (campusId !== 0) {
            dispatch(GetCampusBanksByCampus(campusId));
        }
    }, [dispatch, campusId]);

    const handleSelectRegion = (name: string, option: any) => {
        setRegionId(option?.value ?? 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (campusId === 0) {
            toast.error("Please select a Campus");
            return;
        }
        dispatch(GetCampusBanksByCampus(campusId));
    };

    const handleEdit = (record: any) => {
        setSelectedRecord(record);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: (a: any, b: any) => a.id - b.id,
        },
        {
            title: "Account Title",
            dataIndex: "accountTitle",
            sorter: (a: any, b: any) => a.accountTitle.localeCompare(b.accountTitle),
            render: (text: string) => <span className="text-dark fw-bold">{text}</span>
        },
        {
            title: "Bank Name",
            // Path in JSON: data[0].tblAccountBank.name
            dataIndex: ["tblAccountBank", "name"],
            render: (text: string) => text || "N/A",
        },
        {
            title: "IBAN",
            dataIndex: "iban",
            render: (text: string) => <code className="text-primary">{text}</code>
        },
        {
            title: "Campus",
            // Path in JSON: data[0].tblCampus.name
            dataIndex: ["tblCampus", "name"],
            render: (text: string) => text || "Default Campus",
        },
        ...(hasPermission?.editRight
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
                                        data-bs-target="#edit_campus_bank"
                                        onClick={() => handleEdit(record)}
                                    >
                                        <i className="ti ti-edit-circle me-2" /> Edit
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    ),
                },
            ] : []),
    ];

    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Campus Banks</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                                    <li className="breadcrumb-item active">Campus Banks</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="mb-2">
                            {hasPermission?.addRight && (
                                <Link
                                    to="#"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_campus_bank"
                                    onClick={() => setSelectedRecord(null)}
                                >
                                    <i className="ti ti-square-rounded-plus me-2" />
                                    Add Campus Bank
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Filter Card */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Campus Bank List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="dropdown mb-3 me-2">
                                    <Link to="#" className="btn btn-outline-light bg-white dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        <i className="ti ti-filter me-2" /> Filter
                                    </Link>
                                    <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>
                                        <form onSubmit={handleSearch}>
                                            <div className="p-3 border-bottom">
                                                {userInfo?.userLevel === 1 && (
                                                    <div className="mb-3">
                                                        <label className="form-label">Region</label>
                                                        <CommonSelect3 options={regionsList} onChange={(option) => handleSelectRegion('regions', option)} value={regionsList.find(r => r.value === regionId)} />
                                                    </div>
                                                )}
                                                {userInfo?.userLevel <= 2 && (
                                                    <div className="mb-3">
                                                        <label className="form-label">Campus</label>
                                                        <CommonSelect3 options={campuses} onChange={(opt: any) => setCampusId(opt.value)} value={campuses.find(c => c.value === campusId)} />
                                                    </div>
                                                )}
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal for Add/Edit */}
            <CampusBankModel isEditData={selectedRecord} />
        </>
    );
};

export default CampusBank;