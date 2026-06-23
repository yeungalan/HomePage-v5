'use client'

import { microReboundPreset } from "@/constants/spring"
import { motion } from "motion/react"
import { createElement } from "react"
import Link from "next/link"
import { FOOTER_LINKS } from "@/data/navigation"
import { BRAND_COLORS } from "@/constants/colors"
import { ANIMATION_DELAYS, calculateStaggerDelay } from "@/constants/timing"
import { useTranslation } from "@/i18n"

export const Footer = () => {
  const t = useTranslation()
  return (
    <>
      <div className="center mt-10 mb-20 flex flex-col">
        <div className="my-5 text-2xl font-medium text-black dark:text-white">{t('footer.quickLinksTitle')}</div>
        <div className="mb-15 opacity-90">{t('footer.quickLinksSubtitle')}</div>
        <ul className="flex flex-col flex-wrap gap-2 gap-y-8 opacity-80 lg:flex-row">
          {FOOTER_LINKS.map((item, index) => {
            return (
              <motion.li
                initial={{ opacity: 0.0001, y: 10 }}
                viewport={{ once: true }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    stiffness: 641,
                    damping: 23,
                    mass: 3.9,
                    type: 'spring',
                    delay: calculateStaggerDelay(index, ANIMATION_DELAYS.STAGGER_SMALL),
                  },
                }}
                transition={{
                  delay: ANIMATION_DELAYS.MICRO,
                }}
                whileHover={{
                  y: -10,
                  transition: {
                    ...microReboundPreset,
                    delay: ANIMATION_DELAYS.MICRO,
                  },
                }}
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={item.path}
                  className="flex items-center gap-4 text-neutral-800 duration-200 dark:text-neutral-200"
                  style={{
                    '--hover-color': BRAND_COLORS.primary,
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = BRAND_COLORS.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = ''
                  }}
                >
                  {createElement(item.icon, { className: 'w-6 h-6' })}
                  <span>{item.titleKey ? t(item.titleKey) : item.title}</span>
                </Link>

                {index !== FOOTER_LINKS.length - 1 && (
                  <span className="mx-4 hidden select-none lg:inline"> · </span>
                )}
              </motion.li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
