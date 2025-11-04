'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface LanguageSwitcherProps {
  baseSlug: string;
  currentLanguage: string;
  availableLanguages: string[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  default: '中文',
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  default: '🇨🇳',
  en: '🇺🇸',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  baseSlug,
  currentLanguage,
  availableLanguages,
}) => {
  const router = useRouter();

  // Don't show switcher if only one language is available
  if (availableLanguages.length <= 1) {
    return null;
  }

  const handleLanguageChange = (language: string) => {
    const newSlug = language === 'default' ? baseSlug : `${baseSlug}_${language}`;
    router.push(`/posts/${newSlug}`);
  };

  return (
    <div className="fixed top-20 right-4 z-50 md:top-24 md:right-8">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2"
      >
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <Icon icon="mdi:translate" className="text-sm" />
          <span>Language</span>
        </div>

        {availableLanguages.map((lang) => {
          const isActive = lang === currentLanguage;
          const label = LANGUAGE_LABELS[lang] || lang.toUpperCase();
          const flag = LANGUAGE_FLAGS[lang] || '🌐';

          return (
            <motion.button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span className="text-lg">{flag}</span>
              <span>{label}</span>
              {isActive && (
                <Icon icon="mdi:check" className="ml-auto text-blue-700 dark:text-blue-300" />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
