/**
 * Data parsing utilities for World component
 */

export interface Airport {
  airportId: string
  name: string
  city: string
  country: string
  iata: string
  icao: string
  lat: string
  lng: string
  alt: string
  timezone: string
  dst: string
  tz: string
  type: string
  source: string
}

export interface Route {
  srcIata: string
  dstIata: string
}

export interface TrainStation {
  lat: number
  lng: number
  name: string
  routes: string[]
  type: 'train'
}

export interface TrainPath {
  coords: Array<[number, number] | { lat: number; lng: number; city?: string }>
  properties: {
    name?: string
  }
}

/**
 * Parse airport data from CSV row
 */
export const airportParse = ([
  airportId,
  name,
  city,
  country,
  iata,
  icao,
  lat,
  lng,
  alt,
  timezone,
  dst,
  tz,
  type,
  source,
]: string[]): Airport => ({
  airportId,
  name,
  city,
  country,
  iata,
  icao,
  lat,
  lng,
  alt,
  timezone,
  dst,
  tz,
  type,
  source,
})

/**
 * Parse route data from CSV row
 */
export const routeParse = ([srcIata, dstIata]: string[]): Route => ({
  srcIata,
  dstIata,
})

/**
 * Extract train stations from train path data
 */
export const extractTrainStations = (trainData: TrainPath[]): TrainStation[] => {
  const stationMap = new Map<string, TrainStation>()

  trainData.forEach((route) => {
    const routeName = route.properties.name || ''
    const coords = route.coords

    coords.forEach((coord) => {
      let lat: number, lng: number, cityName: string

      if (Array.isArray(coord)) {
        // Old format: [lat, lng]
        ;[lat, lng] = coord
        // Fallback: extract from route name
        const cities = routeName.split('↔').map((s) => s.trim())
        const index = coords.indexOf(coord)
        cityName = index < cities.length ? cities[index] : cities[cities.length - 1]
      } else {
        // New format: {lat, lng, city}
        lat = coord.lat
        lng = coord.lng
        cityName = coord.city || ''
      }

      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`

      if (!stationMap.has(key)) {
        stationMap.set(key, {
          lat,
          lng,
          name: cityName,
          routes: [],
          type: 'train',
        })
      }

      // Add route name to this station
      const station = stationMap.get(key)
      if (station && routeName && !station.routes.includes(routeName)) {
        station.routes.push(routeName)
      }
    })
  })

  return Array.from(stationMap.values())
}
