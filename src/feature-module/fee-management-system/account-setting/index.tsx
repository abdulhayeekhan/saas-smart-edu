import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { SaveSetting, GetSetting, GetAllSettings } from "../../../store/apps/account-setting";
import { GetAccountsLevelWise } from "../../../store/apps/campus-coa";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import CommonSelect3 from "../../../core/common/commonSelect3";
import toast from "react-hot-toast";
import { usePermission } from "../../../core/common/selectoption/selectoption";

const settingTypeOptions = [

    { value: "security_deposit_receivable", label: "Security Deposit Receivable" },
    { value: "security_deposit_received", label: "Security Deposit Received" },
    { value: "security_deposit_refund", label: "Security Deposit Refund" },
    { value: "security_to_fee_revenue", label: "Security Fee Convert To Fee Revenue" },
];

const AccountSetting = () => {
    const dispatch = useDispatch<AppDispatch>();
    const routes = all_routes;
    const hasPermission = usePermission("Security Account Setting");

    const { data: allSettings, selectedSetting, loading } = useSelector((state: RootState) => state.accountSetting);
    const { data: coaData } = useSelector((state: RootState) => state.campusCoa);

    const [settingType, setSettingType] = useState<string>(settingTypeOptions[0].value);
    const [debitAccountId, setDebitAccountId] = useState<number | "">("");
    const [creditAccountId, setCreditAccountId] = useState<number | "">("");

    const [searchSettingType, setSearchSettingType] = useState<string>(settingTypeOptions[0].value);

    useEffect(() => {
        dispatch(GetAllSettings());
        dispatch(GetAccountsLevelWise({ accountLevel: 4 }));
    }, [dispatch]);

    const accountOptions = Array.isArray(coaData) ? coaData.map((item: any) => ({
        value: item.id,
        label: `${item.accountName} (${item.accountCode || item.id})`
    })) : [];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settingType || !debitAccountId || !creditAccountId) {
            toast.error("Please fill in all fields");
            return;
        }

        await dispatch(SaveSetting({
            settingType,
            debitAccountId: Number(debitAccountId),
            creditAccountId: Number(creditAccountId)
        })).then((res: any) => {
            if (!res.error) {
                document.getElementById('close-add-modal')?.click();
                dispatch(GetAllSettings());
                setDebitAccountId("");
                setCreditAccountId("");
            }
        });
    };

    const handleGetSetting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchSettingType) {
            toast.error("Please select a setting type");
            return;
        }
        await dispatch(GetSetting(searchSettingType));
    };

    return (
        <div className="page-wrapper">
            <div className="content content-two">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="mb-1">Account Setting</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Account Setting
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                        <div className="mb-2">
                            {hasPermission?.addRight && (
                                <Link
                                    to="#"
                                    className="btn btn-primary d-flex align-items-center"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_account_setting"
                                >
                                    <i className="ti ti-square-rounded-plus me-2" />
                                    Add Setting
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-white">
                                <h5 className="card-title mb-0">Fetch Specific Setting</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleGetSetting}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Setting Type</label>
                                            <CommonSelect3
                                                options={settingTypeOptions}
                                                value={settingTypeOptions.find(o => o.value === searchSettingType)}
                                                onChange={(opt: any) => setSearchSettingType(opt?.value)}
                                                className="select"
                                            />
                                        </div>
                                        <div className="col-md-2 mb-3 d-flex align-items-end">
                                            <button type="submit" className="btn btn-secondary w-100" disabled={loading}>
                                                Get Setting
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedSetting && (
                    <div className="row mt-4">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header bg-light">
                                    <h5 className="card-title mb-0">Fetched Setting: {selectedSetting.settingType}</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <strong>Debit Account:</strong> {selectedSetting.debitAccountName} (ID: {selectedSetting.debitAccountId})
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <strong>Credit Account:</strong> {selectedSetting.creditAccountName} (ID: {selectedSetting.creditAccountId})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row mt-4">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-white">
                                <h5 className="card-title mb-0">All Settings</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Setting Type</th>
                                                <th>Debit Account</th>
                                                <th>Credit Account</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allSettings && allSettings.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.settingType}</td>
                                                    <td>{item.debitAccountName} ({item.debitAccountId})</td>
                                                    <td>{item.creditAccountName} ({item.creditAccountId})</td>
                                                </tr>
                                            ))}
                                            {(!allSettings || allSettings.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="text-center">No settings found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Setting Modal */}
            <div className="modal fade" id="add_account_setting">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Account Setting</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                id="close-add-modal"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Setting Type <span className="text-danger">*</span></label>
                                            <CommonSelect3
                                                options={settingTypeOptions}
                                                value={settingTypeOptions.find(o => o.value === settingType)}
                                                onChange={(opt: any) => setSettingType(opt?.value)}
                                                className="select"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Debit Account <span className="text-danger">*</span></label>
                                            <CommonSelect3
                                                options={accountOptions}
                                                value={accountOptions.find((o: any) => o.value === debitAccountId) || null}
                                                onChange={(opt: any) => setDebitAccountId(opt?.value)}
                                                className="select"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Credit Account <span className="text-danger">*</span></label>
                                            <CommonSelect3
                                                options={accountOptions}
                                                value={accountOptions.find((o: any) => o.value === creditAccountId) || null}
                                                onChange={(opt: any) => setCreditAccountId(opt?.value)}
                                                className="select"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Setting'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSetting;
