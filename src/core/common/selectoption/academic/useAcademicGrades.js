import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetGrades } from '../../../../store/apps/grades';

export const useAcademicGrades = (regionId) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.grades);

  const loginInfo = JSON.parse(localStorage.getItem('loginInfo') || '{}');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  let activeRegionId = regionId;
  if (!activeRegionId) {
    if (loginInfo?.userLevel === 2) {
      activeRegionId = loginInfo?.userLevelId;
    } else {
      activeRegionId = loginInfo?.regionId || userData?.data?.regionId || userData?.data?.tblCampus?.regionId;
    }
  }

  useEffect(() => {
    dispatch(GetGrades(activeRegionId));
  }, [dispatch, activeRegionId]);

  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [{ value: 0, label: "SELECT GRADE" }];

    const filtermap = data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
    return [{ value: 0, label: "SELECT GRADE" }, ...filtermap];
  }, [data]);
};