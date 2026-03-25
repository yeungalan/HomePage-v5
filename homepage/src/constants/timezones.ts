/**
 * Timezone display configuration for the goals page
 * Coordinates from airport ICAO codes
 */
export const TIMEZONES = [
  { label: 'Hong Kong', tz: 'Asia/Hong_Kong', lat: 22.308901, lng: 113.915001 },     // VHHH
  { label: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.552299, lng: 139.779999 },              // RJTT
  { label: 'Seattle', tz: 'America/Los_Angeles', lat: 47.449001, lng: -122.309 },     // KSEA
  { label: 'New York', tz: 'America/New_York', lat: 40.639801, lng: -73.7789 },       // KJFK
] as const;

export type DaylightPhase = 'night' | 'sunrise' | 'daytime' | 'sunset';

export interface DaylightInfo {
  phase: DaylightPhase;
  icon: string;
  gradient: string;
  textColor: string;
}

const PHASE_CONFIG: Record<DaylightPhase, Omit<DaylightInfo, 'phase'>> = {
  daytime: { icon: 'mdi:weather-sunny', gradient: 'linear-gradient(135deg, hsl(200, 70%, 75%), hsl(210, 60%, 85%))', textColor: 'text-gray-900' },
  sunrise: { icon: 'mdi:weather-sunset-up', gradient: 'linear-gradient(135deg, hsl(30, 80%, 65%), hsl(45, 70%, 75%))', textColor: 'text-gray-900' },
  sunset:  { icon: 'mdi:weather-sunset-down', gradient: 'linear-gradient(135deg, hsl(15, 75%, 55%), hsl(35, 65%, 60%))', textColor: 'text-white' },
  night:   { icon: 'mdi:weather-night', gradient: 'linear-gradient(135deg, hsl(230, 30%, 15%), hsl(240, 25%, 20%))', textColor: 'text-white' },
};

function getSolarAltitude(date: Date, lat: number, lng: number): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const haRad = ((utcHours - 12) * 15 + lng) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  return Math.asin(sinAlt) * 180 / Math.PI;
}

export function getDaylightInfo(date: Date, lat: number, lng: number): DaylightInfo {
  const alt = getSolarAltitude(date, lat, lng);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarHour = ((utcHours + lng / 15) % 24 + 24) % 24;
  const isMorning = solarHour < 12;

  let phase: DaylightPhase;
  if (alt > 6) phase = 'daytime';
  else if (alt > -6 && isMorning) phase = 'sunrise';
  else if (alt > -6) phase = 'sunset';
  else phase = 'night';

  return { phase, ...PHASE_CONFIG[phase] };
}
