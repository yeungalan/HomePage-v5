"use client"
import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { csvParseRows } from "d3-dsv";
import indexBy from "index-array-by";
import {
  TextureLoader,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import * as solar from "solar-calculator";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { FullPageLoading } from "./Loading";

const COUNTRY = "United States";
const OPACITY = 1;
const VELOCITY = 1; // minutes per frame

const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({
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

const routeParse = ([srcIata, dstIata]) => ({ srcIata, dstIata });

// --- SHADER ---
const dayNightShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      // Calculate world-space normal from world position
      vec3 worldNormal = normalize(vWorldPosition);
      
      // Get sun direction directly in world space (no rotation needed)
      vec3 sunDirection = Polar2Cartesian(sunPosition);
      
      // Calculate lighting intensity
      float intensity = dot(worldNormal, normalize(sunDirection));
      
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1, 0.1, intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `,
};

// --- UTIL: Get sun position for a given timestamp ---
const sunPosAt = (dt) => {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
  const t = solar.century(dt);
  const longitude = ((day - dt) / 864e5) * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

// --- CLUSTERING UTILITIES ---
/**
 * Calculate great circle distance between two lat/lng points in kilometers
 */
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Cluster points based on altitude (zoom level)
 * Returns merged points when zoomed out
 */
const clusterPoints = (points: any[], altitude: number) => {
  // Adjust clustering threshold based on altitude
  // Higher altitude = more zoomed out = larger clustering distance
  let clusterThresholdKm = 0;
  
  if (altitude < 1.5) {
    // Very zoomed in - no clustering
    return points;
  } else if (altitude < 2) {
    clusterThresholdKm = 50; // 50km
  } else if (altitude < 2.5) {
    clusterThresholdKm = 100; // 100km
  } else if (altitude < 3) {
    clusterThresholdKm = 200; // 200km
  } else {
    clusterThresholdKm = 300; // 300km+
  }

  const clustered: any[] = [];
  const used = new Set<number>();

  points.forEach((point, i) => {
    if (used.has(i)) return;

    const cluster = [point];
    used.add(i);

    // Find all nearby points
    for (let j = i + 1; j < points.length; j++) {
      if (used.has(j)) continue;

      const other = points[j];
      const distance = haversineDistance(
        parseFloat(point.lat), 
        parseFloat(point.lng),
        parseFloat(other.lat), 
        parseFloat(other.lng)
      );

      if (distance <= clusterThresholdKm) {
        cluster.push(other);
        used.add(j);
      }
    }

    if (cluster.length === 1) {
      // No clustering needed
      clustered.push(point);
    } else {
      // Merge multiple points
      const avgLat = cluster.reduce((sum, p) => sum + parseFloat(p.lat), 0) / cluster.length;
      const avgLng = cluster.reduce((sum, p) => sum + parseFloat(p.lng), 0) / cluster.length;

      // Separate by type
      const airports = cluster.filter(p => p.type === 'airport' || p.type === 'overlap');
      const trainStations = cluster.filter(p => p.type === 'train' || p.type === 'overlap');

      // Count unique items
      const airportCount = airports.length;
      const trainCount = trainStations.length;
      const hasAirports = airportCount > 0;
      const hasTrains = trainCount > 0;

      // Determine type
      let mergedType = 'cluster';
      if (hasAirports && hasTrains) {
        mergedType = 'cluster-both';
      } else if (hasAirports) {
        mergedType = 'cluster-airport';
      } else if (hasTrains) {
        mergedType = 'cluster-train';
      }

      // Gather names
      const names = cluster
        .map(p => p.name || p.city)
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .slice(0, 5); // limit to first 5

      // Aggregate flight routes from all airports in cluster
      const allFlightRoutes = new Set();
      airports.forEach(airport => {
        if (airport.flightRoutes) {
          airport.flightRoutes.forEach(route => allFlightRoutes.add(route));
        }
      });

      // Aggregate train routes from all train stations in cluster
      const allTrainRoutes = new Set();
      trainStations.forEach(station => {
        if (station.routes) {
          station.routes.forEach(route => allTrainRoutes.add(route));
        }
      });

      clustered.push({
        lat: avgLat.toString(),
        lng: avgLng.toString(),
        type: mergedType,
        clusterSize: cluster.length,
        airportCount,
        trainCount,
        names,
        originalPoints: cluster,
        flightRoutes: Array.from(allFlightRoutes),
        trainRoutes: Array.from(allTrainRoutes),
      });
    }
  });

  return clustered;
};

type TimeMode = 'paused' | 'realtime' | 'animated' | 'stopped';

export default function WorldMap() {
  const globeEl = useRef();
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trainStations, setTrainStations] = useState([]);
  const [trainPaths, setTrainPaths] = useState([]);
  const [dt, setDt] = useState(+new Date());
  const [globeMaterial, setGlobeMaterial] = useState(null);
  const [timeMode, setTimeMode] = useState<TimeMode>('animated');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [altitude, setAltitude] = useState(2.5);
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
    
    let animationId;
    (function iterateTime() {
      setDt((t) => {
        if (timeMode === 'realtime') {
          return +new Date();
        } else if (timeMode === 'animated') {
          return t + VELOCITY * 60 * 1000;
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
        );

      const usedIatas = new Set(
        filteredRoutes.flatMap((r) => [r.srcIata, r.dstIata])
      );
      const filteredAirports = airports.filter((a) => usedIatas.has(a.iata));
      
      setAirports(filteredAirports);
      setRoutes(filteredRoutes);
    }).catch(() => {
      // If data files don't exist, continue without them
      setAirports([]);
      setRoutes([]);
    });

  }, []);

  // Load train data and extract stations as points
  useEffect(() => {
    fetch('./train.dat')
      .then(r => r.json())
      .then(trainData => {
        // Extract unique train stations from the route coordinates
        const stationMap = new Map();
        
        trainData.forEach(route => {
          const routeName = route.properties.name || '';
          const coords = route.coords;
          
          // Map each coordinate to its corresponding city name
          coords.forEach((coord) => {
            // Handle both object format {lat, lng, city} and array format [lat, lng]
            let lat, lng, cityName;
            
            if (Array.isArray(coord)) {
              // Old format: [lat, lng]
              [lat, lng] = coord;
              // Fallback: extract from route name
              const cities = routeName.split('↔').map(s => s.trim());
              const index = coords.indexOf(coord);
              cityName = index < cities.length ? cities[index] : cities[cities.length - 1];
            } else {
              // New format: {lat, lng, city}
              lat = coord.lat;
              lng = coord.lng;
              cityName = coord.city || '';
            }
            
            const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
            
            if (!stationMap.has(key)) {
              stationMap.set(key, {
                lat: lat,
                lng: lng,
                name: cityName,
                routes: []
              });
            }
            
            // Add route name to this station
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
        setTrainPaths(trainData);
      })
      .catch(err => {
        console.log('No train data available');
        setTrainStations([]);
        setTrainPaths([]);
      });
  }, []);

  // Setup globe material with day/night shader
  useEffect(() => {
    const loader = new TextureLoader();
    Promise.all([
      loader.loadAsync("day.jpg"),
      loader.loadAsync("night.jpg"),
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

    useEffect(() => {
    if (globeEl.current) {
      // Disable rotation controls during animation
      globeEl.current.controls().enableRotate = false;
      
      
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 }, 6000);

      // Enable rotation after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        if (globeEl.current) {
          globeEl.current.controls().enableRotate = true;
        }
      }, 6000);
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
        // Set sun position to create constant daylight (sun directly overhead at equator)
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
    ({ lng, lat, altitude }) => {
      // Block zoom during animation
      if (isAnimating) return;
      
      if (globeMaterial?.uniforms?.globeRotation?.value) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat);
      }
      
      // Enforce altitude limits
      if (globeEl.current && altitude !== undefined) {
        const clampedAltitude = Math.max(0.5, Math.min(4, altitude));
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
    const overlapThreshold = 0.01; // degrees (~1km)
    const mergedPoints = [];
    const usedTrainIndices = new Set();

    airportPoints.forEach(airport => {
      let foundOverlap = false;
      trainPoints.forEach((train, idx) => {
        if (usedTrainIndices.has(idx)) return;
        
        const latDiff = Math.abs(parseFloat(airport.lat) - parseFloat(train.lat));
        const lngDiff = Math.abs(parseFloat(airport.lng) - parseFloat(train.lng));
        
        if (latDiff < overlapThreshold && lngDiff < overlapThreshold) {
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

  const getIndicatorPosition = () => {
    const positions = {
      //stopped: 4, // 4th button position
      paused: 4,
      realtime: 36,
      animated: 68,
      // 100
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
              backgroundImageUrl="sky.png"
              onZoom={handleZoom}
              
              // Flight routes as arcs - conditionally shown
              arcsData={showFlightRoutes ? routes : []}
              arcLabel={(d) => `${d.srcIata} ↔ ${d.dstIata}`}
              arcStartLat={(d) => +d.srcAirport.lat}
              arcStartLng={(d) => +d.srcAirport.lng}
              arcEndLat={(d) => +d.dstAirport.lat}
              arcEndLng={(d) => +d.dstAirport.lng}
              arcColor={(d) => [
                `rgba(255, 255, 255, ${OPACITY})`,
                `rgba(255, 255, 255, ${OPACITY})`,
              ]}
              arcsTransitionDuration={0}
              
              // All points (airports + train stations + clusters)
              pointsData={allPoints}
              pointLabel={(d) => {
                // Cluster labels
                if (d.type?.startsWith('cluster')) {
                  const locations = d.names.join(', ');
                  const moreText = d.clusterSize > d.names.length ? ` +${d.clusterSize - d.names.length} more` : '';
                  let typeText = '';
                  
                  if (d.type === 'cluster-both') {
                    typeText = `${d.airportCount} Airport(s) & ${d.trainCount} Train Station(s)`;
                  } else if (d.type === 'cluster-airport') {
                    typeText = `${d.airportCount} Airport(s)`;
                  } else if (d.type === 'cluster-train') {
                    typeText = `${d.trainCount} Train Station(s)`;
                  }
                  
                  // Show routes info
                  const flightInfo = d.flightRoutes && d.flightRoutes.length > 0 
                    ? `<div class="text-xs mt-1">✈️ ${d.flightRoutes.length} flight destination(s)</div>`
                    : '';
                  const trainInfo = d.trainRoutes && d.trainRoutes.length > 0
                    ? `<div class="text-xs mt-1">🚂 ${d.trainRoutes.length} train route(s)</div>`
                    : '';
                  
                  return `<div class="text-white bg-black/90 px-3 py-2 rounded max-w-xs">
                    <div class="font-bold text-yellow-300">📍 ${d.clusterSize} Locations</div>
                    <div class="text-sm mt-1">${typeText}</div>
                    <div class="text-xs mt-1 text-gray-300">${locations}${moreText}</div>
                    ${flightInfo}${trainInfo}
                  </div>`;
                }
                
                // Regular point labels
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
                // Airport
                const flightInfo = d.flightRoutes && d.flightRoutes.length > 0
                  ? `<br/><small>✈️ ${d.flightRoutes.length} flight destination(s)</small>`
                  : '';
                return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}<br/>${d.name}${flightInfo}</div>`;
              }}
              pointColor={(d) => {
                // Cluster colors
                if (d.type === 'cluster-both') return '#FFD700'; // Gold
                if (d.type === 'cluster-airport') return '#FFA500'; // Orange
                if (d.type === 'cluster-train') return '#00ff88'; // Green
                
                // Regular colors
                if (d.type === 'overlap') return '#8B4513'; // Brown for overlap
                if (d.type === 'train') return '#00ff88'; // Green for train
                return 'orange'; // Orange for airport
              }}
              pointAltitude={0.001}
              pointRadius={(d) => {
                const baseRadius = altitude > 1 ? 0.5 : 0.15;
                
                // Make clusters larger based on size
                if (d.type?.startsWith('cluster')) {
                  return baseRadius * (1 + Math.log10(d.clusterSize) * 0.5);
                }
                
                return baseRadius;
              }}
              pointsTransitionDuration={300}
              pointsMerge={false}
              
              // Train routes as paths - conditionally shown
              pathsData={showTrainRoutes ? trainPaths : []}
              pathPoints="coords"
              pathPointLat={p => Array.isArray(p) ? p[0] : p.lat}
              pathPointLng={p => Array.isArray(p) ? p[1] : p.lng}
              pathColor={path => path.properties.color || '#00ff88'}
              pathLabel={path => path.properties.name}
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
        className="fixed left-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10"
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

          {/* Button Group - 4 buttons */}
          <div className="relative inline-flex rounded-full border border-zinc-200 dark:border-zinc-700 p-[3px]">
            {/*
                        <button
              aria-label="Toggle daylight cycle"
              type="button"
              onClick={() => handleModeChange('stopped')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{
                color: !enableDaylight ? '#000' : '#fff',
              }}
            >
              <Icon icon="mdi:stop" className="text-[18px]" onClick={() => handleModeChange('stopped')}/>
            </button>
            */}
            <button
              aria-label="Pause time"
              type="button"
              onClick={() => handleModeChange('paused')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{
                color: timeMode === 'paused' ? '#000' : '#fff',
              }}
            >
              <Icon icon="mdi:pause" className="text-[18px]" onClick={() => handleModeChange('paused')}/>
            </button>
            <button
              aria-label="Real time"
              type="button"
              onClick={() => handleModeChange('realtime')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{
                color: timeMode === 'realtime' ? '#000' : '#fff',
              }}
            >
              <Icon icon="mdi:clock-outline" className="text-[18px]" onClick={() => handleModeChange('realtime')}/>
            </button>
            <button
              aria-label="Animated time"
              type="button"
              onClick={() => handleModeChange('animated')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{
                color: timeMode === 'animated' ? '#000' : '#fff',
              }}
            >
              <Icon icon="mdi:fast-forward" className="text-[18px]" onClick={() => handleModeChange('animated')}/>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="fixed left-4 top-4 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10"
        style={{ 
          top: 'max(1rem, calc(env(safe-area-inset-top) + 1rem))',
          left: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.5,
          ease: "easeOut"
        }}
      >
        <div className="flex flex-col gap-1 pt-15">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Airports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff88' }}></div>
            <span>Train Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B4513' }}></div>
            <span>Both (Airport & Train)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD700' }}></div>
            <span>Clustered Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white"></div>
            <span>Flight Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5" style={{ backgroundColor: '#00ff88' }}></div>
            <span>Train Routes</span>
          </div>
        </div>
      </motion.div>

      {/* Zoom Level Indicator */}
      <motion.div
        className="fixed right-4 top-4 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10"
        style={{ 
          top: 'max(1rem, calc(env(safe-area-inset-top) + 1rem))',
          right: 'max(1rem, calc(env(safe-area-inset-right) + 1rem))'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
        transition={{ 
          duration: 0.8,
          delay: 0.7,
          ease: "easeOut"
        }}
      >
        <div className="flex flex-col gap-2 pt-15">
          <div>Altitude: {altitude.toFixed(2)}</div>
          <div className="text-xs text-gray-400">
            {altitude < 1.5 ? 'Individual points' : 
             altitude < 2 ? 'Light clustering (50km)' :
             altitude < 2.5 ? 'Medium clustering (100km)' :
             altitude < 3 ? 'Heavy clustering (200km)' :
             'Max clustering (300km+)'}
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
              <span className="text-xs">Flight Routes</span>
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
              <span className="text-xs">Train Routes</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}