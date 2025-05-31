import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DataRecord } from '../../types';
import { getPreviousFiscalYears as utilGetPreviousFiscalYears } from '../../utils/dateUtils';
import NoData from '../NoData';
import DownloadIcon from '../icons/DownloadIcon';

interface PartyYearlyComparisonReportProps {
  data: DataRecord[];
  targetFiscalYear: string;
  quantityFormatter: (value: number) => string;
  getPreviousFiscalYears: typeof utilGetPreviousFiscalYears;
  selectedBrokers: string[]; 
}

interface YearlyPartyData {
  partyName: string;
  yearlyQuintals: { [fiscalYear: string]: number };
  grandTotalQuintals: number;
  qtlDifference: number | null;
  percentDifference: number | null;
}

const NUM_PREVIOUS_YEARS = 3;

const PartyYearlyComparisonReport: React.FC<PartyYearlyComparisonReportProps> = ({
  data,
  targetFiscalYear,
  quantityFormatter,
  getPreviousFiscalYears,
  selectedBrokers, 
}) => {
  const fiscalYearsToDisplay = useMemo(() => {
    const prevYears = getPreviousFiscalYears(targetFiscalYear, NUM_PREVIOUS_YEARS);
    return [...prevYears, targetFiscalYear];
  }, [targetFiscalYear, getPreviousFiscalYears]);

  const reportData = useMemo((): YearlyPartyData[] => {
    const relevantFYData = data.filter(record => fiscalYearsToDisplay.includes(record.fiscalYear || ''));
    if (relevantFYData.length === 0) return [];

    const aggregation: Record<string, YearlyPartyData> = {};

    relevantFYData.forEach(record => {
      if (!record.partyName) return;

      if (!aggregation[record.partyName]) {
        aggregation[record.partyName] = {
          partyName: record.partyName,
          yearlyQuintals: fiscalYearsToDisplay.reduce((acc, fy) => ({ ...acc, [fy]: 0 }), {}),
          grandTotalQuintals: 0,
          qtlDifference: null,
          percentDifference: null,
        };
      }
      
      const fy = record.fiscalYear;
      if (fy && aggregation[record.partyName].yearlyQuintals.hasOwnProperty(fy)) {
        aggregation[record.partyName].yearlyQuintals[fy] += (Number(record.totalQty) || 0);
      }
    });

    return Object.values(aggregation).map(partyData => {
      partyData.grandTotalQuintals = fiscalYearsToDisplay.reduce((sum, fy) => sum + partyData.yearlyQuintals[fy], 0);
      
      const targetFYQuintals = partyData.yearlyQuintals[targetFiscalYear];
      const previousFY = fiscalYearsToDisplay[fiscalYearsToDisplay.length - 2];
      
      if (previousFY) {
        const previousFYQuintals = partyData.yearlyQuintals[previousFY];
        if (typeof targetFYQuintals === 'number' && typeof previousFYQuintals === 'number') {
          partyData.qtlDifference = targetFYQuintals - previousFYQuintals;
          if (previousFYQuintals !== 0) {
            partyData.percentDifference = (partyData.qtlDifference / previousFYQuintals) * 100;
          } else if (targetFYQuintals > 0) {
            partyData.percentDifference = Infinity;
          } else {
            partyData.percentDifference = 0;
          }
        }
      }
      return partyData;
    }).sort((a, b) => b.grandTotalQuintals - a.grandTotalQuintals);

  }, [data, targetFiscalYear, fiscalYearsToDisplay]);

  const handleDownloadExcel = () => {
    if (reportData.length === 0) return;

    const sheetData = reportData.map(party => {
      const row: any = { 'Party Name': party.partyName };
      fiscalYearsToDisplay.forEach(fy => {
        row[fy.replace('FY ', '')] = party.yearlyQuintals[fy] || 0;
      });
      row[`Grand Total (${fiscalYearsToDisplay.length} Yrs)`] = party.grandTotalQuintals;
      
      const prevFYShort = fiscalYearsToDisplay[fiscalYearsToDisplay.length - 2]?.replace('FY ','');
      const targetFYShort = targetFiscalYear.replace('FY ','');
      row[`Qtl Diff (${prevFYShort} to ${targetFYShort})`] = party.qtlDifference === null ? '-' : party.qtlDifference;
      
      let percentDiffDisplay = '-';
      if (party.percentDifference === Infinity) {
        percentDiffDisplay = '∞';
      } else if (party.percentDifference !== null) {
        percentDiffDisplay = `${party.percentDifference.toFixed(2)}%`;
      }
      row['% Diff'] = percentDiffDisplay;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Party Yearly Comparison");

    let brokerPrefix = '';
    if (selectedBrokers && selectedBrokers.length > 0) {
      const firstBroker = selectedBrokers[0];
      brokerPrefix = firstBroker.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 5).replace(/ /g, '_');
      if (brokerPrefix) {
        brokerPrefix += '_';
      }
    }

    XLSX.writeFile(wb, `${brokerPrefix}Party_YearlySales_${targetFiscalYear.replace(' ', '_')}.xlsx`);
  };

  const tableBaseClasses = "min-w-full divide-y divide-slate-700 text-sm";
  const thClasses = "px-3 py-2.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider";
  const tdClasses = "px-3 py-2.5 whitespace-nowrap text-slate-200";
  const numericTdClasses = `${tdClasses} text-right`;
  const buttonClasses = "px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors flex items-center";


  if (reportData.length === 0) {
     return (
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
         <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Party Yearly Sales Comparison (Target: {targetFiscalYear})</h3>
        </div>
        <NoData message={`No data available for the selected fiscal years ending with ${targetFiscalYear} with the current broker selection.`} small />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-slate-100">Party Yearly Sales Comparison (Target: {targetFiscalYear})</h3>
        <button
          onClick={handleDownloadExcel}
          className={buttonClasses}
          aria-label="Download Party Yearly Sales Comparison report as Excel"
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
              {fiscalYearsToDisplay.map(fy => (
                <th key={`yr-h-${fy}`} scope="col" className={`${thClasses} text-right`}>{fy.replace('FY ', '')}</th>
              ))}
              <th scope="col" className={`${thClasses} text-right`}>Grand Total ({fiscalYearsToDisplay.length} Yrs)</th>
              <th scope="col" className={`${thClasses} text-right`}>Qtl Diff ({fiscalYearsToDisplay[fiscalYearsToDisplay.length - 2]?.replace('FY ','')} to {targetFiscalYear.replace('FY ','')})</th>
              <th scope="col" className={`${thClasses} text-right`}>% Diff</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {reportData.map(party => (
              <tr key={`yr-r-${party.partyName}`} className="hover:bg-slate-750 transition-colors duration-150">
                <td className={tdClasses}>{party.partyName}</td>
                {fiscalYearsToDisplay.map(fy => (
                  <td key={`yr-d-${party.partyName}-${fy}`} className={numericTdClasses}>
                    {party.yearlyQuintals[fy] ? quantityFormatter(party.yearlyQuintals[fy]).replace(' Qtl','') : '0'}
                  </td>
                ))}
                <td className={numericTdClasses}>{quantityFormatter(party.grandTotalQuintals).replace(' Qtl','')}</td>
                <td className={numericTdClasses}>
                  {party.qtlDifference !== null ? quantityFormatter(party.qtlDifference).replace(' Qtl','') : '-'}
                </td>
                <td className={numericTdClasses}>
                  {party.percentDifference === Infinity ? '∞' : party.percentDifference !== null ? `${party.percentDifference.toFixed(2)}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyYearlyComparisonReport;
