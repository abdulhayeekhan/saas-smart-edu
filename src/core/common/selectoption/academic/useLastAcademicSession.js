import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSessions } from '../../../../store/apps/sessions';


export const useLastAcademicSession = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.sessions);

  useEffect(() => {
    dispatch(GetSessions());
  }, [dispatch]);

  return useMemo(() => {
    // Transform data for Select components
    const options = data.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    // Get the ID of the last session in the array
    const lastSessionId = data.length > 0 ? data[data.length - 1].id : null;

    return {
      options,
      lastSessionId,
      loading
    };
  }, [data, loading]);
}