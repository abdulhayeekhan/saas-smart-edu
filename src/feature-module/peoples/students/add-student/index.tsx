import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// import { feeGroup, feesTypes, paymentType } from '../../../core/common/selectoption/selectoption'
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../../router/all_routes";
import { Spin } from "antd";
import {
  AdmissionNo,
  Hostel,
  useGender,
  PickupPoint,
  VehicleNumber,
  academicYear,
  allClass,
  allSection,
  bloodGroup,
  cast,
  gender,
  house,
  mothertongue,
  names,
  rollno,
  roomNO,
  route,
  status,
  useCountries,
  useStates,
} from "../../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { useAcademicSessions } from "../../../../core/common/selectoption/academic/useAcademicSessions";
import { useAcademicGrades } from "../../../../core/common/selectoption/academic/useAcademicGrades";
import { useReligionsList } from "../../../../core/common/selectoption/academic/useReligions";
import { useCities } from "../../../../core/common/selectoption/address/useCities";
import { TagsInput } from "react-tag-input-component";
import CommonSelect from "../../../../core/common/commonSelect";
import CommonSelect2 from "../../../../core/common/commonSelect2"
import CommonSelect3 from "../../../../core/common/commonSelect3"
import { useLocation } from "react-router-dom";
import { useSectionList } from '../../../../core/common/selectoption/academic/useSections';
import { Admission } from "../../../../store/apps/admissions";
import { GetInquiry } from "../../../../store/apps/inquiry";
import axios from "axios";
import { options } from "@fullcalendar/core/preact";
import toast from "react-hot-toast";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import CameraCapture from "../../../../core/common/CameraCapture";

const baseURL = process.env.REACT_APP_API_BASE_URL;

interface ImageUpload {
  admissionId: number;
  imageUrl: string;
}
const AddStudent = () => {
  const routes = all_routes;
  const academicYear = useAcademicSessions();
  const grades = useAcademicGrades();
  const { id } = useParams();
  const { inquiryId } = useParams();
  const { single: inquiryData, loading: inquiryLoading } = useSelector((state: RootState) => state.inquiry);
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (inquiryId) {
      dispatch(GetInquiry(Number(inquiryId)));
    }
  }, [inquiryId, dispatch]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // For initial data fetch
  const religions = useReligionsList();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const [formData, setFormData] = useState<Admission>({
    id: 0,
    campusId: 0,
    firstName: "",
    middleName: "",
    lastName: "",
    studentNumber: "",
    cnic: "",
    gradeId: 0,
    sectionId: 0,
    sessionId: 0,
    admissionDate: dayjs().toISOString(),
    dateOfBirth: dayjs().toISOString(),
    fatherName: "",
    contactNumber: "+92",
    email: "",
    // --- Added missing required fields below ---
    cCity: "",
    cProvince: "",
    pCity: "",
    pProvince: "",
    religionId: 0,
    cCountryId: 1,
    isEnabled: true,
    // ------------------------------------------
    cCityId: 0,
    cProvinceId: 0,
    cHouseNo: "",
    cStreetNo: "",
    cTown: "",
    pCountryId: 1,
    pProvinceId: 0,
    pCityId: 0,
    pHouseNo: "",
    pStreetNo: "",
    pTown: "",
    motherTongeId: 0,
    referenceId: 1,
    bForm: "",
    bFormNumber: "",
    fatherCNIC: "",
    motherCNIC: "",
    characterCertificate: "",
    gender: 0,
    imageUrl: "",
    userId: 0,
    admissionDiscounts: []
  });

  console.log("Initial formData:", formData);

  useEffect(() => {
    if (inquiryData) {
      // 1. Map labels to IDs for dropdowns (Religion and Mother Tongue)
      const matchedReligion = religions.find(r => r.label === inquiryData.religion);
      const matchedTongue = mothertongue.find(m => m.label === inquiryData.montherTonge);

      // 2. Update the formData state
      setFormData((prev) => ({
        ...prev,
        // Keep ID as 0 because this is a new Admission (conversion)
        id: 0,
        inquiryNumber: inquiryId ? Number(inquiryId) : "",
        // Basic Info
        campusId: inquiryData.campusId || 0,
        firstName: inquiryData.firstName || "",
        middleName: inquiryData.middleName || "",
        lastName: inquiryData.familyName || "", // Inquiry "familyName" -> Admission "lastName"
        cnic: inquiryData.cnic || "",
        contactNumber: inquiryData.contactNumber || "+92",
        email: inquiryData.email || "",

        // Dates
        dateOfBirth: inquiryData.dateOfBirth ? dayjs(inquiryData.dateOfBirth).toISOString() : dayjs().toISOString(),
        admissionDate: dayjs().toISOString(), // Default to today for new admission

        // Academic
        gradeId: inquiryData.gradeId || 0,
        sessionId: inquiryData.sessionId || 0,
        referenceId: inquiryData.referenceId || 1,

        // Family & Religion
        fatherName: inquiryData.fatherName || "",
        religionId: matchedReligion ? Number(matchedReligion.value) : 0,
        motherTongeId: matchedTongue ? Number(matchedTongue.value) : 0,

        // Current Address
        cCountryId: inquiryData.cCountryId || 1,
        cProvinceId: inquiryData.cProvinceId || 0,
        cCityId: inquiryData.cCityId || 0,
        cHouseNo: inquiryData.cHouseNo || "",
        cStreetNo: inquiryData.cStreetNo || "",
        cTown: inquiryData.cTown || "",

        // Permanent Address (Mapping from Inquiry if available, otherwise defaults)
        pCountryId: inquiryData.cCountryId || 1,
        pProvinceId: inquiryData.cProvinceId || 0,
        pCityId: inquiryData.cCityId || 0,
        pHouseNo: inquiryData.cHouseNo || "",
        pStreetNo: inquiryData.cStreetNo || "",
        pTown: inquiryData.cTown || "",
      }));

      // 3. Sync cascading dropdown states

      setCampusId(inquiryData.campusId || 0);
      setCountryId(inquiryData.cCountryId || 1);
      setStateId(inquiryData.cProvinceId || 0);
    }
  }, [inquiryData, inquiryId, religions, mothertongue]);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    // Define all required fields
    const requiredFields = [
      'campusId',
      'firstName',
      'lastName',
      'gradeId',
      'sectionId',
      'sessionId',
      'fatherName',
      'religionId',
      'contactNumber',
      'cnic',
      'motherTongeId',
      'cCountryId',
      'cProvinceId',
      'cCityId',
      'cTown',
      'gender',
      'cHouseNo',
      'cStreetNo'
    ];

    requiredFields.forEach(field => {
      const value = (formData as any)[field];
      // Check for empty strings, null, undefined, or 0 (for dropdowns)
      if (value === "" || value === null || value === undefined || value === 0) {
        newErrors[field] = true;
      }
    });

    // Validation for contact number (e.g., +92321-1234567 is 13 chars)
    if (formData.contactNumber && formData.contactNumber.length < 13) {
      newErrors['contactNumber'] = true;
    }

    // Validation for CNIC (35202-9999555-5 is exactly 15 characters)
    if (formData.cnic && formData.cnic.length < 15) {
      newErrors['cnic'] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to the first error if possible, or just toast
      toast.error("Please fill all required fields highlighted in red");
      return false;
    }
    return true;
  };

  const [isEdit, setIsEdit] = useState<boolean>(false);


  useEffect(() => {
    const isValidId = id !== undefined && id !== null && id !== "" && id !== "0";
    setIsEdit(isValidId);
    if (isValidId) setFetching(true);
  }, [id]);
  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const response = await axios.get(`${baseURL}/api/Admission/GetAdmission?id=${id}`);
          const data = response.data.data;

          // 1. Destructure (we'll ignore the API's discount list and use our own if needed)
          const { admissionDiscountList, ...restOfData } = data;

          // 2. Map and Sanitize the data
          const sanitizedData: Admission = {
            ...restOfData,

            // Setting the specific discount structure you requested
            // If you want to ALWAYS show this empty row regardless of API data:
            admissionDiscounts: (admissionDiscountList && admissionDiscountList.length > 0)
              ? admissionDiscountList
              : [],

            // --- String sanitization to prevent null inputs ---
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            cCity: data.cCity || "",
            cProvince: data.cProvince || "",
            pCity: data.pCity || "",
            pProvince: data.pProvince || "",
            cHouseNo: data.cHouseNo || "",
            cStreetNo: data.cStreetNo || "",
            cTown: data.cTown || "",
            pHouseNo: data.pHouseNo || "",
            pStreetNo: data.pStreetNo || "",
            pTown: data.pTown || "",
            bForm: data.bForm || "",
            bFormNumber: data.bFormNumber || "",
            fatherCNIC: data.fatherCNIC ? String(data.fatherCNIC) : "",
            motherCNIC: data.motherCNIC || "",
            characterCertificate: data.characterCertificate || "",
            imageUrl: data.imageUrl || "",

            // --- ID and Logic Fallbacks ---
            cCountryId: data.cCountryId || 1,
            cProvinceId: data.cProvinceId || 1,
            pCountryId: data.pCountryId || 1,
            pProvinceId: data.pProvinceId || 1,
            pCityId: data.pCityId || data.cCityId || 0,
            referenceId: data.referenceId || 1,
            gender: data.gender || 0,

            // --- Date Formatting ---
            admissionDate: data.admissionDate ? dayjs(data.admissionDate).toISOString() : dayjs().toISOString(),
            dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth).toISOString() : dayjs().toISOString(),
          };

          setFormData(sanitizedData);

          // 3. Sync local UI states
          setRegionId(data.regionId || 0);
          setCampusId(data.campusId || 0);
          setCountryId(sanitizedData.cCountryId);
          setStateId(sanitizedData.cProvinceId);

        } catch (error) {
          console.error("Error fetching student:", error);
        } finally {
          setFetching(false); // Stop loading regardless of success/error
        }
      };
      fetchStudent();
    }
  }, [id]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // --- Formatting Logic ---
    if (name === "contactNumber") {
      // 1. Force +92 prefix and remove non-digits
      const digits = value.replace(/[^\d]/g, "");
      const base = "92";

      // Ensure it always starts with 92
      let cleaned = digits.startsWith(base) ? digits : base + digits;
      cleaned = cleaned.slice(0, 12); // Max length for +923211111111 (12 digits)

      // 2. Format as +92321-1111111
      if (cleaned.length > 5) {
        value = `+${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
      } else {
        value = `+${cleaned}`;
      }
    }

    else if (name === "cnic" || name === "bFormNumber" || name === "fatherCNIC" || name === "motherCNIC") {
      // 1. Remove all non-digits
      const digits = value.replace(/[^\d]/g, "").slice(0, 13); // CNIC is 13 digits

      // 2. Format as 35202-9999555-5
      if (digits.length > 12) {
        value = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
      } else if (digits.length > 5) {
        value = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        value = digits;
      }
    }

    // --- State Updates ---
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };
  // 3. Handle Select Changes (For CommonSelect3)
  const handleSelectUpdate = (name: string, option: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: option?.value ?? 0 }));

    // Logic for cascading selects
    if (name === "campusId") setCampusId(option?.value);
    if (name === "cCountryId") setCountryId(option?.value);
    if (name === "cProvinceId") setStateId(option?.value);
  };


  // 4. Submit Logic (Add vs Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation
    if (!validateForm()) {
      return; // Stop the execution if form is invalid
    }

    setLoading(true);

    // 1. Create the base payload from formData
    // We use type 'any' here to allow dynamic deletion of keys
    let payload: any = { ...formData };

    const endpoint = isEdit
      ? `${baseURL}/api/Admission/EditAdmission`
      : `${baseURL}/api/Admission/AddAdmission`;

    // 2. Format payload based on the specific request bodies you provided
    if (!isEdit) {
      // --- ADD NEW ADMISSION ---
      // Remove fields not present in your 'Add' request body
      delete payload.id;
      delete payload.status;
      delete payload.isEnabled;
      // Note: ensure admissionNumber is handled if your state doesn't have it
      payload.admissionNumber = payload.admissionNumber ? Number(payload.admissionNumber) : 0;
    } else {
      // --- UPDATE ADMISSION ---
      // Ensure all required update fields are present
      payload.id = Number(id); // Use the ID from useParams
      payload.status = formData.status || "active";
      payload.isEnabled = formData.isEnabled ?? true;
      payload.admissionNumber = payload.admissionNumber ? Number(payload.admissionNumber) : 0;
    }

    try {
      const response = await axios.post(endpoint, payload);

      if (response.data.status) {
        toast.success(`Student ${isEdit ? "Updated" : "Added"} Successfully`);

        // Navigate to detail page (using ID from response if it was a new Add)
        const finalId = isEdit ? id : response.data.data?.id;

        if (!isEdit) {
          await axios.post(`${baseURL}/api/Inquiry/UpdateToAdmission?admissionId=${inquiryId}`)
        }

        navigate(`/student/student-details/${finalId}`);
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set dimensions (optional: scale down if too large)
          canvas.width = img.width;
          canvas.height = img.height;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to blob with specific quality (0.1 to 1.0)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Compression failed"));
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processAndUploadDP = async (file: File) => {
    // --- Validate File Type ---
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, or SVG)");
      return;
    }

    try {
      setLoading(true);

      let processedFile: Blob | File = file;
      if (file.type !== "image/svg+xml") {
        processedFile = await compressImage(file, 0.7);
      }

      const formData = new FormData();
      formData.append('file', processedFile, file.name);

      const response = await axios.post(`${baseURL}/api/Admission/UploadDocument`, formData);

      if (response.status === 200) {
        const newImageUrl = response?.data?.data;
        setFormData((prev) => ({ ...prev, imageUrl: newImageUrl }));

        if (isEdit) {
          await axios.post(`${baseURL}/api/Admission/UpdateProfilePic`, {
            admissionId: id,
            imageUrl: newImageUrl
          });
          toast.success("Image Updated Successfully");
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleDPFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processAndUploadDP(file);
    event.target.value = ""; // Reset input
  };
  const handleRemoveImage = async () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
    if (isEdit) {
      await axios.post(`${baseURL}/api/Admission/UpdateProfilePic`, {
        admissionId: id,
        imageUrl: ''
      })
      toast.success("Image removed Successfully");
    }

  }


  // CNIC manage
  // Helper to process and upload
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"father" | "mother" | null>(null);

  const onDragOver = (e: React.DragEvent, type: "father" | "mother") => {
    e.preventDefault();
    setDragType(type);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent, type: "father" | "mother") => {
    e.preventDefault();
    setDragType(null);
    const file = e.dataTransfer.files?.[0];
    if (file) processAndUploadCNIC(file, type);
  };

  // Reusable upload handler
  // Reusable upload handler
  const processAndUploadCNIC = async (file: File, type: "father" | "mother") => {
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, or SVG)");
      return;
    }

    try {
      setLoading(true);
      let processedFile: Blob | File = file;
      if (file.type !== "image/svg+xml") {
        processedFile = await compressImage(file, 0.7);
      }

      const formDataPayload = new FormData();
      formDataPayload.append('file', processedFile, file.name);

      const response = await axios.post(`${baseURL}/api/Admission/UploadDocument`, formDataPayload);

      if (response.status === 200) {
        const newImageUrl = response?.data?.data;

        // Dynamically update the correct field
        const fieldName = type === "father" ? "fatherCNIC" : "motherCNIC";

        setFormData((prev) => ({ ...prev, [fieldName]: newImageUrl }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} CNIC Uploaded`);
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const processAndUploadDocument = async (file: File, fieldName: "bForm" | "characterCertificate") => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid PDF or Image");
      return;
    }

    try {
      setLoading(true);

      // Skip compression for PDFs
      let processedFile: Blob | File = file;
      if (file.type !== "application/pdf") {
        processedFile = await compressImage(file, 0.7);
      }

      const formDataPayload = new FormData();
      formDataPayload.append('file', processedFile, file.name);

      const response = await axios.post(`${baseURL}/api/Admission/UploadDocument`, formDataPayload);

      if (response.status === 200) {
        const filePath = response?.data?.data;
        setFormData((prev) => ({ ...prev, [fieldName]: filePath }));
        toast.success(`${fieldName === 'bForm' ? 'B-Form' : 'Certificate'} Uploaded Successfully`);
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };




  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data

  const regions = useRegionsList();
  const [regionId, setRegionId] = useState<number>(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : 0);
  const handleSelectRegion = (name: string, option: any) => {
    setRegionId(option?.value ?? 0);
  }
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);


  const [campusId, setCampusId] = useState(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : 0)
  const sections = useSectionList(campusId);
  const countries = useCountries();
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const states = useStates(countryId ? countryId : 1);
  const cities = useCities(stateId)

  const gender = useGender;


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
  const handleSelectChange = (name: string, option: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: option?.value ?? 0,
    }))
  }
  const handleSelectCCountry = (name: string, option: any) => {
    setCountryId(option?.value ?? 0);
    setFormData(prev => ({
      ...prev,
      cCountryId: option?.value,
    }))
  }
  const handleSelectPCountry = (name: string, option: any) => {
    setCountryId(option?.value ?? 0);
    setFormData(prev => ({
      ...prev,
      pCountryId: option?.value,
    }))
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Logic for Guardian Whatsapp Number
    if (name === 'contactNumber') {
      // 1. Prevent user from deleting +92
      if (!value.startsWith('+92')) {
        //setForm(prev => ({ ...prev, [name]: '+92' }));
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

      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return; // Exit so the default logic doesn't run
    }

    // Your existing default logic for other fields
    // setForm(prev => ({
    //   ...prev,
    //   [name]: e.target.type === 'number' ? Number(value) : value,
    // }));
  };
  const handleSelectState = (name: string, option: any) => {
    setStateId(option?.value ?? 0);
    // setForm(prev => ({
    //   ...prev,
    //   cProvinceId: option?.value,
    //   cCityId: 0
    // }))
  }
  useEffect(() => {
    if (location.pathname === routes.editStudent) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so we add 1
      const day = String(today.getDate()).padStart(2, "0");
      const formattedDate = `${month}-${day}-${year}`;
      const defaultValue = dayjs(formattedDate);
      setOwner(["English"])
      setOwner1(["Medecine Name"])
      setOwner2(["Allergy", "Skin Allergy"])
      setDefaultDate(defaultValue)

    } else {
      setDefaultDate(null)
    }
  }, [location.pathname])


  // --- LOADING RENDER ---
  if (isEdit && fetching) {
    return (
      <div className="page-wrapper">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            width: "100%",
          }}
        >
          <Spin size="large" tip="Loading Student Data..." />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content content-two">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="mb-1">{isEdit ? 'Edit' : 'Add'} Student</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={routes.studentList}>Students</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {isEdit ? 'Edit' : 'Add'} Student
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-md-12">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-info-square-rounded fs-16" />
                      </span>
                      <h4 className="text-dark">Personal Information</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames">
                            {/* <i className="ti ti-photo-plus fs-16" /> */}
                            <ImageWithBasePath
                              src={
                                formData?.imageUrl
                                  ? formData.imageUrl.startsWith('http')
                                    ? formData.imageUrl                     // If it's a full URL, use it directly
                                    : `${baseURL}/${formData?.imageUrl}`     // If not, append the baseURL
                                  : "assets/img/students/student-01.jpg"  // Fallback
                              }
                              className="img-fluid"
                              alt="img"
                            />
                          </div>
                          <div className="profile-upload">
                            <div className="profile-uploader d-flex align-items-center">
                              <div className="drag-upload-btn mb-3 me-2">
                                Upload
                                <input
                                  type="file"
                                  className="form-control image-sign"
                                  accept="image/jpeg, image/png, image/svg+xml"
                                  onChange={handleDPFileUpload}
                                />
                              </div>
                              <Link to="#" onClick={(e) => { e.preventDefault(); setIsCameraVisible(true); }} className="btn btn-outline-primary mb-3 me-2" style={{ padding: '0.45rem 0.9rem' }}>
                                <i className="ti ti-camera me-1"></i> Capture
                              </Link>
                              <Link to="#" onClick={() => handleRemoveImage()} className="btn btn-primary mb-3">
                                Remove
                              </Link>
                            </div>
                            <p className="fs-12">
                              Upload image size 4MB, Format JPG, PNG, SVG
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
                            <label className="form-label">Campus</label>
                            <CommonSelect3
                              className="select"
                              options={campuses}
                              onChange={(option) => handleSelectUpdate('campusId', option)}
                              value={campuses.find(c => c.value === formData.campusId) || null}
                            />
                          </div>
                        </div>
                      )}

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Academic Year</label>
                          <div className={errors.gradeId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={academicYear}
                              onChange={(option) => handleSelectUpdate('sectionId', option)}
                              value={formData?.sessionId ? academicYear[academicYear.length - 1] : null}
                            />
                          </div>
                        </div>
                      </div>
                      {isEdit && (
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Roll Number</label>
                            <input type="text"
                              value={formData?.studentNumber}
                              className="form-control disabled" disabled={true} />
                          </div>
                        </div>
                      )}
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Admission Date</label>
                          <div className="input-icon position-relative">
                            <DatePicker
                              className="form-control datetimepicker"
                              format={{
                                format: "DD-MM-YYYY",
                                type: "mask",
                              }}
                              value={formData.admissionDate ? dayjs(formData.admissionDate) : null}
                              onChange={(date) => {
                                setFormData(prev => ({
                                  ...prev,
                                  admissionDate: date
                                    ? dayjs(date).format('YYYY-MM-DD')
                                    : ''
                                }))
                              }}
                              placeholder="Select Date"
                            />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Roll Number</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? '35013' : undefined} />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <CommonSelect3
                            className="select"
                            options={status}
                            onChange={(option) => {
                              // Convert the string value back to a boolean when saving
                              setFormData({ ...formData, isEnabled: option.value === 'true' });
                            }}
                            value={status.find(s => String(s.value) === String(formData.isEnabled)) || status[0]}
                          />
                        </div>
                      </div> */}
                      <div className="col-lg-3 col-md-6">
                        <div className="mb-3 d-flex align-items-center" style={{ height: '100%' }}>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isEnabled"
                              checked={formData.isEnabled}
                              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="isEnabled">
                              {formData.isEnabled ? "Active" : "Inactive"}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input type="text"
                            value={formData.firstName || ""}
                            onChange={handleInputChange}
                            name="firstName"
                            className={`form-control ${errors.firstName ? 'is-invalid border-danger' : ''}`}
                          />
                          {errors.firstName && <div className="invalid-feedback">First name is required</div>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Middle Name</label>
                          <input type="text" className="form-control" onChange={handleInputChange} name="middleName" value={formData?.middleName || ''} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input type="text" className={`form-control ${errors.lastName ? 'is-invalid border-danger' : ''}`} onChange={handleInputChange} name="lastName" value={formData?.lastName || ''} />
                          {errors.lastName && <div className="invalid-feedback">Last name is required</div>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Roll No</label>
                          <input type="number" className="form-control" onChange={handleInputChange} name="admissionNumber" value={formData?.admissionNumber || ''} />
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Grade</label>
                          <div className={errors.gradeId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={grades}
                              isDisabled={isEdit}
                              onChange={(option) =>
                                handleSelectChange('gradeId', option)
                              }
                              value={formData?.gradeId ? grades.find(grade => grade.value === formData.gradeId) || null : null}
                            />
                          </div>
                          {errors.gradeId && <span className="text-danger fs-12">Please select a grade</span>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Section</label>
                          <div className={errors.sectionId ? "border border-danger rounded" : ""}>
                            <CommonSelect3
                              className="select"
                              options={sections}
                              onChange={(option) => handleSelectChange('sectionId', option)}
                              value={formData?.sectionId ? sections.find(s => s.value === formData.sectionId) || sections[0] : sections[0]}
                            />
                          </div>
                          {errors.sectionId && <span className="text-danger fs-12">Please select a section</span>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Gender</label>
                          <div className={errors.gender ? "is-invalid-select" : ""}>
                            <CommonSelect3
                              className="select"
                              options={gender}
                              onChange={(option) => handleSelectChange('gender', option)}
                              value={formData.gender ? gender.find(g => g.value === formData.gender) : gender[0]}
                            />
                          </div>
                          {errors.gender && <span className="text-danger fs-12">Please select a gender</span>}
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date of Birth</label>
                          <div className="input-icon position-relative">
                            <DatePicker
                              className="form-control datetimepicker"
                              format={{
                                format: "DD-MM-YYYY",
                                type: "mask",
                              }}
                              onChange={(date) => {
                                setFormData(prev => ({
                                  ...prev,
                                  dateOfBirth: date
                                    ? dayjs(date).format('YYYY-MM-DD')
                                    : ''
                                }))
                              }}
                              value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                              placeholder="Select Date"
                            />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Blood Group</label>
                          <CommonSelect
                            className="select"
                            options={bloodGroup}
                            defaultValue={isEdit ? bloodGroup[0] : undefined}
                          />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">House</label>
                          <CommonSelect
                            className="select"
                            options={house}
                            defaultValue={isEdit ? house[0] : undefined}
                          />
                        </div>
                      </div> */}
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Religion</label>
                          <CommonSelect3
                            className="select"
                            options={religions}
                            onChange={(option) => handleSelectChange('religionId', option)}
                            value={formData.religionId
                              ? religions.find(r => (r.value) === (formData.religionId))
                              : religions[0]}
                          />
                        </div>
                      </div>
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <CommonSelect
                            className="select"
                            options={cast}
                            defaultValue={isEdit ? cast[0] : undefined}
                          />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Primary Contact Number
                          </label>
                          <input type="text" className="form-control" name="contactNumber" onChange={handleInputChange} value={formData?.contactNumber || ''} />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email Address</label>
                          <input type="email" className="form-control" name="email" onChange={handleInputChange} value={formData?.email || ''} />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">CNIC</label>
                          <input type="text" className="form-control" name="cnic" onChange={handleInputChange} value={formData?.cnic || ''} />
                        </div>
                      </div> */}
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Caste</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? 'Catholic' : undefined} />
                        </div>
                      </div> */}
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Mother Tongue</label>
                          <CommonSelect3
                            className="select"
                            options={mothertongue}
                            onChange={(option) => handleSelectChange('motherTongeId', option)}
                            value={formData.motherTongeId ? mothertongue.find(m => m.value === formData.motherTongeId) : mothertongue[0]}
                          />
                        </div>
                      </div>
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">B-Form Number</label>
                          <input type="text" className="form-control" maxLength={15} name="bFormNumber" onChange={handleInputChange} value={formData?.bFormNumber || ''} />
                        </div>
                      </div>
                      {/* <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Language Known</label>
                          <TagsInput
                            // className="input-tags form-control"
                            value={owner}
                            onChange={setOwner}
                          />
                        </div>
                      </div> */}
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
                      <h5 className="mb-3">Father’s Info</h5>
                      <div className="row">
                        {/* <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo-plus fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn mb-3">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple
                                  />
                                </div>
                                <Link to="#" className="btn btn-primary mb-3">
                                  Remove
                                </Link>
                              </div>
                              <p className="fs-12">
                                Upload image size 4MB, Format JPG, PNG, SVG
                              </p>
                            </div>
                          </div>
                        </div> */}
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Father Name</label>
                            <input type="text" className={`form-control ${errors.fatherName ? 'is-invalid border-danger' : ''}`} name="fatherName" onChange={handleInputChange} value={formData?.fatherName || ''} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Contact Number
                            </label>
                            <input type="text" className={`form-control ${errors.contactNumber ? 'is-invalid border-danger' : ''}`} name="contactNumber" onChange={handleInputChange} value={formData?.contactNumber || ''} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <input type="email" className={`form-control ${errors.email ? 'is-invalid border-danger' : ''}`} name="email" onChange={handleInputChange} value={formData?.email || ''} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">CNIC</label>
                            <input type="text" className={`form-control ${errors.cnic ? 'is-invalid border-danger' : ''}`} name="cnic" onChange={handleInputChange} value={formData?.cnic || ''} />
                          </div>
                        </div>
                        {/* <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">CNIC</label>
                            <input type="text" className="form-control" maxLength={15} name="fatherCNIC" onChange={handleInputChange} value={formData?.fatherCNIC || ''} />
                          </div>
                        </div> */}
                        {/* <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? '+1 45545 46464' : undefined} />
                          </div>
                        </div> */}
                        {/* <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Father Occupation
                            </label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Mechanic' : undefined} />
                          </div>
                        </div> */}
                      </div>
                    </div>
                    {/* <div className="border-bottom mb-3">
                      <h5 className="mb-3">Mother’s Info</h5>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo-plus fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn mb-3">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple
                                  />
                                </div>
                                <Link to="#" className="btn btn-primary mb-3">
                                  Remove
                                </Link>
                              </div>
                              <p className="fs-12">
                                Upload image size 4MB, Format JPG, PNG, SVG
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Mother Name</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Roberta Webber' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'robe@example.com' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? '+1 46499 24357' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Mother Occupation
                            </label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Homemaker' : undefined} />
                          </div>
                        </div>
                      </div>
                    </div> */}
                    {/* <div>
                      <h5 className="mb-3">Guardian Details</h5>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-2">
                            <div className="d-flex align-items-center flex-wrap">
                              <label className="form-label text-dark fw-normal me-2">
                                If Guardian Is
                              </label>
                              <div className="form-check me-3 mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="guardian"
                                  id="parents"
                                  defaultChecked
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="parents"
                                >
                                  Parents
                                </label>
                              </div>
                              <div className="form-check me-3 mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="guardian"
                                  id="guardian"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="guardian"
                                >
                                  Guardian
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="guardian"
                                  id="other"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="other"
                                >
                                  Others
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo-plus fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn mb-3">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple
                                  />
                                </div>
                                <Link to="#" className="btn btn-primary mb-3">
                                  Remove
                                </Link>
                              </div>
                              <p className="fs-12">
                                Upload image size 4MB, Format JPG, PNG, SVG
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Name</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Jerald Vicinius' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Guardian Relation
                            </label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Uncle' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? '+1 45545 46464' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" defaultValue={isEdit ? 'jera@example.com' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Occupation</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? 'Mechanic' : undefined} />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" defaultValue={isEdit ? '3495 Red Hawk Road, Buffalo Lake, MN 55314' : undefined} />
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
                {/* /Parents & Guardian Information */}
                {/* Sibilings */}
                {/* <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-users fs-16" />
                      </span>
                      <h4 className="text-dark">Sibilings</h4>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="addsibling-info">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-2">
                            <label className="form-label">Sibling Info</label>
                            <div className="d-flex align-items-center flex-wrap">
                              <label className="form-label text-dark fw-normal me-2">
                                Is Sibling studying in the same school
                              </label>
                              <div className="form-check me-3 mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="sibling"
                                  id="yes"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="yes">
                                  Yes
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="sibling"
                                  id="no"
                                />
                                <label className="form-check-label" htmlFor="no">
                                  No
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        {newContents.map((_, index) => (
                          <div key={index} className="col-lg-12">
                            <div className="row">
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Name</label>
                                  <CommonSelect
                                    className="select"
                                    options={names}
                                    defaultValue={isEdit ? names[0] : undefined}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Roll No</label>
                                  <CommonSelect
                                    className="select"
                                    options={rollno}
                                    defaultValue={isEdit ? rollno[0] : undefined}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Admission No</label>
                                  <CommonSelect
                                    className="select"
                                    options={AdmissionNo}
                                    defaultValue={isEdit ? AdmissionNo[0] : undefined}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <div className="w-100">
                                      <label className="form-label">Grade</label>
                                      <CommonSelect3
                                        className="select"
                                        options={grades}
                                        value={isEdit ? formData.gradeId ? grades.find(g => g.value === formData.gradeId) || null : null : null}
                                      />
                                    </div>
                                    {newContents.length > 1 && (
                                      <div>
                                        <label className="form-label">&nbsp;</label>
                                        <Link
                                          to="#"
                                          className="trash-icon ms-3"
                                          onClick={() => removeContent(index)}
                                        >
                                          <i className="ti ti-trash-x" />
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-top pt-3">
                      <Link
                        to="#"
                        onClick={addNewContent}
                        className="add-sibling btn btn-primary d-inline-flex align-items-center"
                      >
                        <i className="ti ti-circle-plus me-2" />
                        Add New
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* /Sibilings */}

                {/* Current Address */}
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
                          <label className="form-label">Country</label>
                          <CommonSelect3
                            className="select"
                            options={countries}
                            onChange={(option) => handleSelectCCountry('cCountryId', option)}
                            value={formData?.cCountryId ? countries.find(c => c.value === formData.cCountryId) : countries[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <CommonSelect3
                            className="select"
                            options={states}
                            onChange={(option) => handleSelectState('cProvinceId', option)}
                            value={formData?.cProvinceId ? states.find(c => c.value === formData.cProvinceId) : states[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <CommonSelect3
                            className="select"
                            options={cities}
                            onChange={(option) =>
                              handleSelectChange('cCityId', option)
                            }
                            value={formData?.cCityId ? cities.find(c => c.value === formData.cCityId) : cities[0]}
                          //value={form?.cCityId !== 0 ? cities.find(c => c.value === form.cCityId) : cities[0]}
                          />
                        </div>
                      </div>


                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">House No#</label>
                          <input
                            type="text"
                            name="cHouseNo"
                            className={`form-control ${errors.cHouseNo ? 'is-invalid border-danger' : ''}`}
                            value={formData?.cHouseNo}
                            onChange={handleInputChange}
                            placeholder="Enter Your Current House No"
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Street No#</label>
                          <input
                            type="text" name="cStreetNo"
                            value={formData?.cStreetNo}
                            onChange={handleInputChange}
                            className={`form-control ${errors.cStreetNo ? 'is-invalid border-danger' : ''}`}
                            placeholder="Enter Your Current Street No"
                            defaultValue={isEdit ? formData?.cStreetNo : undefined}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Town</label>
                          <input
                            type="text" name="cTown"
                            value={formData?.cTown}
                            onChange={handleInputChange}
                            className={`form-control ${errors.cTown ? 'is-invalid border-danger' : ''}`}
                            placeholder="Enter Your Current Town"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Current Address */}

                {/* Current Address */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-map fs-16" />
                      </span>
                      <h4 className="text-dark">Permanent Address</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <CommonSelect3
                            className="select"
                            options={countries}
                            onChange={(option) => handleSelectPCountry('pCountryId', option)}
                            value={formData?.pCountryId ? countries.find(c => c.value === formData.pCountryId) : countries[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <CommonSelect3
                            className="select"
                            options={states}
                            onChange={(option) => handleSelectState('pProvinceId', option)}
                            value={formData?.pProvinceId ? states.find(c => c.value === formData.pProvinceId) : states[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <CommonSelect3
                            className="select"
                            options={cities}
                            onChange={(option) =>
                              handleSelectChange('pCityId', option)
                            }
                            //value={isEdit ? cities[0]}
                            value={formData?.pCityId !== 0 ? cities.find(c => c.value === formData.pCityId) : cities[0]}
                          />
                        </div>
                      </div>


                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">House No#</label>
                          <input
                            type="text"
                            name="pHouseNo"
                            value={formData?.pHouseNo}
                            onChange={handleInputChange}
                            className={`form-control ${errors.pHouseNo ? 'is-invalid border-danger' : ''}`}
                            placeholder="Enter Your Permanent House No"

                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Street No#</label>
                          <input
                            type="text"
                            name="pStreetNo"
                            value={formData?.pStreetNo}
                            onChange={handleInputChange}
                            className={`form-control ${errors.pStreetNo ? 'is-invalid border-danger' : ''}`}
                            placeholder="Enter Your Permanent Street No" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Town</label>
                          <input
                            type="text" name="pTown"
                            value={formData?.pTown}
                            onChange={handleInputChange}
                            className={`form-control ${errors.pTown ? 'is-invalid border-danger' : ''}`}
                            placeholder="Enter Your Permanent Town"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Permanent Address */}

                {/* Transport Information */}
                {/* <div className="card">
                  <div className="card-header bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-bus-stop fs-16" />
                      </span>
                      <h4 className="text-dark">Transport Information</h4>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                      />
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Route</label>
                          <CommonSelect
                            className="select"
                            options={route}
                            defaultValue={isEdit ? route[0] : undefined}
                          />
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Vehicle Number</label>
                          <CommonSelect
                            className="select"
                            options={VehicleNumber}
                            defaultValue={isEdit ? VehicleNumber[0] : undefined}
                          />
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Pickup Point</label>
                          <CommonSelect
                            className="select"
                            options={PickupPoint}
                            defaultValue={isEdit ? PickupPoint[0] : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* /Transport Information */}
                {/* Hostel Information */}
                {/* <div className="card">
                  <div className="card-header bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-building-fortress fs-16" />
                      </span>
                      <h4 className="text-dark">Hostel Information</h4>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                      />
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Hostel</label>
                          <CommonSelect
                            className="select"
                            options={Hostel}
                            defaultValue={isEdit ? Hostel[0] : undefined}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Room No</label>
                          <CommonSelect
                            className="select"
                            options={roomNO}
                            defaultValue={isEdit ? roomNO[0] : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* /Hostel Information */}
                {/* Documents */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-file fs-16" />
                      </span>
                      <h4 className="text-dark">Documents</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-lg-6">
                        <label className="form-label">Father CNIC</label>
                        <div
                          className={`cnic-drop-zone ${dragType === 'father' ? 'dragging' : ''}`}
                          onDragOver={(e) => onDragOver(e, 'father')}
                          onDragLeave={() => setDragType(null)}
                          onDrop={(e) => onDrop(e, 'father')}
                          style={dropZoneStyle(dragType === 'father', !!formData.fatherCNIC)}
                        >
                          {formData.fatherCNIC ? (
                            <PreviewImage url={formData.fatherCNIC} onRemove={() => setFormData(p => ({ ...p, fatherCNIC: '' }))} />
                          ) : (
                            <DropZonePlaceholder label="Father" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processAndUploadCNIC(file, 'father');
                            }} />
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <label className="form-label">Mother CNIC</label>
                        <div
                          className={`cnic-drop-zone ${dragType === 'mother' ? 'dragging' : ''}`}
                          onDragOver={(e) => onDragOver(e, 'mother')}
                          onDragLeave={() => setDragType(null)}
                          onDrop={(e) => onDrop(e, 'mother')}
                          style={dropZoneStyle(dragType === 'mother', !!formData.motherCNIC)}
                        >
                          {formData.motherCNIC ? (
                            <PreviewImage url={formData.motherCNIC} onRemove={() => setFormData(p => ({ ...p, motherCNIC: '' }))} />
                          ) : (
                            <DropZonePlaceholder label="Mother" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processAndUploadCNIC(file, 'mother');
                            }} />
                          )}
                        </div>
                      </div>


                      <div className="col-lg-6">
                        {/* Header Section */}
                        <div className="mb-3 mt-5">
                          <label className="form-label mb-1 fw-semibold">B-Form</label>
                          <p className="fs-12 text-muted">Max size 4MB, Formats: PDF, JPG, PNG</p>
                        </div>

                        {!formData.bForm ? (
                          /* Upload State */
                          <div className="d-flex align-items-center">
                            <div className="btn btn-primary drag-upload-btn position-relative">
                              <i className="ti ti-file-upload me-1" />
                              Upload B-Form
                              <input
                                type="file"
                                className="position-absolute start-0 top-0 opacity-0 w-100 h-100 cursor-pointer"
                                accept=".pdf,image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) processAndUploadDocument(file, 'bForm');
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          /* Preview State */
                          <div className="bg-light-300 border rounded d-flex align-items-center justify-content-between p-2">
                            <div className="d-flex align-items-center overflow-hidden">
                              <span className="avatar avatar-md bg-white rounded flex-shrink-0">
                                {formData.bForm.toLowerCase().endsWith('.pdf') ? (
                                  <i className="ti ti-file-type-pdf fs-20 text-danger" />
                                ) : (
                                  <i className="ti ti-photo fs-20 text-primary" />
                                )}
                              </span>
                              <div className="ms-2">
                                <p className="text-truncate fw-medium text-dark mb-0" style={{ maxWidth: '150px' }}>
                                  B-Form Document
                                </p>
                                <span className="fs-10 text-muted text-uppercase">
                                  {formData.bForm.split('.').pop()} File
                                </span>
                              </div>
                            </div>

                            <div className="d-flex gap-2">
                              <a
                                href={`${baseURL}/${formData.bForm}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-dark btn-icon btn-sm"
                              >
                                <i className="ti ti-eye" />
                              </a>
                              <button
                                type="button"
                                className="btn btn-danger btn-icon btn-sm"
                                onClick={() => setFormData(prev => ({ ...prev, bForm: '' }))}
                              >
                                <i className="ti ti-trash" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-lg-6">
                        <div className="mb-2 mt-5">
                          <div className="mb-3">
                            <label className="form-label mb-1">Character Certificate</label>
                            <p className="fs-12 text-muted">Max size 4MB, Formats: PDF, JPG, PNG</p>
                          </div>

                          {!formData.characterCertificate ? (
                            <div className="d-flex align-items-center flex-wrap">
                              <div className="btn btn-primary drag-upload-btn mb-2 position-relative">
                                <i className="ti ti-certificate me-1" />
                                Upload Certificate
                                <input
                                  type="file"
                                  className="position-absolute start-0 top-0 opacity-0 w-100 h-100 cursor-pointer"
                                  accept=".pdf,image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) processAndUploadDocument(file, 'characterCertificate');
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-light-300 border rounded d-flex align-items-center justify-content-between mb-3 p-2">
                              <div className="d-flex align-items-center overflow-hidden">
                                <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                                  {formData.characterCertificate.toLowerCase().endsWith('.pdf') ? (
                                    <i className="ti ti-file-type-pdf fs-20 text-danger" />
                                  ) : (
                                    <i className="ti ti-photo fs-20 text-primary" />
                                  )}
                                </span>
                                <div className="ms-2">
                                  <p className="text-truncate fw-medium text-dark mb-0" style={{ maxWidth: '150px' }}>
                                    Character Certificate
                                  </p>
                                  <span className="fs-10 text-muted text-uppercase">
                                    {formData.characterCertificate.split('.').pop()} File
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <a
                                  href={`${baseURL}/${formData.characterCertificate}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-dark btn-icon btn-sm"
                                >
                                  <i className="ti ti-eye" />
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-icon btn-sm"
                                  onClick={() => setFormData(prev => ({ ...prev, characterCertificate: '' }))}
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                {/* /Documents */}
                {/* Medical History */}
                {/* <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-medical-cross fs-16" />
                      </span>
                      <h4 className="text-dark">Medical History</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-2">
                          <label className="form-label">
                            Medical Condition
                          </label>
                          <div className="d-flex align-items-center flex-wrap">
                            <label className="form-label text-dark fw-normal me-2">
                              Medical Condition of a Student
                            </label>
                            <div className="form-check me-3 mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="condition"
                                id="good"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="good"
                              >
                                Good
                              </label>
                            </div>
                            <div className="form-check me-3 mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="condition"
                                id="bad"
                              />
                              <label className="form-check-label" htmlFor="bad">
                                Bad
                              </label>
                            </div>
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="condition"
                                id="others"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="others"
                              >
                                Others
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Allergies</label>

                        <TagsInput
                          // className="input-tags form-control"
                          value={owner2}
                          onChange={setOwner2}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Medications</label>
                        <TagsInput
                          // className="input-tags form-control"
                          value={owner1}
                          onChange={setOwner1}
                        />
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* /Medical History */}
                {/* Previous School details */}
                {/* <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-building fs-16" />
                      </span>
                      <h4 className="text-dark">Previous School Details</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">School Name</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? 'Oxford Matriculation, USA' : undefined} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? '1852 Barnes Avenue, Cincinnati, OH 45202' : undefined} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* /Previous School details */}
                {/* Other Details */}
                {/* <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-building-bank fs-16" />
                      </span>
                      <h4 className="text-dark">Other Details</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-5">
                        <div className="mb-3">
                          <label className="form-label">Bank Name</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? 'Bank of America' : undefined} />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="mb-3">
                          <label className="form-label">Branch</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? 'Cincinnati' : undefined} />
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="mb-3">
                          <label className="form-label">IFSC Number</label>
                          <input type="text" className="form-control" defaultValue={isEdit ? 'BOA83209832' : undefined} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Other Information
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            defaultValue={""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* /Other Details */}
                <div className="text-end">
                  {/* <Link to={`/student/student-details/${id}`} type="button" className="btn btn-light me-3">
                    Cancel
                  </Link> */}
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    onClick={() => {
                      if (isEdit) {
                        navigate(`/student/student-details/${id}`);
                      } else {
                        navigate(-1); // This opens the last page in history
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      isEdit ? "Update Student" : "Add Student"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      <CameraCapture 
        visible={isCameraVisible} 
        onCancel={() => setIsCameraVisible(false)} 
        onCapture={processAndUploadDP} 
      />
    </>
  );
};

export default AddStudent;


const dropZoneStyle = (isDragging: boolean, hasImage: boolean) => ({
  border: isDragging ? '2px dashed #28a745' : '2px dashed #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  backgroundColor: isDragging ? '#f8fff9' : '#f9fafb',
  minHeight: '150px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const PreviewImage = ({ url, onRemove }: { url: string, onRemove: () => void }) => (
  <div className="position-relative">
    <img src={`${baseURL}/${url}`} alt="Preview" style={{ maxHeight: '100px' }} />
    <button onClick={onRemove} className="btn btn-danger btn-sm rounded-circle position-absolute top-0 start-100 translate-middle">
      <i className="ti ti-x" />
    </button>
  </div>
);

const DropZonePlaceholder = ({ label, onChange }: { label: string, onChange: (e: any) => void }) => (
  <div className="text-center">
    <i className="ti ti-camera fs-24 text-muted" />
    <p className="mb-1">Click or Drag {label} CNIC</p>
    <input type="file" className="opacity-0 position-absolute" style={{ width: '1px' }} onChange={onChange} accept="image/*" id={`upload-${label}`} />
    <label htmlFor={`upload-${label}`} className="btn btn-outline-primary btn-sm">Browse</label>
  </div>
);
