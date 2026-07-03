"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { EarningsCard } from "@/components/dashboard/EarningsCard";
import { GoalProgressBar } from "@/components/dashboard/GoalProgressBar";
import { WeeklyChart, type WeeklyChartPoint } from "@/components/dashboard/WeeklyChart";
import { QuickAddButton } from "@/components/dashboard/QuickAddButton";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";
import { useRides } from "@/hooks/useRides";
import { useFinances } from "@/hooks/useFinances";
import { useGoals } from "@/hooks/useGoals";
import { useCurrentProfile } from "@/providers/AuthProvider";
import {
  extraEarningsInRange,
  expensesInRange,
  getPeriodRange,
  grossEarnings,
  netProfit,
  projectGoalCompletion,
  ridesInRange,
} from "@/lib/calculations";

export default function DashboardPage() {
  const profile = useCurrentProfile();
  const { rides, loading: ridesLoading } = useRides();
  const { expenses, extraEarnings, loading: financeLoading } = useFinances();
  const { recordDailyGoal } = useGoals();

  const summary = useMemo(() => {
    const now = new Date();
    const day = getPeriodRange("daily", now);
    const week = getPeriodRange("weekly", now);
    const month = getPeriodRange("monthly", now);

    const dayRides = ridesInRange(rides, day.start, day.end);
    const dayExtra = extraEarningsInRange(extraEarnings, day.start, day.end);
    const dayExpenses = expensesInRange(expenses, day.start, day.end);

    const weekRides = ridesInRange(rides, week.start, week.end);
    const weekExtra = extraEarningsInRange(extraEarnings, week.start, week.end);
    const weekExpenses = expensesInRange(expenses, week.start, week.end);

    const monthRides = ridesInRange(rides, month.start, month.end);
    const monthExtra = extraEarningsInRange(extraEarnings, month.start, month.end);

    const todayEarnings = grossEarnings(dayRides, dayExtra);
    const todayProfit = netProfit(dayRides, dayExpenses, dayExtra);

    return {
      today: todayEarnings,
      todayProfit,
      week: grossEarnings(weekRides, weekExtra),
      weekProfit: netProfit(weekRides, weekExpenses, weekExtra),
      month: grossEarnings(monthRides, monthExtra),
      dailyGoalProjection: projectGoalCompletion(
        todayEarnings,
        profile?.dailyGoal ?? 0,
        day.start,
        day.end,
        now,
      ),
    };
  }, [rides, expenses, extraEarnings, profile]);

  useEffect(() => {
    if (!profile || ridesLoading || financeLoading) return;
    recordDailyGoal(profile.dailyGoal, summary.today >= profile.dailyGoal);
  }, [profile, ridesLoading, financeLoading, summary.today, recordDailyGoal]);

  const chartData: WeeklyChartPoint[] = useMemo(() => {
    const points: WeeklyChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const ref = new Date();
      ref.setDate(ref.getDate() - i);
      const { start, end } = getPeriodRange("daily", ref);
      const dayRides = ridesInRange(rides, start, end);
      const dayExtra = extraEarningsInRange(extraEarnings, start, end);
      const dayExpenses = expensesInRange(expenses, start, end);
      points.push({
        label: format(ref, "EEE", { locale: ptBR }),
        ganhos: Math.round(grossEarnings(dayRides, dayExtra)),
        despesas: Math.round(
          dayExpenses.reduce((acc, e) => acc + e.amount, 0),
        ),
      });
    }
    return points;
  }, [rides, expenses, extraEarnings]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Olá, ${profile?.displayName?.split(" ")[0] ?? ""}`}
        subtitle="Aqui está o resumo do seu dia"
        action={<WeatherBadge />}
      />

      <div className="grid grid-cols-2 gap-3">
        <EarningsCard label="Hoje" value={summary.today} />
        <EarningsCard label="Lucro real hoje" value={summary.todayProfit} tone="success" />
        <EarningsCard label="Semana" value={summary.week} />
        <EarningsCard label="Mês" value={summary.month} />
      </div>

      <GoalProgressBar
        label="Meta diária"
        current={summary.today}
        goal={profile?.dailyGoal ?? 0}
        projection={summary.dailyGoalProjection}
      />
      <Link href="/goals" className="block text-center text-sm font-medium text-primary">
        Ver todas as metas →
      </Link>

      <WeeklyChart data={chartData} />

      <QuickAddButton />
    </div>
  );
}
