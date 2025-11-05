// components/ParticlesBackground.tsx
'use client'

import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Container, ISourceOptions } from '@tsparticles/engine'

/**
 * Creates particle configuration options
 */
const createParticleOptions = (
  particleColor: string,
  linkOpacity: number
): ISourceOptions => ({
  fullScreen: {
    enable: false
  },
  background: {
    color: {
      value: 'transparent'
    }
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: false
      },
      onHover: {
        enable: true,
        mode: 'repulse'
      }
    },
    modes: {
      repulse: {
        distance: 120,
        duration: 1.5,
        speed: 0.3,
        easing: 'ease-out-quad'
      }
    }
  },
  particles: {
    color: {
      value: particleColor
    },
    links: {
      color: particleColor,
      distance: 150,
      enable: true,
      opacity: linkOpacity,
      width: 1
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce'
      },
      random: true,
      speed: 0.3,
      straight: false
    },
    number: {
      density: {
        enable: true
      },
      value: 20
    },
    opacity: {
      value: { min: 0.3, max: 0.5 },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false
      }
    },
    shape: {
      type: 'circle'
    },
    size: {
      value: { min: 2, max: 3 }
    }
  },
  detectRetina: true
})

export function ParticlesBackground() {
  const [init, setInit] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })

    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container)
  }

  if (!init) {
    return null
  }

  const particleColor = isDark ? '#64748b' : '#94a3b8'
  const linkOpacity = isDark ? 0.2 : 0.15
  const particleOptions = createParticleOptions(particleColor, linkOpacity)

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Top border */}
      <div className="absolute left-0 right-0 top-0 h-[200px]">
        <Particles
          id="tsparticles-top"
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={particleOptions}
        />
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px]">
        <Particles
          id="tsparticles-bottom"
          className="h-full w-full"
          options={particleOptions}
        />
      </div>

      {/* Left border */}
      <div className="absolute bottom-0 left-0 top-0 w-[200px]">
        <Particles
          id="tsparticles-left"
          className="h-full w-full"
          options={particleOptions}
        />
      </div>

      {/* Right border */}
      <div className="absolute bottom-0 right-0 top-0 w-[200px]">
        <Particles
          id="tsparticles-right"
          className="h-full w-full"
          options={particleOptions}
        />
      </div>
    </div>
  )
}