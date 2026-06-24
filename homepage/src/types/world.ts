// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PointData = Record<string, any> & {
  type: string;
  lat?: string | number;
  lng?: string | number;
  name?: string;
  city?: string;
  iata?: string;
  routes?: string[];
  flightRoutes?: string[];
  trainRoutes?: string[];
  clusterSize?: number;
  airportCount?: number;
  trainCount?: number;
  names?: string[];
  originalPoints?: PointData[];
};

export interface Airport {
  airportId: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  lat: string;
  lng: string;
  alt: string;
  timezone: string;
  dst: string;
  tz: string;
  type: string;
  source: string;
}

export interface Route {
  srcIata: string;
  dstIata: string;
  srcAirport?: Airport;
  dstAirport?: Airport;
}

export interface TrainStation {
  lat: number;
  lng: number;
  name: string;
  routes: string[];
  type?: string;
}

export interface TrainPath {
  properties: {
    name: string;
    [key: string]: unknown;
  };
  coords: Array<{ lat: number; lng: number; city?: string } | [number, number]>;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type TimeMode = 'paused' | 'realtime' | 'animated' | 'stopped' | 'flat';
