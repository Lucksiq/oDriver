"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useRidesStore } from "@/stores/ridesStore";
import { formatCurrency } from "@/lib/calculations";
import type { Platform, Ride } from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  uber: "Uber",
  "99": "99",
  ifood: "iFood",
  other: "Outro",
};

const PLATFORM_FILTER_ITEMS: Record<string, string> = {
  all: "Todas",
  ...PLATFORM_LABELS,
};

export function RideList() {
  const rides = useRidesStore((s) => s.rides);
  const updateRide = useRidesStore((s) => s.updateRide);
  const removeRide = useRidesStore((s) => s.removeRide);

  const [platform, setPlatform] = useState<string>("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [editing, setEditing] = useState<Ride | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return [...rides]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((r) => platform === "all" || r.platform === platform)
      .filter((r) => !minValue || r.amount >= Number(minValue.replace(",", ".")))
      .filter((r) => !maxValue || r.amount <= Number(maxValue.replace(",", ".")));
  }, [rides, platform, minValue, maxValue]);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 p-3">
          <Select
            items={PLATFORM_FILTER_ITEMS}
            value={platform}
            onValueChange={(v) => setPlatform(v ?? "all")}
          >
            <SelectTrigger className="col-span-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Mín. R$"
            inputMode="decimal"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
          <Input
            placeholder="Máx. R$"
            inputMode="decimal"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma corrida encontrada.
        </p>
      )}

      {filtered.map((ride) => (
        <Card key={ride.id}>
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{PLATFORM_LABELS[ride.platform]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(ride.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums">
                {formatCurrency(ride.amount)}
              </p>
              {ride.distanceKm !== undefined && (
                <p className="text-xs text-muted-foreground">{ride.distanceKm} km</p>
              )}
              {ride.notes && <p className="text-xs text-muted-foreground">{ride.notes}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(ride)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setDeletingId(ride.id)}
              >
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar corrida</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-amount">Valor (R$)</Label>
                <Input
                  id="edit-amount"
                  inputMode="decimal"
                  defaultValue={editing.amount}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: Number(e.target.value.replace(",", ".")) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-distance">Distância (km)</Label>
                <Input
                  id="edit-distance"
                  inputMode="decimal"
                  defaultValue={editing.distanceKm ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      distanceKm: e.target.value
                        ? Number(e.target.value.replace(",", "."))
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">Observação</Label>
                <Input
                  id="edit-notes"
                  defaultValue={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (editing) {
                  updateRide(editing.id, editing);
                  toast.success("Corrida atualizada");
                  setEditing(null);
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir corrida?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  removeRide(deletingId);
                  toast.success("Corrida removida");
                  setDeletingId(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
