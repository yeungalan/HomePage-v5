'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RealFooter } from '@/components/FooterLinks';
import { getDayOfYear, differenceInDays, endOfYear, startOfYear } from 'date-fns';
import { FlightCalculator } from '@/components/goals/FlightCalculator';
import { ClockDisplay } from '@/components/goals/ClockDisplay';
import { YearStats } from '@/components/goals/YearStats';
import { TimezoneGrid } from '@/components/goals/TimezoneGrid';
import { GoalsList } from '@/components/goals/GoalsList';
import { useTranslation } from '@/i18n';

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * The year the site was built, the same in the pre-rendered HTML and the
 * browser bundle (NEXT_PUBLIC_BUILD_DATE is inlined at build time).
 */
const BUILD_YEAR = new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? Date.UTC(2026, 0)).getUTCFullYear();

const PLACEHOLDER = '--';

export default function GoalsPage() {
  const t = useTranslation();
  // The page is pre-rendered at build time, so the current time only exists in
  // the browser. Rendering it on the server would bake in the build moment and
  // break hydration; start empty and fill in on the first tick.
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  const currentYear = time?.getFullYear() ?? BUILD_YEAR;
  const nextYear = currentYear + 1;
  const daysLeft = time ? differenceInDays(endOfYear(time), time) : PLACEHOLDER;

  const daysInYear = isLeapYear(currentYear) ? 366 : 365;
  const yearProgress = time
    ? (((time.getTime() - startOfYear(time).getTime()) / (daysInYear * 86_400_000)) * 100).toFixed(6)
    : PLACEHOLDER;

  const startOfDay = time ? new Date(currentYear, time.getMonth(), time.getDate()) : null;
  const todayProgress = time && startOfDay
    ? (((time.getTime() - startOfDay.getTime()) / 86_400_000) * 100).toFixed(6)
    : PLACEHOLDER;

  return (
    <>
      <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 pt-[50px] sm:pt-[60px] transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-12 pt-5 sm:pt-[60px]">

          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('goals.titleYear', { year: currentYear })}</h1>
            <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('goals.daysLeft', { days: daysLeft, year: nextYear })}</h3>
          </motion.header>

          <ClockDisplay
            hours={time ? padTwo(time.getHours()) : PLACEHOLDER}
            minutes={time ? padTwo(time.getMinutes()) : PLACEHOLDER}
            seconds={time ? padTwo(time.getSeconds()) : PLACEHOLDER}
            utcHours={time ? padTwo(time.getUTCHours()) : PLACEHOLDER}
            utcMinutes={time ? padTwo(time.getUTCMinutes()) : PLACEHOLDER}
            utcSeconds={time ? padTwo(time.getUTCSeconds()) : PLACEHOLDER}
          />

          <YearStats
            dayOfYear={time ? getDayOfYear(time) : PLACEHOLDER}
            yearProgress={yearProgress}
            todayProgress={todayProgress}
          />

          <TimezoneGrid time={time} />

          <FlightCalculator />

          <GoalsList year={currentYear} />

        </div>
      </div>
      <RealFooter />
    </>
  );
}
