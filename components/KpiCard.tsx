
import React from 'react';
import { KpiCardProps } from '../types';

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-slate-800 p-5 rounded-lg shadow-lg flex items-center space-x-4 h-full">
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-sky-600 rounded-full text-white">
          {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-300">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-50">{value}</p>
      </div>
    </div>
  );
};

export default KpiCard;
