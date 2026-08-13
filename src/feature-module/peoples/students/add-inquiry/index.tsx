import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { feeGroup, feesTypes, paymentType } from '../../../core/common/selectoption/selectoption'
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../../router/all_routes";
import {
  AdmissionNo,
  Hostel,
  PickupPoint,
  VehicleNumber,
  allSection,
  bloodGroup,
  cast,
  useGender,
  house,
  mothertongue,
  names,
  useReligion,
  rollno,
  roomNO,
  route,
  status,
  Cities,
  States,
  useCountries,
  useStates,
} from "../../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../../core/common/selectoption/academic/useAcademicSessions";
import { useLastAcademicSession } from "../../../../core/common/selectoption/academic/useLastAcademicSession";
import { useAcademicGrades } from "../../../../core/common/selectoption/academic/useAcademicGrades";
import { useCities } from "../../../../core/common/selectoption/address/useCities";
import { TagsInput } from "react-tag-input-component";
import CommonSelect2 from "../../../../core/common/commonSelect2";
import CommonSelect3 from "../../../../core/common/commonSelect3";
import CommonSelect from "../../../../core/common/commonSelect";
import { useLocation } from "react-router-dom";
import { InquiryType, AddInquiry } from '../../../../store/apps/inquiry'
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

const getMaxDOB = () => dayjs().subtract(3, 'year')

export const initialInquiryState = {
  campusId: 0,
  inquiryNo: 0,
  firstName: '',
  middleName: '',
  familyName: '',
  dateOfBirth: '',
  fatherName: '',
  email: '',
  religionId: 0,
  contactNumber: '+92',
  cnic: '',
  inquiryDate: new Date().toISOString().split('T')[0],
  motherTongeId: 1,

  cCountryId: 1,
  cCityId: 0,
  cProvinceId: 0,
  cHouseNo: '',
  cStreetNo: '',
  cTown: '',

  pCountryId: null,
  pCityId: null,
  pProvinceId: null,
  pHouseNo: '',
  pStreetNo: '',
  pTown: '',

  referenceId: 1,
  gradeId: 0,
  sessionId: 0,
  status: 'New',
  isDeleted: false,
}

const AddStudentInquiry = () => {
  const routes = all_routes;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const regions = useRegionsList();
  const [regionId, setRegionId] = useState<number>(0);
  const handleSelectRegion = (name: string, option: any) => {
    setRegionId(option?.value ?? 0);
  }
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // List of fields that ARE allowed to be empty
    const optionalFields = ['middleName', 'sessionId', 'inquiryNo', 'pCountryId', 'cHouseNo', 'cStreetNo', 'cTown', 'pCityId', 'pProvinceId', 'pHouseNo', 'pStreetNo', 'pTown'];

    Object.keys(initialInquiryState).forEach((key) => {
      if (optionalFields.includes(key)) return;

      const value = form[key as keyof InquiryType];

      // Check for empty strings or zeros in IDs
      if (value === '' || value === null || value === undefined || (typeof value === 'number' && value === 0)) {
        newErrors[key] = "This field is required";
      }
    });

    // 2. Email Validation (Only if not empty)
    if (form.email && form.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors['email'] = "Invalid email format";
      }
    }

    // 3. CNIC Validation (Format: 12345-1234567-1)
    if (form.cnic) {
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicRegex.test(form.cnic)) {
        newErrors['cnic'] = "CNIC must be in XXXXX-XXXXXXX-X format";
      }
    }

    // Specific validation for Contact Number (length check)
    if (form.contactNumber.length < 14) { // +92321-3121145 is 14 chars
      newErrors['contactNumber'] = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCountry = (name: string, option: any) => {
    setCountryId(option?.value ?? 0);
    setForm(prev => ({
      ...prev,
      cCountryId: option?.value,
    }))
  }
  const handleSelectState = (name: string, option: any) => {
    setStateId(option?.value ?? 0);
    setForm(prev => ({
      ...prev,
      cProvinceId: option?.value,
      cCityId: 0
    }))
  }

  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);

  const academicYear = useAcademicSessions();
  const { lastSessionId } = useLastAcademicSession();
  const allClass = useAcademicGrades();
  const religion = useReligion();
  const countries = useCountries();
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const states = useStates(countryId ? countryId : 1);
  const cities = useCities(stateId)

  const gender = useGender;
  const dispatch = useDispatch()
  const [form, setForm] = useState<InquiryType>(initialInquiryState)

  // ---------------- HANDLE CHANGE ----------------
  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target
  //   setForm(prev => ({
  //     ...prev,
  //     [name]:
  //       e.target.type === 'number'
  //         ? Number(value)
  //         : value,
  //   }))
  // }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Logic for Guardian Whatsapp Number
    if (name === 'contactNumber') {
      // 1. Prevent user from deleting +92
      if (!value.startsWith('+92')) {
        setForm(prev => ({ ...prev, [name]: '+92' }));
        return;
      }

      // 2. Extract digits after +92 and strip any non-numeric characters
      const digitsOnly = value.slice(3).replace(/\D/g, '');

      // 3. Format as 321-3121145
      let formattedValue = '+92';
      if (digitsOnly.length > 0) {
        // First 3 digits (e.g., 321)
        formattedValue += digitsOnly.substring(0, 3);
      }
      if (digitsOnly.length > 3) {
        // Hyphen + remaining digits (up to 7 digits)
        formattedValue += '-' + digitsOnly.substring(3, 10);
      }

      setForm(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return; // Exit so the default logic doesn't run
    }

    // --- Logic for CNIC (XXXXX-XXXXXXX-X) ---
    if (name === 'cnic') {
      // 1. Remove all non-numeric characters
      const digits = value.replace(/\D/g, '');

      // 2. Limit to 13 digits total
      const limitedDigits = digits.substring(0, 13);

      // 3. Apply mask: 00000-0000000-0
      let formattedCnic = limitedDigits;
      if (limitedDigits.length > 5 && limitedDigits.length <= 12) {
        formattedCnic = `${limitedDigits.slice(0, 5)}-${limitedDigits.slice(5)}`;
      } else if (limitedDigits.length > 12) {
        formattedCnic = `${limitedDigits.slice(0, 5)}-${limitedDigits.slice(5, 12)}-${limitedDigits.slice(12)}`;
      }

      setForm(prev => ({ ...prev, [name]: formattedCnic }));
      return;
    }

    // Your existing default logic for other fields
    setForm(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value,
    }));
  };
  const handleSelectChange = (name: string, option: any) => {
    setForm(prev => ({
      ...prev,
      [name]: option?.value ?? 0,
    }))
  }
  const navigate = useNavigate()
  // ---------------- HANDLE SAVE ----------------
  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('formdata:', form)
    if (!validateForm()) {
      // Scroll to the first error or show a toast message
      toast.error("Please fill all required fields highlighted in red.");
      return;
    }
    setIsSave(true)
    try {
      await dispatch(AddInquiry(form) as any);
    } catch (error) {
      console.log(error)
    } finally {
      setIsSave(false)
      navigate(routes.studentInquiry)
    }
  }


  const [owner, setOwner] = useState<string[]>(['English', 'Spanish']);
  const [owner1, setOwner1] = useState<string[]>([]);
  const [owner2, setOwner2] = useState<string[]>([]);
  const [defaultDate, setDefaultDate] = useState<dayjs.Dayjs | null>(null);
  const [newContents, setNewContents] = useState<number[]>([0]);
  const location = useLocation();
  const addNewContent = () => {
    setNewContents([...newContents, newContents.length]);
  };
  const removeContent = (index: any) => {
    setNewContents(newContents.filter((_, i) => i !== index));
  };
  useEffect(() => {
    if (loginInfo?.userLevel === 3) {
      setForm(prev => ({
        ...prev,
        campusId: loginInfo?.userLevelId,
      }))
    }
    if (location.pathname === routes.editStudent) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so we add 1
      const day = String(today.getDate()).padStart(2, "0");
      const formattedDate = `${month}-${day}-${year}`;
      const defaultValue = dayjs(formattedDate);
      setIsEdit(true)
      setOwner(["English"])
      setOwner1(["Medecine Name"])
      setOwner2(["Allergy", "Skin Allergy"])
      setDefaultDate(defaultValue)
      console.log(formattedDate, 11);

    } else {
      setIsEdit(false)
      setDefaultDate(null)
    }
    setForm(prev => ({
      ...prev,
      sessionId: lastSessionId ? lastSessionId : null
    }))
  }, [location.pathname])

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content content-two">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="mb-1">{isEdit ? 'Edit' : 'Add'} Student Inquiry</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={routes.studentInquiry}>Inquiries</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {isEdit ? 'Edit' : 'Add'} Inquiry
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-md-12">
              <form onSubmit={handleSave}>
                {/* Personal Information */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-info-square-rounded fs-16" />
                      </span>
                      <h4 className="text-dark">Student Information</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">

                    <div className="row row-cols-xxl-5 row-cols-md-6">
                      {loginInfo?.userLevel === 1 && (
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Region</label>
                            <CommonSelect3
                              className="select"
                              options={regions}
                              onChange={(option) => handleSelectRegion('regions', option)}
                              value={regionId ? regions.find(r => r.value === regionId) : regions[0]}
                            />
                          </div>
                        </div>
                      )}
                      {(loginInfo?.userLevel === 1 || loginInfo?.userLevel === 2) && (
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Campus <span className="text-danger">*</span></label>
                            <CommonSelect3
                              className="select"
                              options={campuses}
                              onChange={(option) =>
                                handleSelectChange('campusId', option)
                              }
                              value={form?.campusId ? campuses.find(c => c.value === form.campusId) : campuses[0]}
                            />
                          </div>
                        </div>
                      )}

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Academic Session Year </label>
                          <div className={errors.sessionId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={academicYear}
                              isDisabled={true}
                              onChange={(option) =>
                                handleSelectChange('sessionId', option)
                              }
                              value={lastSessionId ? academicYear.find(a => a.value === lastSessionId) : null}
                            />
                          </div>
                          {errors.sessionId && <div className="text-danger fs-12">{errors.sessionId}</div>}
                        </div>
                      </div>



                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">First Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            placeholder="Enter First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                          />
                          {errors.firstName && <div className="text-danger fs-12">{errors.firstName}</div>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Middle Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="middleName"
                            placeholder="Enter Middle Name"
                            value={form.middleName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="familyName"
                            className={`form-control ${errors.familyName ? 'is-invalid' : ''}`}
                            onChange={handleChange}
                            placeholder="Enter Last Name"
                          />
                          {errors.familyName && <div className="text-danger fs-12">{errors.familyName}</div>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Grade <span className="text-danger">*</span></label>
                          <div className={errors.gradeId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={allClass}
                              onChange={(option) =>
                                handleSelectChange('gradeId', option)
                              }
                              value={form?.gradeId ? allClass.find(grade => grade.value === form.gradeId) || null : null}
                            />
                          </div>
                          {errors.gradeId && <div className="text-danger fs-12">{errors.gradeId}</div>}
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Gender <span className="text-danger">*</span></label>
                          {/* <div className={errors.gender ? "border border-danger rounded" : ""}> */}
                          <CommonSelect2
                            className="select"
                            options={gender}
                            defaultValue={isEdit ? gender[0] : undefined}
                          />
                          {/* </div>
                          {errors.gender && <div className="text-danger fs-12">{errors.gender}</div>} */}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                          <div className={errors.dateOfBirth ? "border border-danger rounded" : ""}>
                            <div className="input-icon position-relative">
                              <DatePicker
                                className="form-control datetimepicker"
                                format={{
                                  format: "DD-MM-YYYY",
                                  type: "mask",
                                }}
                                value={
                                  isEdit && form.dateOfBirth
                                    ? dayjs(form.dateOfBirth)
                                    : form.dateOfBirth
                                      ? dayjs(form.dateOfBirth)
                                      : null
                                }
                                maxDate={getMaxDOB()}   // 👈 minimum 3 years old
                                placeholder="Select Date"
                                onChange={(date) => {
                                  setForm(prev => ({
                                    ...prev,
                                    dateOfBirth: date
                                      ? dayjs(date).format('YYYY-MM-DD')
                                      : ''
                                  }))
                                }}
                              />

                              <span className="input-icon-addon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                          </div>
                          {errors.dateOfBirth && <div className="text-danger fs-12">{errors.dateOfBirth}</div>}
                        </div>
                      </div>


                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Religion <span className="text-danger">*</span></label>
                          <div className={errors.religionId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={religion}
                              onChange={(option) =>
                                handleSelectChange('religionId', option)
                              }
                              value={form?.religionId ? religion?.find((c: any) => c.value === form.religionId) : religion[0]}
                            />
                          </div>
                          {errors.religionId && <div className="text-danger fs-12">{errors.religionId}</div>}
                        </div>
                      </div>


                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Mother Tongue <span className="text-danger">*</span></label>
                          <div className={errors.motherTongeId ? "border border-danger rounded" : ""}>
                            <CommonSelect2
                              className="select"
                              options={mothertongue}
                              onChange={(option) =>
                                handleSelectChange('motherTongeId', option)
                              }
                              defaultValue={isEdit ? mothertongue[0] : undefined}
                            />
                          </div>
                          {errors.motherTongeId && <div className="text-danger fs-12">{errors.motherTongeId}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Personal Information */}
                {/* Parents & Guardian Information */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-user-shield fs-16" />
                      </span>
                      <h4 className="text-dark">
                        Parents &amp; Guardian Information
                      </h4>
                    </div>
                  </div>
                  <div className="card-body pb-0">
                    <div className="border-bottom mb-3">
                      <h5 className="mb-3">Parent’s Info</h5>
                      <div className="row">

                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Father Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="fatherName"
                              value={form?.fatherName}
                              onChange={handleChange}
                              className={`form-control ${errors.fatherName ? 'is-invalid' : ''}`}
                              placeholder="Parent Name"
                              defaultValue={isEdit ? 'Jerald Vicinius' : undefined}
                            />
                            {errors.fatherName && <div className="text-danger fs-12">{errors.fatherName}</div>}
                          </div>

                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Father CNIC: <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              name="cnic"
                              value={form?.cnic}
                              onChange={handleChange}
                              placeholder="Father CNIC"
                              className={`form-control ${errors.cnic ? 'is-invalid' : ''}`}
                              defaultValue={isEdit ? 'Mechanic' : undefined}
                            />
                            {errors.cnic && <div className="text-danger fs-12">{errors.cnic}</div>}
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="email"
                              value={form?.email}
                              onChange={handleChange}
                              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                              placeholder="Email"
                              defaultValue={isEdit ? 'jera@example.com' : undefined}
                            />
                            {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Whatsapp No <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="contactNumber"
                              value={form?.contactNumber}
                              onChange={handleChange}
                              className={`form-control ${errors.contactNumber ? 'is-invalid' : ''}`}
                              placeholder="Whatsapp No" defaultValue={isEdit ? '+1 45545 46464' : undefined}
                            />
                            {errors.contactNumber && <div className="text-danger fs-12">{errors.contactNumber}</div>}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* <div className="border-bottom mb-3">
                      <h5 className="mb-3">Guardian Info</h5>
                      <div className="row">

                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Name</label>
                            <input type="text" name="fatherName" value={form?.fatherName} onChange={handleChange} className="form-control" placeholder="Guardian Name" defaultValue={isEdit ? 'Jerald Vicinius' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Guardian CNIC:
                            </label>
                            <input type="text" name="cnic" value={form?.cnic} onChange={handleChange} placeholder="Guardian CNIC" className="form-control" defaultValue={isEdit ? 'Mechanic' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Relation</label>
                            <input type="text" name="email" value={form?.email} onChange={handleChange} className="form-control" placeholder="Email" defaultValue={isEdit ? 'jera@example.com' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Email</label>
                            <input type="text" name="email" value={form?.email} onChange={handleChange} className="form-control" placeholder="Guardian Relation" defaultValue={isEdit ? 'jera@example.com' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Whatsapp No</label>
                            <input type="text" name="contactNumber" value={form?.contactNumber} onChange={handleChange} className="form-control" placeholder="Whatsapp No" defaultValue={isEdit ? '+1 45545 46464' : undefined} />
                          </div>
                        </div>



                      </div>
                    </div> */}

                  </div>
                </div>
                {/* /Parents & Guardian Information */}

                {/* Address */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-map fs-16" />
                      </span>
                      <h4 className="text-dark">Current Address</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Country <span className="text-danger">*</span></label>
                          <div className={errors.cCountryId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={countries}
                              onChange={(option) => handleSelectCountry('regions', option)}
                              value={form?.cCountryId ? countries.find(c => c.value === form.cCountryId) : countries[0]}
                            />
                          </div>
                          {errors.cCountryId && <div className="text-danger fs-12">{errors.cCountryId}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">State <span className="text-danger">*</span></label>
                          <div className={errors.cProvinceId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={states}
                              onChange={(option) => handleSelectState('cProvinceId', option)}
                              value={form?.cProvinceId ? states.find(c => c.value === form.cProvinceId) : states[0]}
                            />
                          </div>
                          {errors.cProvinceId && <div className="text-danger fs-12">{errors.cProvinceId}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">City <span className="text-danger">*</span></label>
                          <div className={errors.cCityId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={cities}
                              onChange={(option) =>
                                handleSelectChange('cCityId', option)
                              }
                              //value={isEdit ? cities[0]}
                              value={form?.cCityId !== 0 ? cities.find(c => c.value === form.cCityId) : cities[0]}
                            />
                          </div>
                          {errors.cCityId && <div className="text-danger fs-12">{errors.cCityId}</div>}
                        </div>
                      </div>


                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">House No# </label>
                          <input
                            type="text"
                            name="cHouseNo"
                            value={form?.cHouseNo}
                            onChange={handleChange}
                            className={`form-control ${errors.cHouseNo ? 'is-invalid' : ''}`}
                            placeholder="Enter Your Current House No"
                            defaultValue={isEdit ? '3495 Red Hawk Road, Buffalo Lake, MN 55314' : undefined}
                          />
                          {errors.cHouseNo && <div className="text-danger fs-12">{errors.cHouseNo}</div>}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Street No# </label>
                          <input
                            type="text"
                            name="cStreetNo"
                            value={form?.cStreetNo}
                            onChange={handleChange}
                            className={`form-control ${errors.cStreetNo ? 'is-invalid' : ''}`}
                            placeholder="Enter Your Current Street No" defaultValue={isEdit ? '3495 Red Hawk Road, Buffalo Lake, MN 55314' : undefined} />
                          {errors.cStreetNo && <div className="text-danger fs-12">{errors.cStreetNo}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Town </label>
                          <input
                            type="text"
                            name="cTown"
                            value={form?.cTown}
                            onChange={handleChange}
                            className={`form-control ${errors.cTown ? 'is-invalid' : ''}`}
                            placeholder="Enter Your Current Town"
                            defaultValue={isEdit ? '3495 Red Hawk Road, Buffalo Lake, MN 55314' : undefined} />
                          {errors.cTown && <div className="text-danger fs-12">{errors.cTown}</div>}
                        </div>
                      </div>


                    </div>
                  </div>
                </div>
                {/* /Address */}








                <div className="text-end">
                  <Link to={routes.studentInquiry} className="btn btn-light me-3">
                    Cancel
                  </Link>
                  <button type="submit" disabled={isSave} className="btn btn-primary">
                    {isSave ? 'Saving....' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default AddStudentInquiry;
