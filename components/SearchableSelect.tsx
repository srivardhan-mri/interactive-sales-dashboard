import React, { useState, useMemo } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SearchableSelectProps {
  id: string;
  label: string;
  allOptions: string[]; // Raw list of options, WITHOUT "All"
  selectedValue: string;
  onChange: (value: string) => void;
  allOptionValue: string; // e.g., ALL_FILTER_OPTION
  allOptionText: string; // e.g., "All States"
  searchPlaceholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  allOptions,
  selectedValue,
  onChange,
  allOptionValue,
  allOptionText,
  searchPlaceholder = "Search...",
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return allOptions;
    }
    return allOptions.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allOptions, searchTerm]);

  const commonSelectClasses = "w-full pl-3 pr-10 py-2 text-base border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md appearance-none";
  const commonInputClasses = "w-full px-3 py-1.5 mb-1 text-sm border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-md";

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={commonInputClasses}
        aria-controls={`${id}-select`}
      />
      <div className="relative">
        <select
          id={`${id}-select`}
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
          className={commonSelectClasses}
          aria-label={label}
        >
          <option value={allOptionValue}>{allOptionText}</option>
          {filteredOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5" />
      </div>
    </div>
  );
};

export default SearchableSelect;
