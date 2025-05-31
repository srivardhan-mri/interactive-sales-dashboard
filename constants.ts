
import { DataRecord } from './types';

export const PRODUCT_CATEGORIES: string[] = ["Raw Rice", "Boiled Rice", "Broken Rice", "Bran", "Param"];
export const STATES: string[] = ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Maharashtra", "Uttar Pradesh", "Gujarat", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Haryana", "Himachal Pradesh", "Jharkhand", "Kerala", "Madhya Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tripura", "Uttarakhand", "West Bengal"];
export const SALES_PEOPLE: string[] = ["Salesperson A", "Salesperson B", "Salesperson C"]; 
export const CITIES: string[] = ["Hyderabad", "Vijayawada", "Chennai", "Bangalore", "Mumbai", "Lucknow", "Ahmedabad", "Itanagar", "Dispur", "Patna", "Raipur", "Panaji", "Chandigarh", "Shimla", "Ranchi", "Thiruvananthapuram", "Bhopal", "Imphal", "Shillong", "Aizawl", "Kohima", "Bhubaneswar", "Jaipur", "Gangtok", "Agartala", "Dehradun", "Kolkata"];
export const BROKER_NAMES: string[] = ["Broker X", "Broker Y", "Broker Z", "Broker Alpha", "Broker Beta"];
export const DISTRICTS: string[] = ["North District", "South District", "East District", "West District", "Central District", "Urban District", "Rural District"]; // Added sample districts


export const CHART_COLORS: string[] = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#06b6d4', // cyan-500
];

export const ALL_FILTER_OPTION = "All";
export const ALL_FISCAL_YEARS_OPTION = "All Fiscal Years";


// Maps Excel column headers (case-sensitive) to DataRecord keys
export const EXCEL_COLUMN_MAP: { [key: string]: keyof DataRecord } = {
  'Party Name': 'partyName',
  'Broker Name': 'brokerName',
  'City Name': 'cityName',
  'Product Category': 'productCat',
  'RRMA Number': 'rrmaNum',
  'State': 'state',
  'District': 'district', // Added District mapping
  'Date': 'date',
  'Total Qty': 'totalQty',
  'Sales Man': 'salesMan',
  'Vch No.': 'vchNo',
  'Order amount': 'orderAmount',
};

export const STATE_ABBREVIATIONS: { [key: string]: string } = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chhattisgarh": "CG",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TG",
  "Tripura": "TR",
  "Uttarakhand": "UK",
  "Uttar Pradesh": "UP",
  "West Bengal": "WB"
};

export const FISCAL_MONTHS_SHORT: string[] = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];