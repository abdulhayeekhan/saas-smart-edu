import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect3";
import { feeGroup, feesTypes } from "../../../core/common/selectoption/selectoption";
import { DatePicker } from 'antd'
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { GetFeeType, AddFeeType, AddFeeTypeWithCOA, UpdateFeeType, DeleteFeeType, FeeType } from "../../../store/apps/feeTypes";
import { GetAccountsLevelWise } from "../../../store/apps/campus-coa";

const FeesModal = ({ editData, setEditData, deleteId, setDeleteId }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: rawCoaData } = useSelector((state: RootState) => state.campusCoa);
  const coaData = Array.isArray(rawCoaData) ? rawCoaData : [];

  React.useEffect(() => {
    dispatch(GetAccountsLevelWise({ accountLevel: 4 }) as any);
  }, [dispatch]);

  const coaOptions = coaData.map((d: any) => ({ value: d.id, label: d.name || d.accountName }));
  const [activeContent, setActiveContent] = useState('');
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeEditBtnRef = useRef<HTMLButtonElement>(null);
  const closeDeleteBtnRef = useRef<HTMLButtonElement>(null);
  const handleContentChange = (event: any) => {
    setActiveContent(event.target.value);
  };

  const [form, setForm] = useState<FeeType>({
    name: '',
    description: ''
  })
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]:
        name.includes('AccountId') || name === 'id'
          ? Number(value) // convert numeric IDs to number
          : value,       // keep strings as-is
    }))
  }
  const [saveLoading, setSaveLoading] = useState(false);
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    if (!form.name.trim()) return

    try {
      await dispatch(AddFeeTypeWithCOA(form) as any)
    } catch (error) {
      console.error("Failed to add fee type:", error)
    } finally {
      setForm({
        name: '',
        description: ''
      })
      setSaveLoading(false);
      closeBtnRef.current?.click()
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editData?.name?.trim()) return;
    setSaveLoading(true);
    try {
      const updatePayload = {
        id: editData.id,
        name: editData.name,
        description: editData.description,
        receiptCreditAccountId: editData.receiptCreditAccountId || 0,
        receiptDebitAccountId: 0,
        invoiceDebitAccountId: editData.invoiceDebitAccountId || 0,
        invoiceCreditAccountId: editData.invoiceCreditAccountId || 0
      };
      await dispatch(UpdateFeeType(updatePayload as any));
      closeEditBtnRef.current?.click();
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deleteId) return;
    setSaveLoading(true);
    try {
      await dispatch(DeleteFeeType(deleteId));
      closeDeleteBtnRef.current?.click();
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Month is zero-based, so we add 1
  const day = String(today.getDate()).padStart(2, '0')
  const formattedDate = `${month}-${day}-${year}`
  const defaultValue = dayjs(formattedDate);
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
      <>
        {/* Add Fees Master */}
        <div className="modal fade" id="add_fees_master">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <h4 className="modal-title">Add Fees Master</h4>
                  <span className="badge bg-soft-info ms-2">2024 - 2025</span>
                </div>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form >
                <div className="modal-body" id="modal-datepicker2">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Fees Group</label>
                        <CommonSelect
                          className="select"
                          options={feeGroup}
                          defaultValue={undefined}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Fees Type</label>
                        <CommonSelect
                          className="select"
                          options={feesTypes}
                          defaultValue={undefined}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <div className="date-pic">
                              <DatePicker
                                className="form-control datetimepicker"
                                format={{
                                  format: "DD-MM-YYYY",
                                  type: "mask",
                                }}
                                getPopupContainer={getModalContainer2}
                                defaultValue=""
                                placeholder="Select Date"
                              />
                              <span className="cal-icon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Amount</label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Fine Type</label>
                        <div className="d-flex align-items-center check-radio-group">
                          <label className="custom-radio">
                            <input type="radio" name="radio" value="" checked={activeContent === ''}
                              onChange={handleContentChange} />
                            <span className="checkmark" />
                            None
                          </label>
                          <label className="custom-radio percentage-radio">
                            <input type="radio" name="radio" value="percentage" onChange={handleContentChange} />
                            <span className="checkmark" />
                            Percentage
                          </label>
                          <label className="custom-radio fixed-radio">
                            <input type="radio" name="radio" value="fixed" onChange={handleContentChange} />
                            <span className="checkmark" />
                            Fixed
                          </label>
                        </div>
                      </div>
                      <div className={`percentage-field ${activeContent === 'percentage' ? 'percentage-field-show' : ''} `}>
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="mb-3">
                              <label className="form-label">Percentage</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="%"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="mb-3">
                              <label className="form-label">Amount ($)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="$"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`fixed-field ${activeContent === 'fixed' ? 'fixed-field-show' : ''} `}>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="mb-3">
                              <label className="form-label">Amount ($)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="$"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="status-title">
                        <h5>Status</h5>
                        <p>Change the Status by toggle </p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
                    Cancel
                  </Link>
                  <Link to="#" data-bs-dismiss="modal" className="btn btn-primary">
                    Add Fees Master
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Add Fees Master*/}
        {/* Edit Fees Master */}
        <div className="modal fade" id="edit_fees_master">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <h4 className="modal-title">Edit Fees Master</h4>
                  <span className="badge bg-soft-info ms-2">2024 - 2025</span>
                </div>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body" id="modal-datepicker">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Fees Group</label>
                        <CommonSelect
                          className="select"
                          options={feeGroup}
                          defaultValue={feeGroup[1]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Fees Type</label>
                        <CommonSelect
                          className="select"
                          options={feesTypes}
                          defaultValue={feesTypes[1]}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <div className="date-pic">
                              <DatePicker
                                className="form-control datetimepicker"
                                format={{
                                  format: "DD-MM-YYYY",
                                  type: "mask",
                                }}
                                getPopupContainer={getModalContainer}
                                defaultValue={defaultValue}
                                placeholder="16 May 2024"
                              />
                              <span className="cal-icon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Amout"
                              defaultValue="$500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Fine Type</label>
                        <div className="d-flex align-items-center check-radio-group">
                          <label className="custom-radio">
                            <input type="radio" name="radio" value="" checked={activeContent === ''}
                              onChange={handleContentChange} />
                            <span className="checkmark" />
                            None
                          </label>
                          <label className="custom-radio percentage-radio">
                            <input type="radio" name="radio" value="percentage" onChange={handleContentChange} />
                            <span className="checkmark" />
                            Percentage
                          </label>
                          <label className="custom-radio fixed-radio">
                            <input type="radio" name="radio" value="fixed" onChange={handleContentChange} />
                            <span className="checkmark" />
                            Fixed
                          </label>
                        </div>
                      </div>
                      <div className={`percentage-field ${activeContent === 'percentage' ? 'percentage-field-show' : ''} `}>
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="mb-3">
                              <label className="form-label">Percentage</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="%"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="mb-3">
                              <label className="form-label">Amount ($)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="$"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`fixed-field ${activeContent === 'fixed' ? 'fixed-field-show' : ''} `}>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="mb-3">
                              <label className="form-label">Amount ($)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="$"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="status-title">
                        <h5>Status</h5>
                        <p>Change the Status by toggle </p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
                    Cancel
                  </Link>
                  <Link to="#" data-bs-dismiss="modal" className="btn btn-primary">
                    Save Changes
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Fees Master*/}
      </>

      <>
        <div className="modal fade" id="add_fees_Type">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Fees Type</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input type="text" placeholder="Enter Fee Type Name" onChange={handleChange} value={form?.name} name="name" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows={4} name="description" onChange={handleChange} placeholder="Enter description" value={form.description} />
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
                  <button
                    type="submit"
                    disabled={!form.name || !form.description || saveLoading}
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Edit Fees Type */}
        <div className="modal fade" id="edit_fees_Type">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Fees Type</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={closeBtnRef}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Name"
                          value={editData?.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Receipt Credit Account</label>
                        <CommonSelect2
                          className="select"
                          options={coaOptions}
                          value={
                            editData?.receiptCreditAccountId
                              ? coaOptions.find((opt: any) => opt.value === editData.receiptCreditAccountId) || null
                              : null
                          }
                          onChange={(e: any) =>
                            setEditData({ ...editData, receiptCreditAccountId: e ? e.value : 0 })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Invoice Debit Account</label>
                        <CommonSelect2
                          className="select"
                          options={coaOptions}
                          value={
                            editData?.invoiceDebitAccountId
                              ? coaOptions.find((opt: any) => opt.value === editData.invoiceDebitAccountId) || null
                              : null
                          }
                          onChange={(e: any) =>
                            setEditData({ ...editData, invoiceDebitAccountId: e ? e.value : 0 })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Invoice Credit Account</label>
                        <CommonSelect2
                          className="select"
                          options={coaOptions}
                          value={
                            editData?.invoiceCreditAccountId
                              ? coaOptions.find((opt: any) => opt.value === editData.invoiceCreditAccountId) || null
                              : null
                          }
                          onChange={(e: any) =>
                            setEditData({ ...editData, invoiceCreditAccountId: e ? e.value : 0 })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Add Comment"
                          value={editData?.description || ''}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn btn-primary"
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Fees Type */}
        {/* Add New Fees Type */}
        <div className="modal fade" id="add_new_fees_group">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New Fees Group</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Name"
                          defaultValue=""
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Add Comment"
                        defaultValue={""}
                      />
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="status-title">
                        <h5>Status</h5>
                        <p>Change the Status by toggle </p>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="switch-sm3"
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
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    Add Fees Type
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Add New Fees Type */}
      </>

      <>
        {/* Add Fees Group */}
        <div className="modal fade" id="add_fees_group">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Fees Group</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Fees Group</label>
                        <input type="text" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          defaultValue={""}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switch-sm"
                          />
                        </div>
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
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    Add Fees Group
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Add Fees Group */}
        {/* Edit Fees Group */}
        <div className="modal fade" id="edit_fees_group">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Fees Group</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Fees Group</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Fees Group"
                          defaultValue="Tuition Fees"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Add Comment"
                          defaultValue={"The money that you pay to be taught"}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switch-sm2"
                          />
                        </div>
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
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Fees Group */}
      </>

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleDeleteSubmit}>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  You want to delete all the marked items, this cant be undone
                  once you delete.
                </p>
                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                    ref={closeDeleteBtnRef}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Deleting...' : 'Yes, Delete'}
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
