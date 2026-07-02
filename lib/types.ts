export type Platform = "uber" | "99" | "ifood" | "other";

export type RideType = "passenger" | "delivery" | "pet";

export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "tax"
  | "food"
  | "platform_fee"
  | "other";

export type ExtraEarningCategory = "bonus" | "tip" | "other";

export type GoalType = "daily" | "weekly" | "monthly";

export type PostType = "tip" | "alert" | "achievement" | "question" | "general";

export type ReactionKey = "useful" | "alert" | "hot";

export type MapReportType =
  | "accident"
  | "block"
  | "radar"
  | "risk_zone"
  | "hotspot";

export type RankingMetric = "earnings" | "rides" | "profit" | "km";

export type RankingPeriod = "daily" | "weekly" | "monthly" | "all_time";

export interface Profile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  city: string;
  state: string;
  avatarUrl?: string;
  platforms: Platform[];
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
  isPremium: boolean;
  premiumUntil?: string;
  showEarningsPublic: boolean;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Ride {
  id: string;
  platform: Platform;
  amount: number;
  distanceKm?: number;
  durationMinutes?: number;
  startedAt?: string;
  endedAt?: string;
  rideType: RideType;
  rating?: number;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  liters?: number;
  pricePerLiter?: number;
  description?: string;
  occurredAt: string;
  createdAt: string;
}

export interface ExtraEarning {
  id: string;
  category: ExtraEarningCategory;
  amount: number;
  description?: string;
  occurredAt: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  amount: number;
  periodStart: string;
  periodEnd: string;
  achieved: boolean;
  achievedAt?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorCity: string;
  content: string;
  type: PostType;
  city: string;
  reactions: Record<ReactionKey, number>;
  myReaction?: ReactionKey;
  createdAt: string;
}

export interface MapReport {
  id: string;
  type: MapReportType;
  latitude: number;
  longitude: number;
  description?: string;
  city: string;
  confirmations: number;
  active: boolean;
  createdAt: string;
}

export interface RankingEntry {
  userId: string;
  displayName: string;
  city: string;
  value: number;
  isCurrentUser?: boolean;
}

export interface RankingGroup {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  inviteCode: string;
  maxMembers: number;
  metric: RankingMetric;
  period: RankingPeriod;
  memberCount: number;
}

export interface Badge {
  key: string;
  label: string;
  emoji: string;
  description: string;
}

export interface VoiceChannel {
  id: string;
  name: string;
  topic: string;
  city?: string;
  isPrivate: boolean;
  membersOnline: string[];
}
