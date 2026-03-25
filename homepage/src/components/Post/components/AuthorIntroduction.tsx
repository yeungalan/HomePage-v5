import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { Avatar } from '../../Avatar'

export const AuthorIntroduction: React.FC = () => {
  const category = useCurrentNoteDataSelector(data => data?.data.category)

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Author/Category Image */}
        <div className="flex-shrink-0">
          {category?.avatar ? (
            <Avatar
              color={''}
              imageUrl={category.avatar}
              lazy
              radius={8}
              text={category.name}
              alt={`Avatar of ${category.name}`}
              size={64}
              className="ring-2 ring-gray-400/30 dark:ring-zinc-50"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {/* Placeholder avatar */}
              <svg
                className="w-16 h-16 md:w-20 md:h-20 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Author/Category Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
            {category?.name || 'About the Author'}
          </h3>
          <p className="text-base text-gray-600 mb-3 leading-relaxed dark:text-white">
            {category?.caption ||
              "Hi! I'm a passionate developer and writer sharing my thoughts and experiences. I love exploring new technologies, building creative projects, and documenting my journey."}
          </p>
          {!category?.caption && (
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              When I&apos;m not coding, you can find me reading, experimenting with new
              ideas, or contributing to open-source projects. Feel free to connect
              with me!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
