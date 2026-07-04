"use client";

import { use } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { RankingCard } from "@/components/community/RankingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGroupRanking } from "@/hooks/useGroupRanking";
import { useRankingGroups } from "@/hooks/useRankingGroups";
import { formatCurrency } from "@/lib/calculations";
import { useRouter } from "next/navigation";
import type { RankingGroup, RankingMetric } from "@/lib/types";

const METRIC_LABELS: Record<RankingMetric, string> = {
  earnings: "Ganhos",
  rides: "Corridas",
  profit: "Lucro",
  km: "Quilômetros",
};

function formatForMetric(metric: RankingMetric) {
  if (metric === "earnings" || metric === "profit") return formatCurrency;
  if (metric === "km") return (v: number) => `${v.toFixed(1)} km`;
  return (v: number) => String(Math.round(v));
}

export default function GroupRankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { entries, loading, error } = useGroupRanking(id);
  const { myGroups, leaveGroup } = useRankingGroups();
  const group: RankingGroup | undefined = myGroups.find((g) => g.id === id);

  async function handleLeave() {
    await leaveGroup(id);
    toast.info("Você saiu do grupo");
    router.push("/community/ranking");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={group?.name ?? "Grupo"}
        subtitle={group ? `${METRIC_LABELS[group.metric]} · ${group.memberCount} membros` : undefined}
      />

      {group?.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}

      {group?.isPrivate && (
        <Card>
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">Código de convite</p>
              <p className="font-mono text-lg">{group.inviteCode}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(group.inviteCode);
                toast.success("Código copiado");
              }}
            >
              Copiar
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && entries.length === 0 && !error && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ninguém com dados neste período ainda.
        </p>
      )}

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <RankingCard
            key={entry.userId}
            entry={entry}
            position={i + 1}
            format={group ? formatForMetric(group.metric) : formatCurrency}
          />
        ))}
      </div>

      <Button variant="outline" className="w-full text-destructive" onClick={handleLeave}>
        Sair do grupo
      </Button>
    </div>
  );
}
