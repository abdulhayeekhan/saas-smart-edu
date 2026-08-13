import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetCities } from '../../../../store/apps/city';

export const useCities = (stateId) => {
  const dispatch = useDispatch();
  const { data = [] } = useSelector((state) => state.cities);

  useEffect(() => {
    if (!stateId) return; // ✅ correct
    dispatch(GetCities(stateId));
  }, [dispatch, stateId]);

  const filtermap = data.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return [
    { value: "", label: "-- SELECT ACCOUNT --" },
    ...filtermap,
  ];
};