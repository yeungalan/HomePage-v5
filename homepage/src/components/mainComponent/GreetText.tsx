"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'

const softBouncePreset = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}

  const htmlElements = [
    <span className="font-bold text-purple-600">Traveller!</span>,
    <span className="font-bold text-blue-600">Software Engineer!</span>,
    <span className="font-bold text-green-600">Photographer</span>,
    <span className="font-bold text-orange-600">Adventurer!</span>,
  ];

  // <LotteryText elements={htmlElements} className="text-purple-600" />
  

export const GiantGreetTextTemplate = [
      {
        "type": "h1",
        "text": "Hi, I'm ",
        "class": "font-light text-4xl"
      },
    {
        "type": "h1",
        "text": "I'm ",
        "class": "font-light text-4xl"
      },
      {
        "type": "h1",
        "text": "Alan.",
        "class": "font-medium mx-2 text-4xl"
      },
      {
        "type": "br"
      },
      {
        "type": "h1",
        "text": "A NodeJS Full Stack ",
        "class": "font-light text-4xl"
      },
      {
        "type": "code",
        "text": "<Developer />",
        "class": "font-medium mx-2 text-3xl rounded p-1 bg-gray-200 dark:bg-gray-800/0 hover:dark:bg-gray-800/100 bg-opacity-0 hover:bg-opacity-100 transition-background duration-200"
      },
      {
        "type": "span",
        "class": "inline-block w-[1px] h-8 -bottom-2 relative bg-gray-800/80 dark:bg-gray-200/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:animation-blink"
      }
    ];

  const titleAnimateD =
    GiantGreetTextTemplate.reduce((acc, cur) => {
      return acc + (cur.text?.length || 0)
    }, 0) * 50;

export default function GiantGreetText() {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) return <div>Loading...</div>

    return (
        <>
          <motion.div
            className="group relative text-center leading-[4] lg:text-left [&_*]:inline-block"
            initial={{ opacity: 0.0001, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={softBouncePreset}
          >
            {GiantGreetTextTemplate.map((t, i) => {
              const { type } = t
              const prevAllTextLength = GiantGreetTextTemplate
                .slice(0, i)
                .reduce((acc, cur) => {
                  return acc + (cur.text?.length || 0)
                }, 0)
              return createElement(
                type,
                { key: i, className: t.class },
                t.text && (
                  <TextUpTransitionView
                    initialDelay={prevAllTextLength * 0.05}
                    eachDelay={0.05}
                  >
                    {t.text}
                  </TextUpTransitionView>
                ),
              )
            })}
          </motion.div>
                    <BottomToUpTransitionView
            delay={titleAnimateD + 500}
            transition={softBouncePreset}
            className="my-3 text-center lg:text-left"
          >
            <span className="opacity-80">A random developer</span>
          </BottomToUpTransitionView>
          </>
    )
}