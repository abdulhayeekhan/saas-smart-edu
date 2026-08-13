import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable2/index";
import CommonSelect3 from "../../core/common/commonSelect3";
import { useCampusesList } from "../../core/common/selectoption/master/useCampusesList";
import { all_routes } from "../router/all_routes";
import axios from "axios";
import toast from "react-hot-toast";

const baseURL: string = process.env.REACT_APP_API_BASE_URL || "";

const CampusOpenningBalance = () => {
    console.log("Reloading Campus Opening Balance UI...");
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);

    const [financialYears, setFinancialYears] = useState<any[]>([]);
    const [selectedFinancialYear, setSelectedFinancialYear] = useState<any>(null);
    const [selectedCampus, setSelectedCampus] = useState<any>(null);

    const campusesList = useCampusesList();

    useEffect(() => {
        axios
            .get(`${baseURL}/api/FinancialYear/GetFinancialYears`)
            .then((res) => {
                if (res.data && res.data.data) {
                    const fYears = res.data.data.map((y: any) => ({
                        value: y.id,
                        label: y.name,
                    }));
                    setFinancialYears([{ value: null, label: "Select" }, ...fYears]);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedFinancialYear || !selectedFinancialYear.value || !selectedCampus || !selectedCampus.value) {
            setDataSource([]);
            return;
        }

        setLoading(true);
        const endpoint = `${baseURL}/api/OBV/GetAllByCampusId?campusId=${selectedCampus.value}&financialYearId=${selectedFinancialYear.value}`;

        axios
            .get(endpoint)
            .then((res) => {
                setDataSource(res.data.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedFinancialYear, selectedCampus]);

    const handleDebitChange = (value: string, recordId: number) => {
        const val = parseFloat(value) || 0;
        setDataSource((prev: any) =>
            prev.map((item: any) => {
                if (item.id === recordId || (item.accountId === recordId && item.id === 0)) {
                    return {
                        ...item,
                        debitAmount: val,
                        creditAmount: val > 0 ? 0 : item.creditAmount,
                    };
                }
                return item;
            })
        );
    };

    const handleCreditChange = (value: string, recordId: number) => {
        const val = parseFloat(value) || 0;
        setDataSource((prev: any) =>
            prev.map((item: any) => {
                if (item.id === recordId || (item.accountId === recordId && item.id === 0)) {
                    return {
                        ...item,
                        creditAmount: val,
                        debitAmount: val > 0 ? 0 : item.debitAmount,
                    };
                }
                return item;
            })
        );
    };

    const handleSave = () => {
        if (dataSource.length === 0) return;
        setLoading(true);
        
        // Add additional missing required fields for the AddOpening API if they are not already in the objects
        const payload = dataSource.map(item => ({
            ...item,
            campusId: selectedCampus?.value || 0,
            financialYearId: selectedFinancialYear?.value || 0,
        }));

        axios
            .post(`${baseURL}/api/OBV/AddOpening`, payload)
            .then((res) => {
                toast.success("Opening balances updated successfully!");
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const routes = all_routes;
    const columns = [
        {
            title: "Account Code",
            dataIndex: "accountCode",
            sorter: (a: any, b: any) => (a.accountCode?.length || 0) - (b.accountCode?.length || 0),
        },
        {
            title: "Account Name",
            dataIndex: "accountName",
            sorter: (a: any, b: any) => (a.accountName?.length || 0) - (b.accountName?.length || 0),
        },
        {
            title: "Openning Balance Debit",
            dataIndex: "debitAmount",
            render: (text: any, record: any) => (
                <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={record.debitAmount === 0 ? "" : record.debitAmount}
                    onChange={(e) => handleDebitChange(e.target.value, record.id || record.accountId)}
                />
            ),
            sorter: (a: any, b: any) => (a.debitAmount || 0) - (b.debitAmount || 0),
        },
        {
            title: "Openning Balance Credit",
            dataIndex: "creditAmount",
            render: (text: any, record: any) => (
                <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={record.creditAmount === 0 ? "" : record.creditAmount}
                    onChange={(e) => handleCreditChange(e.target.value, record.id || record.accountId)}
                />
            ),
            sorter: (a: any, b: any) => (a.creditAmount || 0) - (b.creditAmount || 0),
        },
    ];

    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Campus Openning Balance</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Campus Openning Balance
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* Page Header */}
                    
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Campus Openning Balance</h4>
                            <div className="d-flex align-items-center flex-wrap">

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
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Financial Year</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={financialYears}
                                                                onChange={(option: any) => setSelectedFinancialYear(option)}
                                                                value={selectedFinancialYear || (financialYears.length > 0 ? financialYears[0] : null)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Campus</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={campusesList}
                                                                onChange={(option: any) => setSelectedCampus(option)}
                                                                value={selectedCampus || (campusesList.length > 0 ? campusesList[0] : null)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 d-flex align-items-center justify-content-end">
                                                <Link to="#" className="btn btn-light me-3" onClick={() => { setSelectedFinancialYear(null); setSelectedCampus(null); }}>
                                                    Reset
                                                </Link>
                                                <button type="button" className="btn btn-primary" onClick={() => {/* already fetches on change */ }}>
                                                    Apply
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="dropdown mb-3 me-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            <Table rowKey="id" dataSource={dataSource} columns={columns} Selection={true} loading={loading} />
                        </div>
                    </div>
                </div>
            </div>
            {/* /Page Wrapper */}
        </div>
    );
};

export default CampusOpenningBalance;
