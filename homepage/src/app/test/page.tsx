"use client"

import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import { motion } from 'motion/react'
import { createElement, useState, useEffect } from 'react'

const softBouncePreset = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}

export default function Page() {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      setMounted(true)
    }, [])

    const template = [
      {
        "type": "h1",
        "text": "Hi, I'm ",
        "class": "font-light text-4xl"
      },
      {
        "type": "h1",
        "text": "Innei",
        "class": "font-medium mx-2 text-4xl"
      },
      {
        "type": "h1",
        "text": "👋。",
        "class": "font-light text-4xl"
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

    if (!mounted) return <div>Loading...</div>

    return (
        <div className="min-h-screen p-8 bg-green">
          <div>456</div>
          <motion.div
            className="group relative text-center leading-[4] lg:text-left [&_*]:inline-block"
            initial={{ opacity: 0.0001, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={softBouncePreset}
          >
            {template.map((t, i) => {
              const { type } = t
              const prevAllTextLength = template
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
        </div>
    )
}