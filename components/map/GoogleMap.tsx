"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_CITY } from "@/lib/geo";
import type { MapReport, MapReportType } from "@/lib/types";

const TYPE_META: Record<MapReportType, { emoji: string; label: string; color: string }> = {
  accident: { emoji: "🚨", label: "Acidente", color: "bg-destructive" },
  block: { emoji: "🚧", label: "Bloqueio", color: "bg-warning" },
  radar: { emoji: "📸", label: "Radar", color: "bg-chart-4" },
  risk_zone: { emoji: "⚠️", label: "Zona de risco", color: "bg-destructive" },
  hotspot: { emoji: "🔥", label: "Ponto quente", color: "bg-success" },
};

function TrafficLayer() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const layer = new google.maps.TrafficLayer();
    layer.setMap(map);
    return () => layer.setMap(null);
  }, [map]);
  return null;
}

function extractLatLng(latLng: unknown): { lat: number; lng: number } | null {
  if (!latLng || typeof latLng !== "object") return null;
  const obj = latLng as { lat: number | (() => number); lng: number | (() => number) };
  const lat = typeof obj.lat === "function" ? obj.lat() : obj.lat;
  const lng = typeof obj.lng === "function" ? obj.lng() : obj.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng };
}

export function GoogleMap({
  reports,
  pendingLocation,
  onMapClick,
  onConfirmReport,
}: {
  reports: MapReport[];
  pendingLocation: { lat: number; lng: number } | null;
  onMapClick: (loc: { lat: number; lng: number }) => void;
  onConfirmReport: (id: string) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<MapReport | null>(null);

  useEffect(() => {
    // Feature-detect-on-mount; the "no geolocation" branch resolves
    // synchronously, which the linter can't distinguish from an unintended
    // cascading render (see useRides.ts for the same pattern).
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCenter({ lat: DEMO_CITY.lat, lng: DEMO_CITY.lng });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCenter({ lat: DEMO_CITY.lat, lng: DEMO_CITY.lng }),
      { timeout: 5000 },
    );
  }, []);

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa real.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!center ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <div className="h-80 w-full overflow-hidden rounded-xl border">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={14}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              onClick={(e) => {
                const loc = extractLatLng(e.detail.latLng);
                if (loc) onMapClick(loc);
              }}
            >
              <TrafficLayer />
              {reports.map((r) => (
                <AdvancedMarker
                  key={r.id}
                  position={{ lat: r.latitude, lng: r.longitude }}
                  onClick={() => setSelected(r)}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-base shadow-md ring-2 ring-white ${TYPE_META[r.type].color}`}
                  >
                    {TYPE_META[r.type].emoji}
                  </span>
                </AdvancedMarker>
              ))}
              {pendingLocation && (
                <AdvancedMarker position={pendingLocation}>
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-base text-primary-foreground shadow-lg ring-2 ring-white">
                    📍
                  </span>
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        </div>
      )}

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
                onConfirmReport(selected.id);
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
