'use client'

import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import { FullPageLoading } from './Loading';

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
const parseMarkdownWithMetadata = (content: string): { metadata: AutomateField; markdown: string; title: string } => {
  // More flexible regex that handles different line endings and spacing
  const automateFieldRegex = /###\s*AUTOMATE\s+FIELD[\s\S]*?###\s*AUTOMATE\s+FIELD\s+END/i
  const match = content.match(automateFieldRegex)
  
  const metadata: AutomateField = {}
  let markdown = content
  
  if (match) {
    const metadataBlock = match[0]
    // Extract just the content between the markers
    const innerContent = metadataBlock.replace(/###\s*AUTOMATE\s+FIELD/gi, '').replace(/###\s*AUTOMATE\s+FIELD\s+END/gi, '')
    const lines = innerContent.split(/\r?\n/).filter(line => line.trim())
    
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
    
    // Remove the entire metadata block from the markdown (including surrounding whitespace)
    markdown = content.replace(automateFieldRegex, '').trim()
  }
  
  // Extract title from first h1 heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : 'Untitled'
  
  return { metadata, markdown, title }
}

const { metadata, markdown, title } = parseMarkdownWithMetadata("")

const mockNoteData: NoteWrappedPayload = {
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

// Simple markdown renderer with heading IDs - FIXED VERSION

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const h1CountRef = useRef(0);

  useEffect(() => {
    // Reset counter when content changes
    h1CountRef.current = 0;
  }, [content]);

  return (
    <div
      className="
        dark:text-white
        dark:bg-black
        prose prose-neutral dark:prose-invert
        prose-h1:mt-8 prose-h1:mb-4 prose-h1:font-semibold prose-h1:text-3xl
        prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-semibold prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-semibold prose-h3:text-xl
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:break-words
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:max-w-full
        max-w-full
        [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:break-words
        [&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap [&_pre_code]:word-break-break-all
        [&_code]:break-words [&_code]:max-w-full
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              content: {
                type: "element",
                tagName: "a",
                properties: {
                  className: [
                    "text-gray-400",
                    "hover:text-blue-500",
                    "ml-1",
                    "no-underline",
                  ],
                  ariaHidden: "true",
                },
                children: [{ type: "text", value: "#" }],
              },
            },
          ],
        ]}
        components={{
          h1: ({ node, children, ...props }) => {
            h1CountRef.current += 1;
            const shouldHide = h1CountRef.current === 1;
            
            return (
              <h1 
                {...props}
                style={shouldHide ? { display: 'none' } : undefined}
              >
                {children}
              </h1>
            );
          },
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative max-w-full overflow-x-auto">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="max-w-full !bg-gray-900 !my-4"
                  wrapLines={true}
                  wrapLongLines={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} break-words max-w-full`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => (
            <pre className="max-w-full overflow-x-auto my-4">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Banner Component
const NoteBanner: React.FC<{ type: 'warning' | 'info'; message: string }> = ({ type, message }) => {
  return (
    <div className={clsx(
      'mt-4 p-4 rounded-lg border',
      type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'
    )}>
      {message}
    </div>
  )
}

// Paper container with shadow
const PaperWithMainContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-w-0">
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg px-6 py-8 md:px-12 md:py-12">
        {children}
      </div>
    </div>
  )
}

// Note Title
const NoteTitle: React.FC = () => {
  const title = useCurrentNoteDataSelector((data) => data?.data.title || 'Untitled')
  
  return (
    <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
      {title}
    </h1>
  )
}

// Note Date
const NoteHeaderDate: React.FC = () => {
  const created = useCurrentNoteDataSelector((data) => data?.data.created)
  const modified = useCurrentNoteDataSelector((data) => data?.data.modified)
  
  if (!created) return null
  
  return (
    <div className="flex items-center text-gray-600 dark:text-white">
      <MdiClockOutline />
      <span className="ml-1">
        {parseDate(created, 'YYYY-MM-DD')}
      </span>
      {modified && modified !== created && (
        <FloatPopover TriggerComponent={() => (
          <span className="ml-2 text-gray-500">(edited)</span>
        )}>
          Last edited: {parseDate(modified, 'YYYY-MM-DD HH:mm')}
        </FloatPopover>
      )}
    </div>
  )
}

// Note Meta Bar (topic, tags)
const NoteMetaBar: React.FC = () => {
  const topic = useCurrentNoteDataSelector((data) => data?.data.topic)
  
  if (!topic) return null
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
        {topic.name}
      </span>
      {topic.tags?.map((tag, idx) => (
        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          #{tag}
        </span>
      ))}
    </div>
  )
}

// Note Markdown Content
const NoteMarkdown: React.FC = () => {
  const text = useCurrentNoteDataSelector((data) => data?.data.text || '')
  
  return <SimpleMarkdown content={text} />
}

// Reading Progress
const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progressValue = (scrolled / documentHeight) * 100
      setProgress(Math.min(progressValue, 100))
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Reading Progress</h3>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">{Math.round(progress)}% complete</p>
    </div>
  )
}

// Table of Contents
const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])
  const [activeId, setActiveId] = useState<string>('')
  
  useEffect(() => {
    // Extract headings from the document
    const articleElement = document.querySelector('article')
    if (!articleElement) return
    
    const headingElements = articleElement.querySelectorAll('h1, h2, h3')
    const headingsData = Array.from(headingElements)
      .filter((heading) => heading.id) // Only include headings with IDs
      .map((heading) => ({
        id: heading.id,
        text: heading.textContent?.replace('#', '').trim() || '',
        level: parseInt(heading.tagName.substring(1))
      }))
    
    setHeadings(headingsData)
    
    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )
    
    headingElements.forEach((heading) => observer.observe(heading))
    
    return () => observer.disconnect()
  }, [])
  
  if (headings.length === 0) return null
  
  return (
    <nav className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Table of Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={clsx(
                'block hover:text-blue-500 transition-colors',
                activeId === heading.id ? 'text-blue-500 font-medium' : 'text-gray-600'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Left Sidebar
const NoteLeftSidebar: React.FC = () => {
  return (
    <div className="sticky top-[90px] min-h-[300px] hidden xl:block">
      <div className="mr-4 space-y-8">
        <NoteActions />
      </div>
    </div>
  )
}

// Action Button Component
const ActionButton: React.FC<{
  icon: string
  label: string
  onClick: () => void
  count?: number
}> = ({ icon, label, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-sm text-gray-500">{count}</span>
      )}
    </button>
  )
}

// Note Actions (Like, Share, etc.)
const NoteActions: React.FC = () => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(42)
  
  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Check out this note!',
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
            {category?.name || 'About the Author'}
          </h3>
          <p className="text-base text-gray-600 mb-3 leading-relaxed dark:text-white">
            {category?.caption || 'Hi! I\'m a passionate developer and writer sharing my thoughts and experiences. I love exploring new technologies, building creative projects, and documenting my journey.'}
          </p>
          {!category?.caption && (
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              When I'm not coding, you can find me reading, experimenting with new ideas, 
              or contributing to open-source projects. Feel free to connect with me!
            </p>
          )}
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
const Post: React.FC<{ markdownContent?: string }> = ({ markdownContent }) => {
  // Use provided markdown or fall back to mock data
  const content = markdownContent || ""
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
      category: metadata.category ? {
        name: metadata.category,
        caption: metadata.categoryCaption,
        avatar: metadata.categoryAvatar
      } : undefined
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
          category: metadata.category ? {
            name: metadata.category,
            caption: metadata.categoryCaption,
            avatar: metadata.categoryAvatar
          } : undefined
        }
      }
      setCurrentNote(updatedNoteData)
      setCurrentNid(updatedNoteData.data.nid)
      setContentKey(prev => prev + 1) // Force re-render of child components
    }
  }, [markdownContent])

  // Show loading state if no markdown content yet
  if (!markdownContent && !markdown) {
    return (
      <FullPageLoading/>
    )
  }

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
            <div key={`left-${contentKey}`} className="relative hidden min-w-0 xl:block">
              <NoteLeftSidebar />
            </div>

            {/* Main Content */}
            <PaperWithMainContainer>
              <div>
                <NoteTitle />
                <span className="flex flex-wrap items-center text-sm text-gray-600 dark:text-white">
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
                <article className="max-w-none [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-[2rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:text-[1.5rem] [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-[1.25rem] [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-8 [&_li]:mb-2 [&_code]:bg-gray-100 [&_code]:text-black [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[0.875rem] [&_code]:break-words [&_pre]:bg-[#fafafa] [&_pre]:text-black [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:max-w-full [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:break-words">
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
            <div key={`right-${contentKey}`} className="relative hidden min-w-0 xl:block">
              <NoteRightSidebar />
            </div>
          </div>
        </CurrentNoteDataContext.Provider>
      </CurrentNoteNidContext.Provider>
    </div>
  )
}

export default Post;