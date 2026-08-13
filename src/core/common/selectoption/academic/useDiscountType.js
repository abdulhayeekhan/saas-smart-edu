import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  GetDiscountTypes } from '../../../../store/apps/discount-type';

export const useDiscountType = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.discountType);

  useEffect(() => {
    dispatch(GetDiscountTypes());
  }, [dispatch]);

  return useMemo(() => {
    // 1. Create the base array with the placeholder
    const options = [
      { value: "", label: "-- SELECT DISCOUNT TYPE --" }
    ];

    // 2. Map the data and merge it if data exists
    if (data && Array.isArray(data)) {
      const mappedData = data.map(item => ({
        value: String(item.id), // Converting to string to match your earlier Type error fix
        label: item.name,
      }));
      
      return [...options, ...mappedData];
    }

    return options;
  }, [data]);
};