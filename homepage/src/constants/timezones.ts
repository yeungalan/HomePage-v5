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
 * Calculate solar altitude to determine time-of-day phase at a given lat/lng
 */
export type DaylightPhase = 'night' | 'sunrise' | 'daytime' | 'sunset';

export interface DaylightInfo {
  phase: DaylightPhase;
  emoji: string;
  gradient: string;
  textColor: string;
}

function getSolarAltitude(date: Date, lat: number, lng: number): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarHourAngle = (utcHours - 12) * 15 + lng;
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const haRad = solarHourAngle * Math.PI / 180;
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  return Math.asin(sinAlt) * 180 / Math.PI;
}

export function getDaylightInfo(date: Date, lat: number, lng: number): DaylightInfo {
  const alt = getSolarAltitude(date, lat, lng);
  // Also check if sun is rising or setting based on hour angle direction
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarHour = ((utcHours + lng / 15) % 24 + 24) % 24; // local solar time 0-24
  const isMorning = solarHour < 12;

  if (alt > 6) {
    return { phase: 'daytime', emoji: '☀️', gradient: 'linear-gradient(135deg, hsl(200, 70%, 75%), hsl(210, 60%, 85%))', textColor: 'text-gray-900' };
  }
  if (alt > -6 && isMorning) {
    return { phase: 'sunrise', emoji: '🌅', gradient: 'linear-gradient(135deg, hsl(30, 80%, 65%), hsl(45, 70%, 75%))', textColor: 'text-gray-900' };
  }
  if (alt > -6 && !isMorning) {
    return { phase: 'sunset', emoji: '🌇', gradient: 'linear-gradient(135deg, hsl(15, 75%, 55%), hsl(35, 65%, 60%))', textColor: 'text-white' };
  }
  return { phase: 'night', emoji: '🌙', gradient: 'linear-gradient(135deg, hsl(230, 30%, 15%), hsl(240, 25%, 20%))', textColor: 'text-white' };
}
