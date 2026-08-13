import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTableCOA/index";
import PredefinedDateRanges from "../../core/common/datePicker";
import CommonSelect from "../../core/common/commonSelect";
import CommonSelect2 from "../../core/common/commonSelect2";
import CommonSelect3 from "../../core/common/commonSelect3";
import {
    category2,
    coaentrylevel,
    expenseName,
    invoiceNumber,
    paymentMethod,
    usePermission
} from "../../core/common/selectoption/selectoption";
import {useCampusesList} from "../../core/common/selectoption/master/useCampusesList";
import useRegionsList from "../../core/common/selectoption/master/useRegions"
import { FormEvent } from "react";
import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TableData } from "../../core/data/interface";
import { all_routes } from "../router/all_routes";
import TooltipOption from "../../core/common/tooltipOption";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { GetChartOfAccount, AddCampusChartofAccount, DeleteCOAccount, GetChartofAccountByID, UpdateCOAccount } from "../../store/apps/campus-coa";
import axios from "axios";
const baseURL: string = process.env.REACT_APP_API_BASE_URL || "";

interface ChartOfAccountPayload {
    parentAccountId: number | null;
    accountTypeId: number | null;
    accountCode: string;
    accountName: string;
    accountLevel: number;
    nature: string;
    campusId?: string;
    mapping: string;
    isActive: boolean;
}

interface AccountItem {
    account: {
        id: number;
        accountCode: string;
        accountName: string;
        accountLevel: number;
        nature: string;
        createdAt: string;
    };
    subAccounts: AccountItem[];
}

const CampusChartOfAccount = () => {
    const dispatch = useDispatch<AppDispatch>();
    const hasPermission = usePermission("Campus Chart of Accounts");
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<AccountItem[]>([]);

    const regionsList = useRegionsList();

    const userInfoString = localStorage.getItem("userData");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const userLevel = userInfo?.data?.userLevel;
    const userLevelId = userInfo?.data?.userLevelId;

    const navigate = useNavigate();
    const flattenAccounts = (nodes: any[]): any[] => {
        let result: any[] = [];
        for (const node of nodes) {
            result.push(node.account);
            if (node.subAccounts && node.subAccounts.length > 0) {
                result = result.concat(flattenAccounts(node.subAccounts));
            }
        }
        return result;
    };
    const GetAccounts = async () => {
        setLoading(true);
        const response = await dispatch(GetChartOfAccount(selectCampusId) as any);
        if (response.payload) {
            const flatAccounts = flattenAccounts(response.payload);
            const map: any = {};
            const roots: any[] = [];

            flatAccounts.forEach(item => {
                map[item.id] = { ...item, children: [] };
            });

            flatAccounts.forEach(item => {
                if (item.parentAccountId) {
                    map[item.parentAccountId]?.children.push(map[item.id]);
                } else {
                    roots.push(map[item.id]);
                }
            });

            setDataSource(roots);
            setLoading(false)
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userLevel === 2 && userLevelId) {
            setRegionId(userLevelId);
            handleEntryLevel(4);
        }
    }, [userLevel, userLevelId]);
    const [mainAccount, setMainAccount] = React.useState(false);
    const [subAccount, setSubAccount] = React.useState(false);
    const [headOfAccount, setHeadOfAccount] = React.useState(false);
    const [chartOfAccountLevel, setChartOfAccountLevel] = React.useState<number>(0);
    const [accountTypeId, setAccountTypeId] = React.useState<number | null>(null);
    const [levelValue, setLevelValue] = React.useState<number>(0);
    const [account_Code, setAccountCode] = React.useState<string>("");
    const [account_Name, setAccountName] = useState<string>("")
    const [account_mapping, setMapping] = useState<string>("")
    const [levelOneDropDown, setLevelOneDropDown] = React.useState<any[]>([]); // refine type later
    const [natureId, setNatureID] = useState<number | null>(null);
    const [secondlevelParentID, setSecondLevelParentID] = useState<number | null>(null);
    const [thirdlevelParentID, setThirdLevelParentID] = useState<number | null>(null);
    const [parentAccountId, setParentAccountId] = useState<number | null>(null);
    const [levelTwoDropDown, setLevelTwoDropDown] = useState<any[]>([]);
    const [levelThreeDropDown, setLevelThreeDropDown] = useState<any[]>([]);
    const [campusId, setCampusId] = useState<string>("");
    const [regionId, setRegionId] = useState<string>("");
    const campusesList = useCampusesList(regionId);
    const [selectRegionId, setSelectRegionId] = useState<string>("");
    const [selectCampusId, setSelectCampusId] = useState<number>(0);
    const campusesListFiltered = useCampusesList(selectRegionId)
    //const [loading2, setLoading2] = useState<boolean>(false);
    const [loading1, setLoading1] = useState<boolean>(false);
    const [loading2, setLoading2] = useState<boolean>(false);
    const [loading3, setLoading3] = useState<boolean>(false);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    useEffect(() => {
        GetAccounts();
    }, [account_Code]);

    const apiFetch = async <T,>(url: string): Promise<T> => {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            console.error("API Fetch Error:", err);
            throw err;
        }
    };

    const generateAccountCode = async (
        parentId: number | null,
        setAccountCode: (code: string) => void
    ) => {
        try {
            const data = await apiFetch<{ data: string }>(
                `${baseURL}/api/BChartOfAccount/GenerateAccountCode?parentAccountId=${parentId}`
            );
            
            setAccountCode(data.data);
        } catch (error) {
            console.error("Error generating account code:", error);
        }
    };
    const fetchChildAccounts = async (
        parentId: number | null,
        accountLevel: number,
        setDropDown: (data: any[]) => void
    ) => {
        try {
            const queryParent = parentId !== null ? `parentId=${parentId}&` : '';
            const data = await apiFetch<{ data: any[] }>(
                `${baseURL}/api/BChartOfAccount/GetChildAccountByLevel?${queryParent}accountLevel=${accountLevel}`
            );

            setDropDown(data.data);
        } catch (error) {
            console.error("Error fetching child accounts:", error);
        }
    };

    const handleCampuses = async (value: string | number) => {
        const campusId = Number(value);
        setCampusId(String(campusId));
    }
    const handleFilterCampus = async (value: string | number) => {
        const campusId = Number(value);
        setSelectCampusId(Number(campusId));
    }
    const handleFilterReset = async () => {
        setSelectCampusId(0);
        setSelectRegionId("");
    }
    const handleRegions = async (value: string | number) => {
        const regionId = Number(value);
        setRegionId(String(regionId));
    }
    const handleFilterRegions = async (value: string | number) => {
        const regionId = Number(value);
        setSelectRegionId(String(regionId));
    }
    const handleEntryLevel = async (value: string | number) => {
        const level = Number(value);

        if (level === 0) {
            setMainAccount(false);
            setSubAccount(false);
            setHeadOfAccount(false);
            return;
        }

        if (level === 1) {
            setChartOfAccountLevel(1);
            setMainAccount(false);
            setSubAccount(false);
            setHeadOfAccount(false);
            setAccountTypeId(null);
            setLevelValue(1);
            await generateAccountCode(null, setAccountCode);
        }

        if (level === 2) {
            setLoading1(true);
            await fetchChildAccounts(null, 1, setLevelOneDropDown);
            setLoading1(false);
            setChartOfAccountLevel(2);
            setMainAccount(true);
            setSubAccount(false);
            setHeadOfAccount(false);
            setLevelValue(level);
        }

        if (level === 3 || level === 4) {
            setLoading1(true);
            await fetchChildAccounts(null, 1, setLevelOneDropDown);
            setLoading1(false);
            setLevelValue(level);
            setMainAccount(true);
            setSubAccount(true);
            setHeadOfAccount(level === 4);
        }
    };
    const [deleteaccountId, setDeleteAccountId] = useState<number | null>(null);
    const [updateAccountData, setUpdateAccountData] = useState<any>(null);
    const GetUpdateAccountData = async (accountId: number | null) => {
        if (!accountId) {
            console.error("Invalid account ID for update.");
            return;
        }
        const response = await dispatch(GetChartofAccountByID(accountId) as any);
        if (response.payload) {
            const accountData = response.payload;
            const requestBody = {
                id: accountData.id ?? 0,
                parentAccountId: accountData.parentAccountId ?? 0,
                accountTypeId: accountData.accountTypeId ?? 0,
                accountCode: accountData.accountCode ?? "string",
                accountName: accountData.accountName ?? "string",
                accountLevel: accountData.accountLevel ?? 0,
                nature: accountData.nature ?? "string",
                mapping: accountData.mapping ?? "string",
                isActive: accountData.isActive ?? true,
                campusId: accountData.campusId ?? null
            };
            setUpdateAccountData(requestBody)
        }
    }
    const GetDeleteCOAccountId = async (accountId: number | null) => {
        if (!accountId) {
            console.error("Invalid account ID for deletion.");
            return;
        }
        setDeleteAccountId(accountId);
    }
    const HandleDeleteAccount = async (e: any) => {
        e.preventDefault();
        await dispatch(DeleteCOAccount(deleteaccountId as number) as any);
        setDeleteAccountId(null);
        const modalEl = document.getElementById("delete-modal");

        const closeBtn = document.querySelector<HTMLButtonElement>(
            "#delete-modal .btn-close"
        );
        closeBtn?.click();
        await GetAccounts();
    }
    const handle1Level = async (value: string | number) => {
        const parentId = Number(value);
        setNatureID(parentId);
        setSecondLevelParentID(parentId);
        setParentAccountId(parentId);

        setLoading2(true);
        await Promise.all([
            generateAccountCode(parentId, setAccountCode),
            fetchChildAccounts(parentId, 2, setLevelTwoDropDown),
        ]);
        setLoading2(false);
    };

    const handle2Level = async (value: string | number) => {
        const parentId = Number(value);
        setThirdLevelParentID(parentId);
        setParentAccountId(parentId);
        setAccountTypeId(parentId);

        setLoading3(true);
        await Promise.all([
            generateAccountCode(parentId, setAccountCode),
            fetchChildAccounts(parentId, 3, setLevelThreeDropDown),
        ]);
        setLoading3(false);
    };

    const handle3Level = async (value: string | number) => {
        const parentId = Number(value);
        setParentAccountId(parentId);
        await generateAccountCode(parentId, setAccountCode);
    };

    const routes = all_routes;
    const columns = [
        {
            title: "Account Code",
            dataIndex: "accountCode",
            sorter: (a: TableData, b: TableData) => a.accountCode.length - b.accountCode.length,
        },
        {
            title: "Account Name",
            dataIndex: "accountName",
            sorter: (a: TableData, b: TableData) => a.accountName.length - b.accountName.length,
        },
        {
            title: "Level",
            dataIndex: "accountLevel",
            sorter: (a: TableData, b: TableData) => a.accountLevel.length - b.accountLevel.length,
        },
        {
            title: "Nature",
            dataIndex: "nature",
            sorter: (a: TableData, b: TableData) => a.nature.length - b.nature.length,
        },
        {
            title: "Notes grouping",
            dataIndex: "mapping",
            sorter: (a: TableData, b: TableData) => a.mapping.length - b.mapping.length,
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_: any, record: any) => (
                <>
                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <Link
                                to="#"
                                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="ti ti-dots-vertical fs-14" />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-right p-3">
                                {(hasPermission && hasPermission?.editRight) && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#edit_expenses"
                                            onClick={() => GetUpdateAccountData(record.id)}
                                        >
                                            <i className="ti ti-edit-circle me-2" />
                                            Edit
                                        </Link>
                                    </li>
                                )}
                                {(hasPermission && hasPermission?.deleteRight) && (
                                    <li>
                                        <Link
                                            className="dropdown-item rounded-1"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#delete-modal"
                                            onClick={() => GetDeleteCOAccountId(record.id)}
                                        >
                                            <i className="ti ti-trash-x me-2" />
                                            Delete
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </>
            ),
        },
    ];

    const handleSubmit = async (
        params: {
            account_Code: string;
            account_Name: string;
            account_mapping: string;
            accountTypeId: number | null;
            parentAccountId: number | null;
            levelValue: number;
            natureId: number | null;
            campusId?: string;
        },
        baseURL: string,
        dispatch: (action: unknown) => void,
        router: { push: (path: string) => void },
        AddCampusChartofAccount: (payload: ChartOfAccountPayload) => unknown
    ): Promise<void> => {
        setIsSubmit(true);
        try {
            let {
                account_Code,
                account_Name,
                account_mapping,
                accountTypeId,
                parentAccountId,
                levelValue,
                natureId,
                campusId,
            } = params;

            // reset parent if top-level
            if (levelValue === 1) {
                parentAccountId = null;
            }

            // resolve nature
            let nature = "";
            if (levelValue === 1) {
                nature = account_Name;
            } else if (natureId) {
                try {
                    const res = await axios.get<{ data: { accountName: string } }>(
                        `${baseURL}/api/BChartOfAccount/getaccountbyid?id=${natureId}`
                    );
                    nature = res.data.data.accountName;
                } catch (err) {
                    console.error("Failed to fetch nature account name:", err);
                    return;
                }
            }

            // construct body
            const body: ChartOfAccountPayload = {
                parentAccountId,
                accountTypeId,
                accountCode: account_Code,
                accountName: account_Name,
                accountLevel: levelValue,
                nature,
                mapping: account_mapping,
                isActive: true,
                ...(campusId ? { campusId } : {}),
            };
        
            await dispatch(AddCampusChartofAccount(body));
            await GetAccounts(); // refresh latest list

            setAccountCode("");
            setAccountName("");
            setMapping("");
            //close modal programmatically
            const closeBtn = document.querySelector<HTMLButtonElement>(
                "#add_expenses .btn-close"
            );
            closeBtn?.click();
        } catch (err) {
            console.error("Error submitting chart of account:", err);
        } finally {
            setIsSubmit(false);
            setAccountCode("")
            setAccountName("")
            setMapping("")
            setHeadOfAccount(false);
            setSubAccount(false);
            setMainAccount(false);
            setLevelValue(0);
        }
    };

    const handleFormSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        await handleSubmit(
            {
                account_Code,
                account_Name,
                account_mapping,
                accountTypeId,
                parentAccountId,
                levelValue,
                natureId,
                campusId,
            },
            baseURL,
            dispatch,
            { push: (path: string) => navigate(path) },
            AddCampusChartofAccount
        );
    };

    const handleUpdateChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setUpdateAccountData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };
    const handleUpdateSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        await dispatch(UpdateCOAccount(updateAccountData) as any);
        await GetAccounts();
        //close modal programmatically
        const closeBtn = document.querySelector<HTMLButtonElement>(
            "#edit_expenses .btn-close"
        );
        closeBtn?.click();
        setUpdateAccountData(null)
    };


    return (
        <div>
            {" "}
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Campus Chart of Account</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={routes.adminDashboard}>Dashboard</Link>
                                    </li>

                                    <li className="breadcrumb-item active" aria-current="page">
                                        Campus Chart of Accounts
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            {(hasPermission && hasPermission?.addRight) && (
                                <div className="mb-2">
                                    <Link
                                        to="#"
                                        className="btn btn-primary d-flex align-items-center"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add_expenses"
                                    >
                                        <i className="ti ti-square-rounded-plus me-2" />
                                        Add Chart of Account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Page Header */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Campus Office Chart of Account</h4>
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
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">Region</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={regionsList}
                                                                onChange={(option) => handleFilterRegions(option ? option.value : 0)}
                                                                value={selectRegionId ? regionsList.find(region => region.value === Number(selectRegionId)) : regionsList[0]}
                                                                loading={loading3}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">Campus</label>
                                                            <CommonSelect3
                                                                className="select"
                                                                options={campusesListFiltered}
                                                                onChange={(option) => handleFilterCampus(option ? option.value : 0)}
                                                                value={selectCampusId ? campusesListFiltered.find(campus => campus.value === Number(selectCampusId)) : campusesListFiltered[0]}
                                                                loading={loading3}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 d-flex align-items-center justify-content-end">
                                                <Link to="#" className="btn btn-light me-3" onClick={handleFilterReset}>
                                                    Reset
                                                </Link>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            {/* COA List */}
                            <Table rowKey="id" dataSource={dataSource} columns={columns} Selection={true} loading={loading} />
                            {/* /COA List */}
                        </div>
                    </div>
                </div>
            </div>
            {/* /Page Wrapper */}
            {/* Add Expenses */}
            <div className="modal fade" id="add_expenses">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Add Chart of Account</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">

                                        <div className="mb-3">
                                            <label className="form-label">Entry Level</label>
                                            <CommonSelect2
                                                className="select"
                                                options={coaentrylevel}
                                                onChange={(option) => handleEntryLevel(option ? option.value : 0)}
                                                defaultValue={userLevel === 2 ? coaentrylevel.find(item => item.value === 4) : coaentrylevel[0]}
                                            />
                                        </div>
                                        {mainAccount && (
                                            <div className="mb-3">
                                                <label className="form-label">Main Account</label>
                                                <CommonSelect2
                                                    className="select"
                                                    options={levelOneDropDown?.map((item) => ({ value: item.id, label: item.accountName }))}
                                                    //
                                                    onChange={(option) => handle1Level(option ? option.value : 0)}
                                                    defaultValue={coaentrylevel[0]}
                                                    loading={loading1}
                                                />
                                            </div>
                                        )}
                                        {subAccount && (
                                            <div className="mb-3">
                                                <label className="form-label">Sub Account Name</label>
                                                <CommonSelect2
                                                    className="select"
                                                    options={levelTwoDropDown?.map((item) => ({ value: item.id, label: item.accountName }))}
                                                    //
                                                    onChange={(option) => handle2Level(option ? option.value : 0)}
                                                    defaultValue={coaentrylevel[0]}
                                                    loading={loading2}
                                                />
                                            </div>
                                        )}

                                        {headOfAccount && (
                                            <div className="mb-3">
                                                <label className="form-label">Head of Account</label>
                                                <CommonSelect2
                                                    className="select"
                                                    options={levelThreeDropDown?.map((item) => ({ value: item.id, label: item.accountName }))}
                                                    //
                                                    onChange={(option) => handle3Level(option ? option.value : 0)}
                                                    defaultValue={coaentrylevel[0]}
                                                    loading={loading3}
                                                />
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">Account Code</label>
                                            <input type="text" className="form-control" value={account_Code} readOnly placeholder="Auto Generated" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Account Name</label>
                                            <input type="text" className="form-control" value={account_Name} onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountName(e.target.value)} placeholder="Enter Account Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Group Mapping</label>
                                            <input type="text" className="form-control" value={account_mapping} onChange={(e: ChangeEvent<HTMLInputElement>) => setMapping(e.target.value)} placeholder="Enter Group Mapping" />
                                        </div>

                                        {headOfAccount && (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label">Region</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={regionsList}
                                                        onChange={(option) => handleRegions(option ? option.value : 0)}
                                                        value={regionId ? regionsList.find(region => Number(region.value) === Number(regionId)) || null : regionsList[0]}
                                                        loading={loading3}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Campus</label>
                                                    <CommonSelect3
                                                        className="select"
                                                        options={campusesList}
                                                        //
                                                        onChange={(option) => handleCampuses(option ? option.value : 0)}
                                                        value={campusId ? campusesList.find(campus => campus.value === Number(campusId)) : campusesList[0]}
                                                        loading={loading3}
                                                    />
                                                </div>
                                            </>
                                        )}


                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <Link
                                    to="#"
                                    className="btn btn-light me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </Link>
                                <button type="submit" disabled={isSubmit} className="btn btn-primary">
                                    {isSubmit ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Expenses */}
            {/* Edit Expenses */}
            <div className="modal fade" id="edit_expenses">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Chart of Account</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        {updateAccountData ? (
                            <form onSubmit={handleUpdateSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">


                                            <div className="mb-3">
                                                <label className="form-label">Account Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Account Code"
                                                    disabled
                                                    value={updateAccountData ? updateAccountData?.accountCode : ''} readOnly
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Account Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="accountName"
                                                    placeholder="Enter Account Name"
                                                    onChange={handleUpdateChange}
                                                    value={updateAccountData ? updateAccountData?.accountName : ''}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Group Mapping</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="mapping"
                                                    placeholder="Enter Group Mapping"
                                                    onChange={handleUpdateChange}
                                                    value={updateAccountData ? updateAccountData?.mapping : ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Link
                                        to="#"
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) :
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            ></span>
                        }
                    </div>
                </div>
            </div>
            {/* /Edit Expenses */}
            {/* Delete Modal */}
            <div className="modal fade" id="delete-modal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={(e) => HandleDeleteAccount(e)}>
                            <div className="modal-body text-center">
                                <span className="delete-icon">
                                    <i className="ti ti-trash-x" />
                                </span>
                                <h4>Confirm Deletion</h4>
                                <p>
                                    Are you sure you want to delete the selected Chart of Account?
                                </p>
                                <div className="d-flex justify-content-center">
                                    <Link
                                        to="#"
                                        className="btn btn-light me-3"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn btn-danger">
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Delete Modal */}
        </div>
    );
};

export default CampusChartOfAccount;
