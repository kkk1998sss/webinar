import React, { useState } from 'react';

interface CustomSelectTriggerProps {
  value: string;
  onClick: () => void;
  width: string;
}

const CustomSelectTrigger: React.FC<CustomSelectTriggerProps> = ({
  value,
  onClick,
  width,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`cursor-pointer rounded-md border p-2 ${width}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {value}
    </div>
  );
};

interface CustomSelectListProps {
  options: string[];
  onChange: (value: string) => void;
  onClose: () => void;
  selectedValue: string;
  width: string;
}

const CustomSelectList: React.FC<CustomSelectListProps> = ({
  options,
  onChange,
  onClose,
  selectedValue,
  width,
}) => {
  return (
    <ul
      className={`absolute left-0 top-full ${width} mt-1 rounded-md border bg-white shadow-lg`}
    >
      {options.map((option) => (
        <li
          key={option}
          role="option"
          aria-selected={selectedValue === option}
          className="cursor-pointer p-2 hover:bg-gray-200"
          onClick={() => {
            onChange(option);
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onChange(option);
              onClose();
            }
          }}
          tabIndex={0}
        >
          {option}
        </li>
      ))}
    </ul>
  );
};

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  width: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  width,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <CustomSelectTrigger
        value={value}
        onClick={() => setIsOpen(!isOpen)}
        width={width}
      />
      {isOpen && (
        <CustomSelectList
          options={options}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
          selectedValue={value}
          width={width}
        />
      )}
    </div>
  );
};

export default CustomSelect;
