import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Spin, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { GetAllDepartments } from "../../../store/apps/department";
import { GetAllDesignations } from "../../../store/apps/designation";
import { GetAllEmployeeType } from "../../../store/apps/employee-type";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import { AddEmployee, UpdateEmployee, GetEmployeeById, GenerateEmployeeKey } from "../../../store/apps/campus-employee";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { gender } from "../../../core/common/selectoption/selectoption";
import { useReligionsList } from "../../../core/common/selectoption/academic/useReligions";
import { GetCampusChartOfAccount } from "../../../store/apps/campus-coa";
import { GetCampusBanksByCampus } from "../../../store/apps/campus-bank";
import { useCampusFeeRecAccount } from "../../../core/common/selectoption/financial/useCampusFeeRecAccount";
import axios from "axios";
import { all_routes } from "../../router/all_routes";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const AddCampusEmployee = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = id ? parseInt(id, 10) : null;

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;
  const userLevel = loginInfo?.userLevel || 0;
  const userCampusId = userLevel === 3 ? loginInfo?.userLevelId : null;

  const campuses = useCampusesList(userLevel === 2 ? loginInfo?.userLevelId : 0);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { data: departmentData } = useSelector((state: RootState) => state.department);
  const { data: designationData } = useSelector((state: RootState) => state.designation);
  const { data: empTypeData } = useSelector((state: RootState) => state.employeeType);
  const { data: coaData } = useSelector((state: RootState) => state.campusCoa);
  const { data: campusAccount } = useSelector((state: RootState) => state.campusBank);
  const { generatedEmployeeKey } = useSelector((state: RootState) => state.campusEmployee);

  const religions = useReligionsList();
  const cashHeadsFromHook = useCampusFeeRecAccount();
  const paymentModes = [{ label: "Cash", value: "Cash" }, { label: "Bank", value: "Bank" }];

  const maritalStatuses = [
    { label: "Single", value: 1 },
    { label: "Married", value: 2 },
    { label: "Divorced", value: 3 },
    { label: "Widowed", value: 4 },
  ];

  const mappedDepartments = departmentData
    .filter((d: any) => d.isHO === false)
    .map((d: any) => ({ label: d.name, value: d.id ?? 0 }));
  const mappedDesignations = designationData.map((d: any) => ({ label: d.name, value: d.id ?? 0 }));
  const mappedEmpTypes = empTypeData.map((d: any) => ({ label: d.name, value: d.id ?? 0 }));

  const mappedCashHeads = cashHeadsFromHook.filter((opt: any) => opt.value !== "");

  const mappedBankHeads = campusAccount
    ? campusAccount.map((acc: any) => ({
      label: acc.accountTitle + " (" + acc.iban + ")",
      value: acc.id ?? 0,
    }))
    : [];

  const [reportToList, setReportToList] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    campusId: userCampusId || 0,
    employeeKey: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    email: "",
    departmentId: 0,
    designationId: 0,
    dob: dayjs().subtract(18, 'year').format("YYYY-MM-DD"),
    cnic: "",
    joiningDate: dayjs().format("YYYY-MM-DD"),
    confirmationDate: dayjs().format("YYYY-MM-DD"),
    employeeTypeId: 0,
    gender: 0,
    martialStatus: 0,
    repportToId: null,
    isActive: true,
    imageUrl: "",
    contactNumber: "+92",
    eobi: "",
    debitAccountId: 0,
    paymentMode: "Cash",
    bankBranchId: 0,
    accountTitle: "",
    accountNumber: "",
    religionId: 0,
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(GetAllDepartments({ pageNo: 1, pageSize: 100, search: "" }));
    dispatch(GetAllDesignations({ pageNo: 1, pageSize: 100, search: "" }));
    dispatch(GetAllEmployeeType({ pageNo: 1, pageSize: 100, search: "" }));
  }, [dispatch]);

  const [bankList, setBankList] = useState<{ label: string; value: number }[]>([]);
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.post(`${baseURL}/api/AccountBank/GetAll`);
        if (response.data.status && response.data.data) {
          setBankList(response.data.data.map((b: any) => ({ label: b.name, value: b.id })));
        }
      } catch (err) {
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (formData.campusId) {
      dispatch(GetCampusChartOfAccount(formData.campusId));
      dispatch(GetCampusBanksByCampus(formData.campusId));

      const getCampusEmployees = async () => {
        try {
          const resp = await axios.post(`${baseURL}/api/HREmployee/GetAll`, {
            pageNo: 1,
            pageSize: 1000,
            search: "",
            campusId: formData.campusId,
            departmentId: null,
            designationId: null,
            employeeTypeId: null,
            gender: null,
            isActive: true
          });
          if (resp.data && resp.data.data) {
            let employees = resp.data.data;
            if (editId) {
              employees = employees.filter((emp: any) => emp.id !== editId);
            }
            setReportToList(employees.map((emp: any) => ({
              label: `${emp.firstName} ${emp.lastName} - (${emp.designationName} + - + ${emp.employeeKey})`,
              value: emp.id
            })));
          }
        } catch (e) { }
      }
      getCampusEmployees();

      if (!editId && !formData.employeeKey) {
        dispatch(GenerateEmployeeKey(formData.campusId));
      }
    }
  }, [formData.campusId, dispatch, editId]);

  useEffect(() => {
    if (generatedEmployeeKey && !editId) {
      setFormData((prev: any) => ({ ...prev, employeeKey: generatedEmployeeKey }));
    }
  }, [generatedEmployeeKey, editId]);

  useEffect(() => {
    if (editId) {
      setFetching(true);
      dispatch(GetEmployeeById(editId))
        .unwrap()
        .then((data) => {
          setFormData({
            ...data,
            dob: data.dob ? dayjs(data.dob).format("YYYY-MM-DD") : "",
            joiningDate: data.joiningDate ? dayjs(data.joiningDate).format("YYYY-MM-DD") : "",
            confirmationDate: data.confirmationDate ? dayjs(data.confirmationDate).format("YYYY-MM-DD") : "",
          });
        })
        .finally(() => setFetching(false));
    }
  }, [editId, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (["firstName", "middleName", "lastName", "fatherName"].includes(name)) {
      value = value.toUpperCase();
    }

    if (name === "contactNumber") {
      const digits = value.replace(/[^\d]/g, "");
      const base = "92";
      let cleaned = digits.startsWith(base) ? digits : base + digits;
      cleaned = cleaned.slice(0, 12);
      if (cleaned.length > 5) {
        value = `+${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
      } else {
        value = `+${cleaned}`;
      }
    }

    if (name === "cnic") {
      const digits = value.replace(/[^\d]/g, "").slice(0, 13);
      if (digits.length > 12) {
        value = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
      } else if (digits.length > 5) {
        value = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        value = digits;
      }
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectUpdate = (name: string, option: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: option?.value ?? null }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const getSelected = (options: any[], val: any) => options.find((o) => o.value === val) || null;

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    const requiredFields = [
      "campusId", "firstName", "departmentId", "designationId",
      "dob", "cnic", "joiningDate", "employeeTypeId", "gender", "martialStatus",
      "contactNumber", "paymentMode", "religionId"
    ];

    requiredFields.forEach(field => {
      const value = formData[field];
      if (value === "" || value === null || value === undefined || (field !== 'gender' && value === 0)) {
        newErrors[field] = true;
      }
    });

    if (formData.dob) {
      const age = dayjs().diff(dayjs(formData.dob), 'year');
      if (age < 18) {
        newErrors['dob'] = true;
        toast.error("Employee must be at least 18 years old.");
      }
    }

    if (formData.contactNumber && formData.contactNumber.length < 13) {
      newErrors['contactNumber'] = true;
    }

    if (formData.cnic && formData.cnic.length < 15) {
      newErrors['cnic'] = true;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors['email'] = true;
        toast.error("Invalid email format");
      }
    }

    if (formData.paymentMode === "Bank") {
      if (!formData.accountTitle || !formData.accountNumber) {
        newErrors['accountTitle'] = true;
        newErrors['accountNumber'] = true;
      }
    }

    if (formData.paymentMode) {
      if (!formData.debitAccountId) newErrors['debitAccountId'] = true;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields correctly.");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    let payload = { ...formData };

    if (!payload.eobi) payload.eobi = "";
    payload.repportToId = payload.repportToId || 0;

    if (payload.paymentMode === "Cash") {
      payload.bankBranchId = 0;
      payload.accountTitle = "";
      payload.accountNumber = "";
    } else {
      payload.bankBranchId = payload.bankBranchId || 0;
    }

    try {
      if (editId) {
        await dispatch(UpdateEmployee({ ...payload, id: editId })).unwrap();

      } else {
        await dispatch(AddEmployee(payload)).unwrap();
        toast.success("Employee added successfully");
      }
      navigate(routes.campusEmployee);
    } catch (e: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">{editId ? "Edit Campus Employee" : "Add Campus Employee"}</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">HR</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={routes.campusEmployee}>Campus Employees</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {editId ? "Edit" : "Add"} Campus Employee
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <Spin spinning={fetching}>
              <div className="row">
                {(userLevel === 1 || userLevel === 2) && (
                  <div className="col-md-6 mb-3">
                    <label>Campus <span className="text-danger">*</span></label>
                    <CommonSelect3
                      options={campuses}
                      name="campusId"
                      value={getSelected(campuses, formData.campusId)}
                      onChange={(opt) => handleSelectUpdate("campusId", opt)}
                      placeholder="Select Campus"
                      className={errors.campusId ? "border-danger" : ""}
                    />
                  </div>
                )}
                <div className="col-md-6 mb-3">
                  <label>Employee Key</label>
                  <input type="text" className="form-control" value={formData.employeeKey} disabled />
                </div>

                <div className="col-md-4 mb-3">
                  <label>First Name <span className="text-danger">*</span></label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={`form-control ${errors.firstName ? 'border-danger' : ''}`} />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Middle Name</label>
                  <input name="middleName" value={formData.middleName} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Father's Name</label>
                  <input name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className={`form-control ${errors.email ? 'border-danger' : ''}`} />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Contact Number <span className="text-danger">*</span></label>
                  <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className={`form-control ${errors.contactNumber ? 'border-danger' : ''}`} />
                </div>
                <div className="col-md-6 mb-3">
                  <label>CNIC <span className="text-danger">*</span></label>
                  <input name="cnic" value={formData.cnic} onChange={handleInputChange} className={`form-control ${errors.cnic ? 'border-danger' : ''}`} placeholder="XXXXX-XXXXXXX-X" />
                </div>

                <div className="col-md-4 mb-3">
                  <label>DOB <span className="text-danger">*</span></label>
                  <input type="date" name="dob" max={dayjs().subtract(18, 'year').format("YYYY-MM-DD")} value={formData.dob} onChange={handleInputChange} className={`form-control ${errors.dob ? 'border-danger' : ''}`} />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Joining Date <span className="text-danger">*</span></label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className={`form-control ${errors.joiningDate ? 'border-danger' : ''}`} />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Confirmation Date</label>
                  <input type="date" name="confirmationDate" value={formData.confirmationDate} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-md-4 mb-3">
                  <label>Gender <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={gender}
                    name="gender"
                    value={getSelected(gender, formData.gender)}
                    onChange={(opt) => handleSelectUpdate("gender", opt)}
                    placeholder="Select Gender"
                    className={errors.gender ? "border-danger" : ""}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Marital Status <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={maritalStatuses}
                    name="martialStatus"
                    value={getSelected(maritalStatuses, formData.martialStatus)}
                    onChange={(opt) => handleSelectUpdate("martialStatus", opt)}
                    placeholder="Select Status"
                    className={errors.martialStatus ? "border-danger" : ""}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Religion <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={religions}
                    name="religionId"
                    value={getSelected(religions, formData.religionId)}
                    onChange={(opt) => handleSelectUpdate("religionId", opt)}
                    placeholder="Select Religion"
                    className={errors.religionId ? "border-danger" : ""}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label>Department <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={mappedDepartments}
                    name="departmentId"
                    value={getSelected(mappedDepartments, formData.departmentId)}
                    onChange={(opt) => handleSelectUpdate("departmentId", opt)}
                    placeholder="Select Department"
                    className={errors.departmentId ? "border-danger" : ""}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Designation <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={mappedDesignations}
                    name="designationId"
                    value={getSelected(mappedDesignations, formData.designationId)}
                    onChange={(opt) => handleSelectUpdate("designationId", opt)}
                    placeholder="Select Designation"
                    className={errors.designationId ? "border-danger" : ""}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Employee Type <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={mappedEmpTypes}
                    name="employeeTypeId"
                    value={getSelected(mappedEmpTypes, formData.employeeTypeId)}
                    onChange={(opt) => handleSelectUpdate("employeeTypeId", opt)}
                    placeholder="Select Employee Type"
                    className={errors.employeeTypeId ? "border-danger" : ""}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Report To (Optional)</label>
                  <CommonSelect3
                    options={reportToList}
                    name="repportToId"
                    value={getSelected(reportToList, formData.repportToId)}
                    onChange={(opt) => handleSelectUpdate("repportToId", opt)}
                    placeholder="Select Employee"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>EOBI (Optional)</label>
                  <input name="eobi" value={formData.eobi} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-12 mt-2 mb-2"><h5 className="border-bottom pb-2">Payment Details</h5></div>

                <div className="col-md-6 mb-3">
                  <label>Payment Mode <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={paymentModes}
                    name="paymentMode"
                    value={getSelected(paymentModes, formData.paymentMode)}
                    onChange={(opt) => {
                      handleSelectUpdate("paymentMode", opt);
                      setFormData((prev: any) => ({ ...prev, debitAccountId: 0 }));
                    }}
                    placeholder="Select Mode"
                    className={errors.paymentMode ? "border-danger" : ""}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>{formData.paymentMode} Head <span className="text-danger">*</span></label>
                  <CommonSelect3
                    options={formData.paymentMode === "Cash" ? mappedCashHeads : mappedBankHeads}
                    name="debitAccountId"
                    value={getSelected(formData.paymentMode === "Cash" ? mappedCashHeads : mappedBankHeads, formData.debitAccountId)}
                    onChange={(opt) => handleSelectUpdate("debitAccountId", opt)}
                    placeholder={`Select ${formData.paymentMode} Head`}
                    className={errors.debitAccountId ? "border-danger" : ""}
                  />
                </div>

                {formData.paymentMode === "Bank" && (
                  <>
                    <div className="col-md-4 mb-3">
                      <label>Bank Name</label>
                      <CommonSelect3
                        options={bankList}
                        name="bankBranchId"
                        value={getSelected(bankList, formData.bankBranchId)}
                        onChange={(opt) => handleSelectUpdate("bankBranchId", opt)}
                        placeholder="Select Bank"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Account Title <span className="text-danger">*</span></label>
                      <input name="accountTitle" value={formData.accountTitle} onChange={handleInputChange} className={`form-control ${errors.accountTitle ? 'border-danger' : ''}`} />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Account Number <span className="text-danger">*</span></label>
                      <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className={`form-control ${errors.accountNumber ? 'border-danger' : ''}`} />
                    </div>
                  </>
                )}
              </div>

              <div className="text-end">
                <button className="btn btn-light me-3" onClick={() => navigate(routes.campusEmployee)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onSubmit}
                  disabled={loading || !!(editId && !formData.isActive)}
                >
                  {loading ? 'Submitting...' : (editId && !formData.isActive) ? 'Inactive (Cannot Edit)' : 'Submit'}
                </button>
              </div>
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCampusEmployee;
