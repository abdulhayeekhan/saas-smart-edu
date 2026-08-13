import { useState, useEffect } from 'react';
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_BASE_URL;

export const useLastFinancialYearId = () => {
  const [lastYearId, setLastYearId] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseURL}/api/FinancialYear/GetFinancialYears`)
      .then(res => {
        const financialYears = res.data.data; // array of financial years
        if (Array.isArray(financialYears) && financialYears.length > 0) {
          const lastYear = financialYears[financialYears.length - 1]; // get last item
          setLastYearId(lastYear.id ?? null);
        } else {
          setLastYearId(null);
        }
      })
      .catch(err => {
        console.error(err);
        setLastYearId(null);
      });
  }, []);

  return lastYearId;
};

export const useLastFinancialYear = () => {
  const [lastYear, setLastYear] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseURL}/api/FinancialYear/GetFinancialYears`)
      .then(res => {
        const financialYears = res.data.data; // array of financial years
        if (Array.isArray(financialYears) && financialYears.length > 0) {
          const lastYearItem = financialYears[financialYears.length - 1]; // get last item
          const name = lastYearItem.name; // e.g., "2026-27"
          if (name && typeof name === 'string') {
            // Split by '-' and take the last part
            const endYearStr = name.split('-')[1] ?? name.split('-')[0];
            const endYear = parseInt(endYearStr, 10);
            setLastYear(`20${isNaN(endYear) ? null : endYear}`);
          } else {
            setLastYear(null);
          }
        } else {
          setLastYear(null);
        }
      })
      .catch(err => {
        console.error(err);
        setLastYear(null);
      });
  }, []);
  return lastYear;
};
