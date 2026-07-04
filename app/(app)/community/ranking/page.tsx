"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { RankingCard } from "@/components/community/RankingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentProfile } from "@/providers/AuthProvider";
import { useRankingStats } from "@/hooks/useRankingStats";

const GROUPS = [
  { id: "1", name: "Turma da Uber SP", members: 34, metric: "Ganhos semanais" },
  { id: "2", name: "iFood Zona Sul", members: 18, metric: "Corridas no mês" },
];

export default function RankingPage() {
  const profile = useCurrentProfile();
  const { entries } = useRankingStats();

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

        <TabsContent value="groups" className="space-y-2">
          {GROUPS.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.members} membros · {g.metric}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Entrar em grupos estará disponível em breve")}
                >
                  Entrar
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.info("Criação de grupos estará disponível em breve")}
          >
            Criar grupo
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
