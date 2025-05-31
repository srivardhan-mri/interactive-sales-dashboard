import React from 'react';

interface LoadingSpinnerProps {
  size?: string; // e.g., 'h-8 w-8' or 'h-16 w-16'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'h-12 w-12' }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-sky-500 ${size}`}></div>
    </div>
  );
};

export default LoadingSpinner;