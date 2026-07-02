"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoalProgressBar } from "@/components/dashboard/GoalProgressBar";
import { useRidesStore } from "@/stores/ridesStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { useAuthStore, useCurrentProfile } from "@/stores/authStore";
import {
  extraEarningsInRange,
  getPeriodRange,
  grossEarnings,
  projectGoalCompletion,
  ridesInRange,
} from "@/lib/calculations";
import type { GoalType } from "@/lib/types";

const PERIOD_LABELS: Record<GoalType, string> = {
  daily: "Meta diária",
  weekly: "Meta semanal",
  monthly: "Meta mensal",
};

export function GoalsPanel() {
  const profile = useCurrentProfile();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const rides = useRidesStore((s) => s.rides);
  const extraEarnings = useFinanceStore((s) => s.extraEarnings);
  const history = useGoalsStore((s) => s.history);

  const [editing, setEditing] = useState<GoalType | null>(null);
  const [value, setValue] = useState("");

  const periods = useMemo(() => {
    const now = new Date();
    return (["daily", "weekly", "monthly"] as GoalType[]).map((type) => {
      const { start, end } = getPeriodRange(type, now);
      const earnings = grossEarnings(
        ridesInRange(rides, start, end),
        extraEarningsInRange(extraEarnings, start, end),
      );
      const goalField =
        type === "daily"
          ? profile?.dailyGoal
          : type === "weekly"
            ? profile?.weeklyGoal
            : profile?.monthlyGoal;
      return {
        type,
        current: earnings,
        goal: goalField ?? 0,
        projection: projectGoalCompletion(earnings, goalField ?? 0, start, end, now),
      };
    });
  }, [rides, extraEarnings, profile]);

  const recentHistory = [...history].slice(-14).reverse();

  function openEdit(type: GoalType) {
    const current =
      type === "daily"
        ? profile?.dailyGoal
        : type === "weekly"
          ? profile?.weeklyGoal
          : profile?.monthlyGoal;
    setValue(String(current ?? ""));
    setEditing(type);
  }

  function saveEdit() {
    if (!editing) return;
    const amount = Number(value.replace(",", "."));
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    const field =
      editing === "daily"
        ? "dailyGoal"
        : editing === "weekly"
          ? "weeklyGoal"
          : "monthlyGoal";
    updateProfile({ [field]: amount });
    toast.success("Meta atualizada");
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      {periods.map((p) => (
        <div key={p.type} className="space-y-1">
          <GoalProgressBar
            label={PERIOD_LABELS[p.type]}
            current={p.current}
            goal={p.goal}
            projection={p.projection}
          />
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => openEdit(p.type)}>
            Editar meta
          </Button>
        </div>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de metas diárias</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {recentHistory.map((h) => (
            <div
              key={h.id}
              title={new Date(h.date).toLocaleDateString("pt-BR")}
              className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${
                h.achieved
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {new Date(h.date).getDate()}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? PERIOD_LABELS[editing] : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="goal-value">Valor (R$)</Label>
            <Input
              id="goal-value"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
