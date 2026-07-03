"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRides } from "@/hooks/useRides";
import { useFinances } from "@/hooks/useFinances";
import {
  buildMonthlyReport,
  expensesInRange,
  formatCurrency,
  getPeriodRange,
  extraEarningsInRange,
  ridesInRange,
} from "@/lib/calculations";
import type { ExpenseCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: "Combustível",
  maintenance: "Manutenção",
  tax: "IPVA / Seguro",
  food: "Alimentação",
  platform_fee: "Taxa da plataforma",
  other: "Outros",
};

export function MonthlyReport() {
  const { rides } = useRides();
  const { expenses, extraEarnings } = useFinances();

  const report = useMemo(() => {
    const { start, end } = getPeriodRange("monthly");
    return buildMonthlyReport(
      ridesInRange(rides, start, end),
      expensesInRange(expenses, start, end),
      extraEarningsInRange(extraEarnings, start, end),
    );
  }, [rides, expenses, extraEarnings]);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatório do mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Receita bruta</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(report.grossRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Despesas totais</span>
            <span className="font-semibold tabular-nums text-destructive">
              {formatCurrency(report.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Lucro líquido</span>
            <span className="font-bold tabular-nums text-success">
              {formatCurrency(report.netProfit)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lucro por hora</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(report.profitPerHour)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lucro por km</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(report.profitPerKm)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {report.expensesByCategory.size === 0 && (
            <p className="text-muted-foreground">Nenhuma despesa neste mês.</p>
          )}
          {Array.from(report.expensesByCategory.entries()).map(([category, amount]) => (
            <div key={category} className="flex justify-between">
              <span className="text-muted-foreground">
                {CATEGORY_LABELS[category as ExpenseCategory] ?? category}
              </span>
              <span className="font-medium tabular-nums">{formatCurrency(amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
