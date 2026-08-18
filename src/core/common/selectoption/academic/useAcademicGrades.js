import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetGrades } from '../../../../store/apps/grades';
import { GetCampusByID } from '../../../../store/apps/campus-management';

export const useAcademicGrades = (regionId) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.grades);

  const loginInfo = JSON.parse(localStorage.getItem('loginInfo') || '{}');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const userLevel = Number(loginInfo?.userLevel || userData?.data?.userLevel || 0);
  const userLevelId = Number(loginInfo?.userLevelId || userData?.data?.userLevelId || 0);

  const [campusRegionId, setCampusRegionId] = useState(0);

  let activeRegionId = regionId ? Number(regionId) : 0;
  if (!activeRegionId) {
    if (userLevel === 2) {
      activeRegionId = userLevelId;
    } else if (userLevel === 3) {
      activeRegionId = campusRegionId || Number(
        loginInfo?.regionId ||
        userData?.data?.regionId ||
        userData?.data?.tblCampus?.regionId ||
        userData?.data?.campus?.regionId ||
        0
      );
    }
  }

  useEffect(() => {
    if (userLevel === 3 && userLevelId && !activeRegionId) {
      dispatch(GetCampusByID(userLevelId)).then((res) => {
        if (res.payload && res.payload.regionId) {
          setCampusRegionId(Number(res.payload.regionId));
        }
      });
    }
  }, [userLevel, userLevelId, activeRegionId, dispatch]);

  useEffect(() => {
    if (activeRegionId) {
      dispatch(GetGrades(activeRegionId));
    } else if (userLevel === 1) {
      dispatch(GetGrades());
    }
  }, [dispatch, activeRegionId, userLevel]);

  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [{ value: 0, label: "SELECT GRADE" }];

    const seen = new Set();
    const unique = [];
    for (const item of data) {
      const key = item.id ?? item.name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    const filtermap = unique.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    return [{ value: 0, label: "SELECT GRADE" }, ...filtermap];
  }, [data]);
};