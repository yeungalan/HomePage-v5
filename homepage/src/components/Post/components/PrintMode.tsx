'use client'

import { useEffect } from 'react'

/**
 * Prepares a post for printing with Ctrl/Cmd+P. Renders nothing.
 *
 * The print stylesheet in globals.css hides everything marked
 * `data-hide-print` (site header, sidebars, footer, post navigation), so only
 * the article goes to paper. Paper is white, so the page always prints in the
 * light theme: the `dark` class is taken off <html> while the print dialog is
 * open and put back afterwards.
 */
export const PrintMode: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement
    let printing = false
    let wasDark = false

    // beforeprint can fire more than once per print (e.g. when the dialog
    // re-renders its preview), so only the first one records the theme.
    const beforePrint = () => {
      if (printing) return
      printing = true
      wasDark = root.classList.contains('dark')
      if (wasDark) root.classList.remove('dark')
    }
    const afterPrint = () => {
      if (!printing) return
      printing = false
      if (wasDark) root.classList.add('dark')
      wasDark = false
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
      afterPrint()
    }
  }, [])

  return null
}
