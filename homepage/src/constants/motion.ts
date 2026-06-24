/**
 * Unified motion/animation constants
 *
 * Spring presets, transition presets, and reusable Framer Motion variants
 * are all defined here so components share a consistent animation vocabulary.
 */

import type { Transition, Variants } from 'motion/react';

// ---------------------------------------------------------------------------
// Spring transition presets
// ---------------------------------------------------------------------------

export const microReboundPreset: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export const microDampingPreset: Transition = {
  type: 'spring',
  damping: 24,
};

export const softBouncePreset: Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
};

const smoothPreset: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0,
};

const snappyPreset: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0.15,
};

const bouncyPreset: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0.3,
};

// ---------------------------------------------------------------------------
// Spring utility class (fluent API)
// ---------------------------------------------------------------------------

class SpringPresets {
  smooth = smoothPreset;
  snappy = snappyPreset;
  bouncy = bouncyPreset;
}

class SpringStatic {
  presets = new SpringPresets();

  smooth(duration = 0.4, extraBounce = 0): Transition {
    return { type: 'spring', duration, bounce: extraBounce };
  }

  snappy(duration = 0.4, extraBounce = 0): Transition {
    return { type: 'spring', duration, bounce: 0.15 + extraBounce };
  }

  bouncy(duration = 0.4, extraBounce = 0): Transition {
    return { type: 'spring', duration, bounce: 0.3 + extraBounce };
  }
}

export const Spring = new SpringStatic();

// ---------------------------------------------------------------------------
// Shared Framer Motion variant maps
// ---------------------------------------------------------------------------

/** Dropdown / popover panel: springs in, tweens out */
export const popoverVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.8 } as Transition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { type: 'tween', duration: 0.15 } as Transition,
  },
};

/** Stagger-children list wrapper */
export const staggerListVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Individual item inside a staggered list */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      type: 'spring',
      stiffness: 400,
      damping: 25,
    } as Transition,
  }),
};

/** Fade + slide up — suitable for section/card entrances */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/** Fade + scale — suitable for modals / cards that pop in */
export const fadeInScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

/** Slide in from left */
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};
