
import React from 'react';
import { FilterOptions } from '../types';
import { ALL_FILTER_OPTION, ALL_FISCAL_YEARS_OPTION } from '../constants';
import FilterIcon from './icons/FilterIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import UploadIcon from './icons/UploadIcon';
import SearchableSelect from './SearchableSelect';

interface FilterPanelProps {
  availableStates: string[]; // Raw list, without "All"
  availableProductCategories: string[]; // Raw list, without "All"
  availableSalesMen: string[]; // Raw list, without "All"
  availableBrokerNames: string[]; // Raw list, without "All"
  availableCityNames: string[]; // Raw list, without "All"
  availableDistricts: string[]; // Added district: Raw list, without "All"
  availableFiscalYears: string[]; // Includes ALL_FISCAL_YEARS_OPTION
  filters: FilterOptions;
  onFilterChange: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  onClearFilters: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFileName: string | null;
  uploadError: string | null;
  onClearUpload: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  availableStates,
  availableProductCategories,
  availableSalesMen,
  availableBrokerNames,
  availableCityNames,
  availableDistricts, // Added district
  availableFiscalYears,
  filters,
  onFilterChange,
  onClearFilters,
  onFileUpload,
  uploadedFileName,
  uploadError,
  onClearUpload,
}) => {
  const commonSelectClasses = "w-full pl-3 pr-10 py-2 text-base border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md appearance-none";
  const commonInputClasses = "w-full px-3 py-2 text-base border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md";
  const readOnlyInputClasses = "w-full px-3 py-2 text-base border-slate-600 bg-slate-750 text-slate-400 sm:text-sm rounded-md cursor-not-allowed";

  const isFiscalYearSelected = filters.selectedFiscalYear !== ALL_FISCAL_YEARS_OPTION;

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl mb-6 sm:mb-8">
      <div className="flex items-center mb-4 pb-3 border-b border-slate-700">
        <FilterIcon className="text-sky-400 mr-2.5 flex-shrink-0 h-5 w-5" />
        <h3 className="text-lg font-semibold text-slate-100">Filter & Upload Data</h3>
      </div>
      
      <div className="mb-6 pb-6 border-b border-slate-700">
        <h4 className="text-md font-semibold text-slate-100 mb-3 flex items-center">
          <UploadIcon className="mr-2 text-sky-400" />
          Upload Excel File
        </h4>
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx, .xls"
          onChange={onFileUpload}
          className="block w-full text-sm text-slate-300
            file:mr-4 file:py-2 file:px-3
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-sky-600 file:text-white
            hover:file:bg-sky-700 cursor-pointer transition-colors"
          aria-label="Upload Excel file"
        />
        {uploadedFileName && (
          <div className="mt-2 text-sm text-emerald-400">
            Loaded: {uploadedFileName}
            <button 
              onClick={onClearUpload} 
              className="ml-2 text-xs text-rose-400 hover:text-rose-300 underline"
              aria-label="Clear uploaded file and use mock data"
            >
              (Clear & Use Mock Data)
            </button>
          </div>
        )}
        {uploadError && (
          <p className="mt-2 text-sm text-rose-500" role="alert">Error: {uploadError}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          Expected columns: Party Name, Broker Name, City Name, Product Category, RRMA Number, State, District, Date, Total Qty, Sales Man, Vch No., Order amount.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5 mb-4">
        <div className="relative"> {/* Fiscal Year - Standard Select */}
          <label htmlFor="fiscal-year-filter" className="block text-sm font-medium text-slate-300 mb-1">
            Fiscal Year
          </label>
          <select
            id="fiscal-year-filter"
            value={filters.selectedFiscalYear}
            onChange={(e) => onFilterChange('selectedFiscalYear', e.target.value)}
            className={commonSelectClasses}
            aria-label="Filter by fiscal year"
          >
            {availableFiscalYears.map((fy) => ( 
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-9 text-slate-400 pointer-events-none" />
        </div>
        <div>
          <label htmlFor="start-date-filter" className="block text-sm font-medium text-slate-300 mb-1">
            Start Date {isFiscalYearSelected && <span className="text-xs text-sky-400">(Auto)</span>}
          </label>
          <input
            type="date"
            id="start-date-filter"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className={isFiscalYearSelected ? readOnlyInputClasses : commonInputClasses}
            readOnly={isFiscalYearSelected}
            aria-label="Filter by start date"
            aria-disabled={isFiscalYearSelected}
          />
        </div>
        <div>
          <label htmlFor="end-date-filter" className="block text-sm font-medium text-slate-300 mb-1">
            End Date {isFiscalYearSelected && <span className="text-xs text-sky-400">(Auto)</span>}
          </label>
          <input
            type="date"
            id="end-date-filter"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className={isFiscalYearSelected ? readOnlyInputClasses : commonInputClasses}
            readOnly={isFiscalYearSelected}
            aria-label="Filter by end date"
            aria-disabled={isFiscalYearSelected}
          />
        </div>
        
        <SearchableSelect
          id="state-filter"
          label="State"
          allOptions={availableStates}
          selectedValue={filters.state}
          onChange={(value) => onFilterChange('state', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All States"
          searchPlaceholder="Search states..."
        />

        <SearchableSelect
          id="district-filter" 
          label="District"
          allOptions={availableDistricts}
          selectedValue={filters.district}
          onChange={(value) => onFilterChange('district', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All Districts"
          searchPlaceholder="Search districts..."
        />

        <SearchableSelect
          id="city-filter"
          label="City Name"
          allOptions={availableCityNames}
          selectedValue={filters.cityName}
          onChange={(value) => onFilterChange('cityName', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All Cities"
          searchPlaceholder="Search cities..."
        />

        <SearchableSelect
          id="product-cat-filter"
          label="Product Category"
          allOptions={availableProductCategories}
          selectedValue={filters.productCat}
          onChange={(value) => onFilterChange('productCat', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All Categories"
          searchPlaceholder="Search categories..."
        />
        
        <SearchableSelect
          id="salesman-filter"
          label="Sales Man"
          allOptions={availableSalesMen}
          selectedValue={filters.salesMan}
          onChange={(value) => onFilterChange('salesMan', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All Sales Men"
          searchPlaceholder="Search sales men..."
        />

        <SearchableSelect
          id="broker-filter"
          label="Broker Name"
          allOptions={availableBrokerNames}
          selectedValue={filters.brokerName}
          onChange={(value) => onFilterChange('brokerName', value)}
          allOptionValue={ALL_FILTER_OPTION}
          allOptionText="All Brokers"
          searchPlaceholder="Search brokers..."
        />
        
        <div className="flex items-end sm:col-start-1 md:col-start-auto lg:col-start-4"> 
             <button
                onClick={onClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-rose-500 transition-colors duration-150"
                aria-label="Clear all filters"
             >
                Clear All Filters
             </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
