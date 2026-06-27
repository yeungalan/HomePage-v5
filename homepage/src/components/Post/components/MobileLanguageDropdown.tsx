'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useLanguageData } from '../hooks/useLanguageData';

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

export const MobileLanguageDropdown: React.FC = () => {
  const router = useRouter();
  const languageData = useLanguageData();

  if (!languageData || languageData.availableLanguages.length <= 1) {
    return null;
  }

  const { baseSlug, currentLanguage, availableLanguages } = languageData;

  const hrefForLang = (lang: string) =>
    lang === 'default' ? `/posts/${baseSlug}` : `/posts/${baseSlug}_${lang}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(hrefForLang(e.target.value));
  };

  return (
    <div className="flex items-center gap-2 mb-4 xl:hidden">
      <Icon icon="mdi:translate" className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <select
        value={currentLanguage}
        onChange={handleChange}
        className="flex-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200
          px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400
          dark:focus:ring-blue-600 transition-colors"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang] || lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};
