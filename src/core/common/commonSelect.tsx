import React, { useEffect, useState } from "react";
import Select from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  defaultValue?: Option;
  className?: string;
  styles?: any; 
}

const CommonSelect: React.FC<SelectProps> = ({ options, defaultValue, className }) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(defaultValue);

  // const customStyles = {
  //   option: (base: any, state: any) => ({
  //     ...base,
  //     color: "#6A7287",
  //     backgroundColor: state.isSelected ? "#ddd" : "white",
  //     cursor: "pointer",
  //     "&:hover": {
  //       backgroundColor: state.isFocused ? "#3D5EE1" : "blue",
  //       color: state.isFocused ? "#fff" : "#6A7287",
  //     },
  //   }),
  // };

  const handleChange = (option: Option | null) => {
    setSelectedOption(option || undefined);
  };
  useEffect(() => {
    setSelectedOption(defaultValue || undefined);
  }, [defaultValue])
  
  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder="Select"
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      menuPosition="fixed"
      styles={{
        menuPortal: (base: any) => ({ ...base, zIndex: 99999 }),
        menu: (base: any) => ({ ...base, zIndex: 99999, backgroundColor: "#ffffff" }),
      }}
    />
  );
};

export default CommonSelect;
