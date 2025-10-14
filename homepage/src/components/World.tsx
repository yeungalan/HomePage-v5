"use client"
import Globe from 'react-globe.gl';
  import React, { useState, useEffect, useRef } from 'react';
  import { csvParseRows } from 'd3-dsv';
  import indexBy from 'index-array-by';

  const COUNTRY = 'United States';
  const OPACITY = 1;

  const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({ airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source });
//const routeParse = ([airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment]) => ({ airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment});
  const routeParse = ([srcIata, dstIata]) => ({srcIata, dstIata});

export const WorldMap = () => {
  return <World/>
};

    const World = () => {
    const globeEl = useRef(undefined);
    const [airports, setAirports] = useState([]);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
      // load data
      Promise.all([
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat').then(res => res.text())
          .then(d => csvParseRows(d, airportParse)),
        fetch('./routes.dat').then(res => res.text())
          .then(d => csvParseRows(d, routeParse))
      ]).then(([airports, routes]) => {
        console.log(routes);
        const byIata = indexBy(airports, 'iata', false);

        const filteredRoutes = routes
          .filter(d => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)) // exclude unknown airports
          //.filter(d => d.stops === '0') // non-stop flights only
          .map(d => Object.assign(d, {
            srcAirport: byIata[d.srcIata],
            dstAirport: byIata[d.dstIata]
          }))
          //.filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country !== COUNTRY); // international routes from country


            const usedIatas = new Set(
        filteredRoutes.flatMap((r) => [r.srcIata, r.dstIata])
      );

      const filteredAirports = airports.filter((a) => usedIatas.has(a.iata));


        setAirports(filteredAirports);
        setRoutes(filteredRoutes);
      });
    }, []);

    useEffect(() => {
      // aim at continental US centroid
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }, []);

    return <Globe
      ref={globeEl}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"

      arcsData={routes}
      arcLabel={d => `${d.srcIata} &#8594; ${d.dstIata}`}
      arcStartLat={d => +d.srcAirport.lat}
      arcStartLng={d => +d.srcAirport.lng}
      arcEndLat={d => +d.dstAirport.lat}
      arcEndLng={d => +d.dstAirport.lng}
      arcDashLength={1000}
      arcDashGap={1}
      arcDashInitialGap={() => Math.random()}
      arcDashAnimateTime={4000}
      arcColor={d => [`rgba(255, 255, 255, ${OPACITY})`, `rgba(255, 255, 255, ${OPACITY})`]}
      arcsTransitionDuration={0}

      pointsData={airports}
      pointColor={() => 'orange'}
      pointAltitude={0}
      pointRadius={0.5}
      pointsMerge={true}
    />;
  };