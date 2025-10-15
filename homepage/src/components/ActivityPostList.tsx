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
      <h2 className="text-2xl font-medium leading-loose">Awards and Certifications</h2>
      <ul className="shiro-timeline mt-4">
        {[
          {
            id: "1",
            title: "Professional Association of Diving Instructors - Open Water",
            created: "2025-07-28 00:00:00",
        },
          {
            id: "1",
            title: "Japanese-Language Proficiency Test - N5",
            created: "2025-01-10 00:00:00",
        }
          ,{
            id: "1",
            title: "AWS Certified Security – Specialty",
            created: "2024-02-27 00:00:00",
        },
        {
            id: "1",
            title: "University of Washington - Annual Dean's List",
            created: "2023-06-13 00:00:00",
        },
    {
            id: "2",
            title: "AWS Certified Solutions Architect – Associate",
            created: "2022-07-27 00:00:00",
        },
          {
            id: "3",
            title: "AWS Certified Cloud Practitioner",
            created: "2022-07-06 00:00:00",
        }].map((post) => {
          return (
            <li key={post.id} className="flex min-w-0 justify-between">
              <Link
                prefetch
                className="min-w-0 shrink truncate"
                href={"#"}
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
