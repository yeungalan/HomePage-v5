import { csvParseRows } from "d3-dsv";
import { readFile } from "fs/promises";
import { join } from "path";

const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]: string[]) => ({
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
});

const routeParse = ([srcIata, dstIata]: string[]) => ({ srcIata, dstIata });

export async function fetchWorldData() {
  try {
    const publicDir = join(process.cwd(), 'public');

    // Fetch airports and routes
    const [airportsData, routesData, trainData] = await Promise.all([
      readFile(join(publicDir, 'airports.dat'), 'utf-8'),
      readFile(join(publicDir, 'routes.dat'), 'utf-8'),
      readFile(join(publicDir, 'train.dat'), 'utf-8').catch(() => '[]'),
    ]);

    const airports = csvParseRows(airportsData, airportParse);
    const routes = csvParseRows(routesData, routeParse);
    const trainPaths = JSON.parse(trainData);

    return {
      airports,
      routes,
      trainPaths,
    };
  } catch (error) {
    console.error('Error fetching world data:', error);
    return {
      airports: [],
      routes: [],
      trainPaths: [],
    };
  }
}
