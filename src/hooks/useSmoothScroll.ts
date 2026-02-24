'use client'

import { useCallback, useRef } from 'react'
import { prefersReducedMotion, easeOut, easeInOut } from '@/lib/utils'

// ═══ CUSTOM SMOOTH SCROLL ═══
// Replaces browser-native `behavior:'smooth'` which uses ease-in-out
// (sluggish per Emil Kowalski). Default: ease-out cubic.
// Interruptible: cancels on user wheel/touch/key.

type EasingType = 'ease-out' | 'ease-in-out'
type BlockType = 'start' | 'center' | 'bottom-edge'

interface ScrollOptions {
  duration?: number
  easing?: EasingType
  offset?: number
}

interface ScrollToElOptions extends ScrollOptions {
  block?: BlockType
}

export function useSmoothScroll() {
  const rafRef = useRef<number | null>(null)

  const scrollTo = useCallback((targetY: number, options?: ScrollOptions) => {
    // Cancel any in-progress scroll
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const startY = window.scrollY
    const diff = targetY - startY

    // Skip if already at target
    if (Math.abs(diff) < 4) return

    // Instant jump when reduced motion is preferred
    if (prefersReducedMotion()) {
      window.scrollTo(0, targetY)
      return
    }

    const easeFn = options?.easing === 'ease-in-out' ? easeInOut : easeOut

    // Auto-scale duration: min 300ms, max 600ms based on distance
    const duration =
      options?.duration ?? Math.min(600, Math.max(300, Math.abs(diff) * 0.5))

    const startTime = performance.now()
    let cancelled = false

    function cancel() {
      cancelled = true
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      cleanup()
    }

    function cleanup() {
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
    }

    // Interruptible: cancel on any user input
    window.addEventListener('wheel', cancel, { once: true, passive: true })
    window.addEventListener('touchstart', cancel, { once: true, passive: true })
    window.addEventListener('keydown', cancel, { once: true, passive: true })

    function step(now: number) {
      if (cancelled) return
      const progress = Math.min((now - startTime) / duration, 1)
      window.scrollTo(0, startY + diff * easeFn(progress))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
        cleanup()
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  const scrollToEl = useCallback(
    (el: HTMLElement, options?: ScrollToElOptions) => {
      if (!el) return

      const rect = el.getBoundingClientRect()
      const block = options?.block ?? 'start'
      const offset = options?.offset ?? 0
      let targetY: number

      if (block === 'start') {
        targetY = window.scrollY + rect.top + offset
      } else if (block === 'center') {
        targetY =
          window.scrollY +
          rect.top -
          (window.innerHeight - rect.height) / 2 +
          offset
      } else {
        // 'bottom-edge'
        targetY = window.scrollY + rect.bottom - window.innerHeight + offset
      }

      scrollTo(targetY, {
        duration: options?.duration,
        easing: options?.easing,
      })
    },
    [scrollTo]
  )

  return { scrollTo, scrollToEl }
}
