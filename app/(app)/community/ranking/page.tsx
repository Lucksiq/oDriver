"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { RankingCard } from "@/components/community/RankingCard";
import { CreateGroupDialog } from "@/components/community/CreateGroupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentProfile } from "@/providers/AuthProvider";
import { useRankingStats } from "@/hooks/useRankingStats";
import { useRankingGroups } from "@/hooks/useRankingGroups";

const METRIC_LABELS: Record<string, string> = {
  earnings: "Ganhos",
  rides: "Corridas",
  profit: "Lucro",
  km: "Quilômetros",
};

const PERIOD_LABELS: Record<string, string> = {
  daily: "diário",
  weekly: "semanal",
  monthly: "mensal",
  all_time: "todo o período",
};

export default function RankingPage() {
  const profile = useCurrentProfile();
  const { entries } = useRankingStats();
  const { myGroups, discoverGroups, createGroup, joinGroup } = useRankingGroups();
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  async function handleJoin(code: string) {
    const ok = await joinGroup(code);
    if (ok) {
      toast.success("Você entrou no grupo!");
      setInviteCode("");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ranking" subtitle="Ganhos semanais entre motoristas que optaram por aparecer" />
      <CommunityTabs />

      <Tabs defaultValue="global">
        <TabsList className="w-full">
          <TabsTrigger value="global" className="flex-1">
            Global
          </TabsTrigger>
          <TabsTrigger value="city" className="flex-1">
            Cidade
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            Grupos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-2">
          {entries.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Ninguém no ranking ainda. Ative &quot;Mostrar ganhos no ranking público&quot; no
              seu perfil para aparecer aqui.
            </p>
          )}
          {entries.map((entry, i) => (
            <RankingCard key={entry.userId} entry={entry} position={i + 1} />
          ))}
        </TabsContent>

        <TabsContent value="city" className="space-y-2">
          {entries.filter((e) => e.city === profile?.city || !profile?.city).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Ninguém da sua cidade no ranking ainda.
            </p>
          )}
          {entries
            .filter((e) => e.city === profile?.city || !profile?.city)
            .map((entry, i) => (
              <RankingCard key={entry.userId} entry={entry} position={i + 1} />
            ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Código de convite"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <Button variant="outline" onClick={() => handleJoin(inviteCode)}>
              Entrar
            </Button>
          </div>

          {myGroups.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Meus grupos</p>
              {myGroups.map((g) => (
                <Link key={g.id} href={`/community/ranking/groups/${g.id}`}>
                  <Card>
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.memberCount} membros · {METRIC_LABELS[g.metric]} (
                          {PERIOD_LABELS[g.period]})
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {discoverGroups.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Descobrir</p>
              {discoverGroups.map((g) => (
                <Card key={g.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.memberCount} membros · {METRIC_LABELS[g.metric]} (
                        {PERIOD_LABELS[g.period]})
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleJoin(g.inviteCode)}>
                      Entrar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {myGroups.length === 0 && discoverGroups.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum grupo ainda. Crie o primeiro ou entre com um código de convite.
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>
            Criar grupo
          </Button>

          <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createGroup} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
