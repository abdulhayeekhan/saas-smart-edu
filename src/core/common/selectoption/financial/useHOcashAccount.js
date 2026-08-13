import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetChildAccount } from "../../../../store/apps/ho-coa";

export const useHOcashAccount = (campusId) => {
  const dispatch = useDispatch();
  const [options, setOptions] = useState([
    { value: "", label: "-- SELECT ACCOUNT --" }
  ]);

  useEffect(() => {
    // clear old data immediately on campus change
    setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);

    const fetchData = async () => {
      try {
        const finalCampusId = campusId ?? 0;

        const data = await dispatch(
          GetChildAccount({ id: 180, campusId: finalCampusId })
        ).unwrap(); // prevents stale data on failure

        const mappedData = (data ?? []).map(item => ({
          value: item.id,
          label: `${item.accountCode} - ${item.accountName}`
        }));

        setOptions([
          { value: "", label: "-- SELECT ACCOUNT --" },
          ...mappedData
        ]);
      } catch (error) {
        //API failed (404 etc) → keep dropdown empty
        setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
      }
    };

    fetchData();
  }, [campusId, dispatch]);

  return options;
};
