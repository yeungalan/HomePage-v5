'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A random value that hydrates cleanly: the server and the first client render
 * both use `initial`, then `pick()` re-rolls it once the component has mounted.
 *
 * Calling `Math.random()` during render (or in a `useState` initializer) makes
 * the pre-rendered HTML disagree with the browser's first render, which React
 * reports as a hydration error and fixes by throwing the server HTML away.
 */
export const useMountedRandom = <T>(initial: T, pick: () => T) => {
  const [value, setValue] = useState(initial)
  const pickRef = useRef(pick)

  useEffect(() => {
    // Deliberate second render pass after hydration; see the comment above.
    setValue(pickRef.current())
  }, [])

  return [value, setValue] as const
}
