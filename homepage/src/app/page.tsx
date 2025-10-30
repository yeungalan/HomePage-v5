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
import { ParticlesBackground } from '@/components/ParticlesBackground'

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
  'No one can move on without losing something',
  'I think, therefore I am — René Descartes',
  'Practice is the sole criterion for testing truth — Deng Xiaoping',
  'Everything has two sides — Vladimir Ilyich Lenin',
  'Stay hungry, Stay foolish — Steve Jobs',
  'You know who walks with you when the road gets rough',
  'Til I reach the end, and then I will start again  — Zootopia',
  'In the infinite river of time, life is but a spark that vanishes in an instant',
  'The only impossible journey is the one you never begin — Tony Robbins',
  'Even the darkest night will end and the sun will rise — Les Misérables',
  'Only those who dare to fail greatly can ever achieve greatly — Robert F. Kennedy',
  'I am on my way to you, chasing after your name — Radwimps',
  'We are time fliers Scaling the walls of time, climber Tired of playing hide and seek with time and Always coming just short — Radwimps',
  'When you believe you can, the whole world conspires to help you — The Alchemist',
  'We shall never surrender — Winston Churchill',
  'I have nothing to offer but blood, toil, tears and sweat — Winston Churchill',
  'If what you have done yesterday still looks big to you, you haven\'t done much today — Mikhail Gorbachev',
  'Life is 10% what happens to you and 90% how you react to it — Charles R. Swindoll',
  'Be yourself; everyone else is already taken — Oscar Wilde',
  'The best time to plant a tree was 20 years ago. The second best time is now',
  'In the middle of difficulty lies opportunity — Albert Einstein',
  'The future belongs to those who believe in the beauty of their dreams — Eleanor Roosevelt',
];

const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));
const [hasChanged, setHasChanged] = useState(false);

const handleRefreshQuote = () => {
  setHasChanged(true);
  setQuoteIndex((prev) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === prev && quotes.length > 1);
    return newIndex;
  });
};

  return (
    <div className="mt-20 min-w-0 max-w-screen overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px]">
      <TwoColumnLayout leftContainerClassName="pr-4 pl-4 mt-[120px] lg:mt-0 lg:h-[15rem] lg:h-1/2">
        <>
          <GiantGreetText/>

          <ul className="center mx-[60px] mt-8 flex flex-wrap gap-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-4">
            {Object.entries({
  github: "yeungalan",
  linkedin: "ho-yeung",
  instagram: "ay.pixels",
  twitter: "yeungbluecat123",
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
            src={"/profilePic.png"}
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
<div className="px-4 sm:px-0">
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
      aria-label="Change a new sentence"
    >
      <Icon icon="mingcute:refresh-1-line" className="text-xs" />
    </button>
  </div>
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
      <ParticlesBackground />
      <TwoColumnLayout
        // 👇 override only this section to force top alignment
        className="lg:items-start"
        leftContainerClassName="[&>div]:w-full"
        rightContainerClassName="block lg:flex [&>div]:w-full pr-4"
      >
        <ActivityPostList />
        <Timeline />
      </TwoColumnLayout>
    </div>
  )
}

