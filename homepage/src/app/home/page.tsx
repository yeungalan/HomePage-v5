'use client'

import { ActivityPostList } from '@/components/ActivityPostList'
import { BottomToUpTransitionView } from '@/components/BottomToUpTransitionView'
import GiantGreetText, { GiantGreetTextTemplate } from '@/components/mainComponent/GreetText'
import { SocialIcon } from '@/components/SocialIcon'
import { TextUpTransitionView } from '@/components/TextUpTransitionView'
import { softBouncePreset } from '@/constants/spring'
import { clsxm } from '@/lib/helper'
import clsx from 'clsx'
import { m, motion } from 'motion/react'
import Image from 'next/image'
import type * as React from 'react'
import { createElement } from 'react'

export default function Home() {
  return (
    <div>
      <Hero />
      <ActivityScreen />
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
    
  return (
    <div className="mt-20 min-w-0 max-w-screen overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px]">
      <TwoColumnLayout leftContainerClassName="mt-[120px] lg:mt-0 lg:h-[15rem] lg:h-1/2">
        <>
          <GiantGreetText/>

          <ul className="center mx-[60px] mt-8 flex flex-wrap gap-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-4">
            {Object.entries([]).map(
              ([type, id]: any, index) => {
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
            src={""}
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
          <small className="text-center">
            当第一颗卫星飞向大气层外，我们便以为自己终有一日会征服宇宙。
          </small>
          <span className="mt-8 animate-bounce">
            <i className="i-mingcute-right-line rotate-90 text-2xl" />
          </span>
        </motion.div>
      </TwoColumnLayout>
    </div>
  )
}

const ActivityScreen = () => {
  return (
    <div className="mt-24">
      <TwoColumnLayout
        rightContainerClassName="block lg:flex [&>div]:w-full pr-4"
        leftContainerClassName="[&>div]:w-full"
      >
        <ActivityPostList />
        <ActivityPostList />
      </TwoColumnLayout>
    </div>
  )
}