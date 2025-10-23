"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { RealFooter } from '@/components/FooterLinks';
import { getDayOfYear, differenceInDays, endOfYear, startOfYear } from 'date-fns';

interface Airport {
  name: string;
  city: string;
  country: string;
  iata: string;
  lat: number;
  lon: number;
}

// Flight Calculator Component
function FlightCalculator() {
  const [srcCode, setSrcCode] = useState('');
  const [dstCode, setDstCode] = useState('');
  const [srcAirport, setSrcAirport] = useState<Airport | null>(null);
  const [dstAirport, setDstAirport] = useState<Airport | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load saved airports from localStorage
  useEffect(() => {
    const savedSrc = localStorage.getItem('srcAirport');
    const savedDst = localStorage.getItem('dstAirport');
    if (savedSrc) handleSrcChange({ target: { value: savedSrc } });
    if (savedDst) handleDstChange({ target: { value: savedDst } });
  }, []);

  // Haversine formula to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch airport data
  const fetchAirportData = async (code: string) => {
    try {
      const response = await fetch('/airports.dat');
      const text = await response.text();
      const lines = text.split('\n');
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 8) {
          const iataCode = parts[4]?.replace(/"/g,'');
          if (iataCode === code.toUpperCase()) {
            return {
              name: parts[1]?.replace(/"/g,''),
              city: parts[2]?.replace(/"/g,''),
              country: parts[3]?.replace(/"/g,''),
              iata: iataCode,
              lat: parseFloat(parts[6]),
              lon: parseFloat(parts[7])
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching airport data:', error);
      return null;
    }
  };

  const handleSrcChange = async (e: { target: { value: string } }) => {
    const code = e.target.value.toUpperCase();
    setSrcCode(code);
    if (code.length === 3) {
      const airport = await fetchAirportData(code);
      setSrcAirport(airport);
      if (airport) localStorage.setItem('srcAirport', code);
    } else {
      setSrcAirport(null);
    }
  };

  const handleDstChange = async (e: { target: { value: string } }) => {
    const code = e.target.value.toUpperCase();
    setDstCode(code);
    if (code.length === 3) {
      const airport = await fetchAirportData(code);
      setDstAirport(airport);
      if (airport) localStorage.setItem('dstAirport', code);
    } else {
      setDstAirport(null);
    }
  };

  // Calculate distance and duration
  useEffect(() => {
    if (srcAirport && dstAirport) {
      const dist = calculateDistance(srcAirport.lat, srcAirport.lon, dstAirport.lat, dstAirport.lon);
      setDistance(dist);
      setDuration(dist / 800 + 0.5); // 800 km/h + 0.5 hr buffer
      setProgress(0);
      setElapsedTime(0);
      setIsFlying(true);
    } else {
      setIsFlying(false);
      setProgress(0);
      setElapsedTime(0);
    }
  }, [srcAirport, dstAirport]);

  // Animate progress bar
  useEffect(() => {
    if (!isFlying || duration === 0) return;
    const startTime = Date.now();
    const durationMs = duration * 3600 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const elapsedSeconds = elapsed / 1000;
      const newProgress = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(newProgress);
      setElapsedTime(elapsedSeconds);

      if (newProgress >= 100) {
        clearInterval(interval);
        // Desktop notification
        if (Notification.permission === "granted") {
          new Notification(`Flight arrived at ${dstAirport?.city} (${dstAirport?.iata}) ✈️`);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(`Flight arrived at ${dstAirport?.city} (${dstAirport?.iata}) ✈️`);
            }
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isFlying, duration, dstAirport]);

  const isCompleted = progress >= 100;

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds/3600);
    const minutes = Math.floor((seconds%3600)/60);
    const secs = Math.floor(seconds%60);
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
        <Icon icon="mdi:airplane" className="text-3xl sm:text-4xl" />
        <span>Flight Distance</span>
      </h2>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From (IATA Code)
          </label>
          <input
            type="text"
            value={srcCode}
            onChange={handleSrcChange}
            maxLength={3}
            placeholder="e.g., JFK"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-[#fafafa] dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-base sm:text-lg font-mono uppercase"
          />
          {srcAirport && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">{srcAirport.name}, {srcAirport.city}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To (IATA Code)
          </label>
          <input
            type="text"
            value={dstCode}
            onChange={handleDstChange}
            maxLength={3}
            placeholder="e.g., LAX"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-[#fafafa] dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-base sm:text-lg font-mono uppercase"
          />
          {dstAirport && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">{dstAirport.name}, {dstAirport.city}</p>}
        </div>
      </div>

      {/* Flight Info */}
      {srcAirport && dstAirport && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distance</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{distance.toFixed(0)} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{duration.toFixed(1)} hrs</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Flight Progress</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300">{formatElapsedTime(elapsedTime)} / {duration.toFixed(1)}h</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isCompleted ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-600 dark:bg-gray-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{srcAirport.iata}</p>
              <div className="flex items-center gap-1">
                <Icon icon={isCompleted ? "mdi:check-circle" : "mdi:airplane"} className={`text-base sm:text-lg ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`} />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{progress.toFixed(1)}%</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{dstAirport.iata}</p>
            </div>
          </div>

          {isCompleted && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-300 dark:border-gray-600">
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 text-center font-medium">
                ✈️ Flight completed! You&apos;ve arrived at {dstAirport.city}!
              </p>
            </motion.div>
          )}
        </div>
      )}

      {!srcAirport || !dstAirport ? (
        <div className="text-center py-6 sm:py-8">
          <Icon icon="mdi:airplane-search" className="text-4xl sm:text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Enter both airport codes to calculate flight distance</p>
        </div>
      ) : null}
    </motion.div>
  );
}

// Timeline Component
export default function Timeline() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2,'0');
  const minutes = time.getMinutes().toString().padStart(2,'0');
  const seconds = time.getSeconds().toString().padStart(2,'0');
  const utcHours = time.getUTCHours().toString().padStart(2,'0');
  const utcMinutes = time.getUTCMinutes().toString().padStart(2,'0');
  const utcSeconds = time.getUTCSeconds().toString().padStart(2,'0');

  const currentYear = time.getFullYear();
  const nextYear = currentYear+1;
  const dayOfYear = getDayOfYear(time);
  const daysLeft = differenceInDays(endOfYear(time), time);
  const isLeapYear = (y: number) => (y%4===0 && y%100!==0) || y%400===0;
  const daysInYear = isLeapYear(currentYear) ? 366 : 365;
  const msInYear = daysInYear*24*60*60*1000;
  const msSinceYearStart = time.getTime() - startOfYear(time).getTime();
  const yearProgress = ((msSinceYearStart/msInYear)*100).toFixed(6);

  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
  const elapsedMs = time.getTime() - startOfDay.getTime();
  const totalDayMs = 24*60*60*1000;
  const todayProgress = ((elapsedMs/totalDayMs)*100).toFixed(6);

  return (
    <>
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 pt-[50px] sm:pt-[60px] transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 pt-[50px] sm:pt-[60px]">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-gray-900 dark:text-white">Timeline</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">{daysLeft} days left until {nextYear}</p>
        </motion.div>

        {/* Large Clock */}
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.6,delay:0.2}} className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <motion.div key={`hours-${hours}`} initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",stiffness:300,damping:20}} className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight dark:text-white">{hours}</motion.div>
            <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-400 dark:text-gray-500">:</span>
            <motion.div key={`minutes-${minutes}`} initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",stiffness:300,damping:20}} className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight dark:text-white">{minutes}</motion.div>
            <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-400 dark:text-gray-500">:</span>
            <motion.div key={`seconds-${seconds}`} initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",stiffness:300,damping:20}} className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight text-blue-400 dark:text-blue-500">{seconds}</motion.div>
          </div>
          <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
            <Icon icon="mdi:earth" className="text-lg sm:text-xl" />
            <span className="text-sm sm:text-base md:text-lg font-mono">UTC {utcHours}:{utcMinutes}:{utcSeconds}</span>
          </div>
        </motion.div>

        {/* Timeline Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.4}} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Day of the Year</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold dark:text-white">{dayOfYear}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Year Progress</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold dark:text-white">{yearProgress}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Today Progress</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold dark:text-white">{todayProgress}%</p>
          </div>
        </motion.div>

        {/* Flight Calculator */}
        <FlightCalculator />

        {/* 2025 Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
            <Icon icon="mage:goals" className="text-3xl sm:text-4xl" />
            <span>2025 Goals</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:check-circle" className="text-2xl sm:text-3xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Diving</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:progress-clock" className="text-2xl sm:text-3xl text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Motorcycle</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">In progress</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:progress-clock" className="text-2xl sm:text-3xl text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Stay Healthy</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">In progress</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:progress-clock" className="text-2xl sm:text-3xl text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Find a Person I Care Of</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-yellow-400">In progress</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
      <RealFooter />
    </>
  );
}