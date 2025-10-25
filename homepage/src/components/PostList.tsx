'use client'

import { m, motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'
import { useState, useEffect } from 'react'

import { RelativeTime } from '@/components/RelativeTime'
import { softBouncePreset } from '@/constants/spring'
import { FullPageLoading } from './Loading'
import { NormalContainer } from './NormalContainer'

interface Post {
  id: string
  title: string
  slug: string
  created: string
}

export const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setIsLoading(false)
      })
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FullPageLoading />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <NormalContainer>
              <header className="mb-6 sm:mb-8 md:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 dark:text-white">
                  Posts
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
                  Post Links
                </h3>
              </header>
              
              <motion.ul 
                className="shiro-timeline mt-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {posts.map((post, index) => {
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
              </motion.ul>
            </NormalContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}