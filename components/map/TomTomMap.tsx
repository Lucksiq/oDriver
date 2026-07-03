"use client";

import { useEffect, useRef, useState } from "react";
import type * as TT from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_CITY } from "@/lib/geo";
import { getCurrentPosition } from "@/lib/geolocation";
import { useAuth } from "@/providers/AuthProvider";
import type { MapReport, MapReportType } from "@/lib/types";

type LocationSource = "gps" | "profile-city" | "fallback";

async function geocodeCity(
  city: string,
  state: string,
  apiKey: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, ${state}, Brasil`);
    const res = await fetch(
      `https://api.tomtom.com/search/2/geocode/${query}.json?key=${apiKey}&limit=1&countrySet=BR`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const position = data.results?.[0]?.position;
    if (!position) return null;
    return { lat: position.lat, lng: position.lon };
  } catch {
    return null;
  }
}

const TYPE_META: Record<MapReportType, { emoji: string; label: string; color: string }> = {
  accident: { emoji: "🚨", label: "Acidente", color: "bg-destructive" },
  block: { emoji: "🚧", label: "Bloqueio", color: "bg-warning" },
  radar: { emoji: "📸", label: "Radar", color: "bg-chart-4" },
  risk_zone: { emoji: "⚠️", label: "Zona de risco", color: "bg-destructive" },
  hotspot: { emoji: "🔥", label: "Ponto quente", color: "bg-success" },
};

function loadTomTom() {
  return import("@tomtom-international/web-sdk-maps").then(
    (mod) => (mod as unknown as { default: typeof TT }).default ?? (mod as unknown as typeof TT),
  );
}

function createMarkerElement(className: string, emoji: string) {
  const el = document.createElement("div");
  el.className = className;
  el.style.cursor = "pointer";
  el.textContent = emoji;
  return el;
}

function createUserLocationElement() {
  const wrapper = document.createElement("div");
  wrapper.className = "relative flex size-4 items-center justify-center";
  const ping = document.createElement("span");
  ping.className =
    "absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60";
  const dot = document.createElement("span");
  dot.className = "relative inline-flex size-3 rounded-full bg-blue-500 ring-2 ring-white";
  wrapper.append(ping, dot);
  return wrapper;
}

export function TomTomMap({
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
  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  const { profile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<TT.Map | null>(null);
  const markersRef = useRef<TT.Marker[]>([]);
  const pendingMarkerRef = useRef<TT.Marker | null>(null);
  const userMarkerRef = useRef<TT.Marker | null>(null);
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  });

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<MapReport | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveCenter() {
      if (navigator.geolocation) {
        const result = await getCurrentPosition({ timeout: 8000, maximumAge: 60_000 });
        if (cancelled) return;
        if ("coords" in result) {
          setCenter({ lat: result.coords.latitude, lng: result.coords.longitude });
          setLocationSource("gps");
          setLocationError(null);
          return;
        }
        console.warn("Geolocalização indisponível:", result.message);
        setLocationError(result.message);
      } else {
        setLocationError("Geolocalização não suportada neste navegador");
      }

      if (profile?.city && apiKey) {
        const geocoded = await geocodeCity(profile.city, profile.state, apiKey);
        if (cancelled) return;
        if (geocoded) {
          setCenter(geocoded);
          setLocationSource("profile-city");
          return;
        }
      }

      if (cancelled) return;
      setCenter({ lat: DEMO_CITY.lat, lng: DEMO_CITY.lng });
      setLocationSource("fallback");
    }

    resolveCenter();
    return () => {
      cancelled = true;
    };
  }, [profile?.city, profile?.state, apiKey, retryToken]);

  // Creates the map exactly once, at whatever center is available first.
  // Later center changes (GPS resolving, retry) just pan the existing map —
  // recreating it would tear down every marker for no reason.
  useEffect(() => {
    if (!center || !apiKey || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    loadTomTom().then((tt) => {
      if (cancelled || !containerRef.current) return;
      const map = tt.map({
        key: apiKey,
        container: containerRef.current,
        center: [center.lng, center.lat],
        zoom: 14,
        stylesVisibility: { trafficFlow: true, trafficIncidents: true },
      });
      map.on("load", () => {
        if (!cancelled) setMapReady(true);
      });
      map.on("click", (e) => {
        onMapClickRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
    };
  }, [center, apiKey]);

  // True unmount teardown, decoupled from the center-tracking effect above.
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-centers the already-created map whenever the resolved location changes.
  useEffect(() => {
    if (!mapReady || !mapRef.current || !center) return;
    mapRef.current.setCenter([center.lng, center.lat]);
  }, [center, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;
    loadTomTom().then((tt) => {
      if (cancelled || !mapRef.current) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = reports.map((r) => {
        const el = createMarkerElement(
          `flex size-8 items-center justify-center rounded-full text-base shadow-md ring-2 ring-white ${TYPE_META[r.type].color}`,
          TYPE_META[r.type].emoji,
        );
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          setSelected(r);
        });
        return new tt.Marker({ element: el })
          .setLngLat([r.longitude, r.latitude])
          .addTo(mapRef.current!);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [reports, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    pendingMarkerRef.current?.remove();
    pendingMarkerRef.current = null;
    if (!pendingLocation) return;
    let cancelled = false;
    loadTomTom().then((tt) => {
      if (cancelled || !mapRef.current) return;
      const el = createMarkerElement(
        "flex size-8 items-center justify-center rounded-full bg-primary text-base text-primary-foreground shadow-lg ring-2 ring-white",
        "📍",
      );
      pendingMarkerRef.current = new tt.Marker({ element: el })
        .setLngLat([pendingLocation.lng, pendingLocation.lat])
        .addTo(mapRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [pendingLocation, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (locationSource !== "gps" || !center) return;
    let cancelled = false;
    loadTomTom().then((tt) => {
      if (cancelled || !mapRef.current) return;
      userMarkerRef.current = new tt.Marker({ element: createUserLocationElement() })
        .setLngLat([center.lng, center.lat])
        .addTo(mapRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [center, locationSource, mapReady]);

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Configure NEXT_PUBLIC_TOMTOM_API_KEY para exibir o mapa real.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!center ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-xl border" />
      )}

      {locationSource && locationSource !== "gps" && (
        <Card className="border-warning">
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <p className="text-xs text-muted-foreground">
              {locationSource === "profile-city"
                ? `Não conseguimos acessar seu GPS — mostrando o mapa de ${profile?.city}. Ative a localização no navegador para ver sua região exata.`
                : "Não conseguimos acessar seu GPS nem sua cidade cadastrada — mostrando um mapa de exemplo."}
              {locationError && (
                <span className="block text-[10px] opacity-70">Motivo: {locationError}</span>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryToken((n) => n + 1)}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
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
