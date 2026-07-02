import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Expense, ExtraEarning, GoalType, Ride } from "./types";

export function getPeriodRange(type: GoalType, reference = new Date()) {
  switch (type) {
    case "daily":
      return { start: startOfDay(reference), end: endOfDay(reference) };
    case "weekly":
      return {
        start: startOfWeek(reference, { weekStartsOn: 1 }),
        end: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "monthly":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
  }
}

function inRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export function ridesInRange(rides: Ride[], start: Date, end: Date) {
  return rides.filter((r) => inRange(r.createdAt, start, end));
}

export function expensesInRange(expenses: Expense[], start: Date, end: Date) {
  return expenses.filter((e) => inRange(e.occurredAt, start, end));
}

export function extraEarningsInRange(
  earnings: ExtraEarning[],
  start: Date,
  end: Date,
) {
  return earnings.filter((e) => inRange(e.occurredAt, start, end));
}

export function sumRides(rides: Ride[]) {
  return rides.reduce((acc, r) => acc + r.amount, 0);
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

export function sumExtraEarnings(earnings: ExtraEarning[]) {
  return earnings.reduce((acc, e) => acc + e.amount, 0);
}

export function totalKm(rides: Ride[]) {
  return rides.reduce((acc, r) => acc + (r.distanceKm ?? 0), 0);
}

export function totalHours(rides: Ride[]) {
  const minutes = rides.reduce((acc, r) => acc + (r.durationMinutes ?? 0), 0);
  return minutes / 60;
}

export function grossEarnings(rides: Ride[], extraEarnings: ExtraEarning[]) {
  return sumRides(rides) + sumExtraEarnings(extraEarnings);
}

export function netProfit(
  rides: Ride[],
  expenses: Expense[],
  extraEarnings: ExtraEarning[],
) {
  return grossEarnings(rides, extraEarnings) - sumExpenses(expenses);
}

export function expensesByCategory(expenses: Expense[]) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return map;
}

export function fuelCostPerKm(expenses: Expense[], rides: Ride[]) {
  const fuelTotal = expenses
    .filter((e) => e.category === "fuel")
    .reduce((acc, e) => acc + e.amount, 0);
  const km = totalKm(rides);
  if (km <= 0) return 0;
  return fuelTotal / km;
}

export interface MonthlyReport {
  grossRevenue: number;
  netProfit: number;
  expensesByCategory: Map<string, number>;
  totalExpenses: number;
  profitPerHour: number;
  profitPerKm: number;
}

export function buildMonthlyReport(
  rides: Ride[],
  expenses: Expense[],
  extraEarnings: ExtraEarning[],
): MonthlyReport {
  const gross = grossEarnings(rides, extraEarnings);
  const profit = netProfit(rides, expenses, extraEarnings);
  const hours = totalHours(rides);
  const km = totalKm(rides);
  return {
    grossRevenue: gross,
    netProfit: profit,
    expensesByCategory: expensesByCategory(expenses),
    totalExpenses: sumExpenses(expenses),
    profitPerHour: hours > 0 ? profit / hours : 0,
    profitPerKm: km > 0 ? profit / km : 0,
  };
}

/**
 * Projects the clock time the goal will be reached, extrapolating the
 * earnings rate observed since the start of the period. Returns null when
 * there isn't enough data (no earnings yet, or pace won't reach the goal
 * before the period ends).
 */
export function projectGoalCompletion(
  currentAmount: number,
  goalAmount: number,
  periodStart: Date,
  periodEnd: Date,
  now = new Date(),
): Date | null {
  if (currentAmount <= 0 || currentAmount >= goalAmount) return null;
  const elapsedMs = now.getTime() - periodStart.getTime();
  if (elapsedMs <= 0) return null;
  const rate = currentAmount / elapsedMs;
  if (rate <= 0) return null;
  const remaining = goalAmount - currentAmount;
  const etaMs = now.getTime() + remaining / rate;
  const eta = new Date(etaMs);
  if (eta > periodEnd) return null;
  return eta;
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
