export const DEMO_CITY = {
  name: "São Paulo",
  state: "SP",
  lat: -23.5505,
  lng: -46.6333,
};

/** Jitters a point within roughly `radiusKm` of the demo city center. */
export function jitterNear(
  center: { lat: number; lng: number } = DEMO_CITY,
  radiusKm = 8,
) {
  const degreesPerKm = 1 / 111;
  const dLat = (Math.random() - 0.5) * 2 * radiusKm * degreesPerKm;
  const dLng = (Math.random() - 0.5) * 2 * radiusKm * degreesPerKm;
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}
