"use client"

import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { TextUpTransitionView } from "@/components/TextUpTransitionView";
import { LotteryText } from "@/components/LotteryText";
import { useTranslation } from "@/i18n";
import { motion } from 'motion/react'
import React, { createElement, useState, useEffect } from 'react'

const softBouncePreset = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}

const htmlElements = [
  <span key="traveller" className="font-bold text-purple-600 dark:text-cyan-400">Traveller</span>,
  <span key="engineer" className="font-medium mx-2 text-3xl rounded p-1 bg-gray-200 dark:bg-gray-400 hover:bg-gray-300 hover:dark:bg-gray-700 transition-colors duration-200">
    &lt;Software Engineer&nbsp;/&gt;<span className="inline-block w-0.5 h-[0.9em] bg-current ml-1 align-middle animate-[blink_1s_ease-in-out_infinite]"></span>
  </span>,
  <span key="photographer" className="font-bold text-green-600 dark:text-teal-400">Photographer</span>,
  <span key="adventurer" className="font-bold text-orange-600 dark:text-blue-400">Adventurer</span>,
  <span key="security" className="font-bold text-blue-600 dark:text-indigo-400">Security Researcher</span>,
];

const greetings = {
  'zh-TW': '嗨，',
  'ja-JP': 'こんにちは、',
  'en-US': 'Hi, ',
  'fr-FR': 'Bonjour, ',
};

const getRandomGreeting = () => {
  const languages = Object.keys(greetings) as Array<keyof typeof greetings>;
  const randomLang = languages[Math.floor(Math.random() * languages.length)];
  return greetings[randomLang];
};

interface GreetTemplate {
  type: string;
  text?: string;
  class?: string;
  props?: {
    elements: React.ReactNode[];
    className?: string;
  };
}

export const GiantGreetTextTemplate: GreetTemplate[] = [
  {
    "type": "h1",
    "text": getRandomGreeting(),
    "class": "font-light text-4xl dark:text-white"
  },
    {
    "type": "h1",
    "text": "This ",
    "class": "font-light text-4xl dark:text-white"
  },
  {
    "type": "h1",
    "text": "is",
    "class": "font-light text-4xl dark:text-white"
  },
  {
    "type": "h1",
    "text": "Alan.",
    "class": "font-medium mx-2 text-4xl dark:text-white"
  },
  {
    "type": "br"
  },
  {
    "type": "h1",
    "text": "I'm a ",
    "class": "font-light text-4xl dark:text-white",
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
  const [, setMounted] = useState(false)
  const t = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  //if (!mounted) return <FullPageLoading/>

  return (
    <div className="px-4 sm:px-6 lg:px-0">
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
              <span key={i} className="inline-block min-w-0 w-auto">
                {createElement(
                  LotteryText,
                  { 
                    initialDelay: prevAllTextLength * 0.05,
                    ...t.props!
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
        className="my-3 text-center lg:text-left dark:text-white"
      >
        <span className="opacity-80">{t('hero.tagline')}</span>
      </BottomToUpTransitionView>
    </div>
  )
}