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
import { useDiscountType } from '../../../../core/common/selectoption/academic/useDiscountType';
import useRegionsList from "../../../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../../../core/common/selectoption/master/useCampusesList";
import { FeeStructureType, FeeDetailType, GetFeeById, AddFeeStructure, UpdateFeeStructure } from "../../../../store/apps/fee-structure";
import toast from 'react-hot-toast'
import { GetAdmission, Admission, EditAdmission, UpdateFee, UpdateFeePayload } from "../../../../store/apps/admissions";
import { GetFeeByGradeSession } from "../../../../store/apps/fee-structure";


const StudentFeeModel: React.FC<any> = (isEditData) => {
    const [activeContent, setActiveContent] = useState('');
    const regionsList = useRegionsList();
    const { single } = useSelector((state: RootState) => state.admissions);

    const { data: feeStructures } = useSelector((state: RootState) => state.feeStructure);

    const dispatch = useDispatch<AppDispatch>();

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
        fatherCNIC: "",
        motherCNIC: "",
        characterCertificate: "",
        gender: 0,
        imageUrl: "",
        userId: 0,
        admissionDiscounts: []
    });

    useEffect(() => {
        dispatch(GetAdmission(isEditData.isEditData));
    }, [dispatch]);
    useEffect(() => {
        if (single?.campusId && single?.sessionId && single?.gradeId) {
            const body = {
                campusId: single.campusId,
                sessionId: single.sessionId,
                gradeId: single.gradeId
            };
            // Ensure this is dispatched if it's a Redux action
            dispatch(GetFeeByGradeSession(body));
        }
    }, [dispatch, single?.campusId, single?.sessionId, single?.gradeId]);

    useEffect(() => {
        if (single) {
            // Destructure to separate the nested list if needed
            const { admissionDiscountList, ...restOfData } = single;

            const sanitizedData: Admission = {
                ...restOfData,

                // Handle Discount List with your fallback row
                admissionDiscounts: (admissionDiscountList && admissionDiscountList.length > 0)
                    ? admissionDiscountList
                    : [],

                // --- String sanitization (using 'single' as the source) ---
                firstName: single.firstName || "",
                middleName: single.middleName || "",
                lastName: single.lastName || "",
                email: single.email || "",
                cCity: single.cCity || "",
                cProvince: single.cProvince || "",
                pCity: single.pCity || "",
                pProvince: single.pProvince || "",
                cHouseNo: single.cHouseNo || "",
                cStreetNo: single.cStreetNo || "",
                cTown: single.cTown || "",
                pHouseNo: single.pHouseNo || "",
                pStreetNo: single.pStreetNo || "",
                pTown: single.pTown || "",
                bForm: single.bForm || "",
                fatherCNIC: single.fatherCNIC ? String(single.fatherCNIC) : "",
                motherCNIC: single.motherCNIC || "",
                characterCertificate: single.characterCertificate || "",
                imageUrl: single.imageUrl || "",

                // --- ID and Logic Fallbacks ---
                cCountryId: single.cCountryId || 1,
                cProvinceId: single.cProvinceId || 1,
                pCountryId: single.pCountryId || 1,
                pProvinceId: single.pProvinceId || 1,
                pCityId: single.pCityId || single.cCityId || 0,
                referenceId: single.referenceId || 1,
                gender: single.gender || 0,

                // --- Date Formatting (ensure you import dayjs) ---
                admissionDate: single.admissionDate ? dayjs(single.admissionDate).toISOString() : dayjs().toISOString(),
                dateOfBirth: single.dateOfBirth ? dayjs(single.dateOfBirth).toISOString() : dayjs().toISOString(),
            };
            console.log("Sanitized form data from Redux 'single':", sanitizedData);
            setFormData(sanitizedData);
        }
    }, [single]); // This triggers every time 'single' changes in Redux

    const mergedFees = feeStructures[0]?.tblSMSFeeStructureDetails?.map(fee => {
        // Search in local formData instead of Redux 'single'
        const discount = formData?.admissionDiscounts?.find(
            (d: any) => Number(d.feeTypeId) === Number(fee.feeTypeId)
        );

        const disId = discount?.discountTypeId;
        const dAmount = discount?.discountAmount || 0;

        return {
            ...fee,
            discountName: discount ? discount.discountTypeName : "No Discount",
            discountTypeId: disId,
            discountAmount: dAmount,
            netAmount: (fee.amount || 0) - dAmount
        };
    }) || [];
    const totalGross = mergedFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalDiscount = mergedFees.reduce((sum, f) => sum + (f.discountAmount || 0), 0);
    const totalNet = mergedFees.reduce((sum, f) => sum + (f.netAmount || 0), 0);

    // const handleDiscountChange = (feeTypeId: number, field: string, value: any) => {
    //     setFormData((prev: any) => {
    //         if (!prev) return prev;

    //         let currentDiscounts = [...(prev.admissionDiscounts || [])];
    //         const index = currentDiscounts.findIndex(d => d.feeTypeId === feeTypeId);

    //         if (index > -1) {
    //             // Update existing entry
    //             currentDiscounts[index] = {
    //                 ...currentDiscounts[index],
    //                 [field]: value,
    //                 ...(field === 'discountAmount' ? { isOverride: true } : {})
    //             };

    //             // REMOVAL LOGIC for NEW rows only
    //             // If it's a new row (id === 0) and the user sets amount to 0, remove it
    //             if (field === 'discountAmount' && value === 0 && currentDiscounts[index].id === 0) {
    //                 currentDiscounts = currentDiscounts.filter(d => d.feeTypeId !== feeTypeId);
    //             }
    //             // Note: If id > 0, we keep the row with 0 value so the server knows to update/delete it
    //         } else if (value !== 0) {
    //             // Create new entry
    //             currentDiscounts.push({
    //                 id: 0, // Mark as new
    //                 admissionId: prev.id,
    //                 feeTypeId: feeTypeId,
    //                 discountTypeId: field === 'discountTypeId' ? value : 1,
    //                 discountAmount: field === 'discountAmount' ? value : 0,
    //                 discountPercentage: 0,
    //                 isOverride: true
    //             });
    //         }

    //         return { ...prev, admissionDiscounts: currentDiscounts };
    //     });
    // };

    const handleDiscountChange = (feeTypeId: number, field: string, value: any) => {
        // 1. Find the base fee amount for validation
        const baseFee = feeStructures[0]?.tblSMSFeeStructureDetails?.find(
            (f: any) => f.feeTypeId === feeTypeId
        );
        const maxAmount = baseFee?.amount || 0;

        // 2. If user is changing the amount, validate it
        if (field === 'discountAmount') {
            if (value > maxAmount) {
                toast.error(`Discount cannot be more than the fee amount (${maxAmount})`);
                return; // Exit and don't update state
            }
            if (value < 0) {
                toast.error("Discount cannot be negative");
                return;
            }
        }

        setFormData((prev: any) => {
            if (!prev) return prev;

            let currentDiscounts = [...(prev.admissionDiscounts || [])];
            const index = currentDiscounts.findIndex(d => d.feeTypeId === feeTypeId);

            if (index > -1) {
                currentDiscounts[index] = {
                    ...currentDiscounts[index],
                    [field]: value,
                    ...(field === 'discountAmount' ? { isOverride: true } : {})
                };

                // Remove logic for NEW rows set to 0
                if (field === 'discountAmount' && value === 0 && currentDiscounts[index].id === 0) {
                    currentDiscounts = currentDiscounts.filter(d => d.feeTypeId !== feeTypeId);
                }
            } else if (value !== 0) {
                currentDiscounts.push({
                    id: 0,
                    admissionId: prev.id,
                    feeTypeId: feeTypeId,
                    discountTypeId: field === 'discountTypeId' ? value : 1,
                    discountAmount: field === 'discountAmount' ? value : 0,
                    discountPercentage: 0,
                    isOverride: true
                });
            }

            return { ...prev, admissionDiscounts: currentDiscounts };
        });
    };
    const grades = useAcademicGrades();
    const sessions = useAcademicSessions();
    const { lastSessionId } = useLastAcademicSession();
    const feetypes = useFeeTypes()
    const discountTypes = useDiscountType()

    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const closeEditBtnRef = useRef<HTMLButtonElement>(null);
    const handleContentChange = (event: any) => {
        setActiveContent(event.target.value);
    };
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.admissionDiscounts.length === 0) {
            toast.error("No fee changes to save.");
            return;
        }

        // Filter only the relevant data needed for the UpdateFee API
        const feePayload = formData.admissionDiscounts.map((discount: any) => ({
            admissionId: formData.id, // The parent student/admission ID
            id: discount.id || 0,
            feeTypeId: discount.feeTypeId,
            discountTypeId: discount.discountTypeId,
            discountPercentage: discount.discountPercentage || 0,
            discountAmount: discount.discountAmount || 0,
            isOverride: discount.isOverride ?? true
        }));
        console.log("Prepared fee payload for submission:", feePayload);


        try {
            // We dispatch to the new UpdateFee action which expects an array
            await dispatch(UpdateFee(feePayload as UpdateFeePayload[]));
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };





    return (
        <>
            <>

                {/* Edit student Fees */}
                <div className="modal fade" id="edit_fee_details" >
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="d-flex align-items-center">
                                    <h4 className="modal-title">Edit {single?.firstName} {single?.middleName} {single?.lastName} ({single?.studentNumber} - {single?.grade}) Fee</h4>
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
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="custom-datatable-filter table-responsive">
                                            <table className="table datatable">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Fee Type</th>
                                                        <th>Amount</th>
                                                        <th>Discount Type</th>
                                                        <th>Discount Amount</th>

                                                        <th>Cur. Fee</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mergedFees?.map((fee: any) => (
                                                        <tr key={fee.feeTypeId}>
                                                            <td>
                                                                <p className="text-primary fees-group">
                                                                    {fee?.tblSMSFeeType?.name || 'N/A'}
                                                                </p>
                                                            </td>
                                                            <td>{fee.amount}</td>
                                                            <td>
                                                                <CommonSelect3
                                                                    className="select"
                                                                    options={discountTypes}
                                                                    onChange={(opt: any) => handleDiscountChange(fee.feeTypeId, 'discountTypeId', opt.value)}
                                                                    value={fee?.discountTypeId ? discountTypes.find(f => String(f?.value) === String(fee?.discountTypeId)) : discountTypes[0]}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input className="form-control" type="text" max={fee.amount} onChange={(e) => handleDiscountChange(fee.feeTypeId, 'discountAmount', Number(e.target.value))} value={fee?.discountAmount} />
                                                            </td>

                                                            <td>{fee.netAmount}</td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <th className="text-primary">
                                                            Total
                                                        </th>
                                                        <th className="text-primary">{totalGross}</th>
                                                        <td>-</td>
                                                        <th className="text-danger">{totalDiscount}</th>
                                                        <th className="text-success">{totalNet}</th>
                                                    </tr>


                                                </tbody>
                                            </table>
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
                                        disabled={loading}
                                        data-bs-dismiss="modal"
                                        className="btn btn-primary"
                                    >
                                        {loading ? "updating..." : "Update Fee"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* Edit student Fees*/}
            </>
        </>
    );
};

export default StudentFeeModel;
