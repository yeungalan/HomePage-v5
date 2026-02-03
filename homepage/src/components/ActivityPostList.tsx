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
      className="mt-8 flex flex-col lg:mt-0 pl-4 w-full"
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-medium leading-loose">Awards and Certifications</h2>
      <ul className="shiro-timeline mt-4">
        {[
          {
            id: "1",
            title: "Scrum.org Professional Scrum Master I",
            created: "2026-01-29 00:00:00",
        },
          {
            id: "2",
            title: "Professional Association of Diving Instructors - Open Water",
            created: "2025-07-28 00:00:00",
        },
          {
            id: "3",
            title: "Japanese-Language Proficiency Test - N5",
            created: "2025-01-10 00:00:00",
        }
          ,{
            id: "4",
            title: "AWS Certified Security – Specialty",
            created: "2024-02-27 00:00:00",
        },
        {
            id: "5",
            title: "University of Washington - Annual Dean's List",
            created: "2023-06-13 00:00:00",
        },
    {
            id: "6",
            title: "AWS Certified Solutions Architect – Associate",
            created: "2022-07-27 00:00:00",
        },
          {
            id: "7",
            title: "AWS Certified Cloud Practitioner",
            created: "2022-07-06 00:00:00",
        }].map((post) => {
          return (
            <li key={post.id} className="flex min-w-0 justify-between">
              <Link
                prefetch
                className="min-w-0 shrink truncate dark:text-white"
                href={"#"}
              >
                {post.title}
              </Link>

              <span className="ml-2 shrink-0 self-end text-xs opacity-70 dark:text-white">
                <RelativeTime
                  date={post.created}
                  displayAbsoluteTimeAfterDay={180}
                />
              </span>
            </li>
          )
        })}
      </ul>

    </motion.section>
  )
}