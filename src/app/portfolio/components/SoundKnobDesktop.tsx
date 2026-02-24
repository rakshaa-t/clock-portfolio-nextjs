'use client'

import { useState, useRef, useEffect } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { useMatchMedia } from '@/hooks/useMatchMedia'

export function SoundKnobDesktop() {
  const { soundOn, toggleSound } = useAudio()
  const isMobile = useMatchMedia('(max-width: 768px)')
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Show tooltip briefly on click
  function handleClick() {
    toggleSound()

    // Show tooltip for 1.5s on click
    setShowTooltip(true)
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 1500)
  }

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }
  }, [])

  // Only render on desktop
  if (isMobile) return null

  return (
    <div
      className="sound-knob-desktop-wrap"
      style={{
        position: 'fixed',
        top: 14,
        right: 'calc(50% - min(340px, 50vw - 24px))',
        zIndex: 999,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #D8D4CE 0%, #E0DDD8 60%, #E4E0DA 100%)',
        boxShadow:
          'inset 0 2px 6px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Tooltip */}
      <span
        className="knob-tooltip-desktop"
        style={{
          position: 'absolute',
          right: 56,
          top: '50%',
          transform: `translateY(-50%) translateX(${showTooltip ? '0' : '4px'})`,
          padding: '6px 12px',
          borderRadius: 8,
          background: 'var(--color-text-primary)',
          color: 'var(--color-bg)',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
          whiteSpace: 'nowrap' as const,
          opacity: showTooltip ? 1 : 0,
          pointerEvents: 'none' as const,
          transition:
            'opacity 0.2s cubic-bezier(0.32,0.72,0,1), transform 0.2s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {soundOn ? 'Sound on' : 'Sound off'}
        {/* Arrow */}
        <span
          style={{
            content: "''",
            position: 'absolute',
            right: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            border: '4px solid transparent',
            borderLeftColor: 'var(--color-text-primary)',
          }}
        />
      </span>

      {/* Knob */}
      <button
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        onClick={handleClick}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'relative',
          border: 'none',
          background:
            'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%), linear-gradient(180deg, #F6F3EF 0%, #EDEAE5 40%, #E6E3DE 100%)',
          boxShadow:
            '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.04)',
          transform: soundOn ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Indicator dot */}
        <div
          style={{
            position: 'absolute',
            top: 5,
            left: '50%',
            width: 6,
            height: 6,
            marginLeft: -3,
            borderRadius: '50%',
            background: soundOn
              ? 'radial-gradient(circle at 35% 35%, #9B8DD6, #6B5CA8)'
              : 'radial-gradient(circle at 35% 35%, #C8C4BE, #B0ACA6)',
            boxShadow: soundOn
              ? '0 0 4px rgba(107,92,168,0.6), 0 0 8px rgba(107,92,168,0.3), inset 0 1px 1px rgba(255,255,255,0.4)'
              : 'inset 0 1px 2px rgba(0,0,0,0.1)',
            opacity: soundOn ? 1 : 0.5,
            transition:
              'opacity 0.3s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)',
          }}
        />
      </button>
    </div>
  )
}
