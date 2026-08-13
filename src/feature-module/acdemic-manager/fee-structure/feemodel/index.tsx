import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../../core/common/commonSelect";
import CommonSelect2 from "../../../../core/common/commonSelect2";
import CommonSelect3 from "../../../../core/common/commonSelect3";
import CommonSelect4 from "../../../../core/common/commonSelect4"
import { feeGroup, feesTypes, months, recurrenceType, usePermission } from "../../../../core/common/selectoption/selectoption";
import { DatePicker } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store";
import { useAcademicGrades } from '../../../../core/common/selectoption/academic/useAcademicGrades';
import { useAcademicSessions } from '../../../../core/common/selectoption/academic/useAcademicSessions';
import { useLastAcademicSession } from '../../../../core/common/selectoption/academic/useLastAcademicSession';
import { useFeeTypes } from '../../../../core/common/selectoption/academic/useFeeTypes';
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { FeeStructureType, FeeDetailType, GetFeeById, AddFeeStructure, UpdateFeeStructure } from "../../../../store/apps/fee-structure";
import toast from 'react-hot-toast'


interface FeesModalProps {
  isEditData: any; // You can replace 'any' with your FeeStructureType later
}

const FeeStructureModel: React.FC<FeesModalProps> = ({ isEditData }) => {
  const [activeContent, setActiveContent] = useState('');
  const regionsList = useRegionsList();
  const { single: feeDetails, data: allFeeStructures } = useSelector((state: RootState) => state.feeStructure);

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data
  const createdBy = loginInfo?.id
  const [regionId, setRegionId] = useState(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isEditData) {
      dispatch(GetFeeById(isEditData.id));
    }
  }, [isEditData]);

  // ... inside your component

  useEffect(() => {
    if (feeDetails && Object.keys(feeDetails).length > 0) {
      setUpdateData({
        id: feeDetails.id,
        campusId: feeDetails.campusId,
        sessionId: feeDetails.sessionId,
        gradeId: feeDetails.gradeId,
        // Map the nested array to include the required 'arrayid'
        details: feeDetails.details.map((item: any) => ({
          arrayid: uuidv4(), // Required for your local state management
          id: item.id,
          feeStructureId: item.feeStructureId,
          feeTypeId: item.feeTypeId,
          amount: item.amount,
          recurreceType: item.recurreceType,
          frequence: item.frequence
        }))
      });
    }
  }, [feeDetails]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Replace with your actual delete thunk
      // await dispatch(deleteFeeStructure(deleteId)); 

      toast.success("Item deleted successfully");
      setDeleteId(null); // Clear state after deletion
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };
  const handleSelectRegion = (name: string, option: any) => {
    setRegionId(option?.value ?? 0);
  }
  const effectiveRegionId = loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : (regionId || loginInfo?.regionId);
  const campuses = useCampusesList(effectiveRegionId);

  const dispatch = useDispatch<AppDispatch>();
  const grades = useAcademicGrades(effectiveRegionId);
  const sessions = useAcademicSessions(effectiveRegionId);
  const { lastSessionId } = useLastAcademicSession();
  const feetypes = useFeeTypes()
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeEditBtnRef = useRef<HTMLButtonElement>(null);
  const handleContentChange = (event: any) => {
    setActiveContent(event.target.value);
  };

  const [formData, setFormData] = useState<FeeStructureType>({
    campusId: loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0,
    sessionId: 0,
    gradeId: 0,
    details: [{
      arrayid: uuidv4(),
      feeTypeId: 0,
      amount: 0,
      recurreceType: 0,
      frequence: ""
    }]
  });


  useEffect(() => {
    if (lastSessionId) {
      setFormData(prev => ({
        ...prev,
        sessionId: lastSessionId
      }));
    }
  }, [lastSessionId]);



  const addNewRow = () => {
    const newRow = {
      arrayid: uuidv4(),
      feeTypeId: 0,
      amount: 0,
      recurreceType: 0,
      frequence: ""
    };

    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, newRow]
    }));
  };

  const removeRow = (arrayid: string) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((detail) => detail.arrayid !== arrayid),
    }));
  };

  const [saveLoading, setSaveLoading] = useState(false);

  // Handle top-level Selects (Session, Grade)
  const handleTopLevelSelect = (name: keyof FeeStructureType, selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption.value
    }));
  };

  const handleDetailChange = (arrayid: string, name: string, value: any) => {
    // 1. Check for Duplicate Fee Type
    if (name === "feeTypeId") {
      const isDuplicate = formData.details.some(
        (detail) => detail.feeTypeId === Number(value) && detail.arrayid !== arrayid
      );

      if (isDuplicate) {
        toast.error("This Fee Type has already been added to the structure.");
        return;
      }
    }

    // 2. Proceed with State Update
    setFormData((prev) => ({
      ...prev,
      details: prev.details.map((detail) => {
        if (detail.arrayid === arrayid) {
          // Convert to Number if it's not the frequency string
          const numericValue = name === "frequence" ? value : Number(value);
          let updatedRow = { ...detail, [name]: numericValue };

          // 3. Logic for Recurrence Type auto-population
          if (name === "recurreceType") {
            if (numericValue === 1) {
              // Set full frequency for value 1
              updatedRow.frequence = "1,2,3,4,5,6,7,8,9,10,11,12";
            } else if (numericValue === 2 || numericValue === 0) {
              // Clear frequency for value 2 (or 0)
              updatedRow.frequence = "";
            }
          }

          return updatedRow;
        }
        return detail;
      }),
    }));
  };
  const [isSave, setIsSave] = useState(false)
  // const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsSave(true)

  //   const payload = {
  //     ...formData,
  //     details: formData.details.map(({ arrayid, ...rest }) => rest)
  //   };

  //   try {
  //     await dispatch(AddFeeStructure(payload as FeeStructureType))
  //   } catch (error) {
  //     console.error("Save failed:", error);
  //   } finally {
  //     setIsSave(false)
  //     setFormData({
  //       campusId: loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0,
  //         sessionId: 0,
  //           gradeId: 0,
  //             details: [{
  //               arrayid: uuidv4(),
  //               feeTypeId: 0,
  //               amount: 0,
  //               recurreceType: 0,
  //               frequence: ""
  //             }]
  //     })
  //     const closeBtn = document.querySelector<HTMLButtonElement>(
  //       "#add_fees_group .btn-close"
  //     );
  //     closeBtn?.click();
  //   }
  // };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSave(true);

    // 1. Validate Top-Level Fields
    if (!formData.campusId || !formData.sessionId || !formData.gradeId) {
      toast.error("Please select Campus, Session, and Grade");
      setIsSave(false);
      return;
    }

    // Check for duplicate structure
    const isDuplicate = allFeeStructures?.some(
      (fs) => Number(fs.campusId) === Number(formData.campusId) &&
        Number(fs.sessionId) === Number(formData.sessionId) &&
        Number(fs.gradeId) === Number(formData.gradeId)
    );

    if (isDuplicate) {
      toast.error("this grade fee structure already exist");
      setIsSave(false);
      return;
    }

    // 2. Validate Details
    if (!formData.details || formData.details.length === 0) {
      toast.error("Please add at least one Fee Type row");
      setIsSave(false);
      return;
    }

    // Loop through details for specific validation
    for (let i = 0; i < formData.details.length; i++) {
      const row = formData.details[i];
      const rowNum = i + 1;

      if (!row.feeTypeId || row.feeTypeId === 0) {
        toast.error(`Row ${rowNum}: Please select a Fee Type`);
        setIsSave(false);
        return;
      }

      if (!row.amount || Number(row.amount) <= 0) {
        toast.error(`Row ${rowNum}: Amount must be greater than 0`);
        setIsSave(false);
        return;
      }

      if (row.recurreceType === undefined || row.recurreceType === 0) {
        toast.error(`Row ${rowNum}: Please select a Recurrence Type`);
        setIsSave(false);
        return;
      }
    }

    // 3. Prepare Payload
    const payload = {
      ...formData,
      details: formData.details.map(({ arrayid, ...rest }) => rest)
    };

    try {
      // Show a loading toast or just wait for the promise
      await dispatch(AddFeeStructure(payload as FeeStructureType));

      // 4. Reset Form (Only on success)
      // 4. Reset Form (Only on success)
      setFormData((prev) => ({
        ...prev,              // Spreads current state (keeps campusId and sessionId)
        gradeId: 0,           // Resets grade
        details: [{           // Resets the grid to one empty row
          arrayid: uuidv4(),
          feeTypeId: 0,
          amount: 0,
          recurreceType: 0,
          frequence: ""
        }]
      }));

      // Close Modal
      const closeBtn = document.querySelector<HTMLButtonElement>("#add_fees_group .btn-close");
      closeBtn?.click();

    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save Fee Structure. Please try again.");
    } finally {
      setIsSave(false);
    }
  };


  // handle update modules
  const [updateData, setUpdateData] = useState<FeeStructureType>({
    id: 0,
    campusId: 0,
    sessionId: 0,
    gradeId: 0,
    details: [{
      arrayid: uuidv4(),
      id: 0,
      feeTypeId: 0,
      amount: 0,
      recurreceType: 0,
      frequence: ""
    }]
  });

  const addEditNewRow = () => {
    setUpdateData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        { arrayid: uuidv4(), id: 0, feeTypeId: 0, amount: 0, recurreceType: 0, frequence: "" }
      ]
    }));
  };
  const removeEditRow = (arrayid: string) => {
    setUpdateData((prev) => ({
      ...prev,
      details: prev.details.filter((item) => item.arrayid !== arrayid)
    }));
  };
  const handleEditTopLevelSelect = (name: keyof FeeStructureType, selectedOption: any) => {
    setUpdateData(prev => ({
      ...prev,
      [name]: selectedOption.value
    }));
  };
  const handleDetailEditChange = (arrayid: string, field: keyof FeeDetailType, value: any) => {
    setUpdateData((prev) => ({
      ...prev,
      details: prev.details.map((item) =>
        item.arrayid === arrayid ? { ...item, [field]: value } : item
      )
    }));
  };
  const [isUpdate, setIsUpdate] = useState(false)
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdate(true)

    try {
      // Clean the data: remove arrayid before sending to API
      const payload = {
        ...updateData,
        details: updateData.details.map(({ arrayid, ...rest }) => rest)
      };
      console.log("Updating with payload:", payload); // Debugging line
      await dispatch(UpdateFeeStructure(payload as any));
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdate(false)
      const closeBtn = document.querySelector<HTMLButtonElement>("#edit_fees_master .btn-close");
      closeBtn?.click();
    }

  };

  // end handle edit modeuls


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
        <div className="modal fade" id="edit_fees_master" >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <h4 className="modal-title">Edit Fees Structure</h4>
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
              <form onSubmit={handleEditSave}>
                <div className="modal-body">
                  <div className="row">
                    {loginInfo?.userLevel === 1 && (
                      <div className="col-md-6">
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
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Campus</label>
                          <CommonSelect3
                            className="select"
                            options={campuses}
                            onChange={(opt: any) => handleEditTopLevelSelect('campusId', opt)}
                            value={updateData?.campusId ? campuses.find(c => c.value === updateData.campusId) : campuses[0]}
                          />
                        </div>
                      </div>
                    )}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Session</label>
                        <CommonSelect3
                          className="select"
                          options={sessions}
                          onChange={(opt: any) => handleEditTopLevelSelect('sessionId', opt)}
                          value={
                            updateData?.sessionId
                              // Explicitly type 'f' as any or your specific Option type
                              ? sessions.find((f: { value: string | number; label: string }) => String(f?.value) === String(formData?.sessionId))
                              : sessions[0]
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Grade</label>
                        <CommonSelect3
                          className="select"
                          options={grades}
                          onChange={(opt) => handleEditTopLevelSelect('gradeId', opt)}
                          value={updateData?.gradeId ? grades.find(f => String(f?.value) === String(updateData?.gradeId)) : grades[0]}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="add-more-timetable">
                      <div className="tab-content pt-0 dashboard-tab">
                        <div
                          className="tab-pane fade show active"
                          id="pills-monday"
                          role="tabpanel"
                          aria-labelledby="pills-monday-tab"
                        >
                          {/* row start */}
                          {updateData.details.map((row, index) => (
                            <div className="add-timetable-row" key={index}>
                              <div className="row timetable-count">
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Fee Type</label>
                                    <CommonSelect3
                                      className="select"
                                      options={feetypes.filter(opt =>
                                        !updateData.details.some(d => String(d.feeTypeId) === String(opt.value) && d.arrayid !== row.arrayid)
                                      )}
                                      value={feetypes.find(f => String(f.value) === String(row.feeTypeId)) || feetypes[0]}
                                      onChange={(opt: any) => handleDetailEditChange(row.arrayid!, "feeTypeId", opt.value)}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-2">
                                  <div>
                                    <label className="form-label">Amount</label>
                                    <input
                                      type="text"
                                      value={row.amount || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        handleDetailEditChange(row.arrayid!, "amount", Number(val));
                                      }}
                                      className="form-control"
                                      placeholder="Amount"
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Recurrence Type</label>
                                    <CommonSelect3
                                      className="select"
                                      options={recurrenceType}
                                      value={recurrenceType.find(f => Number(f.value) === row.recurreceType) || recurrenceType[0]}
                                      onChange={(opt: any) => handleDetailEditChange(row.arrayid!, "recurreceType", Number(opt.value))}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Frequency</label>
                                    <CommonSelect4
                                      isMulti={true}
                                      className="select"
                                      options={months}
                                      isDisabled={row?.recurreceType === 2 || row?.recurreceType === 0}
                                      value={months.filter(m => row.frequence?.split(',').includes(String(m.value)))}
                                      onChange={(selected: any) => {
                                        const val = selected ? selected.map((s: any) => s.value).join(',') : "";
                                        handleDetailEditChange(row.arrayid!, "frequence", val);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-1">
                                  <div className="mt-4 ms-2">
                                    <Link to="#" className="delete-time-table"
                                      onClick={() => removeEditRow(row.arrayid!)}
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* row end */}

                          <div>
                            <Link
                              to="#"
                              className="btn btn-primary add-new-timetable"
                              onClick={addEditNewRow}
                            >
                              <i className="ti ti-square-rounded-plus-filled me-2" />
                              Add More Fee Type
                            </Link>
                          </div>
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
                  <button
                    type="submit"
                    disabled={isUpdate}
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    {isUpdate ? "updating..." : "Update Fee Structure"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Fees Master*/}
      </>
      <>
        {/* Add Fees Structure */}
        <div className="modal fade" id="add_fees_group">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Fees Structure</h4>
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
                    {loginInfo?.userLevel === 1 && (
                      <div className="col-md-6">
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
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Campus</label>
                          <CommonSelect3
                            className="select"
                            options={campuses}
                            onChange={(opt: any) => handleTopLevelSelect('campusId', opt)}
                            value={formData?.campusId ? campuses.find(c => c.value === formData.campusId) : campuses[0]}
                          />
                        </div>
                      </div>
                    )}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Session</label>
                        <CommonSelect3
                          className="select"
                          options={sessions}
                          onChange={(opt: any) => handleTopLevelSelect('sessionId', opt)}
                          value={
                            formData?.sessionId
                              // Explicitly type 'f' as any or your specific Option type
                              ? sessions.find((f: { value: string | number; label: string }) => String(f?.value) === String(formData?.sessionId))
                              : sessions[0]
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Grade</label>
                        <CommonSelect3
                          className="select"
                          options={grades}
                          onChange={(opt) => handleTopLevelSelect('gradeId', opt)}
                          value={formData?.gradeId ? grades.find(f => String(f?.value) === String(formData?.gradeId)) : grades[0]}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="add-more-timetable">
                      <div className="tab-content pt-0 dashboard-tab">
                        <div
                          className="tab-pane fade show active"
                          id="pills-monday"
                          role="tabpanel"
                          aria-labelledby="pills-monday-tab"
                        >
                          {/* row start */}
                          {formData.details.map((row, index) => (
                            <div className="add-timetable-row" key={index}>
                              <div className="row timetable-count">
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Fee Type</label>
                                    <CommonSelect3
                                      className="select"
                                      options={feetypes.filter(opt =>
                                        !formData.details.some(detail =>
                                          String(detail.feeTypeId) === String(opt.value) && detail.arrayid !== row.arrayid
                                        )
                                      )}
                                      value={
                                        row.feeTypeId
                                          ? feetypes.find(f => String(f?.value) === String(row?.feeTypeId))
                                          : feetypes[0]
                                      }
                                      onChange={(opt: any) => {
                                        if (opt && row.arrayid) {
                                          handleDetailChange(row.arrayid, "feeTypeId", opt.value);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-2">
                                  <div>
                                    <label className="form-label">Amount</label>
                                    <input
                                      type="text"
                                      value={row.amount || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        handleDetailChange(row.arrayid, "amount", Number(val));
                                      }}
                                      className="form-control"
                                      placeholder="Amount"
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Recurrence Type</label>
                                    <CommonSelect3
                                      className="select"
                                      options={recurrenceType}
                                      value={
                                        row?.recurreceType
                                          ? recurrenceType.find(f => String(f?.value) === String(row?.feeTypeId))
                                          : recurrenceType[0]
                                      }
                                      onChange={(opt: any) => {
                                        if (opt && row.arrayid) {
                                          handleDetailChange(row.arrayid, "recurreceType", opt.value);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3">
                                  <div className="mb-3">
                                    <label className="form-label">Frequency</label>
                                    <CommonSelect4
                                      isMulti={true}
                                      className="select"
                                      options={months}
                                      isDisabled={row?.recurreceType === 2 || row?.recurreceType === 0}
                                      value={
                                        (row.frequence
                                          ? months.filter((m: any) => row.frequence.split(',').includes(String(m.value)))
                                          : []) as any // <--- Add "as any" here to fix TS2739
                                      }
                                      onChange={(selectedOptions: any) => {
                                        // Check if it's an array (multi-select returns array, but TS might think it's a single object)
                                        const val = Array.isArray(selectedOptions)
                                          ? selectedOptions.map((o: any) => o.value).join(',')
                                          : selectedOptions?.value
                                            ? String(selectedOptions.value)
                                            : "";

                                        if (row.arrayid) {
                                          handleDetailChange(row.arrayid, "frequence", val);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-1">
                                  <div className="mt-4 ms-2">
                                    <Link to="#" className="delete-time-table"
                                      onClick={() => removeRow(row.arrayid!)}
                                    >
                                      <i className="ti ti-trash" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* row end */}

                          <div>
                            <Link
                              to="#"
                              className="btn btn-primary add-new-timetable"
                              onClick={addNewRow}
                            >
                              <i className="ti ti-square-rounded-plus-filled me-2" />
                              Add More Fee Type
                            </Link>
                          </div>
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
                  <button
                    type="submit"
                    disabled={isSave}
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    {isSave ? "Saving..." : "Add Fee Structure"}
                  </button>
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
        {/* Add Fee Strucutre */}
      </>

      <>



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



      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form>
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
                  <Link
                    to="#"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                  >
                    Yes, Delete
                  </Link>
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

export default FeeStructureModel;
