import Select, { MultiValue, SingleValue } from "react-select";
import React, { useState, useEffect } from "react";

type Option<T = string | number> = {
  value: T;
  label: string;
};

type SelectProps<T = string | number> = {
  options: Option<T>[];
  value?: Option<T> | Option<T>[] | null; // Supports array for multi
  defaultValue?: Option<T> | Option<T>[];
  className?: string;
  onChange?: (option: any) => void; // Flexible for single or multi
  loading?: boolean;
  name?: string;
  isMulti?: boolean;
  isDisabled?: boolean;
};

const CommonSelect4 = <T extends string | number>({
  options,
  value,
  defaultValue,
  className,
  onChange,
  loading,
  name,
  isMulti = false,
  isDisabled = false,
}: SelectProps<T>) => {
  // Internal state typed to handle single object or array
  const [selectedOption, setSelectedOption] = useState<any>(
    value ?? defaultValue ?? (isMulti ? [] : null)
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(value);
    }
  }, [value]);

  const handleChange = (newValue: MultiValue<Option<T>> | SingleValue<Option<T>>) => {
    setSelectedOption(newValue);
    onChange?.(newValue);
  };

  return (
    <Select
      isMulti={isMulti}
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder="Select"
      isLoading={loading}
      // 🔥 Update this to use both loading and isDisabled
      isDisabled={loading || isDisabled}
      isSearchable={true}
      name={name}
    />
  );
};

export default CommonSelect4;