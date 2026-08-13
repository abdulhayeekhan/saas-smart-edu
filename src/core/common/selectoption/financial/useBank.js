import axios from "axios";
import { useEffect, useState } from "react";

const baseURL = process.env.REACT_APP_API_BASE_URL;

export const useBanks = () => {
  const [options, setOptions] = useState([
    { value: "", label: "-- SELECT ACCOUNT --" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Most APIs wrap data in a 'data' property. 
        // We destructure { data } from the Axios response.
        const response = await axios.post(`${baseURL}/api/AccountBank/GetAll`);
        console.log("Raw API Response:", response?.data?.data); // Debug log to check the structure of the response
        // Handle standard API response structures (data.data or just data)
        const rawList = response.data?.data || response.data || [];

        const mappedData = rawList.map((item) => ({
          value: item.id,
          label: item.name
        }));

        setOptions([
          { value: "", label: "-- SELECT ACCOUNT --" },
          ...mappedData
        ]);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
      }
    };

    fetchData();
    // Removed campusId and dispatch since they aren't used inside this hook
    // If you need this to refresh when campus changes, pass campusId as an argument
  }, []); 

  return options;
};