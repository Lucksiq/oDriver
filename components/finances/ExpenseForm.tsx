"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  expenseSchema,
  type ExpenseFormValues,
  type ExpenseInput,
} from "@/lib/schemas";
import { useFinanceStore } from "@/stores/financeStore";
import type { ExpenseCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: "Combustível",
  maintenance: "Manutenção",
  tax: "IPVA / Seguro",
  food: "Alimentação",
  platform_fee: "Taxa da plataforma",
  other: "Outros",
};

export function ExpenseForm({ onDone }: { onDone?: () => void }) {
  const addExpense = useFinanceStore((s) => s.addExpense);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues, unknown, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "fuel" },
  });
  const category = watch("category");

  function onSubmit(data: ExpenseInput) {
    addExpense({
      category: data.category,
      subcategory: data.subcategory,
      amount: data.amount,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      description: data.description,
      occurredAt: new Date().toISOString(),
    });
    toast.success("Despesa registrada");
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select
          items={CATEGORY_LABELS}
          defaultValue="fuel"
          onValueChange={(v) => setValue("category", v as ExpenseCategory)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {category === "fuel" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="liters">Litros</Label>
            <Input id="liters" inputMode="decimal" {...register("liters")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pricePerLiter">Preço/litro</Label>
            <Input id="pricePerLiter" inputMode="decimal" {...register("pricePerLiter")} />
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="amount">Valor total (R$)</Label>
        <Input id="amount" inputMode="decimal" placeholder="0,00" {...register("amount")} />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subcategory">Subcategoria</Label>
        <Input id="subcategory" placeholder="Opcional" {...register("subcategory")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" placeholder="Opcional" {...register("description")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        Salvar despesa
      </Button>
    </form>
  );
}
