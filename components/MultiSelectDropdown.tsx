
import React from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  height?: string; // e.g., 'h-40' for Tailwind height
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  selectedOptions,
  onChange,
  className = '',
  height = 'h-32', // Default height
}) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions, option => option.value);
    onChange(values);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          multiple
          value={selectedOptions}
          onChange={handleSelectChange}
          className={`w-full ${height} px-3 py-2 text-base border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md appearance-none scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-700`}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option} value={option} className="py-1.5 px-2 hover:bg-sky-600 hover:text-white rounded-sm">
              {option}
            </option>
          ))}
        </select>
        {/* Chevron is not very useful for multiselect, consider removing or finding alternative indication */}
         {/* <ChevronDownIcon className="absolute right-3 top-3 text-slate-400 pointer-events-none" /> */}
      </div>
      {selectedOptions.length > 0 && (
        <div className="mt-1.5 text-xs text-slate-400">
            Selected: {selectedOptions.length} broker(s)
            {/* Selected: {selectedOptions.join(', ')} ({selectedOptions.length}) */}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
