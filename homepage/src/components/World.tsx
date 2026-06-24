"use client"
import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { csvParseRows } from "d3-dsv";
import indexBy from "index-array-by";
import { AIRPORTS_RAW } from "@/data/airports";
import { FLIGHT_ROUTES } from "@/data/routes";
import { TRAIN_DATA } from "@/data/train";
import {
  TextureLoader,
  ShaderMaterial,
  Vector2,
} from "three";
import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { FullPageLoading } from "./Loading";
import { useTranslation } from "@/i18n";
import { GLOBE_COLORS } from "@/constants/colors";
import { ALTITUDE_LEVELS, GLOBE_CONFIG, OVERLAP_THRESHOLD_DEGREES, ROUTE_ARC_OPACITY, GLOBE_ANIMATION_VELOCITY } from "@/constants/globe";
import { dayNightShader } from "@/lib/worldShader";
import { airportParse, sunPosAt, clusterPoints } from "@/lib/worldUtils";
import type { Airport, Route, TrainStation, TrainPath, PointData, Dimensions, TimeMode } from "@/types/world";

interface GlobeInstance {
  pointOfView: (pov?: { lat?: number; lng?: number; altitude?: number }, ms?: number) => void | { lat: number; lng: number; altitude: number };
  controls: () => { enableRotate: boolean };
}

export default function WorldMap(): React.JSX.Element {
  const t = useTranslation();
  const globeEl = useRef<GlobeInstance | null>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trainStations, setTrainStations] = useState<TrainStation[]>([]);
  const [trainPaths, setTrainPaths] = useState<TrainPath[]>([]);
  const [dt, setDt] = useState<number>(+new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [globeMaterial, setGlobeMaterial] = useState<any>(null);
  const [timeMode, setTimeMode] = useState<TimeMode>('animated');
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [altitude, setAltitude] = useState<number>(GLOBE_CONFIG.DEFAULT_ALTITUDE);
  const [showFlightRoutes, setShowFlightRoutes] = useState<boolean>(true);
  const [showTrainRoutes, setShowTrainRoutes] = useState<boolean>(true);
  const [enableDaylight, setEnableDaylight] = useState<boolean>(true);

  // Animate time based on mode
  useEffect(() => {
    if(timeMode === 'stopped' || timeMode === 'flat') {
      setEnableDaylight(false);
    }else{
      setEnableDaylight(true);
    }
    if (timeMode === 'paused' || timeMode === 'flat') return;

    let animationId: number;
    (function iterateTime(): void {
      setDt((t) => {
        if (timeMode === 'realtime') {
          return +new Date();
        } else if (timeMode === 'animated') {
          return t + GLOBE_ANIMATION_VELOCITY * 60 * 1000;
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

    // Set initial dimensions
    updateDimensions();

    // Add event listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load airports + routes from constants
  useEffect(() => {
    const airports: Airport[] = csvParseRows(AIRPORTS_RAW, airportParse);
    const routes: Route[] = FLIGHT_ROUTES;
    const byIata: Record<string, Airport> = indexBy(airports, "iata", false);

    const filteredRoutes = routes
      .filter(
        (d) => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)
      )
      .map((d) =>
        Object.assign(d, {
          srcAirport: byIata[d.srcIata],
          dstAirport: byIata[d.dstIata],
        })
      );

    const usedIatas = new Set(
      filteredRoutes.flatMap((r) => [r.srcIata, r.dstIata])
    );
    const filteredAirports = airports.filter((a) => usedIatas.has(a.iata));

    setAirports(filteredAirports);
    setRoutes(filteredRoutes);
  }, []);

  // Load train data from constants
  useEffect(() => {
    const stationMap = new Map();

    TRAIN_DATA.forEach(route => {
      const routeName = route.properties.name || '';
      const coords = route.coords;

      coords.forEach((coord) => {
        let lat, lng, cityName;

        if (Array.isArray(coord)) {
          [lat, lng] = coord;
          const cities = routeName.split('↔').map(s => s.trim());
          const index = coords.indexOf(coord);
          cityName = index < cities.length ? cities[index] : cities[cities.length - 1];
        } else {
          lat = coord.lat;
          lng = coord.lng;
          cityName = coord.city || '';
        }

        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

        if (!stationMap.has(key)) {
          stationMap.set(key, { lat, lng, name: cityName, routes: [] });
        }

        const station = stationMap.get(key);
        if (routeName && !station.routes.includes(routeName)) {
          station.routes.push(routeName);
        }
      });
    });

    const stations = Array.from(stationMap.values()).map(station => ({
      ...station,
      type: 'train'
    }));

    setTrainStations(stations);
    setTrainPaths(TRAIN_DATA);
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
          forceDaylight: { value: 0.0 },
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader,
      });
      setGlobeMaterial(material);
    });
  }, []);

    useEffect(() => {
    if (globeEl.current) {
      // Disable rotation controls during animation
      globeEl.current.controls().enableRotate = false;
      
      
      globeEl.current.pointOfView({
        lat: GLOBE_CONFIG.INITIAL_LATITUDE,
        lng: GLOBE_CONFIG.INITIAL_LONGITUDE,
        altitude: ALTITUDE_LEVELS.LIGHT
      }, GLOBE_CONFIG.INITIAL_ANIMATION_DURATION);

      // Enable rotation after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        if (globeEl.current) {
          globeEl.current.controls().enableRotate = true;
        }
      }, GLOBE_CONFIG.INITIAL_ANIMATION_DURATION);
    }
  }, [globeMaterial]);


  // Update sun position & globe rotation in shader
  useEffect(() => {
    if (!globeMaterial || !globeEl.current) return;

    const updateShader = () => {
      if (enableDaylight) {
        globeMaterial.uniforms.forceDaylight.value = 0.0;
        const [lng, lat] = sunPosAt(dt);
        globeMaterial.uniforms.sunPosition.value.set(lng, lat);
      } else {
        globeMaterial.uniforms.forceDaylight.value = 1.0;
      }

    };

    updateShader();
    const interval = setInterval(updateShader, 100);
    return () => clearInterval(interval);
  }, [globeMaterial, dt, enableDaylight]);

  const handleModeChange = (newMode: TimeMode): void => {
    setTimeMode(newMode);
  };

  const handleZoom = useCallback(
    ({ lng, lat, altitude }: { lng: number; lat: number; altitude: number }): void => {
      // Block zoom during animation
      if (isAnimating) return;
      
      if (globeMaterial?.uniforms?.globeRotation?.value) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat);
      }
      
      // Enforce altitude limits
      if (globeEl.current && altitude !== undefined) {
        const clampedAltitude = Math.max(
          GLOBE_CONFIG.MIN_ALTITUDE,
          Math.min(GLOBE_CONFIG.MAX_ALTITUDE, altitude)
        );
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
    // Build a map of flight routes for each airport IATA code
    const flightRoutesByIata = new Map();
    routes.forEach(route => {
      // Add to source airport
      if (!flightRoutesByIata.has(route.srcIata)) {
        flightRoutesByIata.set(route.srcIata, []);
      }
      flightRoutesByIata.get(route.srcIata).push(route.dstIata);
      
      // Add to destination airport (bidirectional)
      if (!flightRoutesByIata.has(route.dstIata)) {
        flightRoutesByIata.set(route.dstIata, []);
      }
      flightRoutesByIata.get(route.dstIata).push(route.srcIata);
    });
    
    const airportPoints = airports.map(a => ({ 
      ...a, 
      type: 'airport',
      flightRoutes: flightRoutesByIata.get(a.iata) || []
    }));
    const trainPoints = trainStations.map(t => ({ ...t, type: 'train' }));

    // Detect overlaps (same location = airport & train station)
    const mergedPoints: PointData[] = [];
    const usedTrainIndices = new Set();

    airportPoints.forEach(airport => {
      let foundOverlap = false;
      trainPoints.forEach((train, idx) => {
        if (usedTrainIndices.has(idx)) return;
        
        const latDiff = Math.abs(parseFloat(airport.lat) - parseFloat(String(train.lat)));
        const lngDiff = Math.abs(parseFloat(airport.lng) - parseFloat(String(train.lng)));

        if (latDiff < OVERLAP_THRESHOLD_DEGREES && lngDiff < OVERLAP_THRESHOLD_DEGREES) {
          // Found overlap
          mergedPoints.push({
            ...airport,
            type: 'overlap',
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

    // Add remaining train stations that didn't overlap
    trainPoints.forEach((train, idx) => {
      if (!usedTrainIndices.has(idx)) {
        mergedPoints.push(train);
      }
    });

    // Apply clustering based on altitude
    return clusterPoints(mergedPoints, altitude);
  }, [airports, trainStations, routes, altitude]);

  const getIndicatorPosition = (): number => {
    const positions: Record<TimeMode, number> = {
      stopped: 4,
      flat: 4,
      paused: 36,
      realtime: 68,
      animated: 100,
    };
    return positions[timeMode];
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Globe Container - Always Centered */}
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
              ref={globeEl}
              globeMaterial={globeMaterial}
              backgroundImageUrl="/assets/images/sky.png"
              onZoom={handleZoom}
              
              // Flight routes as arcs - conditionally shown
              arcsData={showFlightRoutes ? routes : []}
              arcLabel={(d: Route) => `${d.srcIata} ↔ ${d.dstIata}`}
              arcStartLat={(d: Route) => +d.srcAirport!.lat}
              arcStartLng={(d: Route) => +d.srcAirport!.lng}
              arcEndLat={(d: Route) => +d.dstAirport!.lat}
              arcEndLng={(d: Route) => +d.dstAirport!.lng}
              arcColor={() => [
                `rgba(255, 255, 255, ${ROUTE_ARC_OPACITY})`,
                `rgba(255, 255, 255, ${ROUTE_ARC_OPACITY})`,
              ]}
              arcsTransitionDuration={0}
              
              // All points (airports + train stations + clusters)
              pointsData={allPoints}
              pointLabel={(d: PointData) => {
                // Cluster labels
                if (d.type?.startsWith('cluster')) {
                  const locations = (d.names || []).join(', ');
                  const moreText = d.clusterSize && d.names && d.clusterSize > d.names.length ? ` ${t('world.tooltipMore', { count: d.clusterSize - d.names.length })}` : '';
                  let typeText = '';
                  
                  if (d.type === 'cluster-both') {
                    typeText = t('world.tooltipAirportsAndTrains', { airportCount: d.airportCount ?? 0, trainCount: d.trainCount ?? 0 });
                  } else if (d.type === 'cluster-airport') {
                    typeText = t('world.tooltipAirports', { count: d.airportCount ?? 0 });
                  } else if (d.type === 'cluster-train') {
                    typeText = t('world.tooltipTrainStops', { count: d.trainCount ?? 0 });
                  }

                  const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                    ? `<div class="text-xs mt-1">✈️ ${t('world.tooltipFlightDest', { count: d.flightRoutes.length })}</div>`
                    : '';
                  const trainInfo = d.trainRoutes && d.trainRoutes.length > 0
                    ? `<div class="text-xs mt-1">🚂 ${t('world.tooltipTrainRoutes', { count: d.trainRoutes.length })}</div>`
                    : '';

                  return `<div class="text-white bg-black/90 px-3 py-2 rounded max-w-xs">
                    <div class="font-bold text-yellow-300">📍 ${t('world.tooltipLocations', { count: d.clusterSize ?? 0 })}</div>
                    <div class="text-sm mt-1">${typeText}</div>
                    <div class="text-xs mt-1 text-gray-300">${locations}${moreText}</div>
                    ${flightInfo}${trainInfo}
                  </div>`;
                }
                
                // Regular point labels
                if (d.type === 'overlap') {
                  const trainInfo = d.trainRoutes && d.trainRoutes.length > 0
                    ? `<br/><small>🚂 ${t('world.tooltipTrainRoutes', { count: d.trainRoutes.length })}</small>`
                    : '';
                  const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                    ? `<br/><small>✈️ ${t('world.tooltipFlightDest', { count: d.flightRoutes.length })}</small>`
                    : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.name || d.city}<br/>${t('world.tooltipAirportAndTrain')}${flightInfo}${trainInfo}</div>`;
                }
                if (d.type === 'train') {
                  const routeInfo = d.routes && d.routes.length > 0
                    ? `<br/><small>🚂 ${t('world.tooltipRoutes', { count: d.routes.length })}: ${d.routes.slice(0, 2).join(', ')}${d.routes.length > 2 ? '...' : ''}</small>`
                    : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded"><strong>${d.name}</strong><br/>${t('world.tooltipTrainStation')}${routeInfo}</div>`;
                }
                // Airport
                const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                  ? `<br/><small>✈️ ${t('world.tooltipFlightDest', { count: d.flightRoutes.length })}</small>`
                  : '';
                return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}<br/>${d.name}${flightInfo}</div>`;
              }}
              pointColor={(d: PointData) => {
                if (d.type === 'cluster-both') return GLOBE_COLORS.clusterBoth;
                if (d.type === 'cluster-airport') return GLOBE_COLORS.clusterAirport;
                if (d.type === 'cluster-train') return GLOBE_COLORS.clusterTrain;
                if (d.type === 'overlap') return GLOBE_COLORS.overlap;
                if (d.type === 'train') return GLOBE_COLORS.trainRoute;
                return GLOBE_COLORS.clusterAirport;
              }}
              pointAltitude={0.001}
              pointRadius={(d: PointData) => {
                const baseRadius = altitude > 1 ? 0.5 : 0.15;
                
                // Make clusters larger based on size
                if (d.type?.startsWith('cluster')) {
                  return baseRadius * (1 + Math.log10(d.clusterSize || 1) * 0.5);
                }
                
                return baseRadius;
              }}
              pointsTransitionDuration={300}
              pointsMerge={false}
              
              // Train routes as paths - conditionally shown
              pathsData={showTrainRoutes ? trainPaths : []}
              pathPoints="coords"
              pathPointLat={(p: [number, number] | {lat: number; lng: number}) => Array.isArray(p) ? p[0] : p.lat}
              pathPointLng={(p: [number, number] | {lat: number; lng: number}) => Array.isArray(p) ? p[1] : p.lng}
              pathColor={() => GLOBE_COLORS.trainRoute}
              pathLabel={(path: TrainPath) => path.properties.name}
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

      {/* Time Display - Fixed to Bottom Left */}
      <motion.div 
        className="fixed left-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
        style={{ 
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
          left: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : 20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.3,
          ease: "easeOut"
        }}
      >
        {new Date(dt).toLocaleString()}
      </motion.div>

      <motion.div 
        className="fixed right-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10" 
        style={{ 
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
          right: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : 20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.5,
          ease: "easeOut"
        }}
      >
        <div className="relative inline-block">
          {/* Animated Indicator */}
          <motion.div
            className="absolute top-[4px] z-0 size-[32px] rounded-full bg-white shadow-lg"
            initial={false}
            animate={{
              left: getIndicatorPosition(),
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />

          {/* Button Group */}
          <div className="relative inline-flex rounded-full border border-zinc-200 dark:border-zinc-700 p-[3px]">
            <button
              aria-label={t('world.timeModeFlat')}
              type="button"
              onClick={() => handleModeChange('flat')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{ color: timeMode === 'flat' ? '#000' : '#fff' }}
            >
              <Icon icon="mdi:weather-sunny-off" className="text-[18px]" />
            </button>
            <button
              aria-label={t('world.timeModePaused')}
              type="button"
              onClick={() => handleModeChange('paused')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{ color: timeMode === 'paused' ? '#000' : '#fff' }}
            >
              <Icon icon="mdi:pause" className="text-[18px]" />
            </button>
            <button
              aria-label={t('world.timeModeRealtime')}
              type="button"
              onClick={() => handleModeChange('realtime')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{ color: timeMode === 'realtime' ? '#000' : '#fff' }}
            >
              <Icon icon="mdi:clock-outline" className="text-[18px]" />
            </button>
            <button
              aria-label={t('world.timeModeAnimated')}
              type="button"
              onClick={() => handleModeChange('animated')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{ color: timeMode === 'animated' ? '#000' : '#fff' }}
            >
              <Icon icon="mdi:fast-forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="fixed left-4 top-20 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
        style={{ 
          //top: 'max(1rem, calc(env(safe-area-inset-top) + 1rem))',
          //left: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.5,
          ease: "easeOut"
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>{t('world.legendAirports')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GLOBE_COLORS.trainRoute }}></div>
            <span>{t('world.legendTrainStations')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GLOBE_COLORS.overlap }}></div>
            <span>{t('world.legendBoth')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GLOBE_COLORS.clusterBoth }}></div>
            <span>{t('world.legendClustered')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white"></div>
            <span>{t('world.legendFlightRoutes')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5" style={{ backgroundColor: GLOBE_COLORS.trainRoute }}></div>
            <span>{t('world.legendTrainRoutes')}</span>
          </div>
        </div>
      </motion.div>

      {/* Zoom Level Indicator */}
      <motion.div
        className="fixed right-4 top-20 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
        style={{ 
          //top: 'max(1rem, calc(env(safe-area-inset-top) + 1rem))',
          //right: 'max(1rem, calc(env(safe-area-inset-right) + 1rem))'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.7,
          ease: "easeOut"
        }}
      >
        <div className="flex flex-col gap-2">
          <div>{t('world.altitudeLabel', { value: altitude.toFixed(2) })}</div>
          <div className="text-xs text-gray-400">
            {altitude < 1.5 ? t('world.clusterNone') :
             altitude < 2 ? t('world.clusterLight') :
             altitude < 2.5 ? t('world.clusterMedium') :
             altitude < 3 ? t('world.clusterHeavy') :
             t('world.clusterMax')}
          </div>
          
          {/* Route Toggle Controls */}
          <div className="border-t border-gray-600 pt-2 mt-1 flex flex-col gap-2 ">
            <button
              onClick={() => setShowFlightRoutes(!showFlightRoutes)}
              className="flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-white/10"
              style={{ 
                backgroundColor: showFlightRoutes ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                opacity: showFlightRoutes ? 1 : 0.5
              }}
            >
              <Icon 
                icon={showFlightRoutes ? "mdi:airplane" : "mdi:airplane-off"} 
                className="text-base" 
              />
              <span className="text-xs">{t('world.toggleFlightRoutes')}</span>
            </button>

            <button
              onClick={() => setShowTrainRoutes(!showTrainRoutes)}
              className="flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-white/10"
              style={{
                backgroundColor: showTrainRoutes ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                opacity: showTrainRoutes ? 1 : 0.5
              }}
            >
              <Icon
                icon={showTrainRoutes ? "mdi:train" : "mdi:train-off"}
                className="text-base"
              />
              <span className="text-xs">{t('world.toggleTrainRoutes')}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}