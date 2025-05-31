import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DataRecord } from '../../types';
import NoData from '../NoData';
import DownloadIcon from '../icons/DownloadIcon';

interface PartyMonthlyPerformanceReportProps {
  data: DataRecord[];
  targetFiscalYear: string;
  quantityFormatter: (value: number) => string;
  fiscalMonths: string[];
  selectedBrokers: string[]; 
}

interface MonthlyPartyData {
  partyName: string;
  monthlyQuintals: { [month: string]: number };
  monthlyOrders: { [month: string]: number };
  totalQuintals: number;
  totalOrders: number;
}

const PartyMonthlyPerformanceReport: React.FC<PartyMonthlyPerformanceReportProps> = ({
  data,
  targetFiscalYear,
  quantityFormatter,
  fiscalMonths,
  selectedBrokers, 
}) => {
  const reportData = useMemo((): MonthlyPartyData[] => {
    const filteredByFY = data.filter(record => record.fiscalYear === targetFiscalYear);
    if (filteredByFY.length === 0) return [];

    const aggregation: Record<string, MonthlyPartyData> = {};

    filteredByFY.forEach(record => {
      if (!record.partyName) return;

      if (!aggregation[record.partyName]) {
        aggregation[record.partyName] = {
          partyName: record.partyName,
          monthlyQuintals: fiscalMonths.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
          monthlyOrders: fiscalMonths.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
          totalQuintals: 0,
          totalOrders: 0,
        };
      }

      const recordDate = new Date(record.date);
      const monthIndex = recordDate.getUTCMonth();
      
      let fiscalMonthShortName = '';
      if (monthIndex >= 3) { 
          fiscalMonthShortName = fiscalMonths[monthIndex - 3];
      } else { 
          fiscalMonthShortName = fiscalMonths[monthIndex + 9];
      }
      
      if (fiscalMonthShortName && aggregation[record.partyName].monthlyQuintals.hasOwnProperty(fiscalMonthShortName)) {
        aggregation[record.partyName].monthlyQuintals[fiscalMonthShortName] += (Number(record.totalQty) || 0);
        aggregation[record.partyName].monthlyOrders[fiscalMonthShortName] += 1;
      }
      
      aggregation[record.partyName].totalQuintals += (Number(record.totalQty) || 0);
      aggregation[record.partyName].totalOrders += 1;
    });

    return Object.values(aggregation).sort((a, b) => b.totalQuintals - a.totalQuintals);
  }, [data, targetFiscalYear, fiscalMonths]);

  const handleDownloadExcel = () => {
    if (reportData.length === 0) return;

    const quintalsSheetData = reportData.map(party => {
      const row: any = { 'Party Name': party.partyName };
      fiscalMonths.forEach(month => {
        row[month] = party.monthlyQuintals[month] || 0;
      });
      row['Grand Total Quintals'] = party.totalQuintals;
      return row;
    });

    const ordersSheetData = reportData.map(party => {
      const row: any = { 'Party Name': party.partyName };
      fiscalMonths.forEach(month => {
        row[month] = party.monthlyOrders[month] || 0;
      });
      row['Grand Total Orders'] = party.totalOrders;
      return row;
    });

    const wb = XLSX.utils.book_new();
    const wsQuintals = XLSX.utils.json_to_sheet(quintalsSheetData);
    const wsOrders = XLSX.utils.json_to_sheet(ordersSheetData);

    XLSX.utils.book_append_sheet(wb, wsQuintals, "Quintals per Month");
    XLSX.utils.book_append_sheet(wb, wsOrders, "Orders per Month");

    let brokerPrefix = '';
    if (selectedBrokers && selectedBrokers.length > 0) {
      const firstBroker = selectedBrokers[0];
      brokerPrefix = firstBroker.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 5).replace(/ /g, '_');
      if (brokerPrefix) {
        brokerPrefix += '_';
      }
    }

    XLSX.writeFile(wb, `${brokerPrefix}Party_Monthly_Qtl_Orders_${targetFiscalYear.replace(' ', '_')}.xlsx`);
  };

  const tableBaseClasses = "min-w-full divide-y divide-slate-700 text-sm";
  const thClasses = "px-3 py-2.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider";
  const tdClasses = "px-3 py-2.5 whitespace-nowrap text-slate-200";
  const numericTdClasses = `${tdClasses} text-right`;
  const buttonClasses = "px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors flex items-center";


  if (reportData.length === 0) {
    return (
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-slate-100">Party Monthly Performance for {targetFiscalYear}</h3>
        </div>
        <NoData message={`No data available for ${targetFiscalYear} with the current broker selection.`} small />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Quintals per Month - {targetFiscalYear}</h3>
          <button
            onClick={handleDownloadExcel}
            className={buttonClasses}
            aria-label="Download Quintals and Orders Report (Excel)"
          >
            <DownloadIcon className="mr-1.5 h-4 w-4" />
            Download Report
          </button>
        </div>
        <div className="overflow-x-auto rounded-md">
          <table className={tableBaseClasses}>
            <thead className="bg-slate-850">
              <tr>
                <th scope="col" className={thClasses}>Party Name</th>
                {fiscalMonths.map(month => <th key={`qtl-h-${month}`} scope="col" className={`${thClasses} text-right`}>{month}</th>)}
                <th scope="col" className={`${thClasses} text-right`}>Grand Total</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {reportData.map(party => (
                <tr key={`qtl-r-${party.partyName}`} className="hover:bg-slate-750 transition-colors duration-150">
                  <td className={tdClasses}>{party.partyName}</td>
                  {fiscalMonths.map(month => (
                    <td key={`qtl-d-${party.partyName}-${month}`} className={numericTdClasses}>
                      {party.monthlyQuintals[month] ? quantityFormatter(party.monthlyQuintals[month]).replace(' Qtl','') : '0'}
                    </td>
                  ))}
                  <td className={numericTdClasses}>{quantityFormatter(party.totalQuintals).replace(' Qtl','')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Orders per Month - {targetFiscalYear}</h3>
           <button
            onClick={handleDownloadExcel}
            className={buttonClasses}
            aria-label="Download Quintals and Orders Report (Excel)"
          >
            <DownloadIcon className="mr-1.5 h-4 w-4" />
            Download Report
          </button>
        </div>
        <div className="overflow-x-auto rounded-md">
          <table className={tableBaseClasses}>
            <thead className="bg-slate-850">
              <tr>
                <th scope="col" className={thClasses}>Party Name</th>
                {fiscalMonths.map(month => <th key={`ord-h-${month}`} scope="col" className={`${thClasses} text-right`}>{month}</th>)}
                <th scope="col" className={`${thClasses} text-right`}>Grand Total</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {reportData.map(party => (
                <tr key={`ord-r-${party.partyName}`} className="hover:bg-slate-750 transition-colors duration-150">
                  <td className={tdClasses}>{party.partyName}</td>
                  {fiscalMonths.map(month => (
                    <td key={`ord-d-${party.partyName}-${month}`} className={numericTdClasses}>
                      {party.monthlyOrders[month] || '0'}
                    </td>
                  ))}
                  <td className={numericTdClasses}>{party.totalOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartyMonthlyPerformanceReport;
