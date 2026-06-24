'use client'

import type { FC } from 'react'
import { memo, useState } from 'react'
import { motion } from 'motion/react'
import { Avatar } from '@/components/Avatar'
import { BottomToUpTransitionView } from '@/components/BottomToUpTransitionView'
import type { LinkEntry } from '@/data/friends'

const HoverBackground = memo(() => (
  <motion.span
    layoutId="bg"
    className="absolute -inset-2 z-[-1] rounded-md bg-slate-200/80 dark:bg-neutral-600/80"
    initial={{ opacity: 0.8, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8, transition: { delay: 0.2 } }}
  />
))
HoverBackground.displayName = 'HoverBackground'

const LinkCard: FC<{ entry: LinkEntry }> = ({ entry }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      layoutId={entry.id}
      href={entry.url}
      target="_blank"
      role="link"
      aria-label={`Go to ${entry.name}'s website`}
      className="relative flex flex-col items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      rel="noreferrer"
    >
      {hovered && <HoverBackground />}
      <Avatar
        color=""
        imageUrl={entry.avatar}
        lazy
        radius={8}
        text={entry.name[0]}
        alt={`Avatar of ${entry.name}`}
        size={64}
        className="ring-2 ring-gray-400/30 dark:ring-zinc-50"
      />
      <span className="flex h-full flex-col items-center justify-center space-y-2 py-3">
        <span className="text-lg font-medium dark:text-gray-100">{entry.name}</span>
        <span className="line-clamp-2 text-balance break-all text-center text-sm opacity-80 dark:text-gray-300">
          {entry.description}
        </span>
      </span>
    </motion.a>
  )
}

export const LinkCardGrid: FC<{ entries: LinkEntry[] }> = ({ entries }) => (
  <section className="grid grid-cols-2 gap-6 md:grid-cols-3 2xl:grid-cols-3">
    {entries.map((entry) => (
      <BottomToUpTransitionView key={entry.id} duration={50}>
        <LinkCard entry={entry} />
      </BottomToUpTransitionView>
    ))}
  </section>
)
