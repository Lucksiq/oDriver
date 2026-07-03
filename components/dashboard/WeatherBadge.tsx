"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useWeather } from "@/hooks/useWeather";

function weatherEmoji(icon?: string) {
  if (!icon) return "🌡️";
  const code = icon.slice(0, 2);
  switch (code) {
    case "01":
      return icon.endsWith("d") ? "☀️" : "🌙";
    case "02":
      return "⛅";
    case "03":
    case "04":
      return "☁️";
    case "09":
      return "🌧️";
    case "10":
      return "🌦️";
    case "11":
      return "⛈️";
    case "13":
      return "❄️";
    case "50":
      return "🌫️";
    default:
      return "🌡️";
  }
}

export function WeatherBadge() {
  const { weather, loading } = useWeather();

  if (loading) {
    return <Skeleton className="h-8 w-28 rounded-full" />;
  }

  if (!weather) return null;

  return (
    <div
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-3 py-1.5 text-sm"
      title={weather.condition}
    >
      <span>{weatherEmoji(weather.icon)}</span>
      <span className="font-semibold">{weather.tempC}°C</span>
      <span className="text-muted-foreground">· {weather.city}</span>
    </div>
  );
}
