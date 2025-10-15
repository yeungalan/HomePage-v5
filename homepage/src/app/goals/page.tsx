"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function TimelinePage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10); // Update every 10ms for fast running effect

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const utcHours = time.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = time.getUTCMinutes().toString().padStart(2, '0');
  const utcSeconds = time.getUTCSeconds().toString().padStart(2, '0');

  // Calculate day of year
  const startOfYear = new Date(time.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil((time - startOfYear) / (1000 * 60 * 60 * 24));
  
  // Calculate year progress (running number with more decimals)
  const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInYear = isLeapYear(time.getFullYear()) ? 366 : 365;
  const daysLeft = daysInYear - dayOfYear;
  
  // Year progress as running number
  const msInYear = daysInYear * 24 * 60 * 60 * 1000;
  const msSinceYearStart = time - startOfYear;
  const yearProgress = ((msSinceYearStart / msInYear) * 100).toFixed(6);
  
  // Today progress as running number
  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
  const elapsedMs = time - startOfDay;
  const totalDayMs = 24 * 60 * 60 * 1000;
  const todayProgress = ((elapsedMs / totalDayMs) * 100).toFixed(6);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 pt-[50px]">
      <div className="max-w-4xl mx-auto space-y-12 pt-[50px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Timeline</h1>
          <p className="text-xl text-gray-600">{daysLeft} days left until 2026</p>
        </motion.div>

        {/* Large Clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border border-gray-200 shadow-2xl"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <motion.div
              key={hours}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-8xl font-bold font-mono tracking-tight"
            >
              {hours}
            </motion.div>
            <span className="text-8xl font-bold text-gray-400">:</span>
            <motion.div
              key={minutes}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-8xl font-bold font-mono tracking-tight"
            >
              {minutes}
            </motion.div>
            <span className="text-8xl font-bold text-slate-500">:</span>
            <motion.div
              key={seconds}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-8xl font-bold font-mono tracking-tight text-blue-400"
            >
              {seconds}
            </motion.div>
          </div>
          
          {/* UTC Time */}
          <div className="flex justify-center items-center gap-2 text-gray-500">
            <Icon icon="mdi:earth" className="text-xl" />
            <span className="text-lg font-mono">
              UTC {utcHours}:{utcMinutes}:{utcSeconds}
            </span>
          </div>
        </motion.div>

        {/* Timeline Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/60 rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Today is day</p>
            <p className="text-4xl font-bold text-gray-900">{dayOfYear}</p>
            <p className="text-gray-400 text-xs mt-1">of 2025</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Year progress</p>
            <p className="text-4xl font-bold text-blue-600 font-mono">
              {yearProgress}%
            </p>
          </div>
          <div className="bg-white/60 rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Today progress</p>
            <p className="text-4xl font-bold text-green-600 font-mono">
              {todayProgress}%
            </p>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-2xl text-gray-600 font-light">Live in the present, cherish the moment</p>
        </motion.div>

        {/* 2025 Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-br from-blue-100/80 to-purple-100/80 rounded-2xl p-8 border border-blue-200 shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <Icon icon="mdi:target" className="text-4xl" />
            <span>2025 Goals</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200">
              <Icon icon="mdi:check-circle" className="text-3xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Diving</h3>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200">
              <Icon icon="mdi:progress-clock" className="text-3xl text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Motorcycle</h3>
                <p className="text-gray-600">In progress</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200">
              <Icon icon="mdi:arm-flex" className="text-3xl text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Stay Healthy</h3>
                <p className="text-gray-600">Trying hard</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200">
              <Icon icon="mdi:heart-outline" className="text-3xl text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Find a Person I Care Of</h3>
                <p className="text-gray-600">In progress</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}