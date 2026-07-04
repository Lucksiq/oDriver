"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { RankingGroup, RankingMetric, RankingPeriod } from "@/lib/types";

const METRIC_LABELS: Record<RankingMetric, string> = {
  earnings: "Ganhos",
  rides: "Corridas",
  profit: "Lucro",
  km: "Quilômetros",
};

const PERIOD_LABELS: Record<RankingPeriod, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
  all_time: "Todo o período",
};

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    name: string;
    description?: string;
    isPrivate: boolean;
    metric: RankingMetric;
    period: RankingPeriod;
  }) => Promise<RankingGroup | null>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [metric, setMetric] = useState<RankingMetric>("earnings");
  const [period, setPeriod] = useState<RankingPeriod>("weekly");

  function reset() {
    setName("");
    setDescription("");
    setIsPrivate(false);
    setMetric("earnings");
    setPeriod("weekly");
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Dê um nome ao grupo");
      return;
    }
    const group = await onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      isPrivate,
      metric,
      period,
    });
    if (!group) return;
    if (isPrivate) {
      toast.success(`Grupo criado! Código de convite: ${group.inviteCode}`);
    } else {
      toast.success("Grupo criado!");
    }
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar grupo de ranking</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Nome</Label>
            <Input
              id="group-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group-description">Descrição</Label>
            <Input
              id="group-description"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="group-private">Privado (só entra com código)</Label>
            <Switch id="group-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Métrica</Label>
              <Select
                items={METRIC_LABELS}
                value={metric}
                onValueChange={(v) => setMetric(v as RankingMetric)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METRIC_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Período</Label>
              <Select
                items={PERIOD_LABELS}
                value={period}
                onValueChange={(v) => setPeriod(v as RankingPeriod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
