import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

export const useCampusesList = (customRegionId) => {
  const { data } = useSelector((state) => state.campus);
  const [localCampuses, setLocalCampuses] = useState([]);

  const userInfoString = localStorage.getItem('userData');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userLevel = userInfo?.data?.userLevel;
  const userLevelId = userInfo?.data?.userLevelId;

  // Regional Manager (userLevel === 2) is strictly bound to their assigned regionId
  const effectiveRegionId = customRegionId !== undefined ? customRegionId : (userLevel === 2 ? userLevelId : undefined);

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
    const sourceData = localCampuses.length > 0 ? localCampuses : (data || []);
    let filteredData = sourceData;

    if (effectiveRegionId) {
      const regionNum = Number(effectiveRegionId);
      const matches = filteredData.filter(
        (item) =>
          Number(item?.regionId) === regionNum ||
          Number(item?.regionID) === regionNum ||
          Number(item?.region_id) === regionNum ||
          Number(item?.region?.id) === regionNum
      );
      if (matches.length > 0) {
        filteredData = matches;
      }
    }

    return [
      { value: "", label: "-- SELECT CAMPUS --" },
      ...filteredData.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.cityName || item.city || ''})`,
      })),
    ];
  }, [localCampuses, data, effectiveRegionId]);

  return options;
};