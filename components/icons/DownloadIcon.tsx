import React from 'react';

interface DownloadIconProps {
  className?: string;
}

const DownloadIcon: React.FC<DownloadIconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={`w-5 h-5 ${className || ''}`}
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L6.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586V7z" 
      clipRule="evenodd" 
    />
    <path d="M4 14a1 1 0 01-1-1V7a1 1 0 112 0v6a1 1 0 01-1 1zM16 14a1 1 0 01-1-1V7a1 1 0 112 0v6a1 1 0 01-1 1z" />
  </svg>
);

export default DownloadIcon;