
import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800 p-5 sm:p-6 rounded-lg shadow-xl h-full flex flex-col">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4">{title}</h2>
      <div className="flex-grow min-h-[300px] sm:min-h-[350px]"> 
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
