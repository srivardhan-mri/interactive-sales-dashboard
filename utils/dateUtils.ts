
import { DataRecord } from '../types';
import * as XLSX from 'xlsx'; // Required for SSF

/**
 * Determines the fiscal year string (e.g., "FY 2023-2024") for a given date.
 * A fiscal year runs from April 1st to March 31st.
 * Handles JS Date objects, ISO date strings (YYYY-MM-DD), and Excel date serial numbers.
 * @param dateInput - The date to determine the fiscal year for.
 * @returns The fiscal year string, or an empty string if the date is invalid.
 */
export function getFiscalYear(dateInput: Date | string | number): string {
  let date: Date | null = null;

  if (dateInput instanceof Date) {
    if (!isNaN(dateInput.getTime())) {
      date = dateInput;
    }
  } else if (typeof dateInput === 'string') {
    // Try to parse YYYY-MM-DD first
    const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1; // JS months are 0-indexed
      const day = parseInt(isoMatch[3], 10);
      // Ensure it's a valid date by checking if Date.UTC creates a valid date that matches the input
      const parsedDate = new Date(Date.UTC(year, month, day));
      if (!isNaN(parsedDate.getTime()) && parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month && parsedDate.getUTCDate() === day) {
        date = parsedDate;
      }
    } else {
      // Fallback for other string formats that Date constructor might parse
      const genericParsedDate = new Date(dateInput);
      if (!isNaN(genericParsedDate.getTime())) {
        // Use UTC to avoid timezone issues from local interpretation of genericParsedDate
        date = new Date(Date.UTC(genericParsedDate.getFullYear(), genericParsedDate.getMonth(), genericParsedDate.getDate()));
      }
    }
  } else if (typeof dateInput === 'number') {
    // Assume Excel date serial number
    try {
      const excelDate = XLSX.SSF.parse_date_code(dateInput);
      if (excelDate) {
        // Excel's epoch is slightly different, and SSF.parse_date_code handles this.
        // Create Date object using UTC to ensure consistency.
        const jsDate = new Date(Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d, excelDate.H || 0, excelDate.M || 0, excelDate.S || 0));
        if (!isNaN(jsDate.getTime())) {
            date = jsDate;
        }
      }
    } catch (e) {
      // console.error("Error parsing Excel date serial number:", e);
      // Could not parse, date remains null
    }
  }

  if (!date) {
    return ""; // Invalid or unparseable date
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0 (Jan) to 11 (Dec)

  // Fiscal year starts in April (month 3)
  if (month >= 3) { // April to December
    return `FY ${year}-${year + 1}`;
  } else { // January to March
    return `FY ${year - 1}-${year}`;
  }
}


/**
 * Returns the start and end ISO date strings for a given fiscal year string.
 * Example: "FY 2023-2024" -> { startDate: "2023-04-01", endDate: "2024-03-31" }
 * @param fiscalYear - The fiscal year string (e.g., "FY 2023-2024").
 * @returns An object with startDate and endDate, or null if the format is invalid.
 */
export function getFiscalYearStartEnd(fiscalYear: string): { startDate: string; endDate: string } | null {
  const match = fiscalYear.match(/^FY (\d{4})-(\d{4})$/);
  if (!match) return null;

  const startYear = parseInt(match[1], 10);
  const endYear = parseInt(match[2], 10);

  if (endYear !== startYear + 1) return null; // Invalid range

  return {
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  };
}

/**
 * Generates a sorted list of unique fiscal years present in the data.
 * Also includes "All Fiscal Years" as the first option.
 * @param data - Array of DataRecord objects.
 * @returns A sorted array of fiscal year strings.
 */
export function getAvailableFiscalYears(data: DataRecord[]): string[] {
  if (!data || data.length === 0) {
    return [];
  }
  const fiscalYears = new Set<string>();
  data.forEach(record => {
    if (record.fiscalYear) {
      fiscalYears.add(record.fiscalYear);
    }
  });
  // Sort in descending order (e.g., FY 2024-2025, FY 2023-2024)
  return Array.from(fiscalYears).sort((a, b) => {
    const yearA = parseInt(a.substring(3, 7), 10);
    const yearB = parseInt(b.substring(3, 7), 10);
    return yearB - yearA;
  });
}

/**
 * Generates an array of fiscal year strings preceding a given target fiscal year.
 * @param targetFiscalYear - The fiscal year to count back from (e.g., "FY 2023-2024").
 * @param count - The number of preceding fiscal years to generate.
 * @returns An array of preceding fiscal year strings, from oldest to most recent.
 */
export function getPreviousFiscalYears(targetFiscalYear: string, count: number): string[] {
  const match = targetFiscalYear.match(/^FY (\d{4})-(\d{4})$/);
  if (!match) return [];

  let startYear = parseInt(match[1], 10);
  const previousYears: string[] = [];

  for (let i = 0; i < count; i++) {
    startYear--;
    previousYears.push(`FY ${startYear}-${startYear + 1}`);
  }

  return previousYears.reverse(); // Return oldest to newest
}
