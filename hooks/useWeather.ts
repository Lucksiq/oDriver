"use client";

import { useEffect, useState } from "react";
import { getCurrentPosition } from "@/lib/geolocation";
import { useAuth } from "@/providers/AuthProvider";

interface WeatherData {
  city: string;
  tempC: number;
  condition?: string;
  icon?: string;
}

export function useWeather() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      let url: string | null = null;

      if (navigator.geolocation) {
        const result = await getCurrentPosition({ timeout: 8000, maximumAge: 5 * 60_000 });
        if (cancelled) return;
        if ("coords" in result) {
          url = `/api/weather?lat=${result.coords.latitude}&lon=${result.coords.longitude}`;
        }
      }

      if (!url && profile?.city) {
        const cityQuery = profile.state
          ? `${profile.city},${profile.state},BR`
          : `${profile.city},BR`;
        url = `/api/weather?city=${encodeURIComponent(cityQuery)}`;
      }

      if (!url) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(url);
        if (!cancelled && res.ok) {
          setWeather(await res.json());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.city, profile?.state]);

  return { weather, loading };
}
