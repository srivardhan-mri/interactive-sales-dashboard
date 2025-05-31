import React from 'react';

interface UploadIconProps {
  className?: string;
}

const UploadIcon: React.FC<UploadIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-5 h-5 ${className || ''}`}
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M9.25 13.25V7.75H7.75V13.25H5.063L10 18.188L14.938 13.25H12.25V7.75H10.75V13.25H9.25Z" 
      clipRule="evenodd" 
    />
    <path 
      fillRule="evenodd" 
      d="M3.5 8.5V5.25H16.5V8.5H18V5.25C18 4.8375 17.8312 4.49375 17.5562 4.21875C17.2812 3.94375 16.9375 3.775 16.5 3.775H3.5C3.0625 3.775 2.71875 3.94375 2.44375 4.21875C2.16875 4.49375 2 4.8375 2 5.25V8.5H3.5Z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default UploadIcon;