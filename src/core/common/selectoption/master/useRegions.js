import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllRegions } from '../../../../store/apps/regions';

const useRegionsList = () => {
  const dispatch = useDispatch();
  const { data, loaded } = useSelector((state) => state.region);

  useEffect(() => {
    if (!loaded) {
      dispatch(GetAllRegions({ pageNo: 1, pageSize: 1000 }));
    }
  }, [dispatch, loaded]);

  return useMemo(() => ([
    { value: null, label: "Select" },
    ...data.map(r => ({
      value: r.id,
      label: r.name,
    }))
  ]), [data]);
};

export default useRegionsList