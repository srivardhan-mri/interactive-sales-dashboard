
export interface DataRecord {
  id: string;
  partyName: string;
  brokerName: string;
  cityName: string;
  productCat: string;
  rrmaNum: string;
  state: string;
  district?: string; // Added district
  date: string; // ISO date string YYYY-MM-DD
  totalQty: number;
  salesMan: string;
  vchNo: string;
  orderAmount: number;
  fiscalYear?: string; // e.g., "FY 2023-2024"
}

export interface ChartDataPoint {
  name: string | number; // Allow number for potential time-series x-axis down the line
  value: number;
  // Optional fill for PieChart Cells
  fill?: string;
  // Optional additional values for multi-bar charts or complex tooltips
  [key: string]: any; 
}

export interface FilterOptions {
  state: string;
  productCat: string;
  salesMan: string;
  brokerName: string;
  cityName: string;
  district: string; // Added district
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  selectedFiscalYear: string; // e.g., "FY 2023-2024" or ALL_FISCAL_YEARS_OPTION
}

export type ViewMode = 'main' | 'brokerAnalysis' | 'stateAnalysis' | 'reports';

// For KPI cards
export interface KpiCardProps {
  title: string;
  value: string;
  icon?: React.ReactElement<{ className?: string }>;
}