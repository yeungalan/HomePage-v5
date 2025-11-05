import React, { useState, useEffect, useRef } from 'react'
import { TocItem as TocItemType } from '../types'
import { TocItem } from './TocItem'

export const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<TocItemType[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number
    height: number
  }>({ top: 0, height: 0 })
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
    const headingElements = document.querySelectorAll(
      'h1[data-markdown-heading], h2[data-markdown-heading], h3[data-markdown-heading], h4[data-markdown-heading], h5[data-markdown-heading], h6[data-markdown-heading]'
    )

    const tocItems: TocItemType[] = Array.from(headingElements).map((el, idx) => {
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
      const headingPositions = headings
        .map(({ anchorId }) => {
          const element = document.getElementById(anchorId)
          if (!element) return null

          const rect = element.getBoundingClientRect()
          const absoluteTop = rect.top + scrollTop - 64 // Account for 64px header offset
          // Calculate what percentage of the page this heading is at
          const headingPercentage =
            docHeight > 0
              ? (absoluteTop / (docHeight + window.innerHeight)) * 100
              : 0

          return {
            id: anchorId,
            percentage: headingPercentage
          }
        })
        .filter((h): h is { id: string; percentage: number } => h !== null)

      // Find the active heading - the last one whose position is <= current scroll percentage
      let newActiveId: string | null = headingPositions[0]?.id || null

      for (const heading of headingPositions) {
        if (scrollPercentage >= heading.percentage - 5) {
          // 5% threshold for better UX
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

  const rootDepth =
    headings.length > 0
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
      <h3 className="font-semibold text-gray-900 mb-3 text-xs dark:text-white">
        Table of Contents
      </h3>
      <div className="relative space-y-0.5 max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {/* Animated background indicator */}
        {activeIndex >= 0 && indicatorStyle.height > 0 && (
          <div
            className="absolute left-0 w-full bg-blue-50/50 rounded transition-all duration-300 ease-out pointer-events-none z-0"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.height}px`,
              transform: 'translateZ(0)'
            }}
          />
        )}

        {/* Animated left border indicator */}
        {activeIndex >= 0 && indicatorStyle.height > 0 && (
          <div
            className="absolute left-0 w-[2px] bg-blue-600 dark:bg-gray-400 rounded-r-full transition-all duration-300 ease-out pointer-events-none z-10"
            style={{
              top: `${indicatorStyle.top + 4}px`,
              height: `${indicatorStyle.height - 8}px`,
              transform: 'translateZ(0)'
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
