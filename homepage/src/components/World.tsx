"use client"
import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [dt, setDt] = useState(+new Date());
  const [globeMaterial, setGlobeMaterial] = useState(null);
  const [timeMode, setTimeMode] = useState<TimeMode>('animated');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Set initial globe view
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, [globeMaterial]);

  // Load globe shader (day/night)
  useEffect(() => {
    Promise.all([
      new TextureLoader().loadAsync(
        "./day.png"
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
    ({ lng, lat }) => {
      if (globeMaterial?.uniforms?.globeRotation?.value) {
        globeMaterial.uniforms.globeRotation.value.set(lng, lat);
      }
    },
    [globeMaterial]
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
          <div className="w-full h-full" key={`${dimensions.width}-${dimensions.height}`}>
            <Globe
              ref={globeEl}
              globeMaterial={globeMaterial}
              backgroundImageUrl="sky.png"
              onZoom={handleZoom}
              arcsData={routes}
              arcLabel={(d) => `${d.srcIata} → ${d.dstIata}`}
              arcStartLat={(d) => +d.srcAirport.lat}
              arcStartLng={(d) => +d.srcAirport.lng}
              arcEndLat={(d) => +d.dstAirport.lat}
              arcEndLng={(d) => +d.dstAirport.lng}
              arcColor={(d) => [
                `rgba(255, 255, 255, ${OPACITY})`,
                `rgba(255, 255, 255, ${OPACITY})`,
              ]}
              arcsTransitionDuration={0}
              pointsData={airports}
              pointLabel={(d) => `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}<br/>${d.name}</div>`}
              pointColor={() => "orange"}
              pointAltitude={0}
              pointRadius={0.5}
              pointsMerge={false}
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center text-neutral-900 dark:text-white font-mono">
            <FullPageLoading/>
          </div>
        )}
      </div>

      {/* Time Display - Fixed to Bottom Left */}
      <div 
        className="fixed left-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10"
        style={{ 
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
          left: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}
      >
        {new Date(dt).toLocaleString()}
      </div>

<div className="fixed right-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10" 
           style={{ 
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
          right: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))'
        }}>
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
      </div>
    </div>
  );
}