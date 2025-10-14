import type { Transition } from 'motion/react'

export const microReboundPreset: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
}