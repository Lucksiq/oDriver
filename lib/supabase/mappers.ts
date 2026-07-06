import type { User } from "@supabase/supabase-js";
import type { Tables } from "./types";
import type {
  Expense,
  ExtraEarning,
  MapReport,
  Platform,
  Post,
  PostType,
  Profile,
  RankingEntry,
  RankingGroup,
  ReactionKey,
  Ride,
} from "@/lib/types";
import type { GoalHistoryEntry } from "@/lib/mock-seed";
import type { VoiceChannel, VoiceMessage } from "@/lib/voice-channels";

export function mapProfileRow(row: Tables<"profiles">, user: User): Profile {
  return {
    id: row.id,
    email: user.email ?? "",
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    phone: row.phone,
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
    rideCount: row.ride_count,
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

export function mapMapReportRow(
  row: Tables<"map_reports">,
  myVote?: MapReport["myVote"],
): MapReport {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as MapReport["type"],
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    description: row.description ?? undefined,
    city: row.city ?? "",
    confirmations: row.confirmations,
    denials: row.denials,
    active: row.active,
    createdAt: row.created_at,
    myVote,
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

export function mapPostRow(
  row: Tables<"posts"> & { profiles: { display_name: string | null } | null },
  myReaction?: ReactionKey,
): Post {
  return {
    id: row.id,
    authorName: row.profiles?.display_name ?? "Motorista",
    authorCity: row.city ?? "",
    content: row.content,
    type: row.type as PostType,
    city: row.city ?? "",
    reactions: row.reactions as Record<ReactionKey, number>,
    myReaction,
    createdAt: row.created_at,
  };
}

export function mapRankingStatsRow(
  row: Tables<"ranking_stats">,
  currentUserId?: string,
): RankingEntry {
  return {
    userId: row.user_id ?? "",
    displayName: row.display_name ?? "Motorista",
    city: row.city ?? "",
    value: Number(row.weekly_earnings ?? 0),
    isCurrentUser: row.user_id === currentUserId,
  };
}

export function mapRankingGroupRow(
  row: Tables<"ranking_groups"> & { ranking_group_members: { count: number }[] },
): RankingGroup {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description ?? undefined,
    isPrivate: row.is_private,
    inviteCode: row.invite_code,
    maxMembers: row.max_members,
    metric: row.metric as RankingGroup["metric"],
    period: row.period as RankingGroup["period"],
    memberCount: row.ranking_group_members?.[0]?.count ?? 0,
  };
}

export function mapVoiceChannelRow(row: Tables<"voice_channels">): VoiceChannel {
  return {
    id: row.id,
    name: row.name,
    topic: row.topic ?? undefined,
    city: row.city ?? undefined,
    ownerId: row.owner_id,
    isPrivate: row.is_private,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

export function mapVoiceMessageRow(
  row: Tables<"voice_messages"> & { profiles: { display_name: string | null } | null },
): VoiceMessage {
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId: row.user_id,
    authorName: row.profiles?.display_name ?? "Motorista",
    audioData: row.audio_data,
    mimeType: row.mime_type,
    durationSeconds: row.duration_seconds !== null ? Number(row.duration_seconds) : undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function mapGroupRankingEntryRow(
  row: { user_id: string; display_name: string | null; city: string | null; value: number },
  currentUserId?: string,
): RankingEntry {
  return {
    userId: row.user_id,
    displayName: row.display_name ?? "Motorista",
    city: row.city ?? "",
    value: Number(row.value ?? 0),
    isCurrentUser: row.user_id === currentUserId,
  };
}
