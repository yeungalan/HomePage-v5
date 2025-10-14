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

const COUNTRY = "United States";
const OPACITY = 1;
const VELOCITY = 0.2; // minutes per frame

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

export default function WorldMap() {
  const globeEl = useRef();
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [dt, setDt] = useState(+new Date());
  const [globeMaterial, setGlobeMaterial] = useState(null);
  const [useActualTime, setUseActualTime] = useState(false);
  const [isAnimated, setIsAnimated] = useState(true);

  // Animate time
  useEffect(() => {
    if (!isAnimated) return;
    
    let animationId;
    (function iterateTime() {
      setDt((t) => useActualTime ? +new Date() : t + VELOCITY * 60 * 1000);
      animationId = requestAnimationFrame(iterateTime);
    })();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimated, useActualTime]);

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
        "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg"
      ),
      new TextureLoader().loadAsync(
        "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {globeMaterial ? (
        <Globe
          ref={globeEl}
          globeMaterial={globeMaterial}
          backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
          onZoom={handleZoom}
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
          pointsData={airports}
          pointLabel={(d) => `<div class="text-white bg-black/80 px-2 py-1 rounded">${d.city}, ${d.country}<br/>${d.name}</div>`}
          pointColor={() => "orange"}
          pointAltitude={0}
          pointRadius={0.5}
          pointsMerge={false}
        />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "white",
            fontFamily: "monospace",
          }}
        >
          Loading globe...
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          color: "lightblue",
          fontFamily: "monospace",
          fontSize: "14px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        {new Date(dt).toLocaleString()}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={() => {
            setUseActualTime(!useActualTime);
            if (!useActualTime) {
              setDt(+new Date());
              setIsAnimated(true);
            }
          }}
          style={{
            color: "white",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: useActualTime ? "rgba(59, 130, 246, 0.8)" : "rgba(0, 0, 0, 0.5)",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
          }}
        >
          Actual Time
        </button>
        <button
          onClick={() => setIsAnimated(!isAnimated)}
          style={{
            color: "white",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: isAnimated ? "rgba(59, 130, 246, 0.8)" : "rgba(0, 0, 0, 0.5)",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
          }}
        >
          Animated
        </button>
      </div>
    </div>
  );
}