import type { User } from "@supabase/supabase-js";
import type { Tables } from "./types";
import type {
  Expense,
  ExtraEarning,
  MapReport,
  Platform,
  Profile,
  Ride,
} from "@/lib/types";
import type { GoalHistoryEntry } from "@/lib/mock-seed";

export function mapProfileRow(row: Tables<"profiles">, user: User): Profile {
  return {
    id: row.id,
    email: user.email ?? "",
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    platforms: (row.platforms ?? []) as Platform[],
    dailyGoal: Number(row.daily_goal),
    weeklyGoal: Number(row.weekly_goal),
    monthlyGoal: Number(row.monthly_goal),
    isPremium: row.is_premium,
    premiumUntil: row.premium_until ?? undefined,
    showEarningsPublic: row.show_earnings_public,
    createdAt: row.created_at,
    onboardingComplete: row.onboarding_complete,
    isAdmin: row.is_admin,
  };
}

export function mapRideRow(row: Tables<"rides">): Ride {
  return {
    id: row.id,
    platform: row.platform as Ride["platform"],
    amount: Number(row.amount),
    distanceKm: row.distance_km !== null ? Number(row.distance_km) : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    startedAt: row.started_at ?? undefined,
    endedAt: row.ended_at ?? undefined,
    rideType: row.ride_type as Ride["rideType"],
    rating: row.rating !== null ? Number(row.rating) : undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapExpenseRow(row: Tables<"expenses">): Expense {
  return {
    id: row.id,
    category: row.category as Expense["category"],
    subcategory: row.subcategory ?? undefined,
    amount: Number(row.amount),
    liters: row.liters !== null ? Number(row.liters) : undefined,
    pricePerLiter:
      row.price_per_liter !== null ? Number(row.price_per_liter) : undefined,
    description: row.description ?? undefined,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export function mapExtraEarningRow(row: Tables<"extra_earnings">): ExtraEarning {
  return {
    id: row.id,
    category: row.category as ExtraEarning["category"],
    amount: Number(row.amount),
    description: row.description ?? undefined,
    occurredAt: row.occurred_at,
  };
}

export function mapMapReportRow(row: Tables<"map_reports">): MapReport {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as MapReport["type"],
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    description: row.description ?? undefined,
    city: row.city ?? "",
    confirmations: row.confirmations,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function mapGoalRow(row: Tables<"goals">): GoalHistoryEntry {
  return {
    id: row.id,
    date: row.period_start,
    amount: Number(row.amount),
    achieved: row.achieved,
  };
}
