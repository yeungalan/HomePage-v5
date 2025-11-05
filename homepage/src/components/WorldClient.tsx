"use client"
import WorldMap from './World';

interface WorldClientProps {
  airports: any[];
  routes: any[];
  trainPaths: any[];
}

export default function WorldClient({ airports, routes, trainPaths }: WorldClientProps) {
  return (
    <WorldMap
      initialAirports={airports}
      initialRoutes={routes}
      initialTrainPaths={trainPaths}
    />
  );
}
