'use client'

import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import clsx from 'clsx'
import dayjs from 'dayjs'

// Mock data types (extracted from @mx-space/api-client)
interface NoteModel {
  id: string
  nid: string
  title: string
  text: string
  created: string
  modified?: string
  hide: boolean
  allowComment: boolean
  meta?: {
    cover?: string
  }
  images?: Image[]
  topic?: {
    name: string
  }
}

interface Image {
  src: string
  alt?: string
  width?: number
  height?: number
}

interface NoteWrappedPayload {
  data: NoteModel
}

// Mock data
const mockNoteData: NoteWrappedPayload = {
  data: {
    id: '1',
    nid: 'demo-note',
    title: 'Demo Note - Standalone Version',
    text: `# Welcome to the Standalone Notes Demo

This is a demonstration of the extracted notes functionality without backend dependencies.

## Features Included

- **Note Layout**: Responsive grid layout with sidebar
- **Note Display**: Title, date, and content rendering
- **Markdown Support**: Basic markdown rendering
- **Meta Information**: Creation and modification dates
- **Responsive Design**: Mobile and desktop layouts

## Sample Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello from standalone notes!");
}
\`\`\`

### List Example

- Item 1
- Item 2
- Item 3

This demonstrates the core functionality of the notes system without requiring a backend connection.`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    hide: false,
    allowComment: true,
    meta: {
      cover: undefined
    },
    images: [],
    topic: {
      name: 'Demo Topic'
    }
  }
}

// Context for note data
const CurrentNoteDataContext = createContext<NoteWrappedPayload | null>(null)
const CurrentNoteNidContext = createContext<string | null>(null)

// Custom hooks
const useCurrentNoteDataSelector = <T,>(selector: (data: NoteWrappedPayload | null) => T): T => {
  const data = useContext(CurrentNoteDataContext)
  return selector(data)
}

const useCurrentNoteNid = () => {
  return useContext(CurrentNoteNidContext)
}

// Utility functions
const parseDate = (date: string, format: string) => {
  return dayjs(date).format(format)
}

// Components extracted and simplified

// Clock icon component
const MdiClockOutline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
  </svg>
)

// Simple tooltip component
const FloatPopover: React.FC<{
  children: React.ReactNode
  TriggerComponent: React.ComponentType
}> = ({ children, TriggerComponent }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <TriggerComponent />
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-10">
          {children}
        </div>
      )}
    </div>
  )
}

// Simple markdown renderer with heading IDs
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    let html = text
    let headingCounter = 0
    
    // Headers with IDs for TOC
    html = html.replace(/^### (.*$)/gim, (match, title) => {
      const id = `heading-${++headingCounter}`
      return `<h3 id="${id}" data-markdown-heading="true">${title}</h3>`
    })
    html = html.replace(/^## (.*$)/gim, (match, title) => {
      const id = `heading-${++headingCounter}`
      return `<h2 id="${id}" data-markdown-heading="true">${title}</h2>`
    })
    html = html.replace(/^# (.*$)/gim, (match, title) => {
      const id = `heading-${++headingCounter}`
      return `<h1 id="${id}" data-markdown-heading="true">${title}</h1>`
    })
    
    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    html = html.replace(/\n\n/gim, '</p><p>')
    
    // Wrap in paragraph tags
    html = '<p>' + html + '</p>'
    // Fix list items
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    
    return html
  }

  return (
    <div 
      className="max-w-none [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-[2rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:text-[1.5rem] [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[1.25rem] [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-8 [&_li]:mb-2 [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[0.875rem] [&_pre]:bg-gray-800 [&_pre]:text-gray-50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

// Note components
const NoteDateMeta = () => {
  const created = useCurrentNoteDataSelector((data) => data?.data.created)

  if (!created) return null
  const dateFormat = dayjs(created).format('YYYY 年 M 月 D 日 dddd')

  return (
    <span className="inline-flex items-center gap-1">
      <MdiClockOutline />
      <time className="font-medium" suppressHydrationWarning>
        {dateFormat}
      </time>
    </span>
  )
}

const NoteHeaderDate = () => {
  const date = useCurrentNoteDataSelector((data) => ({
    created: data?.data.created,
    modified: data?.data.modified,
  }))
  
  if (!date?.created) return null

  const tips = `创建于 ${parseDate(date.created, 'YYYY 年 M 月 D 日 dddd')}${
    date.modified
      ? `，修改于 ${parseDate(date.modified, 'YYYY 年 M 月 D 日 dddd')}`
      : ''
  }`

  return (
    <FloatPopover TriggerComponent={NoteDateMeta}>
      {tips}
    </FloatPopover>
  )
}

const NoteTitle = () => {
  const title = useCurrentNoteDataSelector((data) => data?.data.title)

  if (!title) return null
  return (
    <div className="relative">
      <h1 className="my-8 text-balance text-left text-4xl font-bold leading-tight text-gray-900">
        {title}
      </h1>
    </div>
  )
}

const NoteMarkdown = () => {
  const text = useCurrentNoteDataSelector((data) => data?.data.text)!
  return (
    <div className="mt-10">
      <SimpleMarkdown content={text} />
    </div>
  )
}

const NoteMetaBar = () => {
  const topic = useCurrentNoteDataSelector((data) => data?.data.topic)
  
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {topic && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {topic.name}
        </span>
      )}
    </div>
  )
}

const NoteBanner: React.FC<{ type: string; message: string }> = ({ type, message }) => {
  const bgColor = type === 'warning' ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-blue-100 border-blue-400 text-blue-800'
  
  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColor}`}>
      <p>{message}</p>
    </div>
  )
}

const NoteLeftSidebar = () => {
  const topic = useCurrentNoteDataSelector((data) => data?.data.topic)
  const nid = useCurrentNoteNid()
  
  return (
    <div className="sticky top-[120px] mt-[120px] mr-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Note Info</h3>
          {topic && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Topic:</span> {topic.name}
            </div>
          )}
          {nid && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">ID:</span> {nid}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TocItem {
  depth: number
  title: string
  anchorId: string
  index: number
}

const TocItem: React.FC<{
  item: TocItem
  isActive: boolean
  rootDepth: number
  onClick: (anchorId: string) => void
}> = ({ item, isActive, rootDepth, onClick }) => {
  const paddingLeft = `${(item.depth - rootDepth) * 0.75}rem`
  
  return (
    <button
      onClick={() => onClick(item.anchorId)}
      className={clsx(
        'block w-full text-left text-sm py-1.5 px-2 rounded transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
      style={{ paddingLeft }}
    >
      {item.title}
    </button>
  )
}

const PaperWithMainContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  
  useEffect(() => {
    // Find all headings with data-markdown-heading attribute
    const headingElements = document.querySelectorAll('h1[data-markdown-heading], h2[data-markdown-heading], h3[data-markdown-heading], h4[data-markdown-heading], h5[data-markdown-heading], h6[data-markdown-heading]')
    
    const tocItems: TocItem[] = Array.from(headingElements).map((el, idx) => {
      const depth = parseInt(el.tagName.slice(1))
      const title = el.textContent || ''
      const anchorId = el.id
      
      return {
        depth,
        title,
        anchorId,
        index: idx
      }
    })
    
    setHeadings(tocItems)
    
    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        // Find the entry that's most visible
        let mostVisible: IntersectionObserverEntry | null = null
        let maxRatio = 0
        
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            mostVisible = entry
          }
        })
        
        if (mostVisible && mostVisible.target instanceof HTMLElement) {
          setActiveId(mostVisible.target.id)
        }
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )
    
    headingElements.forEach((heading) => {
      observer.observe(heading)
    })
    
    // Also set up a scroll listener as backup
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h1[data-markdown-heading], h2[data-markdown-heading], h3[data-markdown-heading], h4[data-markdown-heading], h5[data-markdown-heading], h6[data-markdown-heading]')
      const scrollPosition = window.scrollY + 200
      
      let currentActiveId: string | null = null
      
      headingElements.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY
        
        if (elementTop <= scrollPosition) {
          currentActiveId = heading.id
        }
      })
      
      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Set initial active heading
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [activeId])
  
  const rootDepth = headings.length > 0 
    ? headings.reduce((min, item) => Math.min(min, item.depth), headings[0]?.depth || 1)
    : 1
  
  const scrollToHeading = (anchorId: string) => {
    const element = document.getElementById(anchorId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(anchorId)
    }
  }
  
  if (headings.length === 0) return null
  
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Table of Contents</h3>
      <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
        {headings.map((heading) => (
          <TocItem
            key={`${heading.anchorId}-${heading.index}`}
            item={heading}
            isActive={heading.anchorId === activeId}
            rootDepth={rootDepth}
            onClick={scrollToHeading}
          />
        ))}
      </div>
    </div>
  )
}

// Action buttons for right sidebar
const ActionButton: React.FC<{
  icon: string
  label: string
  onClick: () => void
  count?: number
}> = ({ icon, label, onClick, count }) => {
  return (
    <button
      className="relative flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      onClick={onClick}
      title={label}
    >
      <div className={clsx('text-xl', icon)} />
      {count !== undefined && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}

const NoteActionButtons: React.FC = () => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)
  
  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Demo Note - Standalone Version',
        text: 'Check out this demo note!',
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  const handleComment = () => {
    // Scroll to comments section (if it existed)
    alert('Comments feature would be here!')
  }
  
  const handleSubscribe = () => {
    alert('Subscribe feature would be here!')
  }
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Actions</h3>
      <div className="flex flex-col gap-2">
        <ActionButton
          icon={liked ? "❤️" : "🤍"}
          label="Like"
          onClick={handleLike}
          count={likeCount}
        />
        <ActionButton
          icon="📤"
          label="Share"
          onClick={handleShare}
        />
        <ActionButton
          icon="💬"
          label="Comments"
          onClick={handleComment}
        />
        <ActionButton
          icon="🔔"
          label="Subscribe"
          onClick={handleSubscribe}
        />
      </div>
    </div>
  )
}

const NoteRightSidebar: React.FC = () => {
  return (
    <div className="sticky top-[120px] mt-[120px] min-h-[300px] hidden xl:block">
      <div className="ml-4 space-y-8">
        <TableOfContents />
        <div className="border-t pt-6">
          <NoteActionButtons />
        </div>
      </div>
    </div>
  )
}

// Main component
const Post: React.FC = () => {
  const [currentNote] = useState<NoteWrappedPayload>(mockNoteData)
  const [currentNid] = useState<string>(mockNoteData.data.nid)

  return (
    <div className="min-h-screen">
      <CurrentNoteNidContext.Provider value={currentNid}>
        <CurrentNoteDataContext.Provider value={currentNote}>
          {/* Layout */}
          <div className={clsx(
            'relative mx-auto grid min-h-[calc(100vh-6.5rem-10rem)] max-w-[60rem]',
            'gap-4 md:grid-cols-1 xl:max-w-[calc(60rem+400px)] xl:grid-cols-[1fr_minmax(auto,60rem)_1fr]',
            'mt-12',
            'md:mt-24'
          )}>
            {/* Left Sidebar */}
            <div className="relative hidden min-w-0 xl:block">
              <NoteLeftSidebar />
            </div>

            {/* Main Content */}
            <PaperWithMainContainer>
              <div>
                <NoteTitle />
                <span className="flex flex-wrap items-center text-sm text-gray-600">
                  <NoteHeaderDate />
                  <div className="ml-4">
                    <NoteMetaBar />
                  </div>
                </span>

                {currentNote.data.hide && (
                  <NoteBanner type="warning" message="这篇文章是非公开的,仅登录可见" />
                )}
              </div>

              <div className="mt-8">
                <article className="max-w-none [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-[2rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:text-[1.5rem] [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[1.25rem] [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-8 [&_li]:mb-2 [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[0.875rem] [&_pre]:bg-gray-800 [&_pre]:text-gray-50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
                  <header className="sr-only">
                    <NoteTitle />
                  </header>
                  <NoteMarkdown />
                </article>
              </div>
            </PaperWithMainContainer>

            {/* Right Sidebar */}
            <div className="relative hidden min-w-0 xl:block">
              <NoteRightSidebar />
            </div>
          </div>
        </CurrentNoteDataContext.Provider>
      </CurrentNoteNidContext.Provider>
    </div>
  )
}

export default Post;