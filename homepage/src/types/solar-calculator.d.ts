// Type declarations for solar-calculator
declare module 'solar-calculator' {
  export interface SolarPosition {
    altitude: number
    azimuth: number
  }

  export class SolarCalculator {
    constructor()
    getSolarPosition(date: Date, latitude: number, longitude: number): SolarPosition
  }

  const calculator: SolarCalculator
  export default calculator
}
