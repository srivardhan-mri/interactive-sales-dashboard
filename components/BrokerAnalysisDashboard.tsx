import React, { useState, useMemo, useEffect } from 'react';
import { DataRecord, ChartDataPoint } from '../types';
import { STATE_ABBREVIATIONS } from '../constants'; 
import MultiSelectDropdown from './MultiSelectDropdown';
import ChartCard from './ChartCard';
import BarChartComponent from './BarChartComponent';
import KpiCard from './KpiCard'; 
import NoData from './NoData';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface IconProps {
  className?: string;
}

const SalesIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m00v-.75c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const AmountIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);


interface BrokerAnalysisDashboardProps {
  allData: DataRecord[];
  availableBrokerNames: string[];
  availableFiscalYears: string[];
  allFiscalYearsOption: string;
  quantityFormatter: (value: number) => string;
  currencyFormatter: (value: number) => string;
}

const BrokerAnalysisDashboard: React.FC<BrokerAnalysisDashboardProps> = ({
  allData,
  availableBrokerNames,
  availableFiscalYears,
  allFiscalYearsOption,
  quantityFormatter,
  currencyFormatter,
}) => {
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>(allFiscalYearsOption);

  useEffect(() => {
    // Reset fiscal year if it's no longer in the available list (e.g. data reloaded)
    // and it's not the "All" option
    if (selectedFiscalYear !== allFiscalYearsOption && !availableFiscalYears.includes(selectedFiscalYear)) {
        setSelectedFiscalYear(allFiscalYearsOption);
    }
  }, [availableFiscalYears, selectedFiscalYear, allFiscalYearsOption]);

  const brokerFilteredData = useMemo(() => {
    if (selectedBrokers.length === 0) return [];
    let filtered = allData.filter(record => selectedBrokers.includes(record.brokerName));
    
    if (selectedFiscalYear !== allFiscalYearsOption) {
      filtered = filtered.filter(record => record.fiscalYear === selectedFiscalYear);
    }
    return filtered;
  }, [allData, selectedBrokers, selectedFiscalYear, allFiscalYearsOption]);

  const totalQuintals = useMemo(() => {
    return brokerFilteredData.reduce((sum, record) => sum + (Number(record.totalQty) || 0), 0);
  }, [brokerFilteredData]);

  const totalOrderAmount = useMemo(() => {
    return brokerFilteredData.reduce((sum, record) => sum + (Number(record.orderAmount) || 0), 0);
  }, [brokerFilteredData]);

  const salesByLocationData = useMemo((): ChartDataPoint[] => {
    if (brokerFilteredData.length === 0) return [];
    const aggregation = brokerFilteredData.reduce((acc, record) => {
      const stateName = record.state || 'Unknown State';
      const abbreviatedState = STATE_ABBREVIATIONS[stateName] || stateName;
      let location = `${record.cityName || 'Unknown City'}, ${abbreviatedState}`.trim();
      if (location === "Unknown City, Unknown State" || location.startsWith(",")) {
        location = "Unknown Location";
      }
      acc[location] = (acc[location] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 15); 
  }, [brokerFilteredData]);

  const salesByPartyData = useMemo((): ChartDataPoint[] => {
    if (brokerFilteredData.length === 0) return [];
    const aggregation = brokerFilteredData.reduce((acc, record) => {
      const party = record.partyName.trim() || "Unknown Party";
      acc[party] = (acc[party] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 15); 
  }, [brokerFilteredData]);

  const commonSelectClasses = "w-full pl-3 pr-10 py-2 text-base border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md appearance-none";
  
  const fySuffix = selectedFiscalYear === allFiscalYearsOption ? "" : ` (${selectedFiscalYear})`;
  const dashboardTitle = `Broker Performance Analysis${fySuffix}`;
  const brokerSelectionTitle = selectedBrokers.join(', ').substring(0,50) + (selectedBrokers.join(', ').length > 50 ? '...' : '');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">{dashboardTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <MultiSelectDropdown
              id="broker-select"
              label="Select Broker(s) to Analyze:"
              options={availableBrokerNames}
              selectedOptions={selectedBrokers}
              onChange={setSelectedBrokers}
              height="h-48"
            />
            <div className="relative">
                <label htmlFor="broker-fiscal-year-filter" className="block text-sm font-medium text-slate-300 mb-1">
                    Filter by Fiscal Year:
                </label>
                <select
                    id="broker-fiscal-year-filter"
                    value={selectedFiscalYear}
                    onChange={(e) => setSelectedFiscalYear(e.target.value)}
                    className={commonSelectClasses}
                    aria-label="Filter by fiscal year for broker analysis"
                    disabled={availableFiscalYears.length === 0 && selectedFiscalYear === allFiscalYearsOption}
                >
                    <option value={allFiscalYearsOption}>{allFiscalYearsOption}</option>
                    {availableFiscalYears.map((fy) => ( 
                    <option key={fy} value={fy}>
                        {fy}
                    </option>
                    ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-9 text-slate-400 pointer-events-none h-5 w-5" />
                 {availableFiscalYears.length === 0 && selectedFiscalYear === allFiscalYearsOption && (
                    <p className="mt-1 text-xs text-slate-400">No specific fiscal years available in current data.</p>
                )}
            </div>
        </div>
      </div>

      {selectedBrokers.length === 0 && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
          <p className="text-slate-400 text-lg">Please select one or more brokers to view their performance details.</p>
        </div>
      )}

      {selectedBrokers.length > 0 && brokerFilteredData.length === 0 && (
         <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
          <NoData message={`No data found for selected broker(s): ${brokerSelectionTitle}${fySuffix}.`} />
        </div>
      )}

      {selectedBrokers.length > 0 && brokerFilteredData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <KpiCard title={`Total Quintals Sold${fySuffix}`} value={quantityFormatter(totalQuintals)} icon={<SalesIcon />} />
            <KpiCard title={`Total Order Value${fySuffix}`} value={currencyFormatter(totalOrderAmount)} icon={<AmountIcon />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartCard title={`Sales by Location for: ${brokerSelectionTitle}${fySuffix} (Top 15)`}>
              <BarChartComponent 
                data={salesByLocationData} 
                dataKey="value" 
                xAxisKey="name" 
                valueFormatter={quantityFormatter}
                name="Quintals Sold"
                layout="horizontal"
                truncateLabelLength={10} 
              />
            </ChartCard>
            <ChartCard title={`Sales by Party for: ${brokerSelectionTitle}${fySuffix} (Top 15)`}>
              <BarChartComponent 
                data={salesByPartyData} 
                dataKey="value" 
                xAxisKey="name" 
                valueFormatter={quantityFormatter}
                name="Quintals Sold"
                layout="horizontal"
                truncateLabelLength={10}
              />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default BrokerAnalysisDashboard;
