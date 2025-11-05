"use client"
import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { csvParseRows } from "d3-dsv";
import indexBy from "index-array-by";
import { TextureLoader, ShaderMaterial, Vector2 } from "three";
import { motion } from "framer-motion";
import { FullPageLoading } from "./Loading";
import { TimeControl, Legend, ZoomIndicator, TimeDisplay, type TimeMode } from "./World";
import { airportParse, routeParse, extractTrainStations, type Airport, type Route, type TrainPath } from "@/utils/worldDataParsers";
import { dayNightShader, sunPosAt } from "@/utils/worldShaders";
import { clusterPoints, type ClusteredPoint } from "@/utils/worldClustering";
import {
  GLOBE_CONFIG,
  ALTITUDE_LIMITS,
  OVERLAP_THRESHOLD_DEGREES,
  POINT_RADIUS,
  POINT_COLORS,
  ROUTE_COLORS,
} from "@/constants/world";

interface RouteWithAirports extends Route {
  srcAirport: Airport
  dstAirport: Airport
}

interface AirportPoint extends Airport {
  type: 'airport'
  flightRoutes: string[]
}

export default function WorldMap() {
  const globeEl = useRef<{
    controls: () => { enableRotate: boolean };
    pointOfView: (pov?: { lat?: number; lng?: number; altitude?: number }, duration?: number) => { lat: number; lng: number; altitude: number };
  }>();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<RouteWithAirports[]>([]);
  const [trainStations, setTrainStations] = useState<ReturnType<typeof extractTrainStations>>([]);
  const [trainPaths, setTrainPaths] = useState<TrainPath[]>([]);
  const [dt, setDt] = useState(+new Date());
  const [globeMaterial, setGlobeMaterial] = useState<ShaderMaterial | null>(null);
  const [timeMode, setTimeMode] = useState<TimeMode>('animated');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [altitude, setAltitude] = useState(GLOBE_CONFIG.INITIAL_ALTITUDE);
  const [showFlightRoutes, setShowFlightRoutes] = useState(true);
  const [showTrainRoutes, setShowTrainRoutes] = useState(true);
  const [enableDaylight, setEnableDaylight] = useState(true);

  // Animate time based on mode
  useEffect(() => {
    if(timeMode === 'stopped') {
      setEnableDaylight(false);
    }else{
      setEnableDaylight(true);
    }
    if (timeMode === 'paused') return;

    let animationId: number;
    (function iterateTime() {
      setDt((t) => {
        if (timeMode === 'realtime') {
          return +new Date();
        } else if (timeMode === 'animated') {
          return t + GLOBE_CONFIG.VELOCITY * 60 * 1000;
        }
        return t;
      });
      animationId = requestAnimationFrame(iterateTime);
    })();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [timeMode]);

  // Listen for screen size changes and update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load airports + routes
  useEffect(() => {
    Promise.all([
      fetch("./airports.dat")
        .then((res) => res.text())
        .then((d) => csvParseRows(d, airportParse)),
      fetch("./routes.dat")
        .then((res) => res.text())
        .then((d) => csvParseRows(d, routeParse)),
    ]).then(([airports, routes]) => {
      const byIata = indexBy(airports, "iata", false);

      const filteredRoutes = routes
        .filter(
          (d) => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)
        )
        .map((d) =>
          Object.assign(d, {
            srcAirport: byIata[d.srcIata],
            dstAirport: byIata[d.dstIata],
          })
        ) as RouteWithAirports[];

      const usedIatas = new Set(
        filteredRoutes.flatMap((r) => [r.srcIata, r.dstIata])
      );
      const filteredAirports = airports.filter((a) => usedIatas.has(a.iata));

      setAirports(filteredAirports);
      setRoutes(filteredRoutes);
    }).catch(() => {
      setAirports([]);
      setRoutes([]);
    });

  }, []);

  // Load train data and extract stations as points
  useEffect(() => {
    fetch('./train.dat')
      .then(r => r.json())
      .then((trainData: TrainPath[]) => {
        const stations = extractTrainStations(trainData);
        setTrainStations(stations);
        setTrainPaths(trainData);
      })
      .catch(() => {
        setTrainStations([]);
        setTrainPaths([]);
      });
  }, []);

  // Setup globe material with day/night shader
  useEffect(() => {
    const loader = new TextureLoader();
    Promise.all([
      loader.loadAsync("/assets/images/day.jpg"),
      loader.loadAsync("/assets/images/night.jpg"),
    ]).then(([dayTexture, nightTexture]) => {
      const material = new ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTexture },
          nightTexture: { value: nightTexture },
          sunPosition: { value: new Vector2() },
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader,
      });
      setGlobeMaterial(material);
    });
  }, []);

  // Initialize globe position and animation
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().enableRotate = false;

      globeEl.current.pointOfView(
        {
          lat: GLOBE_CONFIG.INITIAL_LAT,
          lng: GLOBE_CONFIG.INITIAL_LNG,
          altitude: GLOBE_CONFIG.INITIAL_ALTITUDE
        },
        GLOBE_CONFIG.ANIMATION_DURATION
      );

      setTimeout(() => {
        setIsAnimating(false);
        if (globeEl.current) {
          globeEl.current.controls().enableRotate = true;
        }
      }, GLOBE_CONFIG.ANIMATION_DURATION);
    }
  }, [globeMaterial]);

  // Update sun position & globe rotation in shader
  useEffect(() => {
    if (!globeMaterial || !globeEl.current) return;

    const updateShader = () => {
      if (enableDaylight) {
        const [lng, lat] = sunPosAt(dt);
        globeMaterial.uniforms.sunPosition.value.set(lng, lat);
      } else {
        globeMaterial.uniforms.sunPosition.value.set(0, 0);
      }
    };

    updateShader();
    const interval = setInterval(updateShader, 100);
    return () => clearInterval(interval);
  }, [globeMaterial, dt, enableDaylight]);

  const handleModeChange = (newMode: TimeMode) => {
    setTimeMode(newMode);
  };

  const handleZoom = useCallback(
    ({ lng, lat, altitude }: { lng: number; lat: number; altitude: number }) => {
      if (isAnimating) return;

      if (globeMaterial?.uniforms?.globeRotation?.value) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat);
      }

      if (globeEl.current && altitude !== undefined) {
        const clampedAltitude = Math.max(ALTITUDE_LIMITS.MIN, Math.min(ALTITUDE_LIMITS.MAX, altitude));
        setAltitude(clampedAltitude);

        if (altitude !== clampedAltitude) {
          const currentPOV = globeEl.current.pointOfView();
          globeEl.current.pointOfView({
            ...currentPOV,
            altitude: clampedAltitude
          }, 0);
        }
      }
    },
    [globeMaterial, isAnimating]
  );

  // Combine airports and train stations, detecting overlaps
  const allPoints = useMemo(() => {
    const flightRoutesByIata = new Map<string, string[]>();
    routes.forEach(route => {
      if (!flightRoutesByIata.has(route.srcIata)) {
        flightRoutesByIata.set(route.srcIata, []);
      }
      flightRoutesByIata.get(route.srcIata)!.push(route.dstIata);

      if (!flightRoutesByIata.has(route.dstIata)) {
        flightRoutesByIata.set(route.dstIata, []);
      }
      flightRoutesByIata.get(route.dstIata)!.push(route.srcIata);
    });

    const airportPoints: AirportPoint[] = airports.map(a => ({
      ...a,
      type: 'airport' as const,
      flightRoutes: flightRoutesByIata.get(a.iata) || []
    }));
    const trainPoints = trainStations.map(t => ({ ...t, lat: t.lat.toString(), lng: t.lng.toString(), type: 'train' as const }));

    const mergedPoints: Array<AirportPoint | typeof trainPoints[0] | (AirportPoint & { type: 'overlap'; trainRoutes: string[] })> = [];
    const usedTrainIndices = new Set<number>();

    airportPoints.forEach(airport => {
      let foundOverlap = false;
      trainPoints.forEach((train, idx) => {
        if (usedTrainIndices.has(idx)) return;

        const latDiff = Math.abs(parseFloat(airport.lat) - parseFloat(train.lat));
        const lngDiff = Math.abs(parseFloat(airport.lng) - parseFloat(train.lng));

        if (latDiff < OVERLAP_THRESHOLD_DEGREES && lngDiff < OVERLAP_THRESHOLD_DEGREES) {
          mergedPoints.push({
            ...airport,
            type: 'overlap' as const,
            trainRoutes: train.routes || [],
            flightRoutes: airport.flightRoutes || []
          });
          usedTrainIndices.add(idx);
          foundOverlap = true;
        }
      });

      if (!foundOverlap) {
        mergedPoints.push(airport);
      }
    });

    trainPoints.forEach((train, idx) => {
      if (!usedTrainIndices.has(idx)) {
        mergedPoints.push(train);
      }
    });

    return clusterPoints(mergedPoints as ClusteredPoint[], altitude);
  }, [airports, trainStations, routes, altitude]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {globeMaterial ? (
          <motion.div
            className="w-full h-full"
            key={`${dimensions.width}-${dimensions.height}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              ease: "easeOut"
            }}
          >
            <Globe
              ref={globeEl as React.RefObject<unknown>}
              globeMaterial={globeMaterial}
              backgroundImageUrl="/assets/images/sky.png"
              onZoom={handleZoom}

              arcsData={showFlightRoutes ? routes : []}
              arcLabel={(d: RouteWithAirports) => `${d.srcIata} ↔ ${d.dstIata}`}
              arcStartLat={(d: RouteWithAirports) => +d.srcAirport.lat}
              arcStartLng={(d: RouteWithAirports) => +d.srcAirport.lng}
              arcEndLat={(d: RouteWithAirports) => +d.dstAirport.lat}
              arcEndLng={(d: RouteWithAirports) => +d.dstAirport.lng}
              arcColor={() => [
                `rgba(255, 255, 255, ${GLOBE_CONFIG.OPACITY})`,
                `rgba(255, 255, 255, ${GLOBE_CONFIG.OPACITY})`,
              ]}
              arcsTransitionDuration={0}

              pointsData={allPoints}
              pointLabel={(d: ClusteredPoint) => {
                if (d.type?.startsWith('cluster')) {
                  const locations = d.names?.join(', ') || '';
                  const moreText = (d.clusterSize && d.names && d.clusterSize > d.names.length) ? ` +${d.clusterSize - d.names.length} more` : '';
                  let typeText = '';

                  if (d.type === 'cluster-both') {
                    typeText = `${d.airportCount} Airport(s) & ${d.trainCount} Train/Car Stop(s)`;
                  } else if (d.type === 'cluster-airport') {
                    typeText = `${d.airportCount} Airport(s)`;
                  } else if (d.type === 'cluster-train') {
                    typeText = `${d.trainCount} Train/Car Stop(s)`;
                  }

                  const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                    ? `<div class="text-xs mt-1">✈️ ${d.flightRoutes.length} flight destination(s)</div>`
                    : '';
                  const trainInfo = d.trainRoutes && d.trainRoutes.length > 0
                    ? `<div class="text-xs mt-1">🚂 ${d.trainRoutes.length} train/car route(s)</div>`
                    : '';

                  return `<div class="text-white bg-black/90 px-3 py-2 rounded max-w-xs">
                    <div class="font-bold text-yellow-300">📍 ${d.clusterSize} Locations</div>
                    <div class="text-sm mt-1">${typeText}</div>
                    <div class="text-xs mt-1 text-gray-300">${locations}${moreText}</div>
                    ${flightInfo}${trainInfo}
                  </div>`;
                }

                if (d.type === 'overlap') {
                  const trainInfo = d.trainRoutes && d.trainRoutes.length > 0
                    ? `<br/><small>🚂 ${d.trainRoutes.length} train route(s)</small>`
                    : '';
                  const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                    ? `<br/><small>✈️ ${d.flightRoutes.length} flight destination(s)</small>`
                    : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.name || d.city}<br/>Airport & Train Station${flightInfo}${trainInfo}</div>`;
                }
                if (d.type === 'train') {
                  const routeInfo = d.routes && d.routes.length > 0
                    ? `<br/><small>🚂 ${d.routes.length} route(s): ${d.routes.slice(0, 2).join(', ')}${d.routes.length > 2 ? '...' : ''}</small>`
                    : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded"><strong>${d.name}</strong><br/>Train Station${routeInfo}</div>`;
                }
                const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                  ? `<br/><small>✈️ ${d.flightRoutes.length} flight destination(s)</small>`
                  : '';
                return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}<br/>${d.name}${flightInfo}</div>`;
              }}
              pointColor={(d: ClusteredPoint) => {
                if (d.type === 'cluster-both') return POINT_COLORS.CLUSTER_BOTH;
                if (d.type === 'cluster-airport') return POINT_COLORS.CLUSTER_AIRPORT;
                if (d.type === 'cluster-train') return POINT_COLORS.CLUSTER_TRAIN;
                if (d.type === 'overlap') return POINT_COLORS.OVERLAP;
                if (d.type === 'train') return POINT_COLORS.TRAIN;
                return POINT_COLORS.AIRPORT;
              }}
              pointAltitude={0.001}
              pointRadius={(d: ClusteredPoint) => {
                const baseRadius = altitude > POINT_RADIUS.ZOOM_THRESHOLD ? POINT_RADIUS.BASE_ZOOMED_OUT : POINT_RADIUS.BASE_ZOOMED_IN;

                if (d.type?.startsWith('cluster') && d.clusterSize) {
                  return baseRadius * (1 + Math.log10(d.clusterSize) * 0.5);
                }

                return baseRadius;
              }}
              pointsTransitionDuration={300}
              pointsMerge={false}

              pathsData={showTrainRoutes ? trainPaths : []}
              pathPoints="coords"
              pathPointLat={(p: [number, number] | { lat: number; lng: number }) => Array.isArray(p) ? p[0] : p.lat}
              pathPointLng={(p: [number, number] | { lat: number; lng: number }) => Array.isArray(p) ? p[1] : p.lng}
              pathColor={() => ROUTE_COLORS.TRAIN}
              pathLabel={(path: TrainPath) => path.properties.name || ''}
              pathStroke={2}
              pathDashLength={1}
              pathDashGap={0}
              pathTransitionDuration={0}

              width={dimensions.width}
              height={dimensions.height}
            />
          </motion.div>
        ) : (
          <div className="bg-black h-full w-full">
            <div className="flex justify-center items-center text-neutral-900 dark:text-white font-mono">
              <FullPageLoading/>
            </div>
          </div>
        )}
      </div>

      <TimeDisplay dt={dt} globeMaterial={globeMaterial} />
      <TimeControl
        timeMode={timeMode}
        onModeChange={handleModeChange}
        globeMaterial={globeMaterial}
      />
      <Legend globeMaterial={globeMaterial} />
      <ZoomIndicator
        altitude={altitude}
        showFlightRoutes={showFlightRoutes}
        showTrainRoutes={showTrainRoutes}
        onToggleFlightRoutes={() => setShowFlightRoutes(!showFlightRoutes)}
        onToggleTrainRoutes={() => setShowTrainRoutes(!showTrainRoutes)}
        globeMaterial={globeMaterial}
      />
    </div>
  );
}
