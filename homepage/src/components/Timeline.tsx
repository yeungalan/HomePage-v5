'use client'

import clsx from 'clsx'
import { m, motion } from 'motion/react'
import { useMemo } from 'react'

import { ScrollArea } from '@/components/ScrollArea'
import { softBouncePreset } from '@/constants/spring'

import { ActivityCard } from '@/components/ActivityCard'
import { IcTwotoneSignpost } from './icons/menu-collection'

import "@/styles/style.css";

interface ActivityType {
    created: string;
    id: string;
    nid?: number;
    slug?: string;
    title: string;
    bizType?: string;
}

// Dummy data
const data = {
  posts: [
    {
      id: '1',
      nid: 101,
      slug: 'my-first-blog-post',
      title: 'Getting Started with Next.js 14',
      created: '2025-10-12T10:30:00Z'
    },
    {
      id: '2',
      nid: 102,
      slug: 'typescript-tips',
      title: 'Advanced TypeScript Tips and Tricks',
      created: '2025-10-10T15:20:00Z'
    },
    {
      id: '3',
      nid: 103,
      slug: 'react-patterns',
      title: 'Modern React Patterns in 2025',
      created: '2025-10-08T09:15:00Z'
    }
  ],
  notes: [
    {
      id: '4',
      nid: 201,
      title: 'Quick thought about design systems',
      created: '2025-10-11T14:45:00Z'
    },
    {
      id: '5',
      nid: 202,
      title: 'Coffee and code - a perfect combination',
      created: '2025-10-09T08:30:00Z'
    }
  ],
  projects: [
    {
      id: '6',
      slug: 'portfolio-redesign',
      title: 'Portfolio Website Redesign',
      created: '2025-10-13T11:00:00Z'
    },
    {
      id: '7',
      slug: 'open-source-library',
      title: 'Released new open source library',
      created: '2025-10-07T16:40:00Z'
    }
  ]
}

const isLoading = false

export const Timeline = () => {
  const flatData = useMemo(() => {
    return [...Object.entries(data || {})]
      .flatMap(([type, items]) => {
        if (!Array.isArray(items)) return []
        return items.map((item: any) => {
          return { ...item, bizType: type }
        })
      })
      .sort((a, b) => {
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      }) as ActivityType[]
    // .slice(0, 6) as ReactActivityType[]
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0.0001, y: 50 }}
      transition={softBouncePreset}
      className="mt-8 w-full text-lg lg:mt-0"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.h2 className="mb-8 text-2xl font-medium leading-loose lg:ml-14">
        最近发生的事
      </motion.h2>

      {isLoading ? (
        <div className="relative h-[400px] max-h-[80vh]">
          <ul className="shiro-timeline mt-4 flex animate-pulse flex-col pb-4 pl-2 text-slate-200 dark:!text-neutral-700">
            {new Array(6).fill(null).map((_, i) => {
              return (
                <li key={i} className="flex w-full items-center gap-2">
                  <div
                    className={clsx(
                      IcTwotoneSignpost,
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
        <ScrollArea rootClassName="h-[400px] relative max-h-[80vh]">
          <ul className="shiro-timeline mt-4 flex flex-col pb-8 pl-2">
            {flatData.map((activity) => {
              return (
                <li
                  key={`${activity.bizType}-${activity.id}-${activity.created}`}
                  className="flex min-w-0 justify-between"
                >
                  <ActivityCard />
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      )}
    </motion.div>
  )
}