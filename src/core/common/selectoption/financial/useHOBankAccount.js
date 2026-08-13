import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetChildAccount } from "../../../../store/apps/ho-coa";

export const useHOBankAccount = (campusId) => {
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
            id: 177,
            campusId: campusId ?? 0
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
  }, [campusId, dispatch]);

  return options;
};
