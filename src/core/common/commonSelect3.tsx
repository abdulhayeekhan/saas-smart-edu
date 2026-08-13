import Select from "react-select";
import React, { useState, useEffect } from "react";

type Option<T = string | number> = {
  value: T;
  label: string;
  customLabel?: React.ReactNode;
};

type SelectProps<T = string | number> = {
  options: Option<T>[];
  value?: Option<T> | null;       // controlled value
  defaultValue?: Option<T>;       
  className?: string;
  onChange?: (option: Option<T> | null) => void;
  loading?: boolean;
  name?: string;
  isDisabled?: boolean;
  placeholder?: string;
};

const CommonSelect3 = <T extends string | number>({
  options,
  value,
  defaultValue,
  className,
  onChange,
  loading,
  name,
  isDisabled,
  placeholder
}: SelectProps<T>) => {

  // internal state but synced with parent
  const [selectedOption, setSelectedOption] = useState<Option<T> | null>(
    value ?? defaultValue ?? null
  );

  // 🔥 Sync when `value` changes from parent
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(value);
    }
  }, [value]);

  // 🔥 Sync when defaultValue changes (initial load only)
  useEffect(() => {
    if (defaultValue) {
      setSelectedOption(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (option: Option<T> | null) => {
    setSelectedOption(option);
    onChange?.(option);
  };


  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder || "Select"}
      isLoading={loading}
      isDisabled={isDisabled || loading}
      isSearchable={true}
      name={name}
      formatOptionLabel={(option) => option.customLabel || option.label}
    />
  );
};

export default CommonSelect3;
