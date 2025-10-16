'use client'

import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useMemo, useRef, useEffect, useState } from 'react'
import * as ScrollArea from '@radix-ui/react-scroll-area'

import { ActivityCard } from './ActivityCard'

const softBouncePreset = {
  type: "spring",
  stiffness: 100,
  damping: 15
}

interface Experience {
  id: string
  type: 'work' | 'education' | 'milestone'
  title: string
  organization?: string
  startDate: string
  endDate: string
  icon: string
  isOngoing?: boolean
}

const experiences: Experience[] = [
  {
    id: '1',
    type: 'work',
    title: 'Software Engineer I',
    organization: 'AWS',
    startDate: 'Sept 2024',
    endDate: 'Present',
    icon: 'mdi:aws',
    isOngoing: true
  },
  {
    id: '2',
    type: 'work',
    title: 'Cloud Engineer I',
    organization: 'AWS',
    startDate: 'Sept 2023',
    endDate: 'Sept 2024',
    icon: 'mdi:aws'
  },
  {
    id: '3',
    type: 'education',
    title: 'Computer Engineering (GPA 3.75/4.00)',
    organization: 'University of Washington',
    startDate: 'June 2021',
    endDate: 'June 2023',
    icon: 'mdi:school'
  },
    {
    id: '4',
    type: 'milestone',
    title: 'Moved to America',
    startDate: '2019',
    endDate: '2019',
    icon: 'mdi:airplane'
  },
  {
    id: '5',
    type: 'work',
    title: 'imuslab',
    startDate: '2018',
    endDate: '2023',
    icon: 'mdi:office-building'
  },
  {
    id: '6',
    type: 'education',
    title: 'Graduated from High School',
    startDate: '2018',
    endDate: '2018',
    icon: 'mdi:school-outline'
  }
]

const isLoading = false

export default function Timeline() {
  const leftSideRef = useRef<HTMLDivElement>(null)
  const [leftSideHeight, setLeftSideHeight] = useState(0)

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

  const flatData = useMemo(() => {
    return [...experiences].sort((a, b) => {
      // Convert date strings to comparable format
      const parseDate = (dateStr: string) => {
        if (dateStr === 'Present') return '9999-12'
        // Handle formats like "Sept 2024", "June 2021", or just "2019"
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'June': '06', 'Jul': '07', 'Aug': '08',
          'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        const parts = dateStr.split(' ')
        if (parts.length === 2) {
          const [month, year] = parts
          return `${year}-${monthMap[month] || '01'}`
        }
        return `${dateStr}-01` // For year-only dates
      }
      
      const dateA = parseDate(a.startDate)
      const dateB = parseDate(b.startDate)
      return dateB.localeCompare(dateA) // Most recent first
    })
  }, [])

  return (
    <motion.div
      ref={leftSideRef}
      initial={{ opacity: 0.0001, y: 50 }}
      transition={softBouncePreset}
      className="flex flex-col gap-4 mt-8 w-full text-lg lg:mt-0 max-w-3xl"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.h2 className="text-2xl font-medium leading-loose">
        Experience
      </motion.h2>

      {isLoading ? (
        <div className="relative h-[400px] max-h-[80vh]">
          <ul className="flex animate-pulse flex-col pb-4 pl-2 text-slate-200 dark:!text-neutral-700">
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
        <ScrollArea.Root className="relative overflow-hidden" style={{ height: leftSideHeight > 0 ? `${leftSideHeight}px` : 'auto' }}>
          <ScrollArea.Viewport className="w-full h-full">
            <div className="relative">
              {/* Timeline line - positioned to go through the center of the icons */}
              <div 
                className="absolute left-[15px] top-[16px] bottom-0 w-[2px] bg-gradient-to-b from-pink-300 via-pink-200 to-pink-100 dark:from-pink-700 dark:via-pink-800 dark:to-pink-900" 
                style={{ height: 'calc(100% - 60px)' }}
              />
              
              <ul className="flex flex-col relative">
                {flatData.map((activity, index) => {
                  return (
                    <motion.li
                      key={`${activity.type}-${activity.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, ...softBouncePreset }}
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