"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  rideDetailedSchema,
  type RideDetailedFormValues,
  type RideDetailedInput,
} from "@/lib/schemas";
import { useRides } from "@/hooks/useRides";
import type { Platform, RideType } from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  uber: "Uber",
  "99": "99",
  ifood: "iFood",
  other: "Outro",
};

const RIDE_TYPE_LABELS: Record<RideType, string> = {
  passenger: "Passageiro",
  delivery: "Entrega",
  pet: "Pet",
};

export function RideForm() {
  const router = useRouter();
  const { addRide } = useRides();
  const [detailed, setDetailed] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RideDetailedFormValues, unknown, RideDetailedInput>({
    resolver: zodResolver(rideDetailedSchema),
    defaultValues: { platform: "uber", rideType: "passenger" },
  });

  async function onSubmit(data: RideDetailedInput) {
    let durationMinutes: number | undefined;
    if (data.startedAt && data.endedAt) {
      const diff =
        (new Date(data.endedAt).getTime() - new Date(data.startedAt).getTime()) /
        60000;
      if (diff > 0) durationMinutes = Math.round(diff);
    }
    await addRide({
      platform: data.platform,
      amount: data.amount,
      distanceKm: data.distanceKm,
      notes: data.notes,
      rideType: detailed ? data.rideType : "passenger",
      startedAt: detailed ? data.startedAt : undefined,
      endedAt: detailed ? data.endedAt : undefined,
      durationMinutes: detailed ? durationMinutes : undefined,
      rating: detailed ? data.rating : undefined,
      rideCount: 1,
    });
    toast.success("Corrida registrada!");
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
            <Label htmlFor="amount">Valor recebido (R$)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              autoFocus
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="distanceKm">Distância (km)</Label>
            <Input
              id="distanceKm"
              inputMode="decimal"
              placeholder="Opcional"
              {...register("distanceKm")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observação</Label>
            <Textarea id="notes" placeholder="Opcional" {...register("notes")} />
          </div>

          <label className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Modo detalhado</span>
            <Switch checked={detailed} onCheckedChange={setDetailed} />
          </label>

          {detailed && (
            <div className="space-y-4 rounded-md border p-3">
              <div className="space-y-1.5">
                <Label>Tipo de corrida</Label>
                <Select
                  items={RIDE_TYPE_LABELS}
                  defaultValue="passenger"
                  onValueChange={(v) => setValue("rideType", v as RideType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RIDE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startedAt">Início</Label>
                  <Input id="startedAt" type="datetime-local" {...register("startedAt")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endedAt">Fim</Label>
                  <Input id="endedAt" type="datetime-local" {...register("endedAt")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rating">Avaliação do passageiro</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.5"
                  min={1}
                  max={5}
                  placeholder="Opcional"
                  {...register("rating")}
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            Registrar corrida
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
