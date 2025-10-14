import type { Transition } from 'motion/react'

export const microReboundPreset: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
}

export const softBouncePreset: Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
}