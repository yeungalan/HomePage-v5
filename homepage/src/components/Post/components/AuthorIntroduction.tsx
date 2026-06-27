import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { Avatar } from '../../Avatar'
import { useTranslation } from '@/i18n'

export const AuthorIntroduction: React.FC = () => {
  const t = useTranslation()
  const category = useCurrentNoteDataSelector(data => data?.data.category)

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Author/Category Image */}
        <div className="flex-shrink-0">
          {category?.avatar ? (
            <Avatar
              color={''}
              imageUrl={category.avatar}
              lazy
              radius={8}
              text={category.name[0]?.toUpperCase()}
              alt={`Avatar of ${category.name}`}
              size={64}
              className="ring-2 ring-gray-400/30 dark:ring-zinc-50"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg flex items-center justify-center ring-2 ring-gray-400/30 dark:ring-zinc-50">
              <span className="text-2xl font-bold select-none">
                {category?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
        </div>

        {/* Author/Category Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
            {category?.name || t('author.fallbackTitle')}
          </h3>
          <p className="text-base text-gray-600 mb-3 leading-relaxed dark:text-white">
            {category?.caption || t('author.fallbackCaption')}
          </p>
          {!category?.caption && (
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              {t('author.fallbackHobby')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
