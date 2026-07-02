"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MapMock } from "@/components/map/MapMock";
import { ReportDialog } from "@/components/map/ReportDialog";
import { useMapStore } from "@/stores/mapStore";

export default function MapPage() {
  const allReports = useMapStore((s) => s.reports);
  const reports = useMemo(() => allReports.filter((r) => r.active), [allReports]);

  return (
    <div className="space-y-4">
      <PageHeader title="Mapa" subtitle="Trânsito e ocorrências em tempo real" />
      <MapMock reports={reports} />
      <ReportDialog />
    </div>
  );
}
