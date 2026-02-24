'use client'

import { useCallback, useEffect, useState } from 'react'

// ═══ SSR-SAFE MEDIA QUERY HOOK ═══
// Returns false during server render, hydrates correctly on client,
// and stays in sync with viewport changes via matchMedia listener.

export function useMatchMedia(query: string): boolean {
  // Start with false for SSR — avoids hydration mismatch
  const [matches, setMatches] = useState(false)

  const getMatches = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  useEffect(() => {
    const mql = window.matchMedia(query)

    // Set initial value on mount (may differ from SSR default)
    setMatches(mql.matches)

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    mql.addEventListener('change', handleChange)

    return () => {
      mql.removeEventListener('change', handleChange)
    }
  }, [query, getMatches])

  return matches
}
