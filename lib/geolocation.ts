/** Promise wrapper around the browser Geolocation API — resolves with either the position or the error, never rejects. */
export function getCurrentPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition | GeolocationPositionError>((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, resolve, options);
  });
}
