/**
 * Timezone display configuration for the goals page
 * Coordinates from airport ICAO codes
 */
export const TIMEZONES = [
  { label: 'Hong Kong', tz: 'Asia/Hong_Kong', lat: 22.308901, lng: 113.915001 },     // VHHH
  { label: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.552299, lng: 139.779999 },              // RJTT
  { label: 'Los Angeles', tz: 'America/Los_Angeles', lat: 47.449001, lng: -122.309 }, // KSEA
  { label: 'New York', tz: 'America/New_York', lat: 40.639801, lng: -73.7789 },       // KJFK
] as const;

/**
 * Calculate solar altitude to determine if it's daytime at a given lat/lng
 * Returns a value from 0 (night) to 1 (day) with smooth twilight transition
 */
export function getDaylightFactor(date: Date, lat: number, lng: number): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarHourAngle = (utcHours - 12) * 15 + lng;

  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const haRad = solarHourAngle * Math.PI / 180;

  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const altitudeDeg = Math.asin(sinAlt) * 180 / Math.PI;

  // Smooth transition: -6° (civil twilight) to 6° (full day)
  if (altitudeDeg > 6) return 1;
  if (altitudeDeg < -6) return 0;
  return (altitudeDeg + 6) / 12;
}
