'use client'

import type { FC } from 'react'
import { memo, useState } from 'react'

import { Avatar } from '@/components/Avatar'
import { BottomToUpTransitionView } from '@/components/BottomToUpTransitionView'
import { useTranslation } from '@/i18n'
import { motion } from 'motion/react'

// Fake data array
const PROJECT_DATA = [
  {
    id: '1',
    name: 'Photo',
    url: 'https://photos.alanyeung.co',
    avatar: '',
    description: 'My own photo gallery',
  },
  {
    id: '2',
    name: 's01 arozos',
    url: 'https://s01.aroz.alanyeung.co',
    avatar: '',
    description: 's01',
  },
  {
    id: '3',
    name: 's02 arozos',
    url: 'https://s02.aroz.alanyeung.co',
    avatar: '',
    description: 's02',
  },
  {
    id: '4',
    name: 's03 arozos',
    url: 'https://s03.aroz.alanyeung.co',
    avatar: '',
    description: 's03',
  },
  {
    id: '5',
    name: 'Gitlab',
    url: 'https://gitlab.alanyeung.co',
    avatar: '',
    description: 'GItlab',
  },
  {
    id: '6',
    name: 'Jenkins',
    url: 'https://jenkins.alanyeung.co',
    avatar: '',
    description: 'Jenkins',
  },
  {
    id: '7',
    name: 'HKWTC Git',
    url: 'https://git.hkwtc.org',
    avatar: '',
    description: 'GIT HKWTC',
  }
]

export default function Page() {
  const t = useTranslation()
  return (
    <div className={"pt-5"}>
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('projects.title')}</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('projects.subtitle')}</h3>
      </header>

      <main className="mt-10 flex w-full flex-col">
        <FriendSection data={PROJECT_DATA} />
      </main>
    </div>
  )
}

type FriendSectionProps = {
  data: typeof PROJECT_DATA
}

const FriendSection: FC<FriendSectionProps> = ({ data }) => {
  return (
    <section className="grid grid-cols-2 gap-6 md:grid-cols-3 2xl:grid-cols-3">
      {data.map((link) => {
        return (
          <BottomToUpTransitionView key={link.id} duration={50}>
            <Card link={link} />
          </BottomToUpTransitionView>
        )
      })}
    </section>
  )
}

const LayoutBg = memo(() => {
  return (
    <motion.span
      layoutId="bg"
      className="absolute -inset-2 z-[-1] rounded-md bg-slate-200/80 dark:bg-neutral-600/80"
      initial={{ opacity: 0.8, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { delay: 0.2 } }}
    />
  )
})
LayoutBg.displayName = 'LayoutBg'

const Card: FC<{ link: typeof PROJECT_DATA[0] }> = ({ link }) => {
  const [enter, setEnter] = useState(false)

  return (
    <motion.a
      layoutId={link.id}
      href={link.url}
      target="_blank"
      role="link"
      aria-label={`Go to ${link.name}'s website`}
      className="relative flex flex-col items-center justify-center"
      onMouseEnter={() => setEnter(true)}
      onMouseLeave={() => setEnter(false)}
      rel="noreferrer"
    >
      {enter && <LayoutBg />}

      <Avatar
        color={""}
        imageUrl={link.avatar}
        lazy
        radius={8}
        text={link.name[0]}
        alt={`Avatar of ${link.name}`}
        size={64}
        className="ring-2 ring-gray-400/30 dark:ring-zinc-50"
      />
      <span className="flex h-full flex-col items-center justify-center space-y-2 py-3">
        <span className="text-lg font-medium dark:text-gray-100">{link.name}</span>
        <span className="line-clamp-2 text-balance break-all text-center text-sm opacity-80 dark:text-gray-300">
          {link.description}
        </span>
      </span>
    </motion.a>
  )
}