import * as solar from 'solar-calculator';
import type { Airport, PointData } from '@/types/world';
import { CLUSTER_THRESHOLDS, ALTITUDE_LEVELS } from '@/constants/globe';

/** Parse a CSV row from airports.dat into an Airport object */
export const airportParse = (
  [airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]: string[]
): Airport => ({
  airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source,
});

/** Return [longitude, latitude] of the sun at the given time */
export const sunPosAt = (dt: number | Date): [number, number] => {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
  const t = solar.century(dt);
  const longitude = ((day - +dt) / 864e5) * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

/** Great-circle distance between two lat/lng points in kilometres (Haversine) */
export const haversineDistance = (
  lat1: number, lng1: number, lat2: number, lng2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Merge nearby points into clusters based on the current altitude (zoom level).
 * Higher altitude → larger clustering radius.
 */
export const clusterPoints = (points: PointData[], altitude: number): PointData[] => {
  let clusterThresholdKm = 0;

  if (altitude < CLUSTER_THRESHOLDS.MIN_ALTITUDE_FOR_CLUSTERING) return points;
  else if (altitude < ALTITUDE_LEVELS.LIGHT)   clusterThresholdKm = CLUSTER_THRESHOLDS.LIGHT_CLUSTERING_KM;
  else if (altitude < ALTITUDE_LEVELS.MEDIUM)  clusterThresholdKm = CLUSTER_THRESHOLDS.MEDIUM_CLUSTERING_KM;
  else if (altitude < ALTITUDE_LEVELS.HEAVY)   clusterThresholdKm = CLUSTER_THRESHOLDS.HEAVY_CLUSTERING_KM;
  else                                          clusterThresholdKm = CLUSTER_THRESHOLDS.MAX_CLUSTERING_KM;

  const clustered: PointData[] = [];
  const used = new Set<number>();

  points.forEach((point, i) => {
    if (used.has(i)) return;
    const cluster = [point];
    used.add(i);

    for (let j = i + 1; j < points.length; j++) {
      if (used.has(j)) continue;
      const other = points[j];
      const dist = haversineDistance(
        parseFloat(String(point.lat)), parseFloat(String(point.lng)),
        parseFloat(String(other.lat)), parseFloat(String(other.lng))
      );
      if (dist <= clusterThresholdKm) { cluster.push(other); used.add(j); }
    }

    if (cluster.length === 1) { clustered.push(point); return; }

    const avgLat = cluster.reduce((s, p) => s + parseFloat(String(p.lat)), 0) / cluster.length;
    const avgLng = cluster.reduce((s, p) => s + parseFloat(String(p.lng)), 0) / cluster.length;

    const airports = cluster.filter(p => p.type === 'airport' || p.type === 'overlap');
    const trains   = cluster.filter(p => p.type === 'train'   || p.type === 'overlap');
    const hasAirports = airports.length > 0;
    const hasTrains   = trains.length   > 0;

    let mergedType = 'cluster';
    if (hasAirports && hasTrains) mergedType = 'cluster-both';
    else if (hasAirports)         mergedType = 'cluster-airport';
    else if (hasTrains)           mergedType = 'cluster-train';

    const names = cluster
      .map(p => p.name ?? p.city)
      .filter((v): v is string => !!v)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    const allFlightRoutes = new Set<string>(airports.flatMap(a => a.flightRoutes ?? []));
    const allTrainRoutes  = new Set<string>(trains.flatMap(t => t.routes ?? []));

    clustered.push({
      lat: avgLat.toString(),
      lng: avgLng.toString(),
      type: mergedType,
      clusterSize: cluster.length,
      airportCount: airports.length,
      trainCount:   trains.length,
      names,
      originalPoints: cluster,
      flightRoutes: Array.from(allFlightRoutes),
      trainRoutes:  Array.from(allTrainRoutes),
    });
  });

  return clustered;
};
