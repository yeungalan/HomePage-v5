'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

import { RelativeTime } from '@/components/RelativeTime'
import { softBouncePreset } from '@/constants/spring'
import { AWARDS } from '@/data/awards'

export const ActivityPostList = () => {
  return (
    <motion.section
      initial={{ opacity: 0.0001, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={softBouncePreset}
      className="mt-8 flex flex-col lg:mt-0 px-4 w-full"
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-medium leading-loose">Awards and Certifications</h2>
      <ul className="shiro-timeline mt-4">
        {AWARDS.map((post) => (
          <li key={post.id} className="flex min-w-0 justify-between">
            <Link
              prefetch
              className="min-w-0 shrink truncate dark:text-white"
              href={"#"}
            >
              {post.title}
            </Link>
            <span className="ml-2 shrink-0 self-end text-xs opacity-70 dark:text-white">
              <RelativeTime date={post.created} displayAbsoluteTimeAfterDay={180} />
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
