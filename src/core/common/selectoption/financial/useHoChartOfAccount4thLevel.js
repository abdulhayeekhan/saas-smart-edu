import { useEffect, useState, useMemo, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAccountsLevelWise } from '../../../../store/apps/ho-coa';

export const useHoChartOfAccount4thLevel = (campusId) => {
  const dispatch = useDispatch();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions([{ value: "", label: "-- SELECT ACCOUNT --" }]);
    const fetchData = async () => {
      const finalCampusId = campusId ?? 0;
      const body = { accountLevel: 4, campusId: finalCampusId };
      const response = await dispatch(GetAccountsLevelWise(body));
      if (GetAccountsLevelWise.fulfilled.match(response)) {
        const mappedData =
          (response.payload ?? [])
            .filter(
              item => item.nature === "Asset" || item.nature === "Liability" || item.nature ===  "Expense"
            )
            .map(item => ({
              value: item.id,
              label: `${item.accountCode} - ${item.accountName}`
            }));

        setOptions([
          { value: "", label: "-- SELECT ACCOUNT --" },
          ...mappedData
        ]);
      }
    };

    fetchData();
  }, [campusId, dispatch]);

  return options;
};