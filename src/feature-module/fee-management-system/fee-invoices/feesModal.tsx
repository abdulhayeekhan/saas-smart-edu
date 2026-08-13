import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../core/common/commonSelect";
import { feeGroup, feesTypes } from "../../../core/common/selectoption/selectoption";
import { DatePicker } from 'antd'
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { GetFeeType, AddFeeType, AddFeeTypeWithCOA, UpdateFeeType, FeeType } from "../../../store/apps/feeTypes";
import { CancelInvoice, CancelInvoicePayload } from "../../../store/apps/fee-invoice";
interface FeesModalProps {
  isDeleted: any; // You can replace 'any' with your FeeStructureType later
}

const FeesModal: React.FC<FeesModalProps> = ({ isDeleted }) => {
  const [activeContent, setActiveContent] = useState('');
  const [cancelBody, setCancelBody] = useState({
    invoiceId: null,
    reason: ""
  });
  const handleReasonChange = (event: any) => {
    const { value } = event.target;
    setCancelBody((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  useEffect(() => {
    if (isDeleted) {
      setCancelBody(prev => ({
        ...prev,
        invoiceId: isDeleted, // Set the ID from props
        reason: ""            // Reset reason for the new ID
      }));
    }
  }, [isDeleted]);
  const dispatch = useDispatch<AppDispatch>();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const handleContentChange = (event: any) => {
    setActiveContent(event.target.value);
  };

  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };
  const getModalContainer2 = () => {
    const modalElement = document.getElementById('modal-datepicker2');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  return (
    <>


      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form>
              <div className="modal-body text-center p-4">
                <span className="delete-icon mb-3 d-inline-block">
                  <i className="ti ti-trash-x text-danger" style={{ fontSize: '50px' }} />
                </span>
                <h4>Confirm Cancellation</h4>

                <div className="text-start mb-4">
                  <label className="form-label fw-medium">Reason for Cancellation</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter reason here..."
                    rows={3}
                    value={cancelBody.reason}
                    onChange={(e) => setCancelBody(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                  />
                </div>

                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light me-3 w-100"
                    data-bs-dismiss="modal"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    className={`btn btn-danger w-100 ${!cancelBody.reason.trim() ? 'disabled' : ''}`}
                    data-bs-dismiss="modal"
                    onClick={() => {
                      if (cancelBody.invoiceId && cancelBody.reason.trim()) {
                        dispatch(CancelInvoice(cancelBody as CancelInvoicePayload));
                      }
                    }}
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </>
  );
};

export default FeesModal;
