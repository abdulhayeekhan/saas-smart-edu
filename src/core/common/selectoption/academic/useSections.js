import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSectionsByCampus } from '../../../../store/apps/section';

export const useSectionList = (campusId) => {
  const dispatch = useDispatch();
  const { data, loaded } = useSelector((state) => state.section);

  useEffect(() => {
    if (!loaded || campusId) {
      dispatch(GetSectionsByCampus(campusId));
    }
  }, [dispatch, campusId, loaded]);

  // ✅ Memoized mapping
  const options = useMemo(() => {
    return [
      { value: "", label: "-- SELECT SECTION --" },
      ...data.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    ];
  }, [data]);

  return options;
};