import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { useCurrentNoteNid } from '../hooks/useCurrentNoteNid'
import { useLanguageData } from '../hooks/useLanguageData'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { useTranslation } from '@/i18n'

export const NoteLeftSidebar: React.FC = () => {
  const t = useTranslation()
  const topic = useCurrentNoteDataSelector(data => data?.data.topic)
  const category = useCurrentNoteDataSelector(data => data?.data.category)
  const nid = useCurrentNoteNid()
  const languageData = useLanguageData()
  const tags = topic?.tags || []

  return (
    <div className="sticky top-[90px] mr-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm dark:text-white">
            {t('post.noteInfo')}
          </h3>

          {category && (
            <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('post.category')}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {category.name}
              </div>
              {category.caption && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {category.caption}
                </div>
              )}
            </div>
          )}

          {topic && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('post.topic')}
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {topic.name}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t('post.tags')}
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs dark:text-black"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {nid && (
            <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('post.id')}</span> {nid}
            </div>
          )}

          {/* Language Switcher */}
          {languageData && (
            <LanguageSwitcher
              baseSlug={languageData.baseSlug}
              currentLanguage={languageData.currentLanguage}
              availableLanguages={languageData.availableLanguages}
            />
          )}
        </div>
      </div>
    </div>
  )
}
