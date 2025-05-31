
import React from 'react';

interface FilterIconProps {
  className?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={`w-5 h-5 ${className || ''}`}
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.033a.75.75 0 01-1.11.674l-2.75-1.528a.75.75 0 01-.44-.674v-1.505a2.25 2.25 0 00-.659-1.59L3.257 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default FilterIcon;
