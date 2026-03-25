'use client'

import React, { useRef, useEffect, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'

interface SimpleMarkdownProps {
  content: string
}

interface CodeProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

// Helper to strip 'node' prop from react-markdown component props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripNode<T extends Record<string, any>>(props: T & { node?: unknown }) {
  const { node, ...rest } = props
  void node
  return rest
}

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
  const h1CountRef = useRef(0)

  useEffect(() => {
    // Reset counter when content changes
    h1CountRef.current = 0
  }, [content])

  return (
    <div
      className="
        dark:text-white
        dark:bg-zinc-900
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
              behavior: 'append',
              content: {
                type: 'element',
                tagName: 'a',
                properties: {
                  className: [
                    'text-gray-400',
                    'hover:text-blue-500',
                    'ml-1',
                    'no-underline'
                  ]
                },
                children: [{ type: 'text', value: '' }]
              }
            }
          ]
        ]}
        components={{
          h1: (allProps) => {
            const { children, ...props } = stripNode(allProps)
            h1CountRef.current += 1
            const shouldHide = h1CountRef.current <= 2
            console.log(shouldHide + ' ' + children)
            return (
              <h1
                {...props}
                style={shouldHide ? { display: 'none' } : undefined}
                data-markdown-heading="true"
              >
                {children}
              </h1>
            )
          },
          h2(allProps) {
            const props = stripNode(allProps)
            const text = String(props.children)
            return (
              <h2
                {...props}
                id={text.toLowerCase().replace(/\s+/g, '-')}
                data-markdown-heading="true"
              />
            )
          },
          h3(allProps) {
            const props = stripNode(allProps)
            const text = String(props.children)
            return (
              <h3
                {...props}
                id={text.toLowerCase().replace(/\s+/g, '-')}
                data-markdown-heading="true"
              />
            )
          },
          code: (allProps) => {
            const { inline, className, children, ...props } = stripNode(allProps) as CodeProps
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <div className="relative max-w-full overflow-x-auto">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="max-w-full !my-4"
                  wrapLines={true}
                  wrapLongLines={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} break-words max-w-full`} {...props}>
                {children}
              </code>
            )
          },
          pre: (allProps) => {
            const { children, ...props } = stripNode(allProps)
            return (
              <pre className="max-w-full overflow-x-auto my-4" {...props}>{children}</pre>
            )
          },
          ul(allProps) {
            const props = stripNode(allProps)
            return <ul className="list-disc pl-8 my-4 space-y-2" {...props} />
          },
          ol(allProps) {
            const props = stripNode(allProps)
            return <ol className="list-decimal pl-8 my-4 space-y-2" {...props} />
          },
          li(allProps) {
            const props = stripNode(allProps)
            return <li className="mb-2" {...props} />
          },
          iframe(allProps) {
            const { height, className, src, sandbox, ...otherProps } = stripNode(allProps)
            const allowtransparency = !!(allProps as Record<string, unknown>).allowtransparency

            // If height is specified, use it; otherwise use responsive container
            if (height) {
              return (
                <div className={`w-full my-4 ${className || ''}`}>
                  <iframe
                    src={src}
                    height={height}
                    className="w-full rounded-lg"
                    allowFullScreen
                    allowTransparency={allowtransparency}
                    sandbox={sandbox}
                    {...otherProps}
                  />
                </div>
              )
            }

            // Default responsive 16:9 container
            return (
              <div
                className="relative w-full my-4"
                style={{ paddingBottom: '56.25%' }}
              >
                <iframe
                  src={src}
                  className={`absolute top-0 left-0 w-full h-full rounded-lg ${className || ''}`}
                  allowFullScreen
                  allowTransparency={allowtransparency}
                  sandbox={sandbox}
                  {...otherProps}
                />
              </div>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
