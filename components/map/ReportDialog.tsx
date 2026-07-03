"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMapReports } from "@/hooks/useMapReports";
import { useAuth } from "@/providers/AuthProvider";
import { DEMO_CITY } from "@/lib/geo";
import type { MapReportType } from "@/lib/types";

const TYPE_LABELS: Record<MapReportType, string> = {
  accident: "Acidente",
  block: "Bloqueio",
  radar: "Radar",
  risk_zone: "Zona de risco",
  hotspot: "Ponto quente",
};

export function ReportDialog({
  open,
  onOpenChange,
  location,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: { lat: number; lng: number } | null;
  onSubmitted: () => void;
}) {
  const { addReport } = useMapReports();
  const { profile } = useAuth();
  const [type, setType] = useState<MapReportType>("accident");
  const [description, setDescription] = useState("");

  async function submit() {
    if (!location) return;
    await addReport({
      type,
      description: description || undefined,
      latitude: location.lat,
      longitude: location.lng,
      city: profile?.city || DEMO_CITY.name,
    });
    toast.success("Ocorrência reportada. Obrigado por ajudar a comunidade!");
    setDescription("");
    setType("accident");
    onOpenChange(false);
    onSubmitted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar ocorrência</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              items={TYPE_LABELS}
              value={type}
              onValueChange={(v) => setType(v as MapReportType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-description">Descrição</Label>
            <Input
              id="report-description"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
