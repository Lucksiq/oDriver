"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BADGES, computeEarnedBadges } from "@/lib/badges";
import { generateRankingEntries } from "@/lib/mock-seed";
import { getPeriodRange, grossEarnings, extraEarningsInRange, ridesInRange } from "@/lib/calculations";
import { useCurrentProfile } from "@/providers/AuthProvider";
import { useRides } from "@/hooks/useRides";
import { useFinances } from "@/hooks/useFinances";
import { useGoals } from "@/hooks/useGoals";
import { useMapStore } from "@/stores/mapStore";

export function BadgeGrid() {
  const profile = useCurrentProfile();
  const { rides } = useRides();
  const { extraEarnings } = useFinances();
  const { history } = useGoals();
  const myReportsCount = useMapStore((s) => s.myReportsCount);
  const [now] = useState(() => new Date());

  const earned = useMemo(() => {
    const day = getPeriodRange("daily", now);
    const week = getPeriodRange("weekly", now);
    const dailyEarnings = grossEarnings(
      ridesInRange(rides, day.start, day.end),
      extraEarningsInRange(extraEarnings, day.start, day.end),
    );
    const weeklyEarnings = grossEarnings(
      ridesInRange(rides, week.start, week.end),
      extraEarningsInRange(extraEarnings, week.start, week.end),
    );
    const last7 = [...history].slice(-7);
    const perfectWeekStreak = last7.length === 7 && last7.every((h) => h.achieved);
    const rankingEntries = generateRankingEntries(profile?.displayName ?? "Você");
    const position = rankingEntries.findIndex((e) => e.isCurrentUser) + 1;
    const accountAgeDays = profile
      ? (now.getTime() - new Date(profile.createdAt).getTime()) / 86_400_000
      : 0;

    return computeEarnedBadges({
      ridesCount: rides.length,
      dailyGoalAchievedToday: dailyEarnings >= (profile?.dailyGoal ?? Infinity),
      perfectWeekStreak,
      weeklyEarnings,
      mapReportsByUser: myReportsCount,
      rankingTop10: position > 0 && position <= 10,
      isPremium: profile?.isPremium ?? false,
      accountAgeDays,
    });
  }, [rides, extraEarnings, history, myReportsCount, profile, now]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {BADGES.map((badge) => {
        const unlocked = earned.has(badge.key);
        return (
          <Card key={badge.key} className={cn(!unlocked && "opacity-40")}>
            <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
              <span className="text-3xl">{badge.emoji}</span>
              <p className="text-sm font-semibold">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
