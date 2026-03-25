'use client'

import type {
  MotionProps,
  TargetAndTransition,
  Transition,
} from 'motion/react'
import { motion } from 'motion/react'
import type { PropsWithChildren } from 'react'
import { memo, useState } from 'react'

import { isHydrationEnded } from '@/components/common/HydrationEndDetector'
import { microReboundPreset } from '@/constants/spring'

import type { BaseTransitionProps } from '@/types/transitions'
import { useRef } from 'react'

interface TransitionViewParams {
  from: TargetAndTransition
  to: TargetAndTransition
  initial?: TargetAndTransition
  preset?: Transition
}

export const createTransitionView = (params: TransitionViewParams) => {
  const { from, to, initial, preset } = params

  const TransitionView = (allProps: PropsWithChildren<BaseTransitionProps> & {
    ref?: React.RefObject<HTMLElement | null>
  }) => {
    const { ref, ...props } = allProps
    void ref
    const {
      timeout = {},
      duration = 0.5,

      animation = {},
      as,
      delay = 0,
      lcpOptimization = false,
      ...rest
    } = props
    void as

    const { enter = delay, exit = delay } = timeout

    const [stableIsHydrationEnded] = useState(isHydrationEnded)

    const motionProps: MotionProps = {
      initial: initial || from,
      animate: {
        ...to,
        transition: {
          duration,
          ...(preset || microReboundPreset),
          ...animation.enter,
          delay: enter / 1000,
        },
      },
      transition: {
        duration,
      },
      exit: {
        ...from,
        transition: {
          duration,
          ...animation.exit,
          delay: exit / 1000,
        } as TargetAndTransition['transition'],
      },
    }
    if (lcpOptimization && !stableIsHydrationEnded) {
      motionProps.initial = to
      delete motionProps.animate
    }

    const rref = useRef<HTMLDivElement>(null);

    return (
      <motion.div ref={rref} {...motionProps} {...rest}>
        {props.children}
      </motion.div>
    )
  }
  TransitionView.displayName = `forwardRef(TransitionView)`
  const MemoedTransitionView = memo(TransitionView)
  MemoedTransitionView.displayName = `MemoedTransitionView`
  return MemoedTransitionView
}
