import React, { useState, useMemo } from 'react';
import { DataRecord, ChartDataPoint } from '../types';
import MultiSelectDropdown from './MultiSelectDropdown';
import ChartCard from './ChartCard';
import BarChartComponent from './BarChartComponent';
import KpiCard from './KpiCard';
import NoData from './NoData';

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


interface StateAnalysisDashboardProps {
  allData: DataRecord[];
  availableStates: string[]; // Should not include "All"
  quantityFormatter: (value: number) => string;
  currencyFormatter: (value: number) => string;
}

const StateAnalysisDashboard: React.FC<StateAnalysisDashboardProps> = ({
  allData,
  availableStates,
  quantityFormatter,
  currencyFormatter,
}) => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const stateFilteredData = useMemo(() => {
    if (selectedStates.length === 0) return [];
    return allData.filter(record => selectedStates.includes(record.state));
  }, [allData, selectedStates]);

  const totalQuintals = useMemo(() => {
    return stateFilteredData.reduce((sum, record) => sum + (Number(record.totalQty) || 0), 0);
  }, [stateFilteredData]);

  const totalOrderAmount = useMemo(() => {
    return stateFilteredData.reduce((sum, record) => sum + (Number(record.orderAmount) || 0), 0);
  }, [stateFilteredData]);

  const salesByCityData = useMemo((): ChartDataPoint[] => {
    if (stateFilteredData.length === 0) return [];
    const aggregation = stateFilteredData.reduce((acc, record) => {
      const city = record.cityName?.trim() || 'Unknown City';
      acc[city] = (acc[city] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 15); 
  }, [stateFilteredData]);

  const salesByBrokerData = useMemo((): ChartDataPoint[] => {
    if (stateFilteredData.length === 0) return [];
    const aggregation = stateFilteredData.reduce((acc, record) => {
      const broker = record.brokerName?.trim() || 'Unknown Broker';
      acc[broker] = (acc[broker] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 15); 
  }, [stateFilteredData]);

  const salesByDistrictData = useMemo((): ChartDataPoint[] => {
    if (stateFilteredData.length === 0) return [];
    const aggregation = stateFilteredData.reduce((acc, record) => {
      const district = record.district?.trim() || 'Unknown District';
      acc[district] = (acc[district] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 15);
  }, [stateFilteredData]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">State-wise Sales Analysis</h2>
        <MultiSelectDropdown
          id="state-select"
          label="Select State(s) to Analyze:"
          options={availableStates}
          selectedOptions={selectedStates}
          onChange={setSelectedStates}
          height="h-48"
        />
      </div>
      
      {selectedStates.length === 0 && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
          <p className="text-slate-400 text-lg">Please select one or more states to view their sales details.</p>
        </div>
      )}

      {selectedStates.length > 0 && stateFilteredData.length === 0 && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center">
          <NoData message={`No data found for selected state(s): ${selectedStates.join(', ')}.`} />
        </div>
      )}

      {selectedStates.length > 0 && stateFilteredData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <KpiCard title="Total Quintals Sold in State(s)" value={quantityFormatter(totalQuintals)} icon={<SalesIcon />} />
            <KpiCard title="Total Order Value in State(s)" value={currencyFormatter(totalOrderAmount)} icon={<AmountIcon />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartCard title={`Sales by City in: ${selectedStates.join(', ').substring(0,50)}${selectedStates.join(', ').length > 50 ? '...' : ''} (Top 15)`}>
              <BarChartComponent 
                data={salesByCityData} 
                dataKey="value" 
                xAxisKey="name" 
                valueFormatter={quantityFormatter}
                name="Quintals Sold"
                layout="horizontal"
                truncateLabelLength={10}
              />
            </ChartCard>
            <ChartCard title={`Sales by Broker in: ${selectedStates.join(', ').substring(0,50)}${selectedStates.join(', ').length > 50 ? '...' : ''} (Top 15)`}>
              <BarChartComponent 
                data={salesByBrokerData} 
                dataKey="value" 
                xAxisKey="name" 
                valueFormatter={quantityFormatter}
                name="Quintals Sold"
                layout="horizontal"
                truncateLabelLength={10}
              />
            </ChartCard>
            <ChartCard title={`Sales by District in: ${selectedStates.join(', ').substring(0,50)}${selectedStates.join(', ').length > 50 ? '...' : ''} (Top 15)`}>
              <BarChartComponent 
                data={salesByDistrictData} 
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

export default StateAnalysisDashboard;