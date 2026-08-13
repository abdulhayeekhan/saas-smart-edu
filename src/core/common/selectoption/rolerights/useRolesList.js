import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllRoles } from '../../../../store/apps/roles';

export const useRolesList = (roleType) => {
  const dispatch = useDispatch();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await dispatch(GetAllRoles());
      if (response.payload) {
        // ✅ Filter by roleType
        const filteredRoles = roleType
          ? response.payload.filter((item) => item.roleType === roleType)
          : response.payload;

        const mappedData = filteredRoles.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        // Add default option
        setOptions([{ value: "", label: "-- SELECT ROLE --" }, ...mappedData]);
      }
    };

    fetchData();
  }, [dispatch, roleType]);

  return options;
}