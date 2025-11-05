'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { FullPageLoading } from '../Loading'
import { CurrentNoteDataContext } from './contexts/NoteDataContext'
import { CurrentNoteNidContext } from './contexts/NoteNidContext'
import { LanguageContext } from './contexts/LanguageContext'
import { parseMarkdownWithMetadata } from './utils/markdownParser'
import { NoteWrappedPayload, PostProps, LanguageData } from './types'
import { PaperWithMainContainer } from './components/PaperWithMainContainer'
import { NoteTitle } from './components/NoteTitle'
import { NoteHeaderDate } from './components/NoteHeaderDate'
import { NoteMetaBar } from './components/NoteMetaBar'
import { NoteBanner } from './components/NoteBanner'
import { NoteMarkdown } from './components/NoteMarkdown'
import { AuthorIntroduction } from './components/AuthorIntroduction'
import { NoteLeftSidebar } from './components/NoteLeftSidebar'
import { NoteRightSidebar } from './components/NoteRightSidebar'

const Post: React.FC<PostProps> = ({
  markdownContent,
  baseSlug = '',
  currentLanguage = 'default',
  availableLanguages = []
}) => {
  // Use provided markdown or fall back to mock data
  const content = markdownContent || ''
  const { metadata, markdown, title } = parseMarkdownWithMetadata(content)

  const noteData: NoteWrappedPayload = {
    data: {
      id: metadata.id || '1',
      nid: metadata.id || 'demo-note',
      title: title,
      text: markdown,
      created: metadata.createdDate || new Date().toISOString(),
      modified: metadata.editedDate || new Date().toISOString(),
      hide: false,
      allowComment: true,
      meta: {
        cover: undefined
      },
      images: [],
      topic: {
        name: metadata.topic || 'Demo Topic',
        tags: metadata.tags || []
      },
      category: metadata.category
        ? {
            name: metadata.category,
            caption: metadata.categoryCaption,
            avatar: metadata.categoryAvatar
          }
        : undefined
    }
  }

  const [currentNote, setCurrentNote] = useState<NoteWrappedPayload>(noteData)
  const [currentNid, setCurrentNid] = useState<string>(noteData.data.nid)
  const [contentKey, setContentKey] = useState(0) // Key to force re-render

  // Update note data when markdown content changes
  useEffect(() => {
    if (markdownContent) {
      const { metadata, markdown, title } = parseMarkdownWithMetadata(markdownContent)
      const updatedNoteData: NoteWrappedPayload = {
        data: {
          id: metadata.id || '1',
          nid: metadata.id || 'demo-note',
          title: title,
          text: markdown,
          created: metadata.createdDate || new Date().toISOString(),
          modified: metadata.editedDate || new Date().toISOString(),
          hide: false,
          allowComment: true,
          meta: {
            cover: undefined
          },
          images: [],
          topic: {
            name: metadata.topic || 'Demo Topic',
            tags: metadata.tags || []
          },
          category: metadata.category
            ? {
                name: metadata.category,
                caption: metadata.categoryCaption,
                avatar: metadata.categoryAvatar
              }
            : undefined
        }
      }
      setCurrentNote(updatedNoteData)
      setCurrentNid(updatedNoteData.data.nid)
      setContentKey(prev => prev + 1) // Force re-render of child components
    }
  }, [markdownContent])

  // Show loading state if no markdown content yet
  if (!markdownContent && !markdown) {
    return <FullPageLoading />
  }

  const languageData: LanguageData = {
    baseSlug,
    currentLanguage,
    availableLanguages
  }

  return (
    <div className="min-h-screen">
      <LanguageContext.Provider value={languageData}>
        <CurrentNoteNidContext.Provider value={currentNid}>
          <CurrentNoteDataContext.Provider value={currentNote}>
            {/* Layout */}
            <div
              className={clsx(
                'relative mx-auto grid min-h-[calc(100vh-6.5rem-10rem)] max-w-[60rem]',
                'gap-4 md:grid-cols-1 xl:max-w-[calc(60rem+400px)] xl:grid-cols-[1fr_minmax(auto,60rem)_1fr]',
                'mt-12',
                'md:mt-24'
              )}
            >
              {/* Left Sidebar */}
              <div
                key={`left-${contentKey}`}
                className="relative hidden min-w-0 xl:flex xl:flex-col xl:w-60"
              >
                <NoteLeftSidebar />
              </div>

              {/* Main Content */}
              <PaperWithMainContainer>
                <div>
                  <NoteTitle />
                  <span className="flex flex-wrap items-center text-sm text-gray-600 dark:text-white">
                    <div className="flex flex-col lg:flex-row items-start">
                      <div className="flex-1">
                        <NoteHeaderDate />
                      </div>

                      <div className="ml-4 max-lg:mt-3">
                        <NoteMetaBar />
                      </div>
                    </div>
                  </span>

                  {currentNote.data.hide && (
                    <NoteBanner
                      type="warning"
                      message="This article is private, only visible when logged in"
                    />
                  )}
                </div>

                <div className="mt-8">
                  <article className="max-w-none [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-[2rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:text-[1.5rem] [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[1.25rem] [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-8 [&_li]:mb-2 [&_code]:bg-gray-100 [&_code]:text-black [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[0.875rem] [&_code]:break-words [&_pre]:bg-[#282c34] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:max-w-full [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:break-words">
                    <header className="sr-only">
                      <NoteTitle />
                    </header>
                    <NoteMarkdown />
                  </article>

                  {/* Author Introduction */}
                  <AuthorIntroduction />
                </div>
              </PaperWithMainContainer>

              {/* Right Sidebar */}
              <div className="relative min-w-0 hidden xl:flex xl:flex-col xl:w-60">
                <NoteRightSidebar />
              </div>
            </div>
          </CurrentNoteDataContext.Provider>
        </CurrentNoteNidContext.Provider>
      </LanguageContext.Provider>
    </div>
  )
}

export default Post
