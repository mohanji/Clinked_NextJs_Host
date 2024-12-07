import React, { useState } from 'react';
import Select from 'react-select';

const DropdownWithSearch = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (selected) => {
    setSelectedOption(selected);
  };

  return (
    <div>
      
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Select an option..."
        isSearchable
      />
    </div>
  );
};

export default DropdownWithSearch;
