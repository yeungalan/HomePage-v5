declare module 'solar-calculator' {
  export function getMoonIllumination(date: Date): {
    fraction: number;
    phase: number;
    angle: number;
  };
  export function getMoonPosition(date: Date, lat: number, lng: number): {
    azimuth: number;
    altitude: number;
    distance: number;
  };
  export function getSunPosition(date: Date, lat: number, lng: number): {
    azimuth: number;
    altitude: number;
  };
}
