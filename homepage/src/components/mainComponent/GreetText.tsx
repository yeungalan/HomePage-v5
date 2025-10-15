"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import { LotteryText } from "@/components/LotteryText";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'

const softBouncePreset = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}

const htmlElements = [
  <span className="font-bold text-purple-600">Traveller</span>,
  <span className="font-medium mx-2 text-3xl rounded p-1 bg-gray-200 dark:bg-gray-800/0 hover:dark:bg-gray-800/100 bg-opacity-0 hover:bg-opacity-100 transition-background duration-200">&lt;Software Engineer!&nbsp;/&gt;</span>,
  <span className="font-bold text-green-600">Photographer</span>,
  <span className="font-bold text-orange-600">Adventurer</span>,
];

export const GiantGreetTextTemplate = [
  {
    "type": "h1",
    "text": "Hi, This ",
    "class": "font-light text-4xl"
  },
  {
    "type": "h1",
    "text": "is ",
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
    "text": "I'm a ",
    "class": "font-light text-4xl",
  },
  {
    "type": "LotteryText",
    "props": {
      "elements": htmlElements,
      "className": "font-light text-4xl"
    }
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

  if (!mounted) return <div className="h-32">Loading...</div>

  return (
    <>
      <motion.div
        className="group relative text-center leading-[4] lg:text-left [&_*]:inline-block min-h-[100px]"
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
          
          // Handle LotteryText component
          if (type === 'LotteryText') {
            return (
              <span key={i} className="inline-block min-w-[400px]">
                {createElement(
                  LotteryText,
                  { 
                    initialDelay: prevAllTextLength * 0.05,
                    ...t.props 
                  }
                )}
              </span>
            )
          }
          
          // Handle regular HTML elements
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