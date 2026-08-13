import { useEffect, useState,useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetCities } from '../../../../store/apps/city';
import axios from "axios";
const baseURL = process.env.REACT_APP_API_BASE_URL;

export const useCitiesList = () => {
  const [citieslist, setCitiesList] = useState([]);
  useEffect(() => {
    const GetCitieslist = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/Address/GetCities`);
        const allcities = [
          { value: null, label: "Select" }, // default option
          ...(response?.data?.data?.map(city => ({
            value: city.id,
            label: city.name,
          })) || [])
        ]
        setCitiesList(allcities)
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    }
    GetCitieslist()
  }, [])

  return citieslist;
}