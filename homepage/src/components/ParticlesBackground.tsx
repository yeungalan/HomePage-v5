// components/ParticlesBackground.tsx
'use client'

import { useEffect, useState } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'
import {
  PARTICLE_COLORS,
  PARTICLE_LINK_OPACITY,
  PARTICLE_CONFIG,
} from '@/constants/particles'

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
  fpsLimit: PARTICLE_CONFIG.FPS_LIMIT,
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
        distance: PARTICLE_CONFIG.REPULSE_DISTANCE,
        duration: PARTICLE_CONFIG.REPULSE_DURATION,
        speed: PARTICLE_CONFIG.REPULSE_SPEED,
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
      distance: PARTICLE_CONFIG.LINK_DISTANCE,
      enable: true,
      opacity: linkOpacity,
      width: PARTICLE_CONFIG.LINK_WIDTH
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce'
      },
      random: true,
      speed: PARTICLE_CONFIG.MOVE_SPEED,
      straight: false
    },
    number: {
      density: {
        enable: true
      },
      value: PARTICLE_CONFIG.PARTICLE_COUNT
    },
    opacity: {
      value: {
        min: PARTICLE_CONFIG.OPACITY_MIN,
        max: PARTICLE_CONFIG.OPACITY_MAX
      },
      animation: {
        enable: true,
        speed: PARTICLE_CONFIG.OPACITY_ANIMATION_SPEED,
        sync: false
      }
    },
    shape: {
      type: 'circle'
    },
    size: {
      value: {
        min: PARTICLE_CONFIG.SIZE_MIN,
        max: PARTICLE_CONFIG.SIZE_MAX
      }
    }
  },
  detectRetina: true
})

/**
 * Registers the slim bundle with the engine. ParticlesProvider runs this once and
 * requires the same callback for the app's lifetime, so it lives at module level.
 */
const initParticlesEngine = async (engine: Engine): Promise<void> => {
  await loadSlim(engine)
}

export function ParticlesBackground() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
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

  const particlesLoaded = async (): Promise<void> => {
    // particles loaded
  }

  const particleColor = isDark ? PARTICLE_COLORS.DARK : PARTICLE_COLORS.LIGHT
  const linkOpacity = isDark
    ? PARTICLE_LINK_OPACITY.DARK
    : PARTICLE_LINK_OPACITY.LIGHT
  const particleOptions = createParticleOptions(particleColor, linkOpacity)

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Full-screen particle field so the links also fill the middle, not just the borders */}
      {/* ParticlesProvider renders nothing until the engine has loaded */}
      <ParticlesProvider init={initParticlesEngine}>
        <Particles
          id="tsparticles-full"
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={particleOptions}
        />
      </ParticlesProvider>
    </div>
  )
}