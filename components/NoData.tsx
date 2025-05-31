import React from 'react';

interface NoDataProps {
  message?: string;
  small?: boolean;
}

const NoData: React.FC<NoDataProps> = ({ message = "No data available to display.", small = false }) => {
  return (
    <div className={`flex justify-center items-center h-full ${small ? 'py-4' : 'py-8'}`}>
      <p className={`text-slate-400 italic ${small ? 'text-sm' : 'text-base'}`}>{message}</p>
    </div>
  );
};

export default NoData;