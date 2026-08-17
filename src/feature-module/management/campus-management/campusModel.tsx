import React, { useState, useRef, useEffect } from "react";
import { Spin } from "antd";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCitiesList } from "../../../core/common/selectoption/address/useCitiesList";
import CommonSelect from "../../../core/common/commonSelect2";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { Link } from "react-router-dom";
import { AddCampus, GetCampusByID, UpdateCampus } from '../../../store/apps/campus-management';
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";

interface CampusInput {
  id?: number,
  name: string;
  campusKey: string;
  shortName: string;
  address: string;
  cityId: number;
  latitude: string;
  lngitude: string;
  contactNumber: string;
  email: string;
  regionId: number;
  addedBy: number;
  addedAt: string;      // ISO timestamp string
  isEnabled: boolean;
  isDeleted: boolean;
  hasUploaded: boolean;
  allowBulkImport: boolean;
}

type OptionType = {
  value: number;
  label: string;
};

type CampusModalProps = {
  selectedId?: number | null;
  onSuccess?: () => void;
};

const CampusModal: React.FC<CampusModalProps> = ({ selectedId, onSuccess }) => {
  const RegionsList = useRegionsList();
  const citiesList: OptionType[] = useCitiesList();
  const dispatch = useDispatch<AppDispatch>();

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo") || "{}");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const userLevel = Number(loginInfo?.userLevel || userData?.data?.userLevel || 0);
  const userLevelId = Number(loginInfo?.userLevelId || userData?.data?.userLevelId || 0);
  const userId = Number(loginInfo?.userId || userData?.data?.id || 0);

  const [campusInfo, setCampusInfo] = useState<CampusInput>({
    name: "",
    campusKey: "",
    shortName: "",
    address: "",
    cityId: 0,
    latitude: "",
    lngitude: "",
    contactNumber: "",
    email: "",
    regionId: userLevel === 2 && userLevelId ? userLevelId : 0,
    addedBy: 3,
    addedAt: new Date().toISOString(),
    isEnabled: true,
    isDeleted: false,
    hasUploaded: false,
    allowBulkImport: true,
  })
  const [campusEdit, setCampusEdit] = useState<CampusInput>({
    id: 0,
    name: "",
    campusKey: "",
    shortName: "",
    address: "",
    cityId: 0,
    latitude: "",
    lngitude: "",
    contactNumber: "",
    email: "",
    regionId: 0,
    addedBy: 3,
    addedAt: new Date().toISOString(),
    isEnabled: true,
    isDeleted: false,
    hasUploaded: false,
    allowBulkImport: true,
  })
  const [isEditLoading, setIsEditLoading] = useState(false)
  console.log('campusEdit:',campusEdit)
  useEffect(() => {
    if (userLevel === 2 && userLevelId) {
      setCampusInfo((prev) => ({
        ...prev,
        regionId: userLevelId,
      }));
    }
  }, [userLevel, userLevelId]);

  useEffect(() => {
    const GetSingleCampus = async () => {
      setIsEditLoading(true)
      try {
        const response = await dispatch(GetCampusByID(selectedId as number))
        if (response?.payload) {
          const fetchedCampus = response.payload as CampusInput;
          if (userLevel === 2 && userLevelId) {
            fetchedCampus.regionId = userLevelId;
          }
          setCampusEdit(fetchedCampus);
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsEditLoading(false)
      }
    }
    if (selectedId !== null || selectedId !== '') {
      GetSingleCampus()
    }
  }, [selectedId, dispatch, userLevel, userLevelId]);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleCampusInfoChange = (field: keyof CampusInput, value: any) => {
    setCampusInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const handleCampusEditInfoChange = (field: keyof CampusInput, value: any) => {
    setCampusEdit((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const handleEditRegionId = (value: any) => {
    setCampusEdit((prev) => ({
      ...prev,
      regionId: value,
    }));
  }
  const handleEditCityId = (value: any) => {
    setCampusEdit((prev) => ({
      ...prev,
      cityId: value,
    }));
  }
  const handleRegionId = (value: any) => {
    setCampusInfo((prev) => ({
      ...prev,
      regionId: value,
    }));
  }
  const handleCityId = (value: any) => {
    setCampusInfo((prev) => ({
      ...prev,
      cityId: value,
    }));
  }
  const [saveloading, setSaveLoading] = useState(false)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload: CampusInput = {
        name: campusInfo.name || "",
        campusKey: campusInfo.campusKey || "",
        shortName: campusInfo.shortName || "",
        address: campusInfo.address || "",
        cityId: Number(campusInfo.cityId) || 0,
        latitude: campusInfo.latitude || "",
        lngitude: campusInfo.lngitude || "",
        contactNumber: campusInfo.contactNumber || "",
        email: campusInfo.email || "",
        regionId: userLevel === 2 && userLevelId ? Number(userLevelId) : Number(campusInfo.regionId) || 0,
        addedBy: Number(userId || 0),
        addedAt: new Date().toISOString(),
        isEnabled: Boolean(campusInfo.isEnabled),
        isDeleted: false,
        hasUploaded: true,
        allowBulkImport: true,
      };
      await dispatch(AddCampus(payload))
      closeBtnRef.current?.click();
      onSuccess?.();

      setCampusInfo({
        name: "",
        campusKey: "",
        shortName: "",
        address: "",
        cityId: 0,
        latitude: "",
        lngitude: "",
        contactNumber: "",
        email: "",
        regionId: userLevel === 2 && userLevelId ? Number(userLevelId) : 0,
        addedBy: Number(userId || 0),
        addedAt: new Date().toISOString(),
        isEnabled: true,
        isDeleted: false,
        hasUploaded: true,
        allowBulkImport: true,
      })
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaveLoading(false);
    }

  }
  const handleUpdateSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload: CampusInput = {
        id: Number(campusEdit.id) || 0,
        name: campusEdit.name || "",
        campusKey: campusEdit.campusKey || "",
        shortName: campusEdit.shortName || "",
        address: campusEdit.address || "",
        cityId: Number(campusEdit.cityId) || 0,
        latitude: campusEdit.latitude || "",
        lngitude: campusEdit.lngitude || "",
        contactNumber: campusEdit.contactNumber || "",
        email: campusEdit.email || "",
        regionId: userLevel === 2 && userLevelId ? Number(userLevelId) : Number(campusEdit.regionId) || 0,
        addedBy: Number(userId || campusEdit.addedBy || 0),
        addedAt: campusEdit.addedAt || new Date().toISOString(),
        isEnabled: Boolean(campusEdit.isEnabled),
        isDeleted: false,
        hasUploaded: Boolean(campusEdit.hasUploaded ?? true),
        allowBulkImport: Boolean(campusEdit.allowBulkImport ?? true),
      };
      await dispatch(UpdateCampus(payload))
      closeBtnRef.current?.click();
      onSuccess?.();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaveLoading(false);
    }

  }
  return (
    <>
      <>
        {/* Add Hostel Rooms */}
        <div className="modal fade" id="add_hostel_rooms">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New Campus</h4>
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
                        <label className="form-label">Campus Name  <span className="text-danger">*</span></label>
                        <input type="text" name="name" required className="form-control" />
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Campus Key <span className="text-danger">*</span></label>
                            <input type="text" name="campusKey" required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Short Name <span className="text-danger">*</span></label>
                            <input type="text" name="shortName" required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Contact Number <span className="text-danger">*</span></label>
                            <input type="text" name="contactNumber" required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input type="email" name="email" required className="form-control" />
                          </div>
                        </div>
                      </div>


                      <div className="mb-3">
                        <label className="form-label">Regions <span className="text-danger">*</span></label>
                        <CommonSelect
                          className="select"
                          options={RegionsList}
                          defaultValue={RegionsList[0]}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">City <span className="text-danger">*</span></label>
                        <CommonSelect
                          className="select"
                          options={citiesList}
                          defaultValue={citiesList[0]}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Address <span className="text-danger">*</span></label>
                        <input type="text" name="address" required className="form-control" />
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">latitude <span className="text-success">(opt)</span></label>
                            <input type="text" name="latitude" className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">lngitude <span className="text-success">(opt)</span></label>
                            <input type="text" name="lngitude" className="form-control" />
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
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    Add Campus
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Add Hostel Rooms */}
        {/* Edit Hostel Room */}
        <div className="modal fade" id="edit_hostel_rooms">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Campus</h4>
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
                        <label className="form-label">Campus Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Room No"
                          defaultValue="A1"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Hostel Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Hostel Name"
                          defaultValue="Phoenix Residence"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Region</label>
                        <CommonSelect
                          className="select"
                          options={RegionsList}
                          defaultValue={RegionsList[0]}
                        />
                      </div>

                      <div className="mb-0">
                        <label className="form-label">Cost per Bed</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Cost per Bed"
                          defaultValue="$200"
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
                    Save Changes
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Hostel Room */}
      </>

      <>
        {/* Add Room Type*/}
        <div className="modal fade" id="add_hostel_room_type">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Room Type</h4>
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
                        <label className="form-label">Room Type</label>
                        <input type="text" className="form-control" />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Cost per Bed</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          defaultValue={""}
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
                    Add Room Type
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Add Room Type */}
        {/* Edit Room Type */}
        <div className="modal fade" id="edit_hostel_room_type">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Room Type</h4>
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
                        <label className="form-label">Room Type</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Room Type"
                          defaultValue="Two Bed"
                        />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Cost per Bed</label>
                        <textarea
                          className="form-control"
                          placeholder="text"
                          rows={4}
                          defaultValue={
                            "Enjoy serene solitude in our one-bed room, your tranquil retreat for focused studying"
                          }
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
                    Save Changes
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Edit Room Type */}
      </>

      {/* Add Campus */}
      <div className="modal fade" id="add_hostel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Campus</h4>
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

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Campus Name  <span className="text-danger">*</span></label>
                      <input type="text" name="name" value={campusInfo?.name} onChange={(e) => handleCampusInfoChange('name', e.target.value)} required className="form-control" />
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Campus Key <span className="text-danger">*</span></label>
                          <input type="text" name="campusKey" value={campusInfo?.campusKey} onChange={(e) => handleCampusInfoChange('campusKey', e.target.value)} required className="form-control" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Short Name <span className="text-danger">*</span></label>
                          <input type="text" name="shortName" value={campusInfo?.shortName} onChange={(e) => handleCampusInfoChange('shortName', e.target.value)} required className="form-control" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Contact Number <span className="text-danger">*</span></label>
                          <input type="text" name="contactNumber" value={campusInfo?.contactNumber} onChange={(e) => handleCampusInfoChange('contactNumber', e.target.value)} required className="form-control" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email <span className="text-danger">*</span></label>
                          <input type="email" name="email" value={campusInfo?.email} required onChange={(e) => handleCampusInfoChange('email', e.target.value)} className="form-control" />
                        </div>
                      </div>
                    </div>


                    {userLevel !== 2 && (
                      <div className="mb-3">
                        <label className="form-label">Regions <span className="text-danger">*</span></label>
                        <CommonSelect3
                          className="select"
                          options={RegionsList}
                          onChange={(selected) =>
                            handleRegionId(selected?.value || null)
                          }
                          value={campusInfo?.regionId ? RegionsList.find(region => region.value === campusInfo.regionId) || null : null}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">City <span className="text-danger">*</span></label>
                      <CommonSelect
                        className="select"
                        options={citiesList}
                        onChange={(selected) =>
                          handleCityId(selected?.value || null)
                        }
                        defaultValue={citiesList[0]}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address <span className="text-danger">*</span></label>
                      <input type="text" name="address" value={campusInfo?.address} required onChange={(e) => handleCampusInfoChange('address', e.target.value)} className="form-control" />
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">latitude <span className="text-success">(opt)</span></label>
                          <input type="text" name="latitude" value={campusInfo?.latitude} onChange={(e) => handleCampusInfoChange('latitude', e.target.value)} className="form-control" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">lngitude <span className="text-success">(opt)</span></label>
                          <input type="text" name="lngitude" value={campusInfo?.lngitude} onChange={(e) => handleCampusInfoChange('lngitude', e.target.value)} className="form-control" />
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
                  className="btn btn-primary"
                  disabled={
                    saveloading ||
                    campusInfo?.cityId === 0 ||
                    (userLevel !== 2 && campusInfo?.regionId === 0) ||
                    campusInfo?.name === '' ||
                    campusInfo?.campusKey === '' ||
                    campusInfo?.shortName === '' ||
                    campusInfo?.contactNumber === '' ||
                    campusInfo?.email === ''
                  }
                >
                  {saveloading ? 'Loading...' : 'Add Campus'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
      {/* /Add Campus */}
      {/* Edit Campus */}
      <div className="modal fade" id="edit_hostel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Campus</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            {isEditLoading ?
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                width: "100%",
              }}><Spin size="small" /></div> :
              <form onSubmit={handleUpdateSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Campus Name  <span className="text-danger">*</span></label>
                        <input type="text" name="name" value={campusEdit?.name} onChange={(e) => handleCampusEditInfoChange('name', e.target.value)} required className="form-control" />
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Campus Key <span className="text-danger">*</span></label>
                            <input type="text" name="campusKey" value={campusEdit?.campusKey} onChange={(e) => handleCampusEditInfoChange('campusKey', e.target.value)} required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Short Name <span className="text-danger">*</span></label>
                            <input type="text" name="shortName" value={campusEdit?.shortName} onChange={(e) => handleCampusEditInfoChange('shortName', e.target.value)} required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Contact Number <span className="text-danger">*</span></label>
                            <input type="text" name="contactNumber" value={campusEdit?.contactNumber} onChange={(e) => handleCampusEditInfoChange('contactNumber', e.target.value)} required className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input type="email" name="email" value={campusEdit?.email} required onChange={(e) => handleCampusEditInfoChange('email', e.target.value)} className="form-control" />
                          </div>
                        </div>
                      </div>


                      {userLevel !== 2 && (
                        <div className="mb-3">
                          <label className="form-label">Regions <span className="text-danger">*</span></label>
                          <CommonSelect3
                            className="select"
                            options={RegionsList}
                            onChange={(selected) =>
                              handleEditRegionId(selected?.value || null)
                            }
                            value={campusEdit?.regionId ? RegionsList.find(region => region.value === campusEdit.regionId) || null : null}
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">City <span className="text-danger">*</span></label>
                        <CommonSelect3
                          className="select"
                          options={citiesList}
                          onChange={(selected) =>
                            handleEditCityId(selected?.value || null)
                          }
                          value={campusEdit?.cityId ? citiesList?.find(item => item.value === campusEdit.cityId) || null : null}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Address <span className="text-danger">*</span></label>
                        <input type="text" name="address" value={campusEdit?.address} required onChange={(e) => handleCampusEditInfoChange('address', e.target.value)} className="form-control" />
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">latitude <span className="text-success">(opt)</span></label>
                            <input type="text" name="latitude" value={campusEdit?.latitude} onChange={(e) => handleCampusEditInfoChange('latitude', e.target.value)} className="form-control" />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">lngitude <span className="text-success">(opt)</span></label>
                            <input type="text" name="lngitude" value={campusEdit?.lngitude} onChange={(e) => handleCampusEditInfoChange('lngitude', e.target.value)} className="form-control" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-12">
                          <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                            <div className="status-title">
                              <h6 className="mb-0 fs-13">Allow Bulk Import</h6>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={campusEdit?.allowBulkImport ?? true}
                                onChange={(e) => handleCampusEditInfoChange('allowBulkImport', e.target.checked)}
                              />
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
                            checked={campusEdit?.isEnabled}
                            onChange={(e) => handleCampusEditInfoChange('isEnabled', e.target.checked)}
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
                  <button
                    type="submit"
                    disabled={saveloading}
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    {saveloading ? 'Loading...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
      {/* /Edit Campus */}
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

export default CampusModal;
