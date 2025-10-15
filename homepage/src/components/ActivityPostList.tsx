'use client'

import { m, motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'

import { RelativeTime } from '@/components/RelativeTime'
import { softBouncePreset } from '@/constants/spring'


export const ActivityPostList = () => {
  return (
    <motion.section
      initial={{ opacity: 0.0001, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={softBouncePreset}
      className="mt-8 flex flex-col gap-4 lg:mt-0"
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-medium leading-loose">最近更新的文稿</h2>
      <ul className="shiro-timeline mt-4">
        {[{
            id: "1",
            title: "234",
            created: "2025-05-01 10:01:01",
        },
    {
            id: "2",
            title: "234",
            created: "2025-05-01 10:01:01",
        }].map((post) => {
          return (
            <li key={post.id} className="flex min-w-0 justify-between">
              <Link
                prefetch
                className="min-w-0 shrink truncate"
                href={"5677"}
              >
                {post.title}
              </Link>

              <span className="ml-2 shrink-0 self-end text-xs opacity-70">
                <RelativeTime
                  date={post.created}
                  displayAbsoluteTimeAfterDay={180}
                />
              </span>
            </li>
          )
        })}
      </ul>

      <Link
        className="flex items-center justify-end opacity-70 duration-200 hover:text-accent"
        href={"!234"}
      >
        <i className="i-mingcute-arrow-right-circle-line" />
        <span className="ml-2">还有更多</span>
      </Link>
    </motion.section>
  )
}
