'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { getAirportByIata, type AirportInfo as Airport } from '@/data/airports';
import { haversineDistance } from '@/lib/worldUtils';
import { useTranslation } from '@/i18n';
import { FLIGHT_CRUISE_SPEED_KMH, FLIGHT_TIME_BUFFER_HRS } from '@/constants/flight';

export type { Airport };

export const FlightCalculator: React.FC = () => {
  const t = useTranslation();
  const [srcCode, setSrcCode] = useState('');
  const [dstCode, setDstCode] = useState('');
  const [srcAirport, setSrcAirport] = useState<Airport | null>(null);
  const [dstAirport, setDstAirport] = useState<Airport | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const savedSrc = localStorage.getItem('srcAirport');
    const savedDst = localStorage.getItem('dstAirport');
    if (savedSrc) handleOriginChange({ target: { value: savedSrc } } as ChangeEvent<HTMLInputElement>);
    if (savedDst) handleDestinationChange({ target: { value: savedDst } } as ChangeEvent<HTMLInputElement>);
  }, []);

  const handleOriginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setSrcCode(code);
    if (code.length === 3) {
      const airport = getAirportByIata(code);
      setSrcAirport(airport);
      if (airport) localStorage.setItem('srcAirport', code);
    } else {
      setSrcAirport(null);
    }
  };

  const handleDestinationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setDstCode(code);
    if (code.length === 3) {
      const airport = getAirportByIata(code);
      setDstAirport(airport);
      if (airport) localStorage.setItem('dstAirport', code);
    } else {
      setDstAirport(null);
    }
  };

  // Calculate distance and duration
  useEffect(() => {
    if (srcAirport && dstAirport) {
      const dist = haversineDistance(srcAirport.lat, srcAirport.lon, dstAirport.lat, dstAirport.lon);
      setDistance(dist);
      setDuration(dist / FLIGHT_CRUISE_SPEED_KMH + FLIGHT_TIME_BUFFER_HRS);
      setProgress(0);
      setElapsedTime(0);
      setIsFlying(true);

      // Request notification permission when flight starts
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
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
        if (Notification.permission === 'granted') {
          new Notification(`Flight arrived at ${dstAirport?.city} (${dstAirport?.iata}) ✈️`);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
        <Icon icon="mdi:airplane" className="text-3xl sm:text-4xl" />
        <span>{t('flightCalculator.title')}</span>
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('flightCalculator.subtitle')}
      </p>
      <br />

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('flightCalculator.from')}
          </label>
          <input
            type="text"
            value={srcCode}
            onChange={handleOriginChange}
            maxLength={3}
            placeholder="e.g., JFK"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-[#fafafa] dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-base sm:text-lg font-mono uppercase"
          />
          {srcAirport && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
              {srcAirport.name}, {srcAirport.city}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('flightCalculator.to')}
          </label>
          <input
            type="text"
            value={dstCode}
            onChange={handleDestinationChange}
            maxLength={3}
            placeholder="e.g., LAX"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-[#fafafa] dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-base sm:text-lg font-mono uppercase"
          />
          {dstAirport && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
              {dstAirport.name}, {dstAirport.city}
            </p>
          )}
        </div>
      </div>

      {/* Flight Info */}
      {srcAirport && dstAirport && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('flightCalculator.distance')}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {t('flightCalculator.distanceValue', { value: distance.toFixed(0) })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('flightCalculator.duration')}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {t('flightCalculator.durationValue', { value: duration.toFixed(1) })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('flightCalculator.flightProgress')}</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
                {formatElapsedTime(elapsedTime)} / {duration.toFixed(1)}h
              </p>
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
                <Icon
                  icon={isCompleted ? 'mdi:check-circle' : 'mdi:airplane'}
                  className={`text-base sm:text-lg ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
                />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {progress.toFixed(1)}%
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{dstAirport.iata}</p>
            </div>
          </div>

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#fafafa] dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-300 dark:border-gray-600"
            >
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 text-center font-medium">
                {t('flightCalculator.completed', { city: dstAirport.city })}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {!srcAirport || !dstAirport ? (
        <div className="text-center py-6 sm:py-8">
          <Icon
            icon="mdi:airplane-search"
            className="text-4xl sm:text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3"
          />
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {t('flightCalculator.placeholder')}
          </p>
        </div>
      ) : null}
    </motion.div>
  );
};
