import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable2/index";
import CommonSelect3 from "../../core/common/commonSelect3";
import { all_routes } from "../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { GetFinancialYears, GetAccountsBalanceByFinancialYear } from "../../store/apps/financial-year";
import { AddHOOpening } from "../../store/apps/opening-balance";
import toast from "react-hot-toast";

const routes = all_routes;

const FinancialYearRollover = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

    const [selectedSourceYear, setSelectedSourceYear] = useState<any>(null);
    const [selectedTargetYear, setSelectedTargetYear] = useState<any>(null);

    const financialYearsData = useSelector((state: RootState) => state.financialYear.data);
    const accountBalancesData = useSelector((state: RootState) => state.financialYear.accountBalances);

    const [financialYearsList, setFinancialYearsList] = useState<any[]>([]);

    useEffect(() => {
        dispatch(GetFinancialYears());
    }, [dispatch]);

    useEffect(() => {
        if (financialYearsData && financialYearsData.length > 0) {
            const formatted = financialYearsData.map((item: any) => ({
                value: item.id,
                label: item.name,
            }));
            setFinancialYearsList(formatted);
        }
    }, [financialYearsData]);

    const handleFetchBalances = () => {
        if (!selectedSourceYear) {
            toast.error("Please select a source financial year");
            return;
        }
        dispatch(GetAccountsBalanceByFinancialYear(selectedSourceYear.value));
    };

    const handleRollover = async () => {
        if (!selectedTargetYear) {
            toast.error("Please select a target financial year");
            return;
        }
        if (!accountBalancesData || accountBalancesData.length === 0) {
            toast.error("No balances to rollover. Please fetch balances first.");
            return;
        }

        const currentYear = new Date().getFullYear();

        const level4Balances = accountBalancesData.filter((item: any) => item.accountLevel === 4);

        if (level4Balances.length === 0) {
            toast.error("No 4th level accounts found to rollover.");
            return;
        }

        const payload = level4Balances.map((item: any) => {
            const isDebit = ['Asset', 'Expense'].includes(item.nature);

            let debitAmount = 0;
            let creditAmount = 0;

            if (!['Expense', 'Revenue'].includes(item.nature)) {
                if (item.closingBalance > 0) {
                    if (isDebit) debitAmount = item.closingBalance;
                    else creditAmount = item.closingBalance;
                } else if (item.closingBalance < 0) {
                    if (isDebit) creditAmount = Math.abs(item.closingBalance);
                    else debitAmount = Math.abs(item.closingBalance);
                }
            }

            return {
                id: 0,
                financialYearId: selectedTargetYear.value,
                accountId: item.accountId,
                debitAmount: debitAmount,
                creditAmount: creditAmount,
                year: currentYear,
                addedBy: 0,
                addedAt: new Date().toISOString(),
                modifiedBy: 0,
                modifiedAt: new Date().toISOString(),
                campusId: 0, // Using 0 for Head Office
                isHO: true
            };
        });

        setLoading(true);
        const actionResult = await dispatch(AddHOOpening(payload));
        if (AddHOOpening.fulfilled.match(actionResult)) {
            // AddHOOpening shows success toast via thunk
        }
        setLoading(false);
    };

    const columns = [
        {
            title: "Account Code",
            dataIndex: "accountCode",
            sorter: (a: any, b: any) => a.accountCode.localeCompare(b.accountCode),
        },
        {
            title: "Account Name",
            dataIndex: "accountName",
            sorter: (a: any, b: any) => a.accountName.localeCompare(b.accountName),
        },
        {
            title: "Nature",
            dataIndex: "nature",
            sorter: (a: any, b: any) => a.nature.localeCompare(b.nature),
        },
        {
            title: "Debit Balance",
            render: (text: any, record: any) => {
                const isDebit = ['Asset', 'Expense'].includes(record.nature);
                let amount = 0;
                
                if (!['Expense', 'Revenue'].includes(record.nature)) {
                    if (record.closingBalance > 0 && isDebit) amount = record.closingBalance;
                    else if (record.closingBalance < 0 && !isDebit) amount = Math.abs(record.closingBalance);
                }
                
                return <span>{amount.toLocaleString()}</span>;
            },
        },
        {
            title: "Credit Balance",
            render: (text: any, record: any) => {
                const isDebit = ['Asset', 'Expense'].includes(record.nature);
                let amount = 0;
                
                if (!['Expense', 'Revenue'].includes(record.nature)) {
                    if (record.closingBalance > 0 && !isDebit) amount = record.closingBalance;
                    else if (record.closingBalance < 0 && isDebit) amount = Math.abs(record.closingBalance);
                }
                
                return <span>{amount.toLocaleString()}</span>;
            },
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                    <div className="my-auto mb-2">
                        <h3 className="page-title mb-1">Financial Year Rollover</h3>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={routes.adminDashboard}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Financial Year Rollover
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                        <h4 className="mb-3">Rollover Balances</h4>
                    </div>
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label className="form-label">Source Financial Year (Closing)</label>
                                    <CommonSelect3
                                        className="select"
                                        options={financialYearsList}
                                        onChange={(option: any) => setSelectedSourceYear(option)}
                                        value={selectedSourceYear}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2 d-flex align-items-end mb-3">
                                <button className="btn btn-primary w-100" onClick={handleFetchBalances}>
                                    Fetch Balances
                                </button>
                            </div>
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label className="form-label">Target Financial Year (Opening)</label>
                                    <CommonSelect3
                                        className="select"
                                        options={financialYearsList}
                                        onChange={(option: any) => setSelectedTargetYear(option)}
                                        value={selectedTargetYear}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2 d-flex align-items-end mb-3">
                                <button className="btn btn-success w-100" onClick={handleRollover} disabled={loading}>
                                    {loading ? 'Processing...' : 'Rollover Balances'}
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <Table
                                dataSource={(accountBalancesData || []).filter((item: any) => item.accountLevel === 4)}
                                columns={columns}
                                Selection={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialYearRollover;
