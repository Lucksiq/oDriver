"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { batchRideSchema, type BatchRideFormValues, type BatchRideInput } from "@/lib/schemas";
import { useRides } from "@/hooks/useRides";
import { useFinances } from "@/hooks/useFinances";
import type { Platform } from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  uber: "Uber",
  "99": "99",
  ifood: "iFood",
  other: "Outro",
};

export function BatchRideForm() {
  const router = useRouter();
  const { addRide } = useRides();
  const { addExpense } = useFinances();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BatchRideFormValues, unknown, BatchRideInput>({
    resolver: zodResolver(batchRideSchema),
    defaultValues: { platform: "uber", date: new Date().toISOString().slice(0, 10) },
  });

  async function onSubmit(data: BatchRideInput) {
    const occurredAt = new Date(`${data.date}T12:00:00`).toISOString();
    await addRide({
      platform: data.platform,
      amount: data.totalAmount,
      rideType: "passenger",
      rideCount: data.rideCount,
      startedAt: occurredAt,
      endedAt: occurredAt,
      notes: `${data.rideCount} corridas registradas em lote`,
    });
    if (data.totalCosts) {
      await addExpense({
        category: "other",
        amount: data.totalCosts,
        description: `Custos agregados de ${data.rideCount} corridas`,
        occurredAt,
      });
    }
    toast.success("Corridas agrupadas registradas!");
    router.push("/rides");
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plataforma</Label>
            <Select
              items={PLATFORM_LABELS}
              defaultValue="uber"
              onValueChange={(v) => setValue("platform", v as Platform)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-date">Data</Label>
            <Input id="batch-date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-rideCount">Quantidade de corridas</Label>
            <Input id="batch-rideCount" inputMode="numeric" placeholder="Ex: 12" {...register("rideCount")} />
            {errors.rideCount && (
              <p className="text-sm text-destructive">{errors.rideCount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-totalAmount">Faturamento total (R$)</Label>
            <Input
              id="batch-totalAmount"
              inputMode="decimal"
              placeholder="0,00"
              {...register("totalAmount")}
            />
            {errors.totalAmount && (
              <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-totalCosts">Custos totais (R$)</Label>
            <Input
              id="batch-totalCosts"
              inputMode="decimal"
              placeholder="Opcional"
              {...register("totalCosts")}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            Registrar corridas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
