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

export default function GoalsPage() {
  const t = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  const currentYear = time.getFullYear();
  const nextYear = currentYear + 1;
  const daysLeft = differenceInDays(endOfYear(time), time);

  const daysInYear = isLeapYear(currentYear) ? 366 : 365;
  const yearProgress = (((time.getTime() - startOfYear(time).getTime()) / (daysInYear * 86_400_000)) * 100).toFixed(6);

  const startOfDay = new Date(currentYear, time.getMonth(), time.getDate());
  const todayProgress = (((time.getTime() - startOfDay.getTime()) / 86_400_000) * 100).toFixed(6);

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
            hours={padTwo(time.getHours())}
            minutes={padTwo(time.getMinutes())}
            seconds={padTwo(time.getSeconds())}
            utcHours={padTwo(time.getUTCHours())}
            utcMinutes={padTwo(time.getUTCMinutes())}
            utcSeconds={padTwo(time.getUTCSeconds())}
          />

          <YearStats
            dayOfYear={getDayOfYear(time)}
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
