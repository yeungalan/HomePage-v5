'use client'

import { ActivityPostList } from '@/components/ActivityPostList'
import { BottomToUpTransitionView } from '@/components/BottomToUpTransitionView'
import GiantGreetText, { GiantGreetTextTemplate } from '@/components/mainComponent/GreetText'
import { isSupportIcon, SocialIcon } from '@/components/SocialIcon'
import { TextUpTransitionView } from '@/components/TextUpTransitionView'
import { softBouncePreset } from '@/constants/spring'
import { clsxm } from '@/lib/helper'
import clsx from 'clsx'
import { m, motion } from 'motion/react'
import Image from 'next/image'
import type * as React from 'react'
import { createElement, useState } from 'react'
import { Icon } from '@iconify/react';
import Timeline from '@/components/Timeline'
import { Footer } from '@/components/Footer'
import { RealFooter } from '@/components/FooterLinks'

export default function Home() {
  return (
    <div>
      <Hero />
      <ActivityScreen />
       <Footer/>
       <RealFooter/>
    </div>
  )
}
const TwoColumnLayout = ({
  children,
  leftContainerClassName,
  rightContainerClassName,
  className,
}: {
  children:
    | [React.ReactNode, React.ReactNode]
    | [React.ReactNode, React.ReactNode, React.ReactNode]

  leftContainerClassName?: string
  rightContainerClassName?: string
  className?: string
}) => {
  return (
    <div
      className={clsxm(
        'relative mx-auto block size-full min-w-0 max-w-[1800px] flex-col flex-wrap items-center lg:flex lg:flex-row',
        className,
      )}
    >
      {children.slice(0, 2).map((child, i) => {
        return (
          <div
            key={i}
            className={clsxm(
              'flex w-full flex-col center lg:h-auto lg:w-1/2',

              i === 0 ? leftContainerClassName : rightContainerClassName,
            )}
          >
            <div className="relative max-w-full lg:max-w-2xl">{child}</div>
          </div>
        )
      })}

      {children[2]}
    </div>
  )
}

const Hero = () => {
  const titleAnimateD =
    GiantGreetTextTemplate.reduce((acc, cur) => {
      return acc + (cur.text?.length || 0)
    }, 0) * 50;
    

const quotes = [
  'When the first satellite flew beyond the atmosphere, we thought we would one day conquer the universe.',
  'We gaze up at the stars, only to find the stars are gazing back at us.',
  'In the infinite river of time, life is but a spark that vanishes in an instant.',
  'The end of technology is not conquest, but understanding and harmony.',
  'The universe owes us no explanation, yet we owe the universe our reverence.',
  'Civilization is like a drifting bottle, seeking echoes in the dark universe.',
  'Every civilization is a lonely singer in the cosmos, singing melodies only they can understand.',
  'Time is the gentlest blade, silently cutting through all existence.',
  'We explore the unknown not to conquer the darkness, but to light more candles.',
  'Before the scale of the universe, both arrogance and humility lose their meaning.',
  'True wisdom lies not in knowing the answers, but in knowing how to ask the right questions.',
  'When we finally understand the universe, perhaps the universe will understand us too.',
];

const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));
const [hasChanged, setHasChanged] = useState(false);

const handleRefreshQuote = () => {
  setHasChanged(true);
  setQuoteIndex((prev) => (prev + 1) % quotes.length);
};

  return (
    <div className="mt-20 min-w-0 max-w-screen overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px]">
      <TwoColumnLayout leftContainerClassName="mt-[120px] lg:mt-0 lg:h-[15rem] lg:h-1/2">
        <>
          <GiantGreetText/>

          <ul className="center mx-[60px] mt-8 flex flex-wrap gap-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-4">
            {Object.entries({
  twitter: "yeungbluecat123",
  github: "yeungalan",
}).map(
              ([type, id]: any, index) => {
                console.log(type, id, index);
                if (!isSupportIcon(type)) return null
                return (
                  <BottomToUpTransitionView
                    key={type}
                    delay={index * 100 + titleAnimateD + 500}
                    className="inline-block"
                    as="li"
                  >
                    <SocialIcon id={id} type={type} />
                  </BottomToUpTransitionView>
                )
              },
            )}
          </ul>
        </>

        <div
          className={clsx('lg:size-[300px]', 'size-[200px]', 'mt-24 lg:mt-0')}
        >
          <Image
            height={300}
            width={300}
            src={"https://avatar.iran.liara.run/public/1"}
            alt="Site Owner Avatar"
            className={clsxm(
              'aspect-square rounded-full border border-slate-200 dark:border-neutral-800',
              'w-full',
            )}
          />
        </div>

<motion.div
  initial={{ opacity: 0.0001, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={softBouncePreset}
  className={clsx(
    'center inset-x-0 bottom-0 mt-12 flex flex-col lg:absolute lg:mt-0',
    'center text-neutral-800/80 dark:text-neutral-200/80',
  )}
>
  <div className="flex items-center gap-3">
    <motion.small
      key={quoteIndex}
      initial={hasChanged ? { opacity: 0, scaleY: 0, scaleX: 1.2 } : { opacity: 1, scaleY: 1, scaleX: 1 }}
      animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
      transition={{
        duration: hasChanged ? 0.4 : 0,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="text-center origin-center"
    >
      {quotes[quoteIndex]}
    </motion.small>
    <button
      onClick={handleRefreshQuote}
      className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
      aria-label="换一句"
    >
      <Icon icon="mingcute:refresh-1-line" className="text-xs" />
    </button>
  </div>
  <span className="mt-8 animate-bounce">
          <Icon icon="mingcute:right-line" className="rotate-90 text-2xl" />

  </span>
</motion.div>

      </TwoColumnLayout>
    </div>
  )
}

const ActivityScreen = () => {
  return (
    <div className="mt-24 px-4 sm:px-6 lg:px-0">
      <TwoColumnLayout
        rightContainerClassName="block lg:flex [&>div]:w-full pr-4"
        leftContainerClassName="[&>div]:w-full"
      >
        <ActivityPostList />
        <Timeline />
      </TwoColumnLayout>
    </div>
  )
}