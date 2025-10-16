"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { RealFooter } from '@/components/FooterLinks';

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

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
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
          const iataCode = parts[4]?.replace(/"/g, '');
          if (iataCode === code.toUpperCase()) {
            return {
              name: parts[1]?.replace(/"/g, ''),
              city: parts[2]?.replace(/"/g, ''),
              country: parts[3]?.replace(/"/g, ''),
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

  // Handle source airport input
  const handleSrcChange = async (e: { target: { value: string; }; }) => {
    const code = e.target.value.toUpperCase();
    setSrcCode(code);
    
    if (code.length === 3) {
      const airport = await fetchAirportData(code);
      setSrcAirport(airport);
    } else {
      setSrcAirport(null);
    }
  };

  // Handle destination airport input
  const handleDstChange = async (e: { target: { value: string; }; }) => {
    const code = e.target.value.toUpperCase();
    setDstCode(code);
    
    if (code.length === 3) {
      const airport = await fetchAirportData(code);
      setDstAirport(airport);
    } else {
      setDstAirport(null);
    }
  };

  // Calculate distance and duration when both airports are set
  useEffect(() => {
    if (srcAirport && dstAirport) {
      const dist = calculateDistance(
        srcAirport.lat, srcAirport.lon,
        dstAirport.lat, dstAirport.lon
      );
      setDistance(dist);
      setDuration(dist / 800 + 0.5); // 900 km/h, duration in hours
      setProgress(0);
      setElapsedTime(0);
      setIsFlying(true);
    } else {
      setIsFlying(false);
      setProgress(0);
      setElapsedTime(0);
    }
  }, [srcAirport, dstAirport]);

  // Animate progress bar based on actual time
  useEffect(() => {
    if (!isFlying || duration === 0) return;

    const startTime = Date.now();
    const durationMs = duration * 3600 * 1000; // Convert hours to milliseconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const elapsedSeconds = elapsed / 1000;
      const newProgress = Math.min((elapsed / durationMs) * 100, 100);
      
      setProgress(newProgress);
      setElapsedTime(elapsedSeconds);

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isFlying, duration]);

  const isCompleted = progress >= 100;

  // Format elapsed time to HH:MM:SS
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gradient-to-br from-sky-100/80 to-blue-100/80 dark:from-sky-900/30 dark:to-blue-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-sky-200 dark:border-sky-700 shadow-lg"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
        <Icon icon="mdi:airplane" className="text-3xl sm:text-4xl" />
        <span>Flight Distance</span>
      </h2>

      {/* Airport Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg font-mono uppercase"
          />
          {srcAirport && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
              {srcAirport.name}, {srcAirport.city}
            </p>
          )}
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg font-mono uppercase"
          />
          {dstAirport && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
              {dstAirport.name}, {dstAirport.city}
            </p>
          )}
        </div>
      </div>

      {/* Flight Progress Bar */}
      <motion.div
        initial={false}
        animate={{ 
          height: isFlying ? 'auto' : 0,
          opacity: isFlying ? 1 : 0,
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 sm:p-6"
        >
          {/* Progress Bar Container */}
          <div className="relative mb-6 sm:mb-8">
            {/* Progress Bar */}
            <div className="relative h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-visible">
              <motion.div
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
            
            {/* Airplane Icon - Centered with white background for clearance */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
              <Icon 
                icon="mdi:airplane" 
                className={`text-2xl sm:text-4xl ${
                  isCompleted ? 'text-green-600' : 'text-blue-600'
                }`}
              />
            </div>
          </div>

          {/* Completion Status */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-green-600 font-semibold text-base sm:text-lg"
            >
              <Icon icon="mdi:check-circle" className="text-xl sm:text-2xl" />
              <span>Completed</span>
            </motion.div>
          )}

          {/* Flight Info */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Distance</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {distance.toFixed(0)} <span className="text-sm sm:text-base">km</span>
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Est. Duration</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(duration)}<span className="text-sm">h</span> {Math.round((duration % 1) * 60)}<span className="text-sm">m</span>
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Elapsed</p>
              <div className="flex justify-center gap-0.5">
                {formatElapsedTime(elapsedTime).split('').map((char, index) => (
                  <motion.span
                    key={`${index}-${char}`}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    className={`text-base sm:text-2xl font-bold font-mono inline-block ${
                      char === ':' ? 'text-gray-400' : 'text-blue-600'
                    }`}
                    style={{
                      transformOrigin: 'center',
                      perspective: '1000px'
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function TimelinePage() {
  const [time, setTime] = useState(new Date());
  const [dateKey, setDateKey] = useState(new Date().toDateString());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);
      
      // Update dateKey when the date changes (at midnight)
      const newDateKey = newTime.toDateString();
      if (newDateKey !== dateKey) {
        setDateKey(newDateKey);
      }
    }, 10); // Update every 10ms for fast running effect

    return () => clearInterval(timer);
  }, [dateKey]);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const utcHours = time.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = time.getUTCMinutes().toString().padStart(2, '0');
  const utcSeconds = time.getUTCSeconds().toString().padStart(2, '0');

  // Calculate day of year - recalculates when dateKey changes
  const startOfYear = new Date(time.getFullYear(), 0, 0);
  const diff = +time - (+startOfYear);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Calculate year progress (running number with more decimals)
  const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear(time.getFullYear()) ? 366 : 365;
  const daysLeft = daysInYear - dayOfYear;
  
  // Year progress as running number
  const msInYear = daysInYear * 24 * 60 * 60 * 1000;
  const msSinceYearStart = +time - (+startOfYear);
  const yearProgress = ((msSinceYearStart / msInYear) * 100).toFixed(6);
  
  // Today progress as running number
  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
  const elapsedMs = +time - (+startOfDay);
  const totalDayMs = 24 * 60 * 60 * 1000;
  const todayProgress = ((elapsedMs / totalDayMs) * 100).toFixed(6);

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 pt-[50px] sm:pt-[60px] transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 pt-[50px] sm:pt-[60px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-gray-900 dark:text-white">Timeline</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">{daysLeft} days left until 2026</p>
        </motion.div>

        {/* Large Clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-2xl"
        >
          <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <motion.div
              key={`hours-${hours}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight dark:text-white"
            >
              {hours}
            </motion.div>
            <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-400 dark:text-gray-500">:</span>
            <motion.div
              key={`minutes-${minutes}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight dark:text-white"
            >
              {minutes}
            </motion.div>
            <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-slate-500 dark:text-slate-400">:</span>
            <motion.div
              key={`seconds-${seconds}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight text-blue-400 dark:text-blue-500"
            >
              {seconds}
            </motion.div>
          </div>
          
          {/* UTC Time */}
          <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
            <Icon icon="mdi:earth" className="text-lg sm:text-xl" />
            <span className="text-sm sm:text-base md:text-lg font-mono">
              UTC {utcHours}:{utcMinutes}:{utcSeconds}
            </span>
          </div>
        </motion.div>

        {/* Timeline Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Today is day</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{dayOfYear}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">of 2025</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Year progress</p>
            <p className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-500 font-mono break-all">
              {yearProgress}%
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Today progress</p>
            <p className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-500 font-mono break-all">
              {todayProgress}%
            </p>
          </div>
        </motion.div>

        {/* Flight Distance Calculator */}
        <FlightCalculator />

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center px-4"
        >
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light">Live in the present, cherish the moment</p>
        </motion.div>

        {/* 2025 Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-br from-blue-100/80 to-purple-100/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-200 dark:border-blue-700 shadow-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
            <Icon icon="mdi:target" className="text-3xl sm:text-4xl" />
            <span>2025 Goals</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:check-circle" className="text-2xl sm:text-3xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Diving</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:progress-clock" className="text-2xl sm:text-3xl text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Motorcycle</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">In progress</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:arm-flex" className="text-2xl sm:text-3xl text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Stay Healthy</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Trying hard</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon icon="mdi:heart-outline" className="text-2xl sm:text-3xl text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">Find a Person I Care Of</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">In progress</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
           <RealFooter/>
    
          </>
  );
}