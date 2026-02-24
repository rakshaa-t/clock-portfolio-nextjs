'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ═══ ACTIVE SECTION TRACKING ═══
// Uses getBoundingClientRect on scroll (rAF-throttled) to determine which
// section covers the most viewport area. Powers the bottom nav highlight.

interface UseActiveSectionOptions {
  /** Section element IDs to observe */
  sectionIds: string[]
}

export function useActiveSection({ sectionIds }: UseActiveSectionOptions) {
  const [activeIndex, setActiveIndex] = useState(0)
  const programmaticScrollRef = useRef(false)
  const tickingRef = useRef(false)

  // Expose setter so the nav component can flag programmatic scrolls
  const setProgrammaticScroll = useCallback((value: boolean) => {
    programmaticScrollRef.current = value
    if (value) {
      // Auto-clear after scroll animation completes
      setTimeout(() => {
        programmaticScrollRef.current = false
      }, 800)
    }
  }, [])

  useEffect(() => {
    function updateActiveFromScroll() {
      if (programmaticScrollRef.current) return

      const vh = window.innerHeight
      let bestIdx = 0
      let bestCoverage = 0

      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i])
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const visTop = Math.max(rect.top, 0)
        const visBot = Math.min(rect.bottom, vh)
        const coverage = Math.max(0, visBot - visTop)
        if (coverage > bestCoverage) {
          bestCoverage = coverage
          bestIdx = i
        }
      }

      setActiveIndex(bestIdx)
    }

    function onScroll() {
      if (!tickingRef.current) {
        tickingRef.current = true
        requestAnimationFrame(() => {
          tickingRef.current = false
          updateActiveFromScroll()
        })
      }
    }

    // Set initial state from current scroll position
    updateActiveFromScroll()

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [sectionIds])

  return {
    activeIndex,
    setActiveIndex,
    setProgrammaticScroll,
  }
}
