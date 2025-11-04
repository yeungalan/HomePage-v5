'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

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

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  baseSlug,
  currentLanguage,
  availableLanguages,
}) => {
  // Don't show switcher if only one language is available
  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        <Icon icon="mdi:translate" className="text-sm" />
        <span>Language</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableLanguages.map((lang) => {
          const isActive = lang === currentLanguage;
          const label = LANGUAGE_LABELS[lang] || lang.toUpperCase();
          const href = lang === 'default' ? `/posts/${baseSlug}` : `/posts/${baseSlug}_${lang}`;

          return (
            <Link
              key={lang}
              href={href}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <span>{label}</span>
              {isActive && (
                <Icon icon="mdi:check" className="text-xs" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
