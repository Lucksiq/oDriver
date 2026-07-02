"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_CITY } from "@/lib/geo";
import type { MapReport, MapReportType } from "@/lib/types";
import { useMapStore } from "@/stores/mapStore";

const TYPE_META: Record<MapReportType, { emoji: string; label: string; color: string }> = {
  accident: { emoji: "🚨", label: "Acidente", color: "bg-destructive" },
  block: { emoji: "🚧", label: "Bloqueio", color: "bg-warning" },
  radar: { emoji: "📸", label: "Radar", color: "bg-chart-4" },
  risk_zone: { emoji: "⚠️", label: "Zona de risco", color: "bg-destructive" },
  hotspot: { emoji: "🔥", label: "Ponto quente", color: "bg-success" },
};

const BOUNDS = {
  latMin: DEMO_CITY.lat - 0.13,
  latMax: DEMO_CITY.lat + 0.13,
  lngMin: DEMO_CITY.lng - 0.13,
  lngMax: DEMO_CITY.lng + 0.13,
};

function project(lat: number, lng: number) {
  const left = ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100;
  const top = ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * 100;
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(96, Math.max(4, top))}%`,
  };
}

export function MapMock({ reports }: { reports: MapReport[] }) {
  const confirmReport = useMapStore((s) => s.confirmReport);
  const [selected, setSelected] = useState<MapReport | null>(null);

  return (
    <div className="space-y-3">
      <div
        className="relative h-80 w-full overflow-hidden rounded-xl border bg-brand-navy"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px)",
        }}
      >
        <div className="absolute left-2 top-2 rounded bg-black/30 px-2 py-1 text-[10px] text-white/70">
          Mapa ilustrativo — {DEMO_CITY.name} (aguardando integração com Google Maps)
        </div>
        {reports.map((r) => {
          const pos = project(r.latitude, r.longitude);
          const meta = TYPE_META[r.type];
          return (
            <button
              key={r.id}
              style={pos}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full text-base shadow-md ring-2 ring-white/80 transition-transform hover:scale-110"
              onClick={() => setSelected(r)}
              aria-label={meta.label}
            >
              <span className={`flex size-8 items-center justify-center rounded-full ${meta.color}`}>
                {meta.emoji}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_META).map(([type, meta]) => (
          <span
            key={type}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
          >
            {meta.emoji} {meta.label}
          </span>
        ))}
      </div>

      {selected && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="font-semibold">
                {TYPE_META[selected.type].emoji} {TYPE_META[selected.type].label}
              </p>
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {selected.confirmations} confirmações · {selected.city}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                confirmReport(selected.id);
                setSelected({ ...selected, confirmations: selected.confirmations + 1 });
              }}
            >
              Confirmar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
