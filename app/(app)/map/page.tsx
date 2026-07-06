"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TomTomMap } from "@/components/map/TomTomMap";
import { ReportDialog } from "@/components/map/ReportDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMapReports } from "@/hooks/useMapReports";

export default function MapPage() {
  const { reports, voteReport } = useMapReports();
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader title="Mapa" subtitle="Trânsito e ocorrências em tempo real" />

      <TomTomMap
        reports={reports}
        pendingLocation={pendingLocation}
        onMapClick={setPendingLocation}
        onVoteReport={voteReport}
      />

      {pendingLocation ? (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <p className="text-sm">Local marcado — toque em outro ponto para mudar.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPendingLocation(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                Reportar aqui
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Toque no mapa para marcar o local de uma ocorrência.
        </p>
      )}

      <ReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={pendingLocation}
        onSubmitted={() => setPendingLocation(null)}
      />
    </div>
  );
}
