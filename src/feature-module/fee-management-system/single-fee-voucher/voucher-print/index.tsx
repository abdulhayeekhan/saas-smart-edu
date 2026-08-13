import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
// Import your existing component
import SingleFeeVoucher from '../index';
// Import your action to fetch invoice if it's not in state
import { GetFeeInvoiceById } from '../../../../store/apps/fee-invoice';

const VoucherPrintPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // 1. Try to find the invoice in your existing Redux state
    const invoice = useSelector((state: RootState) =>
        state.feeInvoice.data.find((item: any) => item.id === Number(id))
    );

    // 2. If user refreshes the tab and Redux is empty, fetch the data
    useEffect(() => {
        if (!invoice && id) { // Ensure id exists before calling
            // Adjust this call based on your API logic (e.g., fetch by ID)
            dispatch(GetFeeInvoiceById(Number(id)));
        }
    }, [id, invoice, dispatch]);

    if (!invoice) {
        return <div className="p-5 text-center">Loading Voucher...</div>;
    }

    return (
        <div className="page-wrapper">
            <div style={{ backgroundColor: '#525659', minHeight: '100vh', marginTop: 40 }}>
                <SingleFeeVoucher data={invoice} />
            </div>
        </div>
    );
};

export default VoucherPrintPage;