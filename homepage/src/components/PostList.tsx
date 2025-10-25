'use client'

import { m, motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'
import { useState, useEffect } from 'react'

import { RelativeTime } from '@/components/RelativeTime'
import { softBouncePreset } from '@/constants/spring'

interface Post {
  id: string
  title: string
  slug: string
  created: string
}

export const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    // Fetch the list of posts from your API route
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0.0001, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={softBouncePreset}
      className="mt-8 flex flex-col lg:mt-0 pl-4 w-full"
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-medium leading-loose">Blog Posts</h2>
      <ul className="shiro-timeline mt-4">
        {posts.map((post) => {
          return (
            <li key={post.id} className="flex min-w-0 justify-between">
              <Link
                prefetch
                className="min-w-0 shrink truncate dark:text-white"
                href={`/posts/${post.slug}`}
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