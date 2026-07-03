"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/finances/ExpenseForm";
import { EarningForm } from "@/components/finances/EarningForm";
import { MonthlyReport } from "@/components/finances/MonthlyReport";
import { useFinances } from "@/hooks/useFinances";
import { formatCurrency } from "@/lib/calculations";
import type { ExpenseCategory, ExtraEarningCategory } from "@/lib/types";

const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  fuel: "Combustível",
  maintenance: "Manutenção",
  tax: "IPVA / Seguro",
  food: "Alimentação",
  platform_fee: "Taxa da plataforma",
  other: "Outros",
};

const EARNING_LABELS: Record<ExtraEarningCategory, string> = {
  bonus: "Bônus",
  tip: "Gorjeta",
  other: "Outros",
};

export default function FinancesPage() {
  return (
    <Suspense>
      <FinancesPageContent />
    </Suspense>
  );
}

function FinancesPageContent() {
  const searchParams = useSearchParams();
  const { expenses, extraEarnings, removeExpense, removeExtraEarning } =
    useFinances();

  const [expenseOpen, setExpenseOpen] = useState(
    () => searchParams.get("add") === "expense",
  );
  const [earningOpen, setEarningOpen] = useState(false);

  const sortedExpenses = [...expenses].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );
  const sortedEarnings = [...extraEarnings].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Finanças" subtitle="Ganhos, despesas e relatório" />

      <Tabs defaultValue="expenses">
        <TabsList className="w-full">
          <TabsTrigger value="expenses" className="flex-1">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex-1">
            Ganhos extras
          </TabsTrigger>
          <TabsTrigger value="report" className="flex-1">
            Relatório
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-3">
          <Button className="w-full" onClick={() => setExpenseOpen(true)}>
            <Plus className="size-4" />
            Nova despesa
          </Button>
          {sortedExpenses.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma despesa registrada.
            </p>
          )}
          {sortedExpenses.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{EXPENSE_LABELS[e.category]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.occurredAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 font-bold tabular-nums">{formatCurrency(e.amount)}</p>
                  {e.description && (
                    <p className="text-xs text-muted-foreground">{e.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeExpense(e.id)}
                >
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="earnings" className="space-y-3">
          <Button className="w-full" onClick={() => setEarningOpen(true)}>
            <Plus className="size-4" />
            Novo ganho extra
          </Button>
          {sortedEarnings.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum ganho extra registrado.
            </p>
          )}
          {sortedEarnings.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{EARNING_LABELS[e.category]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.occurredAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 font-bold tabular-nums text-success">
                    {formatCurrency(e.amount)}
                  </p>
                  {e.description && (
                    <p className="text-xs text-muted-foreground">{e.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeExtraEarning(e.id)}
                >
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="report">
          <MonthlyReport />
        </TabsContent>
      </Tabs>

      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova despesa</DialogTitle>
          </DialogHeader>
          <ExpenseForm onDone={() => setExpenseOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={earningOpen} onOpenChange={setEarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo ganho extra</DialogTitle>
          </DialogHeader>
          <EarningForm onDone={() => setEarningOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
