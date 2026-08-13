import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSessions } from '../../../../store/apps/sessions';

export const useAcademicSessions = (regionId) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.sessions);

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
    dispatch(GetSessions(activeRegionId));
  }, [dispatch, activeRegionId]);

  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [{ value: "", label: "SELECT SESSION" }];

    const formattedSessions = data
      .map((item) => ({
        value: item.id,
        label: item.name,
      }))
      .sort((a, b) => b.value - a.value);

    return [
      { value: "", label: "SELECT SESSION" },
      ...formattedSessions
    ];
  }, [data]);
};