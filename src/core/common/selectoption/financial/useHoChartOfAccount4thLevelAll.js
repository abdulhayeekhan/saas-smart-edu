import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetAccountsLevelWise } from "../../../../store/apps/ho-coa";

export const useHoChartOfAccount4thLevelAll = (campusId) => {
  const dispatch = useDispatch();

  const [options, setOptions] = useState([
    { value: "", label: "-- SELECT ACCOUNT --" }
  ]);

  useEffect(() => {
    // reset immediately when campusId changes
    setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);

    const fetchData = async () => {
      try {
        const data = await dispatch(
          GetAccountsLevelWise({
            accountLevel: 4,
            campusId: campusId ?? 0 // null → HO
          })
        ).unwrap();

        const mappedData = (data ?? []).map(item => ({
          value: item.id,
          label: `${item.accountCode} - ${item.accountName}`
        }));

        setOptions([
          { value: "", label: "-- SELECT ACCOUNT --" },
          ...mappedData
        ]);
      } catch (error) {
        // API error / 404 → no stale data
        setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
      }
    };

    fetchData();
  }, [campusId, dispatch]);

  return options;
};
