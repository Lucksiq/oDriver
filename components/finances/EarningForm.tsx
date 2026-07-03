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
  extraEarningSchema,
  type ExtraEarningFormValues,
  type ExtraEarningInput,
} from "@/lib/schemas";
import { useFinances } from "@/hooks/useFinances";
import type { ExtraEarningCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<ExtraEarningCategory, string> = {
  bonus: "Bônus de plataforma",
  tip: "Gorjeta em dinheiro",
  other: "Outros",
};

export function EarningForm({ onDone }: { onDone?: () => void }) {
  const { addExtraEarning } = useFinances();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExtraEarningFormValues, unknown, ExtraEarningInput>({
    resolver: zodResolver(extraEarningSchema),
    defaultValues: { category: "tip" },
  });

  async function onSubmit(data: ExtraEarningInput) {
    await addExtraEarning({
      category: data.category,
      amount: data.amount,
      description: data.description,
      occurredAt: new Date().toISOString(),
    });
    toast.success("Ganho extra registrado");
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select
          items={CATEGORY_LABELS}
          defaultValue="tip"
          onValueChange={(v) => setValue("category", v as ExtraEarningCategory)}
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
      <div className="space-y-1.5">
        <Label htmlFor="earning-amount">Valor (R$)</Label>
        <Input id="earning-amount" inputMode="decimal" placeholder="0,00" {...register("amount")} />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="earning-description">Descrição</Label>
        <Input id="earning-description" placeholder="Opcional" {...register("description")} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        Salvar ganho
      </Button>
    </form>
  );
}
