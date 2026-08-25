import { TradeType } from "../types";

export const TRADE_RATES: Record<TradeType, number> = {
  CARPENTER: 225,
  PLUMBER: 299,
  MASON: 150,
  PAINTER: 125,
  UNSKILLED_LABOUR: 100,
} as const;

export const PLATFORM_COMMISSION_RATE = 0.20; // 20%

export function calculateTotalDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  
  if (isNaN(startMs) || isNaN(endMs) || endMs < startMs) return 1;
  
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function calculateHoursPerDay(startTimeStr: string, endTimeStr: string): number {
  if (!startTimeStr || !endTimeStr) return 5;
  
  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);
  
  if (isNaN(startH) || isNaN(endH)) return 5;
  
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);
  
  if (endMinutes <= startMinutes) return 5;
  
  const totalHours = (endMinutes - startMinutes) / 60;
  return Math.round(totalHours * 10) / 10;
}

export function calculateBaseLaborCost(
  hourlyRate: number,
  hoursPerDay: number,
  totalDays: number
): number {
  const cost = hourlyRate * hoursPerDay * totalDays;
  return Math.round(cost * 100) / 100;
}

export function calculateCommission(baseLaborCost: number): number {
  const comm = baseLaborCost * PLATFORM_COMMISSION_RATE;
  return Math.round(comm * 100) / 100;
}

export function calculateTotalPayment(baseLaborCost: number, commission: number): number {
  return Math.round((baseLaborCost + commission) * 100) / 100;
}

export function calculateWorkerEarnings(baseLaborCost: number): number {
  return Math.round(baseLaborCost * 100) / 100;
}

export interface PricingBreakdown {
  hourlyRate: number;
  hoursPerDay: number;
  totalDays: number;
  baseLaborCost: number;
  platformCommission: number;
  totalCustomerPayment: number;
  workerEarnings: number;
}

export function calculateFullPricing(
  trade: TradeType,
  hoursPerDay: number,
  startDateStr: string,
  endDateStr: string
): PricingBreakdown {
  const hourlyRate = TRADE_RATES[trade] || 100;
  const totalDays = calculateTotalDays(startDateStr, endDateStr);
  const safeHours = Math.max(0.5, hoursPerDay);
  
  const baseLaborCost = calculateBaseLaborCost(hourlyRate, safeHours, totalDays);
  const platformCommission = calculateCommission(baseLaborCost);
  const totalCustomerPayment = calculateTotalPayment(baseLaborCost, platformCommission);
  const workerEarnings = calculateWorkerEarnings(baseLaborCost);

  return {
    hourlyRate,
    hoursPerDay: safeHours,
    totalDays,
    baseLaborCost,
    platformCommission,
    totalCustomerPayment,
    workerEarnings,
  };
}
