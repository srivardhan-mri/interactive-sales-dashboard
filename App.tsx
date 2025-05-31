
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { DataRecord, ChartDataPoint, FilterOptions, ViewMode } from './types';
import { generateMockData } from './services/dataService';
import { 
  ALL_FILTER_OPTION, 
  ALL_FISCAL_YEARS_OPTION,
  EXCEL_COLUMN_MAP,
  STATE_ABBREVIATIONS,
  FISCAL_MONTHS_SHORT
} from './constants';
import { getFiscalYear, getFiscalYearStartEnd, getAvailableFiscalYears, getPreviousFiscalYears } from './utils/dateUtils';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import DataGrid from './components/DataGrid';
import ChartCard from './components/ChartCard';
import BarChartComponent from './components/BarChartComponent';
import PieChartComponent from './components/PieChartComponent';
import LoadingSpinner from './components/LoadingSpinner';
import BrokerAnalysisDashboard from './components/BrokerAnalysisDashboard';
import StateAnalysisDashboard from './components/StateAnalysisDashboard';
import ReportsDashboard from './components/reports/ReportsDashboard';

type FiscalYearChangeSourceType = 'user' | 'system' | 'user_date_change';

const App: React.FC = () => {
  const [allData, setAllData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('main');
  
  const fiscalYearChangeSource = useRef<FiscalYearChangeSourceType>('user');


  const getDefaultFilters = useCallback((): FilterOptions => ({
    state: ALL_FILTER_OPTION,
    productCat: ALL_FILTER_OPTION,
    salesMan: ALL_FILTER_OPTION,
    brokerName: ALL_FILTER_OPTION,
    cityName: ALL_FILTER_OPTION,
    district: ALL_FILTER_OPTION, 
    startDate: '', 
    endDate: '',
    selectedFiscalYear: ALL_FISCAL_YEARS_OPTION,
  }), []);

  const [filters, setFilters] = useState<FilterOptions>(getDefaultFilters());
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState<boolean>(false);


  const loadMockData = useCallback(() => {
    setIsLoading(true);
    setUploadedFileName(null);
    setUploadError(null);
    setTimeout(() => {
      const mockData = generateMockData(200);
      setAllData(mockData);
      setFilters(getDefaultFilters()); 
      setIsLoading(false);
      setDataInitialized(true);
    }, 500);
  }, [getDefaultFilters]);

  useEffect(() => {
    if (!dataInitialized) {
      loadMockData();
    }
  }, [dataInitialized, loadMockData]);

 const handleFilterChange = useCallback(<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prevFilters => {
        const newFilters = { ...prevFilters, [key]: value };

        if (key === 'selectedFiscalYear') {
            const fiscalYear = value as string;
            if (fiscalYear !== ALL_FISCAL_YEARS_OPTION) {
                const range = getFiscalYearStartEnd(fiscalYear);
                if (range) {
                    fiscalYearChangeSource.current = 'system'; 
                    newFilters.startDate = range.startDate;
                    newFilters.endDate = range.endDate;
                }
            } else {
                if (fiscalYearChangeSource.current !== 'user_date_change') {
                    fiscalYearChangeSource.current = 'system';
                    newFilters.startDate = '';
                    newFilters.endDate = '';
                }
            }
        } else if ((key === 'startDate' || key === 'endDate')) {
            if (fiscalYearChangeSource.current === 'user' || fiscalYearChangeSource.current === 'user_date_change') {
                 fiscalYearChangeSource.current = 'user_date_change'; 
                 newFilters.selectedFiscalYear = ALL_FISCAL_YEARS_OPTION;
            }
        }
        
        if (fiscalYearChangeSource.current === 'system') {
           fiscalYearChangeSource.current = 'user';
        } else if (fiscalYearChangeSource.current === 'user_date_change' && (key === 'startDate' || key === 'endDate')) {
           if(newFilters.selectedFiscalYear === ALL_FISCAL_YEARS_OPTION){
             fiscalYearChangeSource.current = 'user';
           }
        }
        return newFilters;
    });
}, []);


  const handleClearFilters = useCallback(() => {
    fiscalYearChangeSource.current = 'system';
    setFilters(getDefaultFilters());
    fiscalYearChangeSource.current = 'user';
  }, [getDefaultFilters]);

  const handleClearUpload = useCallback(() => {
    setUploadedFileName(null);
    setUploadError(null);
    const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = ''; 
    }
    loadMockData();
  }, [loadMockData]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadError(null);
    setUploadedFileName(null);

    try { 
      const reader = new FileReader();
      reader.onload = async (e) => {
        try { 
          const fileData = e.target?.result;
          if (!fileData) throw new Error("Failed to read file content.");

          const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const headerRowRaw = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, defval: "" })[0] as string[];
          if (!headerRowRaw || headerRowRaw.length === 0) {
            throw new Error("Excel sheet is empty or has no header row.");
          }
          
          const actualHeaderMap: { [lower: string]: string } = {};
          headerRowRaw.forEach(h => {
            const trimmedHeader = String(h).trim();
            if (trimmedHeader) {
                actualHeaderMap[trimmedHeader.toLowerCase()] = trimmedHeader;
            }
          });

          const expectedExcelHeadersCanonical = Object.keys(EXCEL_COLUMN_MAP);
          
          const missingCanonicalHeaders = expectedExcelHeadersCanonical.filter(
            expectedCanonical => !actualHeaderMap[expectedCanonical.toLowerCase()]
          );

          if (missingCanonicalHeaders.length > 0) {
            throw new Error(`Missing expected columns: ${missingCanonicalHeaders.join(', ')}. Please ensure your Excel file includes these headers (case is ignored for matching).`);
          }
          
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false, defval: null });

          if (!Array.isArray(jsonData)) { 
             throw new Error("No data rows found in the Excel sheet.");
          }
          if (jsonData.length === 0) {
             setAllData([]);
             setFilters(getDefaultFilters());
             setUploadedFileName(file.name);
             setDataInitialized(true);
             setIsLoading(false);
             if (event.target) event.target.value = '';
             return;
          }

          const transformedData: DataRecord[] = jsonData.map((row, index) => {
            const record: Partial<DataRecord> = {
              id: `excel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
            };
            let rowErrorMessages: string[] = [];
            let recordDateForFiscalYear: Date | string | number | null = null;


            for (const excelColNameCanonical of expectedExcelHeadersCanonical) {
              const dataRecordKey = EXCEL_COLUMN_MAP[excelColNameCanonical as keyof typeof EXCEL_COLUMN_MAP];
              const actualHeaderInExcel = actualHeaderMap[excelColNameCanonical.toLowerCase()];
              let value = row[actualHeaderInExcel];
              
              const isRequiredNumeric = ['orderAmount', 'totalQty'].includes(dataRecordKey);
              const isRequiredDate = dataRecordKey === 'date';

              if (value === null || value === undefined || String(value).trim() === "") {
                 if (isRequiredNumeric || isRequiredDate) {
                    rowErrorMessages.push(`Missing value for required column '${actualHeaderInExcel}'`);
                 }
                 value = isRequiredNumeric ? 0 : ''; 
              }

              if (dataRecordKey === 'date') {
                let dateStr = '';
                if (value instanceof Date && !isNaN(value.getTime())) {
                  dateStr = value.toISOString().split('T')[0];
                  recordDateForFiscalYear = value;
                } else if (typeof value === 'string' && value.trim() !== '') {
                  const dateString = value.trim();
                  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                  const ddmmyyyyMatch = dateString.match(ddmmyyyyRegex);

                  if (ddmmyyyyMatch) {
                    const day = parseInt(ddmmyyyyMatch[1], 10);
                    const month = parseInt(ddmmyyyyMatch[2], 10) - 1; 
                    const year = parseInt(ddmmyyyyMatch[3], 10);
                    const parsedDate = new Date(Date.UTC(year, month, day));
                    if (!isNaN(parsedDate.getTime()) && 
                        parsedDate.getUTCFullYear() === year && 
                        parsedDate.getUTCMonth() === month && 
                        parsedDate.getUTCDate() === day) {
                      dateStr = parsedDate.toISOString().split('T')[0];
                      recordDateForFiscalYear = parsedDate;
                    } else {
                      rowErrorMessages.push(`Invalid date in '${actualHeaderInExcel}': "${dateString}" (dd/mm/yyyy format but creates invalid date).`);
                    }
                  } else { 
                    const parsedDate = new Date(dateString); 
                    if (!isNaN(parsedDate.getTime())) {
                       const utcDate = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
                       dateStr = utcDate.toISOString().split('T')[0];
                       recordDateForFiscalYear = utcDate;
                    } else {
                       rowErrorMessages.push(`Invalid or unparseable date format for '${actualHeaderInExcel}': "${dateString}". Expected dd/mm/yyyy or ISO format (YYYY-MM-DD).`);
                    }
                  }
                } else if (typeof value === 'number') { 
                    recordDateForFiscalYear = value; 
                    const excelDate = XLSX.SSF.parse_date_code(value);
                    if (excelDate) {
                        const jsDate = new Date(Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d, excelDate.H || 0, excelDate.M || 0, excelDate.S || 0));
                        if(!isNaN(jsDate.getTime())) {
                             dateStr = jsDate.toISOString().split('T')[0];
                        } else {
                             rowErrorMessages.push(`Invalid date serial for '${actualHeaderInExcel}': "${value}" (could not convert to valid JS Date)`);
                        }
                    } else {
                        rowErrorMessages.push(`Invalid date serial for '${actualHeaderInExcel}': "${value}"`);
                    }
                } else if (String(value).trim() === '' && isRequiredDate) {
                } else if (String(value).trim() !== ''){ 
                   rowErrorMessages.push(`Unparseable date for '${actualHeaderInExcel}': "${value}"`);
                }
                record[dataRecordKey] = dateStr;

              } else if (dataRecordKey === 'orderAmount' || dataRecordKey === 'totalQty') {
                const numValue = parseFloat(String(value).replace(/[^0-9.-]+/g,""));
                if (isNaN(numValue)) {
                  if (String(value).trim() !== '') { 
                    rowErrorMessages.push(`Invalid number for '${actualHeaderInExcel}': "${value}"`);
                  }
                  record[dataRecordKey] = 0;
                } else {
                  record[dataRecordKey] = numValue;
                }
              } else {
                const stringDataKey = dataRecordKey as Exclude<keyof DataRecord, 'date' | 'orderAmount' | 'totalQty'>;
                record[stringDataKey] = String(value ?? '').trim();
              }
            }
            
            if (recordDateForFiscalYear) {
                 record.fiscalYear = getFiscalYear(recordDateForFiscalYear);
            } else if (record.date) { 
                 record.fiscalYear = getFiscalYear(record.date);
            }

            if (rowErrorMessages.length > 0) {
              throw new Error(`Error in Excel data at source row ${index + 2}: ${rowErrorMessages.join('; ')}.`);
            }
            return record as DataRecord;
          });

          setAllData(transformedData);
          setFilters(getDefaultFilters());
          setUploadedFileName(file.name);
          setDataInitialized(true); 

        } catch (parseErr: any) {
          console.error("Error parsing Excel file:", parseErr);
          setUploadError(parseErr.message || "Failed to parse Excel file. Check format, column headers, and data types.");
        } finally {
          setIsLoading(false);
          if (event.target) {
            event.target.value = ''; 
          }
        }
      };
      reader.onerror = (errorEvent) => {
        console.error("FileReader error:", errorEvent);
        setUploadError("Error reading file.");
        setIsLoading(false);
        if (event.target) event.target.value = '';
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) { 
      console.error("General file upload initiation error:", err);
      setUploadError("An unexpected error occurred preparing the file upload.");
      setIsLoading(false);
      if (event.target) event.target.value = '';
    }
  }, [getDefaultFilters]);

  // Main data filtering logic for dashboard
  useEffect(() => {
    if (!dataInitialized || currentView !== 'main') {
        if (currentView === 'main' && allData.length > 0 && filteredData.length !== allData.length) {
           const currentFiltersAreDefault = Object.keys(filters).every(
             key => filters[key as keyof FilterOptions] === getDefaultFilters()[key as keyof FilterOptions]
           );
           if (currentFiltersAreDefault) {
             setFilteredData(allData);
           }
        }
        return;
    }

    setIsLoading(true);
    const newFilteredData = allData.filter(record => {
      const recordDateStr = record.date;
      let recordDateObj: Date | null = null;
      
      if (recordDateStr && /^\d{4}-\d{2}-\d{2}$/.test(recordDateStr)) {
        const parts = recordDateStr.split('-').map(Number);
        recordDateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      }

      if (filters.startDate) {
        const startParts = filters.startDate.split('-').map(Number);
        const startDateFilter = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
        if (!recordDateObj || recordDateObj < startDateFilter) return false;
      }
      
      if (filters.endDate) {
        const endParts = filters.endDate.split('-').map(Number);
        const endDateFilter = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
        if (!recordDateObj || recordDateObj > endDateFilter) return false;
      }

      if (filters.state !== ALL_FILTER_OPTION && record.state !== filters.state) return false;
      if (filters.district !== ALL_FILTER_OPTION && record.district !== filters.district) return false;
      if (filters.cityName !== ALL_FILTER_OPTION && record.cityName !== filters.cityName) return false;
      if (filters.productCat !== ALL_FILTER_OPTION && record.productCat !== filters.productCat) return false;
      if (filters.salesMan !== ALL_FILTER_OPTION && record.salesMan !== filters.salesMan) return false;
      if (filters.brokerName !== ALL_FILTER_OPTION && record.brokerName !== filters.brokerName) return false;
      
      return true;
    });
    setFilteredData(newFilteredData);
    setIsLoading(false);
  }, [allData, filters, dataInitialized, currentView, getDefaultFilters, filteredData.length]);
  
  // --- Cascading Filter Options Derivation ---
  const dataFilteredByState = useMemo(() => {
    if (filters.state === ALL_FILTER_OPTION) return allData;
    return allData.filter(d => d.state === filters.state);
  }, [allData, filters.state]);

  const dataFilteredByStateAndDistrict = useMemo(() => {
    if (filters.district === ALL_FILTER_OPTION) return dataFilteredByState;
    return dataFilteredByState.filter(d => d.district === filters.district);
  }, [dataFilteredByState, filters.district]);
  
  const dataFilteredByGeography = useMemo(() => {
    if (filters.cityName === ALL_FILTER_OPTION) return dataFilteredByStateAndDistrict;
    return dataFilteredByStateAndDistrict.filter(d => d.cityName === filters.cityName);
  }, [dataFilteredByStateAndDistrict, filters.cityName]);

  const dataFilteredByGeoAndProduct = useMemo(() => {
    if (filters.productCat === ALL_FILTER_OPTION) return dataFilteredByGeography;
    return dataFilteredByGeography.filter(d => d.productCat === filters.productCat);
  }, [dataFilteredByGeography, filters.productCat]);
  
  const dataFilteredByGeoProdSalesMan = useMemo(() => {
    if (filters.salesMan === ALL_FILTER_OPTION) return dataFilteredByGeoAndProduct;
    return dataFilteredByGeoAndProduct.filter(d => d.salesMan === filters.salesMan);
  }, [dataFilteredByGeoAndProduct, filters.salesMan]);

  // Available options for dropdowns (raw lists, SearchableSelect adds "All")
  const availableStatesForFilterPanel = useMemo(() => 
    Array.from(new Set(allData.map(d => d.state).filter(s => s && s.trim() !== ''))).sort(), 
  [allData]);
  
  const availableDistrictsForFilterPanel = useMemo(() => 
    Array.from(new Set(dataFilteredByState.map(d => d.district).filter(s => s && s.trim() !== ''))).sort(), 
  [dataFilteredByState]);

  const availableCityNamesForFilterPanel = useMemo(() => 
    Array.from(new Set(dataFilteredByStateAndDistrict.map(d => d.cityName).filter(s => s && s.trim() !== ''))).sort(), 
  [dataFilteredByStateAndDistrict]);

  const availableProductCategoriesForFilterPanel = useMemo(() => 
    Array.from(new Set(dataFilteredByGeography.map(d => d.productCat).filter(s => s && s.trim() !== ''))).sort(), 
  [dataFilteredByGeography]);

  const availableSalesMenForFilterPanel = useMemo(() => 
    Array.from(new Set(dataFilteredByGeoAndProduct.map(d => d.salesMan).filter(s => s && s.trim() !== ''))).sort(), 
  [dataFilteredByGeoAndProduct]);

  const availableBrokerNamesForFilterPanel = useMemo(() => 
    Array.from(new Set(dataFilteredByGeoProdSalesMan.map(d => d.brokerName).filter(s => s && s.trim() !== ''))).sort(), 
  [dataFilteredByGeoProdSalesMan]);

  const availableBrokerNamesFromAllData = useMemo(() => 
    Array.from(new Set(allData.map(d => d.brokerName).filter(bn => bn && bn.trim() !== ''))).sort(), 
  [allData]);

  const fiscalYearsFromAllData = useMemo(() => getAvailableFiscalYears(allData), [allData]);
  const fiscalYearsForFilterPanel = useMemo(() => [ALL_FISCAL_YEARS_OPTION, ...fiscalYearsFromAllData], [fiscalYearsFromAllData]);

  // Effect to reset dependent filters if their selected value is no longer valid
  useEffect(() => {
    let changed = false;
    const newFilters = { ...filters };

    if (filters.district !== ALL_FILTER_OPTION && !availableDistrictsForFilterPanel.includes(filters.district)) {
        newFilters.district = ALL_FILTER_OPTION;
        changed = true;
    }
    if (filters.cityName !== ALL_FILTER_OPTION && !availableCityNamesForFilterPanel.includes(filters.cityName)) {
        newFilters.cityName = ALL_FILTER_OPTION;
        changed = true;
    }
    if (filters.productCat !== ALL_FILTER_OPTION && !availableProductCategoriesForFilterPanel.includes(filters.productCat)) {
        newFilters.productCat = ALL_FILTER_OPTION;
        changed = true;
    }
    if (filters.salesMan !== ALL_FILTER_OPTION && !availableSalesMenForFilterPanel.includes(filters.salesMan)) {
        newFilters.salesMan = ALL_FILTER_OPTION;
        changed = true;
    }
    if (filters.brokerName !== ALL_FILTER_OPTION && !availableBrokerNamesForFilterPanel.includes(filters.brokerName)) {
        newFilters.brokerName = ALL_FILTER_OPTION;
        changed = true;
    }

    if (changed) {
        setFilters(newFilters);
    }
  }, [
    filters, 
    availableDistrictsForFilterPanel, 
    availableCityNamesForFilterPanel, 
    availableProductCategoriesForFilterPanel, 
    availableSalesMenForFilterPanel, 
    availableBrokerNamesForFilterPanel
  ]);


  // Formatters
  const quantityFormatter = useCallback((value: number) => {
    if (value === undefined || value === null) return '0 Qtl';
    return `${value.toLocaleString('en-IN')} Qtl`;
  }, []);

  const currencyFormatter = useCallback((value: number) => {
    if (value === undefined || value === null) return '₹0.00';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  // Chart data calculations for Main Dashboard
  const productionByProductCatChartData = useMemo((): ChartDataPoint[] => {
    if (!filteredData.length || currentView !== 'main') return [];
    const aggregation = filteredData.reduce((acc, record) => {
      const category = record.productCat || 'Unknown';
      acc[category] = (acc[category] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [filteredData, currentView]);

  const productionByStateChartData = useMemo((): ChartDataPoint[] => {
    if (!filteredData.length || currentView !== 'main') return [];
    const aggregation = filteredData.reduce((acc, record) => {
      const stateName = record.state || 'Unknown';
      const abbreviatedState = STATE_ABBREVIATIONS[stateName] || stateName;
      acc[abbreviatedState] = (acc[abbreviatedState] || 0) + (Number(record.totalQty) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [filteredData, currentView]);
  
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  if (isLoading && !dataInitialized) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header currentView={currentView} onViewChange={handleViewChange} />
        {/* Adjust main content padding-top to account for sticky header height (approx 60px or py-3 on header + parent padding) */}
        <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 flex justify-center items-center pt-[76px] md:pt-6">
          <LoadingSpinner />
        </main>
         <footer className="text-center py-4 text-sm text-slate-400 border-t border-slate-750 mt-auto">
            Sales Dashboard &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }
  
  const renderContent = () => {
    if (isLoading && dataInitialized && currentView === 'main') { 
        // This specific loading condition is for when filters are applied on main view.
        // For other views, loading is handled within the component or not shown if data is already available.
    }

    switch (currentView) {
      case 'brokerAnalysis':
        return <BrokerAnalysisDashboard 
                  allData={allData} 
                  availableBrokerNames={availableBrokerNamesFromAllData} 
                  availableFiscalYears={fiscalYearsFromAllData}
                  allFiscalYearsOption={ALL_FISCAL_YEARS_OPTION}
                  quantityFormatter={quantityFormatter}
                  currencyFormatter={currencyFormatter}
                />;
      case 'stateAnalysis':
        return <StateAnalysisDashboard 
                  allData={allData}
                  availableStates={availableStatesForFilterPanel} 
                  availableFiscalYears={fiscalYearsFromAllData}
                  allFiscalYearsOption={ALL_FISCAL_YEARS_OPTION}
                  quantityFormatter={quantityFormatter}
                  currencyFormatter={currencyFormatter}
                />;
      case 'reports':
        return <ReportsDashboard
                  allData={allData}
                  allBrokerNamesFromData={availableBrokerNamesFromAllData} 
                  allFiscalYearsFromData={fiscalYearsFromAllData} 
                  quantityFormatter={quantityFormatter}
                  currencyFormatter={currencyFormatter}
                  getPreviousFiscalYears={getPreviousFiscalYears}
                  fiscalMonths={FISCAL_MONTHS_SHORT}
                  isLoading={isLoading && dataInitialized} // General loading state for reports
                />;
      case 'main':
      default:
        return (
          <>
            <FilterPanel
              availableStates={availableStatesForFilterPanel}
              availableProductCategories={availableProductCategoriesForFilterPanel}
              availableSalesMen={availableSalesMenForFilterPanel}
              availableBrokerNames={availableBrokerNamesForFilterPanel}
              availableCityNames={availableCityNamesForFilterPanel}
              availableDistricts={availableDistrictsForFilterPanel} 
              availableFiscalYears={fiscalYearsForFilterPanel}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onFileUpload={handleFileUpload}
              uploadedFileName={uploadedFileName}
              uploadError={uploadError}
              onClearUpload={handleClearUpload}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ChartCard title="Production (Quintals) by Product Category">
                <BarChartComponent 
                  data={productionByProductCatChartData} 
                  dataKey="value" 
                  xAxisKey="name" 
                  valueFormatter={quantityFormatter}
                  name="Production (Quintals)" 
                />
              </ChartCard>
              <ChartCard title="Production (Quintals) by State">
                <PieChartComponent data={productionByStateChartData} valueFormatter={quantityFormatter}/>
              </ChartCard>
            </div>
            <DataGrid data={filteredData} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      {/* Adjust main content padding-top to account for sticky header height */}
      {/* Header py-3 and its container px-4,sm:px-6,py-3. Header height is approx 60px. Current main padding is py-6 sm:py-8.
          When header is sticky, this 'main' element will start under it.
          So, if header height is ~60px, then `pt-[calc(60px+1.5rem)]` (60px + py-6) might be needed for sm screens.
          Or more simply `pt-24` to be safe, then `sm:pt-28`
          For non-sticky version it was: <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8 relative">
      */}
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8 relative pt-[76px] md:pt-[88px]"> {/* Approx header height + original padding */}
        {isLoading && dataInitialized && currentView === 'main' && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50" aria-busy="true" aria-live="polite">
                <LoadingSpinner />
            </div>
        )}
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-sm text-slate-400 border-t border-slate-750 mt-auto">
        Sales Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
