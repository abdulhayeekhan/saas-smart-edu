import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetReligions } from '../../../../store/apps/religions';

export const useReligionsList = () => {
  const dispatch = useDispatch();
  const { data, loaded } = useSelector((state) => state.religion);

  useEffect(() => {
      dispatch(GetReligions());
  }, [dispatch, loaded]);

  // ✅ Memoized mapping
  const options = useMemo(() => {
    return [
      { value: "", label: "-- SELECT RELIGION --" },
      ...data.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    ];
  }, [data]);

  return options;
};