import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllEmployees } from '../../../../store/apps/campus-employee';

export const useEmployeesList = (campusId) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.campusEmployee);

  useEffect(() => {
    if (campusId) {
      const filter = {
        pageNo: 1,
        pageSize: 10000,
        campusId: campusId,
        isActive: true,
      };

      dispatch(GetAllEmployees(filter));
    }
  }, [dispatch, campusId]);

  const options = useMemo(() => {
    return [
      { value: "", label: "-- SELECT EMPLOYEE --" },
      ...(data || []).map((item) => ({
        value: item.id,
        label: `${item.firstName} ${item.lastName}${item.employeeKey ? ` (${item.employeeKey})` : ""}`,
      })),
    ];
  }, [data]);

  return options;
};
