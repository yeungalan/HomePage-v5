'use client'

import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useMemo, useRef, useEffect, useState } from 'react'
import * as ScrollArea from '@radix-ui/react-scroll-area'

import { ActivityCard } from './ActivityCard'
import { softBouncePreset } from '@/constants/spring'
import { EXPERIENCES, sortExperiencesByDate } from '@/data/experiences'
import { BRAND_COLORS } from '@/constants/colors'
import { ANIMATION_DELAYS, calculateStaggerDelay } from '@/constants/timing'
import { COMPONENT_HEIGHTS, Z_INDEX } from '@/constants/spacing'

const isLoading = false

export default function Timeline() {
  const leftSideRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [leftSideHeight, setLeftSideHeight] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [canScroll, setCanScroll] = useState(false)

  const flatData = useMemo(() => sortExperiencesByDate(EXPERIENCES), [])

  useEffect(() => {
    const updateHeight = () => {
      if (leftSideRef.current) {
        const awardsSection = document.querySelector('.shiro-timeline')?.parentElement
        if (awardsSection) {
          setLeftSideHeight(awardsSection.clientHeight)
        }
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    // Use MutationObserver to detect when the left side content loads
    const observer = new MutationObserver(updateHeight)
    if (leftSideRef.current) {
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
    }
  }, [])

  // Handle scroll detection for gradient effects
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollElement) return

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = scrollElement.clientHeight

      const atTop = scrollTop <= 1
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      const scrollable = scrollHeight > clientHeight

      setIsAtTop(atTop)
      setIsAtBottom(atBottom)
      setCanScroll(scrollable)
    }

    // Attach listeners
    scrollElement.addEventListener('scroll', handleScroll)

    // Immediately check scroll state after mount
    handleScroll()

    // Check if content changes dynamically
    const resizeObserver = new ResizeObserver(() => {
      handleScroll() // Re-run logic when content height changes
    })
    resizeObserver.observe(scrollElement)

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [flatData])


  return (
    <motion.div
      ref={leftSideRef}
      initial={{ opacity: 0.0001, y: 50 }}
      transition={softBouncePreset}
      className="pl-4 flex flex-col w-full text-lg mt-8 lg:mt-0 max-w-3xl"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.h2 className="text-2xl font-medium leading-loose">
        Experience
      </motion.h2>

      {isLoading ? (
        <div className="relative h-[400px] max-h-[80vh]">
          <ul className="flex animate-pulse flex-col pb-4 pl-2 text-slate-200 dark:text-neutral-700">
            {new Array(6).fill(null).map((_, i) => {
              return (
                <li key={i} className="flex w-full items-center gap-2">
                  <div
                    className={clsx(
                      'rounded-full border shrink-0 text-base center inline-flex size-[32px]',
                      'border-0 bg-current text-inherit',
                    )}
                  />
                  <div className="mb-4 box-content h-16 w-full rounded-md bg-current" />
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <ScrollArea.Root ref={scrollAreaRef} className="relative overflow-hidden" style={{ height: leftSideHeight > 0 ? `${leftSideHeight}px` : 'auto' }}>
          {canScroll && !isAtTop && (
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none
                        bg-[linear-gradient(to_bottom,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_100%)]
                        dark:bg-[linear-gradient(to_bottom,rgba(24,24,27,0.9)_0%,rgba(24,24,27,0)_100%)]"
              style={{ zIndex: Z_INDEX.NODES, height: `${COMPONENT_HEIGHTS.GRADIENT_HEIGHT}px` }}
            />
          )}

          {canScroll && !isAtBottom && (
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none
                        bg-[linear-gradient(to_top,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_100%)]
                        dark:bg-[linear-gradient(to_top,rgba(24,24,27,0.9)_0%,rgba(24,24,27,0)_100%)]"
              style={{ zIndex: Z_INDEX.NODES, height: `${COMPONENT_HEIGHTS.GRADIENT_HEIGHT}px` }}
            />
          )}

          <ScrollArea.Viewport className="w-full h-full">
            <div className="relative">
              {/* Timeline line - solid through all items */}
              <div
                className="absolute left-[15px] top-[16px] w-[2px]"
                style={{
                  height: 'calc(100% - 161px)',
                  background: BRAND_COLORS.primary,
                }}
              />
              {/* Dashed line below last item */}
              <div
                className="absolute left-[15px] w-[2px]"
                style={{
                  top: 'calc(100% - 145px)',
                  height: '100px',
                  backgroundImage: `repeating-linear-gradient(to bottom, ${BRAND_COLORS.primary} 0px, ${BRAND_COLORS.primary} 4px, transparent 4px, transparent 8px)`,
                }}
              />


              <ul className="flex flex-col relative">
                {flatData.map((activity, index) => {
                  return (
                    <motion.li
                      key={`${activity.type}-${activity.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: calculateStaggerDelay(index, ANIMATION_DELAYS.STAGGER_MEDIUM), ...softBouncePreset }}
                      viewport={{ once: true }}
                      className="flex min-w-0 relative"
                    >
                      <ActivityCard
                        type={activity.type}
                        title={activity.title}
                        organization={activity.organization}
                        startDate={activity.startDate}
                        endDate={activity.endDate}
                        icon={activity.icon}
                        isOngoing={activity.isOngoing}
                      />
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-transparent transition-colors duration-150 ease-out hover:bg-gray-100 dark:hover:bg-gray-800 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-400 dark:bg-gray-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-transparent" />
        </ScrollArea.Root>
      )}
    </motion.div>
  )
}
