import Select from "react-select";
import React, { useState, useEffect } from "react";

// type Option = {
//   value: number; // 🔧 Use 'number' here to match academicYear
//   label: string;
// };

// type SelectProps = {
//   options: Option[];
//   defaultValue?: Option;
//   className?: string;
// };

type Option<T = string | number> = {
  value: T;
  label: string;
};

type SelectProps<T = string | number> = {
  options: Option<T>[];
  defaultValue?: Option<T>;
  className?: string;
  onChange?: (option: Option<T> | null) => void;
  loading?: boolean;
  name?: string;
};

const CommonSelect2: React.FC<SelectProps> = ({ options, defaultValue, className, onChange, loading, name }) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(defaultValue);

  const handleChange = (option: Option | null) => {
    setSelectedOption(option || undefined);
    if (onChange) onChange(option); 
  };

  useEffect(() => {
    setSelectedOption(defaultValue || undefined);
  }, [defaultValue]);

  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder="Select"
      isLoading={loading}
      isDisabled={loading}
      isSearchable={true}
    />
  );
};

export default CommonSelect2;
