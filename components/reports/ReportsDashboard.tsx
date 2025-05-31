import React, { useState, useMemo, useEffect } from 'react';
import { DataRecord } from '../../types';
import { getAvailableFiscalYears, getPreviousFiscalYears } from '../../utils/dateUtils';
import PartyMonthlyPerformanceReport from './PartyMonthlyPerformanceReport';
import PartyYearlyComparisonReport from './PartyYearlyComparisonReport';
import MultiSelectDropdown from '../MultiSelectDropdown';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import LoadingSpinner from '../LoadingSpinner';
import NoData from '../NoData';


type ReportType = 'partyMonthlyPerformance' | 'partyYearlyComparison';

interface ReportsDashboardProps {
  allData: DataRecord[];
  allBrokerNamesFromData: string[]; // List of broker names (without "All")
  allFiscalYearsFromData: string[]; // List of all FYs from the entire dataset (without "All Fiscal Years")
  quantityFormatter: (value: number) => string;
  currencyFormatter: (value: number) => string;
  getPreviousFiscalYears: typeof getPreviousFiscalYears;
  fiscalMonths: string[];
  isLoading: boolean;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  allData,
  allBrokerNamesFromData,
  allFiscalYearsFromData,
  quantityFormatter,
  currencyFormatter,
  getPreviousFiscalYears: utilGetPreviousFiscalYears,
  fiscalMonths,
  isLoading,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('partyMonthlyPerformance');
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [targetFiscalYear, setTargetFiscalYear] = useState<string>('');

  const dataForReports = useMemo(() => {
    if (selectedBrokers.length === 0) return [];
    return allData.filter(record => selectedBrokers.includes(record.brokerName));
  }, [allData, selectedBrokers]);

  const fiscalYearsForReportDropdown = useMemo(() => {
    if (selectedBrokers.length === 0) return []; 
    return getAvailableFiscalYears(dataForReports);
  }, [dataForReports, selectedBrokers.length]);

  useEffect(() => {
    if (selectedBrokers.length > 0) {
        if (fiscalYearsForReportDropdown.length > 0) {
            if (!fiscalYearsForReportDropdown.includes(targetFiscalYear)) {
                 setTargetFiscalYear(fiscalYearsForReportDropdown[0]); 
            }
        } else {
            setTargetFiscalYear(''); 
        }
    } else {
        setTargetFiscalYear(''); 
    }
  }, [selectedBrokers, fiscalYearsForReportDropdown, targetFiscalYear]);


  const handleReportTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReportType(event.target.value as ReportType);
  };

  const handleFiscalYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetFiscalYear(event.target.value);
  };

  const commonSelectClasses = "w-full pl-3 pr-10 py-2 text-base border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md appearance-none";

  if (isLoading && selectedBrokers.length === 0 && allData.length === 0) { 
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-6">Generate Broker Reports</h2>
        
        <MultiSelectDropdown
          id="report-broker-select"
          label="Select Broker(s):"
          options={allBrokerNamesFromData}
          selectedOptions={selectedBrokers}
          onChange={setSelectedBrokers}
          height="h-40" 
        />
        
        {selectedBrokers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-6">
            <div className="relative">
              <label htmlFor="report-type-select" className="block text-sm font-medium text-slate-300 mb-1">
                Select Report Type
              </label>
              <select
                id="report-type-select"
                value={selectedReportType}
                onChange={handleReportTypeChange}
                className={commonSelectClasses}
                aria-label="Select report type"
              >
                <option value="partyMonthlyPerformance">Party Monthly Performance</option>
                <option value="partyYearlyComparison">Party Yearly Sales Comparison</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-9 text-slate-400 pointer-events-none h-5 w-5" />
            </div>
            <div className="relative">
              <label htmlFor="target-fiscal-year-select" className="block text-sm font-medium text-slate-300 mb-1">
                Target Fiscal Year
              </label>
              <select
                id="target-fiscal-year-select"
                value={targetFiscalYear}
                onChange={handleFiscalYearChange}
                className={commonSelectClasses}
                disabled={fiscalYearsForReportDropdown.length === 0}
                aria-label="Select target fiscal year for the report"
              >
                {fiscalYearsForReportDropdown.map(fy => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
                {fiscalYearsForReportDropdown.length === 0 && <option value="">No FYs for selected broker(s)</option>}
              </select>
              <ChevronDownIcon className="absolute right-3 top-9 text-slate-400 pointer-events-none h-5 w-5" />
            </div>
          </div>
        )}
      </div>

      {selectedBrokers.length === 0 && (
         <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
            <p className="text-slate-300 text-lg">Please select one or more brokers to generate reports.</p>
        </div>
      )}

      {selectedBrokers.length > 0 && isLoading && ( 
          <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
      )}

      {selectedBrokers.length > 0 && !isLoading && dataForReports.length === 0 && (
           <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
            <NoData message={`No data found for selected broker(s): ${selectedBrokers.join(', ')}.`} />
           </div>
      )}
      
      {selectedBrokers.length > 0 && !isLoading && dataForReports.length > 0 && !targetFiscalYear && fiscalYearsForReportDropdown.length > 0 && (
         <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
            <p className="text-slate-300 text-lg">Please select a target fiscal year for the selected broker(s).</p>
        </div>
      )}

      {selectedBrokers.length > 0 && !isLoading && dataForReports.length > 0 && targetFiscalYear && (
        <>
          {selectedReportType === 'partyMonthlyPerformance' && (
            <PartyMonthlyPerformanceReport
              data={dataForReports} 
              targetFiscalYear={targetFiscalYear}
              quantityFormatter={quantityFormatter}
              fiscalMonths={fiscalMonths}
              selectedBrokers={selectedBrokers} 
            />
          )}
          {selectedReportType === 'partyYearlyComparison' && (
            <PartyYearlyComparisonReport
              data={dataForReports} 
              targetFiscalYear={targetFiscalYear}
              quantityFormatter={quantityFormatter}
              getPreviousFiscalYears={utilGetPreviousFiscalYears}
              selectedBrokers={selectedBrokers} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReportsDashboard;
