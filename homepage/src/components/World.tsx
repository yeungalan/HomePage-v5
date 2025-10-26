"use client"
import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { csvParseRows } from "d3-dsv";
import indexBy from "index-array-by";
import {
  TextureLoader,
  ShaderMaterial,
  Vector2,
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
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    varying vec3 vNormal;
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
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );
      vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
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

type TimeMode = 'paused' | 'realtime' | 'animated';

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
  const [altitude, setAltitude] = useState(0);

  // Animate time based on mode
  useEffect(() => {
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
              cityName = coord.city || 'Unknown Station';
            }
            
            const key = `${lat},${lng}`;
            
            if (!stationMap.has(key)) {
              stationMap.set(key, {
                lat,
                lng,
                name: cityName,
                type: 'train',
                routes: []
              });
            }
            
            // Track which routes pass through this station
            stationMap.get(key).routes.push(routeName);
          });
        });

        // Convert map to array of unique stations
        const uniqueStations = Array.from(stationMap.values());
        
        setTrainStations(uniqueStations);
        setTrainPaths(trainData);
      })
      .catch(() => {
        setTrainStations([]);
        setTrainPaths([]);
      });
  }, []);

  // Detect overlapping coordinates and mark them using useMemo
  const allPoints = useMemo(() => {
    if (airports.length === 0 && trainStations.length === 0) return [];

    // Create a coordinate key for comparison (rounded to avoid floating point issues)
    const coordKey = (lat, lng) => {
      const roundedLat = Math.round(parseFloat(lat) * 10000) / 10000;
      const roundedLng = Math.round(parseFloat(lng) * 10000) / 10000;
      return `${roundedLat},${roundedLng}`;
    };

    // Build maps of coordinates
    const airportMap = new Map();
    airports.forEach(airport => {
      const key = coordKey(airport.lat, airport.lng);
      airportMap.set(key, airport);
    });

    const trainMap = new Map();
    trainStations.forEach(station => {
      const key = coordKey(station.lat, station.lng);
      trainMap.set(key, station);
    });

    // Find overlapping coordinates
    const overlappingKeys = new Set();
    airportMap.forEach((airport, key) => {
      if (trainMap.has(key)) {
        overlappingKeys.add(key);
      }
    });

    // Process airports with overlap marking
    const processedAirports = airports.map(airport => {
      const key = coordKey(airport.lat, airport.lng);
      if (overlappingKeys.has(key)) {
        return { ...airport, type: 'overlap' };
      }
      return airport;
    });

    // Process train stations with overlap marking
    const processedTrainStations = trainStations.map(station => {
      const key = coordKey(station.lat, station.lng);
      if (overlappingKeys.has(key)) {
        return { ...station, type: 'overlap' };
      }
      return station;
    });

    return [...processedAirports, ...processedTrainStations];
  }, [airports, trainStations]);

  // Set initial globe view and enable zoom after animation
  useEffect(() => {
    if (globeEl.current) {
      // Disable rotation controls during animation
      globeEl.current.controls().enableRotate = false;
      
      // Initialize globe rotation uniform immediately
      const initialPOV = globeEl.current.pointOfView();
      if (globeMaterial?.uniforms?.globeRotation?.value && initialPOV) {
        globeMaterial.uniforms.globeRotation.value.set(
          initialPOV.lng || -98.5, 
          initialPOV.lat || 39.6
        );
      }
      
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 }, 1);

      // Enable rotation after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        if (globeEl.current) {
          globeEl.current.controls().enableRotate = true;
        }
      }, 6000);
    }
  }, [globeMaterial]);

  // Continuously update globe rotation to sync shader with camera
  useEffect(() => {
    if (!globeEl.current || !globeMaterial) return;
    
    let animationFrame;
    const updateRotation = () => {
      if (globeEl.current && globeMaterial?.uniforms?.globeRotation?.value) {
        const pov = globeEl.current.pointOfView();
        if (pov && pov.lng !== undefined && pov.lat !== undefined) {
          globeMaterial.uniforms.globeRotation.value.set(pov.lng, pov.lat);
        }
      }
      animationFrame = requestAnimationFrame(updateRotation);
    };
    
    updateRotation();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [globeMaterial]);

  // Load globe shader (day/night)
  useEffect(() => {
    Promise.all([
      new TextureLoader().loadAsync(
        "./day.jpg"
      ),
      new TextureLoader().loadAsync(
        "./night.jpg"
      ),
    ]).then(([dayTexture, nightTexture]) => {
      setGlobeMaterial(
        new ShaderMaterial({
          uniforms: {
            dayTexture: { value: dayTexture },
            nightTexture: { value: nightTexture },
            sunPosition: { value: new Vector2() },
            globeRotation: { value: new Vector2() },
          },
          vertexShader: dayNightShader.vertexShader,
          fragmentShader: dayNightShader.fragmentShader,
        })
      );
    });
  }, []);

  // Update sun position
  useEffect(() => {
    if (globeMaterial?.uniforms?.sunPosition?.value) {
      globeMaterial.uniforms.sunPosition.value.set(...sunPosAt(dt));
    }
  }, [dt, globeMaterial]);

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

  const handleModeChange = (mode: TimeMode) => {
    setTimeMode(mode);
    if (mode === 'realtime') {
      setDt(+new Date());
    }
  };

  const getIndicatorPosition = () => {
    const positions = {
      paused: 4,
      realtime: 36,
      animated: 68,
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
              
              // Flight routes as arcs
              arcsData={routes}
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
              
              // All points (airports + train stations)
              pointsData={allPoints}
              pointLabel={(d) => {
                if (d.type === 'overlap') {
                  const stationInfo = d.routes ? `<br/><small>${d.routes.length} train route(s)</small>` : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.name || d.city}<br/>Airport & Train Station${stationInfo}</div>`;
                }
                if (d.type === 'train') {
                  const routeInfo = d.routes && d.routes.length > 0 
                    ? `<br/><small>${d.routes.length} route(s): ${d.routes.slice(0, 2).join(', ')}${d.routes.length > 2 ? '...' : ''}</small>`
                    : '';
                  return `<div class="text-white bg-black/80 px-2 py-1 rounded"><strong>${d.name}</strong><br/>Train Station${routeInfo}</div>`;
                }
                return `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}<br/>${d.name}</div>`;
              }}
              pointColor={(d) => {
                if (d.type === 'overlap') return '#8B4513'; // Brown for overlap
                if (d.type === 'train') return '#00ff88'; // Green for train
                return 'orange'; // Orange for airport
              }}
              pointAltitude={0.001}
              pointRadius={(d) => {
                 const baseRadius = altitude > 1 ? 0.5 : 0.15;
                // Make overlap points slightly larger to stand out
                return baseRadius
              }}
              pointsTransitionDuration={0}
              pointsMerge={false}
              
              // Train routes as paths
              pathsData={trainPaths}
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

          {/* Button Group */}
          <div className="relative inline-flex rounded-full border border-zinc-200 dark:border-zinc-700 p-[3px]">
            <button
              aria-label="Pause time"
              type="button"
              onClick={() => handleModeChange('paused')}
              className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
              style={{
                color: timeMode === 'paused' ? '#000' : '#fff',
              }}
            >
              <Icon icon="mdi:pause" className="text-[18px]" />
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
              <Icon icon="mdi:clock-outline" className="text-[18px]" />
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
              <Icon icon="mdi:fast-forward" className="text-[18px]" />
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
        <div className="flex flex-col gap-1">
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
            <div className="w-8 h-0.5 bg-white"></div>
            <span>Flight Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5" style={{ backgroundColor: '#00ff88' }}></div>
            <span>Train Routes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}