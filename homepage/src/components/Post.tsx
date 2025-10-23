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
    tags?: string[]
  }
  category?: {
    name: string
    caption?: string
    avatar?: string
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

interface AutomateField {
  topic?: string
  id?: string
  createdDate?: string
  editedDate?: string
  tags?: string[]
  category?: string
  categoryCaption?: string
  categoryAvatar?: string
}

// Function to parse markdown with automate fields
const parseMarkdownWithMetadata = (content: string): { metadata: AutomateField; markdown: string } => {
  const automateFieldRegex = /### AUTOMATE FIELD\n([\s\S]*?)\n### AUTOMATE FIELD END/
  const match = content.match(automateFieldRegex)
  
  const metadata: AutomateField = {}
  let markdown = content
  
  if (match) {
    const metadataBlock = match[1]
    const lines = metadataBlock.split('\n')
    
    lines.forEach(line => {
      const [key, value] = line.split('=').map(s => s.trim())
      if (key && value) {
        switch (key) {
          case 'Topic':
            metadata.topic = value
            break
          case 'ID':
            metadata.id = value
            break
          case 'CREATED_DATE':
            metadata.createdDate = value
            break
          case 'EDITED_DATE':
            metadata.editedDate = value
            break
          case 'TAG':
            metadata.tags = value.split(',').map(t => t.trim())
            break
          case 'CATEGORY':
            metadata.category = value
            break
          case 'CATEGORY_CAPTION':
            metadata.categoryCaption = value
            break
          case 'CATEGORY_AVATAR':
            metadata.categoryAvatar = value
            break
        }
      }
    })
    
    // Remove the metadata block from the markdown
    markdown = content.replace(automateFieldRegex, '').trim()
  }
  
  return { metadata, markdown }
}

// Mock data with automate fields
const mockMarkdownContent = `### AUTOMATE FIELD
Topic=Demo Topic
ID=demo-note
CREATED_DATE=2025-01-22T00:01:01Z
EDITED_DATE=2025-01-22T12:30:00Z
TAG=Demo, Tutorial, Standalone
CATEGORY=Greeting
CATEGORY_CAPTION=Welcome to our demo
CATEGORY_AVATAR=https://via.placeholder.com/150
### AUTOMATE FIELD END

# Welcome to the Standalone Notes Demo

This is a demonstration of the extracted notes functionality without backend dependencies.

## Features Included

- **Note Layout**: Responsive grid layout with sidebar
- **Note Display**: Title, date, and content rendering
- **Markdown Support**: Basic markdown rendering
- **Meta Information**: Creation and modification dates
- **Responsive Design**: Mobile and desktop layouts

## Sample Content

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

This demonstrates the core functionality of the notes system without requiring a backend connection.`

const { metadata, markdown } = parseMarkdownWithMetadata(mockMarkdownContent)

const mockNoteData: NoteWrappedPayload = {
  data: {
    id: metadata.id || '1',
    nid: metadata.id || 'demo-note',
    title: 'Demo Note - Standalone Version',
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
    category: metadata.category ? {
      name: metadata.category,
      caption: metadata.categoryCaption,
      avatar: metadata.categoryAvatar
    } : undefined
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
  const dateFormat = dayjs(created).format('MMMM D, YYYY')

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

  const tips = `Created on ${parseDate(date.created, 'MMMM D, YYYY')}${
    date.modified
      ? `, modified on ${parseDate(date.modified, 'MMMM D, YYYY')}`
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
  const tags = topic?.tags || []
  
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
      {topic && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {topic.name}
        </span>
      )}
      {tags.map((tag, index) => (
        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
          #{tag}
        </span>
      ))}
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
  const category = useCurrentNoteDataSelector((data) => data?.data.category)
  const nid = useCurrentNoteNid()
  const tags = topic?.tags || []
  
  return (
    <div className="sticky top-[90px] mr-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Note Info</h3>
          
          {category && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Category</div>
              <div className="text-sm font-medium text-gray-900">{category.name}</div>
              {category.caption && (
                <div className="text-xs text-gray-600 mt-1">{category.caption}</div>
              )}
            </div>
          )}
          
          {topic && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Topic</div>
              <div className="text-sm text-gray-900">{topic.name}</div>
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2">Tags</div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {nid && (
            <div className="text-xs text-gray-600">
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
  itemIndex: number
  setRef: (el: HTMLButtonElement | null) => void
}> = ({ item, isActive, rootDepth, onClick, itemIndex, setRef }) => {
  const baseIndent = (item.depth - rootDepth) * 0.5
  
  return (
    <button
      ref={setRef}
      onClick={() => onClick(item.anchorId)}
      className={clsx(
        'relative block w-full text-left text-xs py-1 px-2 rounded transition-colors duration-200',
        isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-600 hover:text-gray-900'
      )}
      style={{ paddingLeft: `${baseIndent + 0.5}rem` }}
      title={item.title}
    >
      <span className="block truncate leading-tight">{item.title}</span>
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
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({ top: 0, height: 0 })
  const isManualClickRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTopRef = useRef(0)
  const userScrolledRef = useRef(false)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  
  // Update active index when active ID changes
  useEffect(() => {
    if (activeId) {
      const index = headings.findIndex(h => h.anchorId === activeId)
      setActiveIndex(index)
    }
  }, [activeId, headings])
  
  // Update indicator position based on actual element measurements
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current.has(activeIndex)) {
      const activeElement = itemRefs.current.get(activeIndex)
      if (activeElement) {
        const rect = activeElement.getBoundingClientRect()
        const containerElement = activeElement.parentElement?.parentElement
        if (containerElement) {
          const containerRect = containerElement.getBoundingClientRect()
          setIndicatorStyle({
            top: activeElement.offsetTop,
            height: rect.height
          })
        }
      }
    }
  }, [activeIndex])
  
  const setItemRef = (index: number) => (el: HTMLButtonElement | null) => {
    if (el) {
      itemRefs.current.set(index, el)
    } else {
      itemRefs.current.delete(index)
    }
  }
  
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
  }, [])
  
  useEffect(() => {
    if (headings.length === 0) return
    
    const updateActiveHeading = () => {
      // Skip updates if user manually clicked a TOC item
      if (isManualClickRef.current) return
      
      // Calculate current scroll percentage
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      // Get all heading elements with their scroll percentages
      const headingPositions = headings.map(({ anchorId }) => {
        const element = document.getElementById(anchorId)
        if (!element) return null
        
        const rect = element.getBoundingClientRect()
        const absoluteTop = rect.top + scrollTop - 64 // Account for 64px header offset
        // Calculate what percentage of the page this heading is at
        const headingPercentage = docHeight > 0 
          ? (absoluteTop / (docHeight + window.innerHeight)) * 100 
          : 0
        
        return {
          id: anchorId,
          percentage: headingPercentage
        }
      }).filter((h): h is { id: string; percentage: number } => h !== null)
      
      // Find the active heading - the last one whose position is <= current scroll percentage
      let newActiveId: string | null = headingPositions[0]?.id || null
      
      for (const heading of headingPositions) {
        if (scrollPercentage >= heading.percentage - 5) { // 5% threshold for better UX
          newActiveId = heading.id
        } else {
          break
        }
      }
      
      setActiveId(newActiveId)
    }
    
    const handleScroll = () => {
      const currentScrollTop = window.scrollY
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // If in manual click mode and user hasn't scrolled yet, stay in manual mode
      if (isManualClickRef.current && !userScrolledRef.current) {
        // Check if this is the end of programmatic smooth scroll
        scrollTimeoutRef.current = setTimeout(() => {
          lastScrollTopRef.current = currentScrollTop
        }, 100)
        return
      }
      
      // If user scrolled, exit manual mode
      if (userScrolledRef.current) {
        isManualClickRef.current = false
        userScrolledRef.current = false
      }
      
      // Update active heading
      if (!isManualClickRef.current) {
        updateActiveHeading()
      }
      
      lastScrollTopRef.current = currentScrollTop
    }
    
    // Detect user-initiated scrolling
    const handleUserScroll = () => {
      if (isManualClickRef.current) {
        userScrolledRef.current = true
      }
    }
    
    // Set initial active heading
    updateActiveHeading()
    
    // Add scroll and resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleUserScroll, { passive: true })
    window.addEventListener('touchmove', handleUserScroll, { passive: true })
    window.addEventListener('resize', updateActiveHeading)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleUserScroll)
      window.removeEventListener('touchmove', handleUserScroll)
      window.removeEventListener('resize', updateActiveHeading)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [headings])
  
  const rootDepth = headings.length > 0 
    ? headings.reduce((min, item) => Math.min(min, item.depth), headings[0]?.depth || 1)
    : 1
  
  const scrollToHeading = (anchorId: string) => {
    // Set flag to prevent automatic updates during manual scroll
    isManualClickRef.current = true
    userScrolledRef.current = false // Reset user scroll detection
    
    // Immediately set the clicked item as active
    setActiveId(anchorId)
    
    // Scroll to the element with offset
    const element = document.getElementById(anchorId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - 64 // 64px offset for fixed header
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }
  
  if (headings.length === 0) return null
  
  return (
    <div className="space-y-2 max-w-[200px]">
      <h3 className="font-semibold text-gray-900 mb-3 text-xs">Table of Contents</h3>
      <div className="relative space-y-0.5 max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {/* Animated background indicator */}
        {activeIndex >= 0 && indicatorStyle.height > 0 && (
          <div
            className="absolute left-0 w-full bg-blue-50/50 rounded transition-all duration-300 ease-out pointer-events-none z-0"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.height}px`,
              transform: 'translateZ(0)',
            }}
          />
        )}
        
        {/* Animated left border indicator */}
        {activeIndex >= 0 && indicatorStyle.height > 0 && (
          <div
            className="absolute left-0 w-[2px] bg-blue-600 rounded-r-full transition-all duration-300 ease-out pointer-events-none z-10"
            style={{
              top: `${indicatorStyle.top + 4}px`,
              height: `${indicatorStyle.height - 8}px`,
              transform: 'translateZ(0)',
            }}
          />
        )}
        
        <div className="relative z-20">
          {headings.map((heading, index) => (
            <TocItem
              key={`${heading.anchorId}-${heading.index}`}
              item={heading}
              isActive={heading.anchorId === activeId}
              rootDepth={rootDepth}
              onClick={scrollToHeading}
              itemIndex={index}
              setRef={setItemRef(index)}
            />
          ))}
        </div>
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
      className="relative flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
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

const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      
      // Calculate how much of the document has been scrolled
      const scrollableHeight = documentHeight - windowHeight
      const scrollPercentage = scrollableHeight > 0 
        ? Math.min(Math.round((scrollTop / scrollableHeight) * 100), 100)
        : 0
      
      setProgress(scrollPercentage)
    }
    
    // Calculate on mount
    calculateProgress()
    
    // Add scroll listener
    window.addEventListener('scroll', calculateProgress)
    window.addEventListener('resize', calculateProgress)
    
    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])
  
  // Circle parameters - smaller size
  const size = 40
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <div className="flex items-center gap-3">
      {/* SVG Circle Progress */}
      <div className="relative inline-flex items-center justify-center flex-shrink-0">
        <svg 
          width={size} 
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>
      
      {/* Percentage text */}
      <div className="text-sm font-medium text-gray-700">
        {progress}%
      </div>
    </div>
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
      <div className="flex flex-col space-y-2">
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

const AuthorIntroduction: React.FC = () => {
  const category = useCurrentNoteDataSelector((data) => data?.data.category)
  
  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Author/Category Image */}
        <div className="flex-shrink-0">
          {category?.avatar ? (
            <img 
              src={category.avatar} 
              alt={category.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {/* Placeholder avatar */}
              <svg className="w-16 h-16 md:w-20 md:h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Author/Category Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {category?.name || 'About the Author'}
          </h3>
          <p className="text-base text-gray-600 mb-3 leading-relaxed">
            {category?.caption || 'Hi! I\'m a passionate developer and writer sharing my thoughts and experiences. I love exploring new technologies, building creative projects, and documenting my journey.'}
          </p>
          {!category?.caption && (
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              When I'm not coding, you can find me reading, experimenting with new ideas, 
              or contributing to open-source projects. Feel free to connect with me!
            </p>
          )}
          
          {/* Social Links */}
          <div className="flex flex-wrap gap-3">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <span>🔗</span>
              Website
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <span>💼</span>
              GitHub
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <span>🐦</span>
              Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const NoteRightSidebar: React.FC = () => {
  return (
    <div className="sticky top-[90px] min-h-[300px] hidden xl:block">
      <div className="ml-4 space-y-8">
        <TableOfContents />
        <div className="border-t pt-6">
          <ReadingProgress />
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
                  <NoteBanner type="warning" message="This article is private, only visible when logged in" />
                )}
              </div>

              <div className="mt-8">
                <article className="max-w-none [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-[2rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:text-[1.5rem] [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[1.25rem] [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-8 [&_li]:mb-2 [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[0.875rem] [&_pre]:bg-gray-800 [&_pre]:text-gray-50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
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