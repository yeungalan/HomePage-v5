'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { RealFooter } from '@/components/FooterLinks';
import { getDayOfYear, differenceInDays, endOfYear, startOfYear } from 'date-fns';
import { GOALS_2026, GOAL_STATUS_CONFIG, GOAL_STATUS_LABELS, getGoalsTitle } from '@/data/goals';
import { FlightCalculator } from '@/components/goals/FlightCalculator';
import { TIMEZONES, getDaylightInfo } from '@/constants/timezones';

export default function GoalsPage() {
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
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 pt-5 sm:pt-[60px]">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
                <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{nextYear - 1} Goals</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{daysLeft} days left until {nextYear}</h3>
      </header>

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

        {/* Global Timezones */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.6}} className="grid grid-cols-2 gap-4 sm:gap-6">
          {TIMEZONES.map(({ label, tz, lat, lng }) => {
            const { icon: daylightIcon, gradient, textColor } = getDaylightInfo(time, lat, lng);
            return (
              <div
                key={tz}
                className="rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-500"
                style={{ background: gradient }}
              >
                <p className={`text-xs sm:text-sm mb-1 ${textColor} opacity-70 flex items-center justify-center gap-1`}>
                  <Icon icon={daylightIcon} className="text-base" /> {label}
                </p>
                <p className={`text-lg sm:text-xl md:text-2xl font-bold font-mono ${textColor}`}>
                  {time.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Flight Calculator */}
        <FlightCalculator />

        {/* Dynamic Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
            <Icon icon="mage:goals" className="text-3xl sm:text-4xl" />
            <span>{getGoalsTitle()}</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {GOALS_2026.map((goal, index) => {
              const statusConfig = GOAL_STATUS_CONFIG[goal.status];
              const statusLabel = GOAL_STATUS_LABELS[goal.status];

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <Icon
                    icon={statusConfig.icon}
                    className={`text-2xl sm:text-3xl ${statusConfig.color} flex-shrink-0 mt-1`}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">
                      {goal.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {statusLabel}
                    </p>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
      <RealFooter />
    </>
  );
}