import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

export const useCampusesList = (customRegionId) => {
  const { data } = useSelector((state) => state.campus);
  const [localCampuses, setLocalCampuses] = useState([]);

  const loginInfoString = localStorage.getItem('loginInfo');
  const userDataString = localStorage.getItem('userData');
  const loginInfo = loginInfoString ? JSON.parse(loginInfoString) : {};
  const userData = userDataString ? JSON.parse(userDataString) : {};

  const userLevel = Number(loginInfo?.userLevel || userData?.data?.userLevel || userData?.userLevel || 0);
  const userLevelId = Number(loginInfo?.userLevelId || userData?.data?.userLevelId || userData?.userLevelId || 0);

  // Regional Manager (userLevel === 2) is strictly bound to their assigned regionId (userLevelId)
  let effectiveRegionId;
  if (userLevel === 2 && userLevelId) {
    effectiveRegionId = userLevelId;
  } else if (customRegionId !== undefined && customRegionId !== null && customRegionId !== "" && Number(customRegionId) > 0) {
    effectiveRegionId = Number(customRegionId);
  } else {
    effectiveRegionId = undefined;
  }

  useEffect(() => {
    let isMounted = true;
    const fetchCampuses = async () => {
      const filter = {
        pageNo: 1,
        pageSize: 10000,
        isEnabled: true,
        ...(effectiveRegionId ? { regionId: effectiveRegionId } : {}),
      };

      try {
        const storedToken = localStorage.getItem('accessToken') || '';
        const response = await axios.post(`${baseURL}/api/campus/getall`, filter, {
          headers: storedToken ? { Authorization: storedToken } : {},
        });
        if (isMounted && response?.data?.data && Array.isArray(response.data.data)) {
          setLocalCampuses(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch campuses in useCampusesList", err);
      }
    };

    fetchCampuses();
    return () => {
      isMounted = false;
    };
  }, [effectiveRegionId]);

  const options = useMemo(() => {
    let sourceData = [];

    if (localCampuses && Array.isArray(localCampuses) && localCampuses.length > 0) {
      sourceData = localCampuses;
    } else if (data && Array.isArray(data) && data.length > 0) {
      if (effectiveRegionId) {
        const regionNum = Number(effectiveRegionId);
        const matches = data.filter(
          (item) =>
            Number(
              item?.regionId ||
              item?.regionID ||
              item?.region_id ||
              item?.region?.id ||
              item?.tblRegion?.id ||
              0
            ) === regionNum
        );
        sourceData = matches;
      } else {
        sourceData = data;
      }
    }

    return [
      { value: "", label: "-- SELECT CAMPUS --" },
      ...sourceData.map((item) => ({
        value: item.id,
        label: `${item.name}${item.cityName || item.city ? ` (${item.cityName || item.city})` : ''}`,
      })),
    ];
  }, [localCampuses, data, effectiveRegionId]);

  return options;
};