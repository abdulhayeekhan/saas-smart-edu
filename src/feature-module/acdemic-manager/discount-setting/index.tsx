import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast'

// State & API Imports
import type { RootState, AppDispatch } from "../../../store";

import { GetAllDiscountSettings, UpdateDiscountSettings, AddDiscountSettings } from '../../../store/apps/FSReceiptDiscount';

// Custom Hooks
import { useFeeTypes } from '../../../core/common/selectoption/academic/useFeeTypes';
import { useDiscountType } from '../../../core/common/selectoption/academic/useDiscountType';
import { useCampusDis4thLevel } from '../../../core/common/selectoption/financial/useCampusDis4thLevel';
import { all_routes } from "../../router/all_routes";

// Types
interface DiscountSetting {
    id?: number;
    feeTypeId: number;
    discountTypeId: number;
    receiptDebitAccount: number;
    receiptAccountName?: string;
}

const DiscountTransactionSetting: React.FC = () => {
    const routes = all_routes;
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const accountLevel = 4;

    // Custom Hooks for data fetching
    const feeTypes = useFeeTypes().slice(1);
    const discountTypes = useDiscountType().slice(1);
    const campusDis4thLevel = useCampusDis4thLevel();
    console.log('Campus Dis 4th Level Options:', campusDis4thLevel);
    console.log('Fee Types:', feeTypes);
    console.log('Discount Types:', discountTypes);

    // Redux Selectors

    const discountSettingdata = useSelector((state: RootState) => state.discountSettings);
    const discountSettingList: DiscountSetting[] = discountSettingdata.data || [];

    console.log('Discount Settings from Redux:', discountSettingList);

    // Local State
    const [updateDisSetting, setUpdateDisSetting] = useState<DiscountSetting[]>([]);
    const [addDisSettings, setAddDisSettings] = useState<DiscountSetting[]>([]);



    useEffect(() => {
        dispatch(GetAllDiscountSettings());
    }, [dispatch]);

    const handleRreceiptDebitAccountUpdate = (
        id: number,
        feetypeid: number,
        discountTypeId: number,
        databaseID: number
    ) => {
        const payload: DiscountSetting = {
            id: databaseID,
            feeTypeId: feetypeid,
            discountTypeId: discountTypeId,
            receiptDebitAccount: id
        };

        setUpdateDisSetting(prev => {
            const exists = prev.find(x => x.feeTypeId === feetypeid && x.discountTypeId === discountTypeId);
            if (exists) {
                return prev.map(item => (item.feeTypeId === feetypeid && item.discountTypeId === discountTypeId ? payload : item));
            }
            return [...prev, payload];
        });
    };

    const handleRreceiptDebitAccountAdd = (id: number, feetypeid: number, discountTypeId: number) => {
        const payload: DiscountSetting = {
            feeTypeId: feetypeid,
            discountTypeId: discountTypeId,
            receiptDebitAccount: id
        };

        setAddDisSettings(prev => {
            const exists = prev.find(x => x.feeTypeId === feetypeid && x.discountTypeId === discountTypeId);
            if (exists) {
                return prev.map(item => (item.feeTypeId === feetypeid && item.discountTypeId === discountTypeId ? payload : item));
            }
            return [...prev, payload];
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (updateDisSetting.length > 0) dispatch(UpdateDiscountSettings(updateDisSetting));
        if (addDisSettings.length > 0) dispatch(AddDiscountSettings(addDisSettings));

        toast.success('Discount transaction settings Updated');
        // navigate('/settings/HO/');
    };

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h4 className="mb-0">Fee Discount Transaction Setting</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Fee Type Name</th>
                                                    <th>Fee Discount</th>
                                                    <th>Account Debit (Level 4)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {feeTypes?.map((fee) => (
                                                    discountTypes?.map((disc) => {
                                                        const existingSetting = discountSettingList.find(
                                                            s => s.feeTypeId === Number(fee?.value) && s.discountTypeId === Number(disc.value)
                                                        );

                                                        return (
                                                            <tr
                                                                key={`${fee?.value}-${disc?.value}`}
                                                            >
                                                                <td>{fee?.label}</td>
                                                                <td>{disc?.label}</td>
                                                                <td>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={existingSetting ? existingSetting.receiptDebitAccount : ""}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            if (!val) return;

                                                                            // Assuming your handlers work with the raw ID now
                                                                            existingSetting
                                                                                ? handleRreceiptDebitAccountUpdate(Number(val), Number(fee?.value), Number(disc.value), Number(existingSetting.id))
                                                                                : handleRreceiptDebitAccountAdd(Number(val), Number(fee.value), Number(disc.value));
                                                                        }}
                                                                    >
                                                                        
                                                                        {campusDis4thLevel?.map((opt) => (
                                                                            <option key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="submit" className="btn btn-primary me-2">
                                            Save Settings
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate('/settings/HO/')}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountTransactionSetting;