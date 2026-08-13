import { useEffect, useState, useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetChildAccount } from '../../../../store/apps/campus-coa';

export const useCampusDis4thLevel = () => {
  const dispatch = useDispatch();
  
    const [options, setOptions] = useState([
      { value: "", label: "-- SELECT ACCOUNT --" }
    ]);
  
    useEffect(() => {
      // clear previous options immediately when campus changes
      setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
  
      const fetchData = async () => {
        try {
          const data = await dispatch(
            GetChildAccount({
              id: 64
            })
          ).unwrap(); // prevents stale payload
  
          const mappedData = (data ?? []).map(item => ({
            value: item.id,
            label: `${item.accountCode} - ${item.accountName}`
          }));
    
          setOptions([
            { value: "", label: "-- SELECT ACCOUNT --" },
            ...mappedData
          ]);
        } catch (error) {
          //API failed / 404 → keep dropdown empty
          setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
        }
      };
  
      fetchData();
    }, [dispatch]);
  
    return options;
};