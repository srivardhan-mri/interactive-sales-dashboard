
import React, { useState } from 'react';
import { DataRecord } from '../types';
import NoData from './NoData';

interface DataGridProps {
  data: DataRecord[];
}

const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl mt-6 sm:mt-8"><NoData message="No data matches the current filters." /></div>;
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const headers: { key: keyof DataRecord; label: string }[] = [
    { key: 'date', label: 'Date' },
    { key: 'vchNo', label: 'Vch No.'},
    { key: 'partyName', label: 'Party Name' },
    { key: 'brokerName', label: 'Broker Name' },
    { key: 'salesMan', label: 'Sales Man' },
    { key: 'state', label: 'State' },
    { key: 'district', label: 'District' }, 
    { key: 'cityName', label: 'City' },
    { key: 'productCat', label: 'Product Cat.' },
    { key: 'totalQty', label: 'Total Qty (Quintals)' },
    { key: 'orderAmount', label: 'Order Amount' },
  ];
  
  const formatValue = (key: keyof DataRecord, value: any): string => {
    if (value === null || value === undefined) return '';
    if (key === 'orderAmount') {
      return typeof value === 'number' ? value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
    }
    if (key === 'totalQty') {
      return typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);
    }
    if (key === 'date') {
        if (value instanceof Date) {
            return value.toLocaleDateString('en-CA'); // YYYY-MM-DD
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`; // DD/MM/YYYY format
        }
        return String(value); 
    }
    return String(value);
  };


  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4">Detailed Records</h2>
      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-850">
            <tr>
              {headers.map((header) => (
                <th key={header.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {paginatedData.map((record) => (
              <tr key={record.id} className="hover:bg-slate-750 transition-colors duration-150">
                {headers.map((header) => (
                  <td key={`${record.id}-${header.key}`} className="px-4 py-3 whitespace-nowrap text-sm text-slate-200">
                    {formatValue(header.key, record[header.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-700">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
