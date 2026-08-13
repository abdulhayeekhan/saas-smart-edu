import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAdmissions } from '../../../../store/apps/admissions';

export const useAdmissions = (params = {}) => {
  const dispatch = useDispatch();

  // Extract values inside the hook body
  const { 
    externalCampusId, 
    externalGradeId, 
    externalSectionId, 
    externalsearch = '' 
  } = params;

  const { data: datalist = [], loading } = useSelector((state) => state.admissions);
  console.log("externalCampusId:", externalCampusId);
  console.log("externalGradeId:", externalGradeId);
  const [pageNo, setPageNo] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPageNo(1);
  }, [externalCampusId, externalGradeId, externalSectionId, externalsearch]);

  useEffect(() => {
    const filterBody = {
      pageNo,
      pageSize: 10000,
      gradeId: externalGradeId || null, // Ensure 0 or undefined becomes null for API
      sectionId: externalSectionId || null,
      campusId: externalCampusId || 0,
      isEnabled: true,
      search: externalsearch
    };
    console.log("Fetching Admissions with filters:", filterBody);
    dispatch(GetAdmissions(filterBody));
  }, [dispatch, pageNo, externalCampusId, externalGradeId, externalSectionId, externalsearch]);

  const studentOptions = useMemo(() => {
    if (!datalist?.length) return [{ value: "", label: "SELECT STUDENT" }];

    const formatted = datalist
      .map((item) => {
        let regNo = item.studentNumber || item.admissionNumber || "N/A";
        if (regNo !== "N/A") {
          regNo = String(regNo).slice(-4);
        }
        const name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
        const fatherName = item.fatherName || "N/A";
        return {
          value: item.id,
          label: `${regNo} - ${name} - ${fatherName}`,
          customLabel: (
            <span>
              {regNo} - <strong>{name}</strong> - {fatherName}
            </span>
          ),
          status: item.status
        };
      })
      .sort((a, b) => b.value - a.value);

    return [{ value: "", label: "SELECT STUDENT" }, ...formatted];
  }, [datalist]);

  return { studentOptions, loading, setPageNo };
};