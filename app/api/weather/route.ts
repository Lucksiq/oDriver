import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Clima não configurado" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");

  const locationQuery =
    lat && lon
      ? `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      : city
        ? `q=${encodeURIComponent(city)}`
        : null;

  if (!locationQuery) {
    return NextResponse.json({ error: "Localização não informada" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${apiKey}&units=metric&lang=pt_br`,
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao consultar o clima" }, { status: res.status });
  }

  const data = await res.json();

  return NextResponse.json({
    city: data.name as string,
    tempC: Math.round(data.main?.temp as number),
    condition: data.weather?.[0]?.description as string | undefined,
    icon: data.weather?.[0]?.icon as string | undefined,
  });
}
