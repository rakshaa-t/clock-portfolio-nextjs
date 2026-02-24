'use client'

import { useCallback, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/utils'
import { useMatchMedia } from './useMatchMedia'

// ═══ 3D TILT CARD ═══
// Subtle perspective rotation following mouse position on puzzle cards.
// Max rotation +-4 degrees. Disabled on mobile and when reduced motion is preferred.

const MAX_ROTATE = 4 // degrees

interface TiltStyle extends CSSProperties {
  transform: string
  transition: string
}

const defaultStyle: TiltStyle = {
  transform: '',
  transition: '',
}

export function useTiltCard(): {
  ref: RefObject<HTMLDivElement | null>
  onMouseEnter: () => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseLeave: () => void
  style: TiltStyle
} {
  const ref = useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = useState<TiltStyle>(defaultStyle)
  const isMobile = useMatchMedia('(max-width: 768px)')

  const isDisabled = useCallback(() => {
    return isMobile || prefersReducedMotion()
  }, [isMobile])

  const onMouseEnter = useCallback(() => {
    if (isDisabled()) return
    // Suppress transition so tilt tracking is instant
    setStyle({ transform: '', transition: 'none' })
  }, [isDisabled])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled()) return
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width // 0 -> 1
      const y = (e.clientY - rect.top) / rect.height // 0 -> 1
      const rotateY = (x - 0.5) * MAX_ROTATE * 2 // -MAX_ROTATE -> +MAX_ROTATE
      const rotateX = (0.5 - y) * MAX_ROTATE * 2 // inverted for natural feel

      setStyle({
        transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.01)`,
        transition: 'none',
      })
    },
    [isDisabled]
  )

  const onMouseLeave = useCallback(() => {
    if (isDisabled()) return
    // Restore transition for smooth return to neutral
    setStyle({
      transform: '',
      transition: '',
    })
  }, [isDisabled])

  return { ref, onMouseEnter, onMouseMove, onMouseLeave, style }
}
