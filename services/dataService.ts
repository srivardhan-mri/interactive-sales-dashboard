
import { DataRecord } from '../types';
import { PRODUCT_CATEGORIES, STATES, SALES_PEOPLE, CITIES, BROKER_NAMES, DISTRICTS } from '../constants'; // Added DISTRICTS
import { getFiscalYear } from '../utils/dateUtils';

function getRandomElement<T,>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Cannot get random element from an empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function generateMockData(count: number = 200): DataRecord[] {
  const data: DataRecord[] = [];
  const startDateGen = new Date(2021, 0, 1); // Jan 1, 2021 to ensure multiple fiscal years
  const endDateGen = new Date(); // Today

  for (let i = 0; i < count; i++) {
    const productCat = getRandomElement(PRODUCT_CATEGORIES);
    const state = getRandomElement(STATES);
    const cityName = getRandomElement(CITIES);
    const salesMan = getRandomElement(SALES_PEOPLE);
    const brokerName = getRandomElement(BROKER_NAMES);
    const district = getRandomElement(DISTRICTS); // Added district
    const orderAmount = parseFloat((Math.random() * 150000 + 5000).toFixed(2)); // Amount in INR
    const totalQty = Math.floor(Math.random() * 100) + 5; // 5 - 105 quintals
    const recordDate = getRandomDate(startDateGen, endDateGen);

    data.push({
      id: `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
      partyName: `Party ${String.fromCharCode(65 + (i % 26))}${Math.floor(i/26) || ''}-${Math.floor(Math.random() * 100)}`,
      brokerName: brokerName,
      cityName: cityName,
      productCat,
      rrmaNum: `RRMA-${Math.floor(Math.random() * 9000) + 1000}`,
      state,
      district, // Added district
      date: recordDate,
      fiscalYear: getFiscalYear(recordDate),
      totalQty,
      salesMan: salesMan,
      vchNo: `VCH-${Math.floor(Math.random() * 90000) + 10000}`,
      orderAmount,
    });
  }
  return data;
}