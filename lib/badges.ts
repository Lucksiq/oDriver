import type { Badge } from "./types";

export const BADGES: Badge[] = [
  {
    key: "first_ride",
    label: "Primeira Corrida",
    emoji: "🚗",
    description: "Registrar a primeira corrida",
  },
  {
    key: "goal_reached",
    label: "Meta Atingida",
    emoji: "🎯",
    description: "Atingir a meta do dia",
  },
  {
    key: "perfect_week",
    label: "Semana Perfeita",
    emoji: "🔥",
    description: "Meta atingida 7 dias seguidos",
  },
  {
    key: "thousand_reais",
    label: "Mil Reais",
    emoji: "💰",
    description: "Ganhar R$ 1.000 em uma semana",
  },
  {
    key: "explorer",
    label: "Explorador",
    emoji: "🗺️",
    description: "Reportar 10 ocorrências no mapa",
  },
  {
    key: "top10_city",
    label: "Top 10 Cidade",
    emoji: "👑",
    description: "Entrar no top 10 do ranking da cidade",
  },
  {
    key: "odriver_pro",
    label: "oDriver Pro",
    emoji: "⭐",
    description: "Assinar o plano Premium",
  },
  {
    key: "veteran",
    label: "Veterano",
    emoji: "🏆",
    description: "1 ano de uso ativo",
  },
];

export interface BadgeContext {
  ridesCount: number;
  dailyGoalAchievedToday: boolean;
  perfectWeekStreak: boolean;
  weeklyEarnings: number;
  mapReportsByUser: number;
  rankingTop10: boolean;
  isPremium: boolean;
  accountAgeDays: number;
}

export function computeEarnedBadges(ctx: BadgeContext): Set<string> {
  const earned = new Set<string>();
  if (ctx.ridesCount >= 1) earned.add("first_ride");
  if (ctx.dailyGoalAchievedToday) earned.add("goal_reached");
  if (ctx.perfectWeekStreak) earned.add("perfect_week");
  if (ctx.weeklyEarnings >= 1000) earned.add("thousand_reais");
  if (ctx.mapReportsByUser >= 10) earned.add("explorer");
  if (ctx.rankingTop10) earned.add("top10_city");
  if (ctx.isPremium) earned.add("odriver_pro");
  if (ctx.accountAgeDays >= 365) earned.add("veteran");
  return earned;
}
