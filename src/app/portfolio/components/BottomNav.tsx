'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { cn } from '@/lib/utils'

// ═══ SECTION CONFIG ═══
const NAV_ITEMS = [
  { label: 'About', sectionId: 'sec-about' },
  { label: 'Work', sectionId: 'sec-work' },
  { label: 'Notes', sectionId: 'sec-notes' },
  { label: 'Saves', sectionId: 'sec-bookmarks' },
  { label: 'Books', sectionId: 'sec-books' },
] as const

const SECTION_IDS = NAV_ITEMS.map((i) => i.sectionId)

export function BottomNav() {
  const { soundOn, toggleSound } = useAudio()
  const { activeIndex, setActiveIndex, setProgrammaticScroll } =
    useActiveSection({ sectionIds: SECTION_IDS })
  const { scrollToEl } = useSmoothScroll()

  // Highlight position & width
  const pillRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [highlight, setHighlight] = useState({ left: 0, width: 0 })

  // Scroll-to-top visibility
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Sound toast
  const [toastText, setToastText] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Measure highlight position ──
  const measureHighlight = useCallback(() => {
    const pill = pillRef.current
    const item = itemRefs.current[activeIndex]
    if (!pill || !item) return
    const pillRect = pill.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    setHighlight({
      left: itemRect.left - pillRect.left,
      width: itemRect.width,
    })
  }, [activeIndex])

  useEffect(() => {
    measureHighlight()
  }, [measureHighlight])

  // Re-measure on resize
  useEffect(() => {
    const ro = new ResizeObserver(measureHighlight)
    if (pillRef.current) ro.observe(pillRef.current)
    return () => ro.disconnect()
  }, [measureHighlight])

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // ── Scroll-to-top visibility ──
  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Nav click handler ──
  function handleNavClick(idx: number) {
    const el = document.getElementById(SECTION_IDS[idx])
    if (!el) return
    setProgrammaticScroll(true)
    setActiveIndex(idx)
    scrollToEl(el, { block: 'start', offset: -20 })
  }

  // ── Scroll to top ──
  function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Sound toggle with toast ──
  function handleSoundToggle() {
    toggleSound()
    const nextState = !soundOn
    showToast(nextState ? 'Sound on' : 'Sound off')
  }

  function showToast(text: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastText(text)
    setToastVisible(true)
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
    }, 1500)
  }

  return (
    <nav
      data-bottom-nav
      className="fixed z-[998] flex items-center gap-1.5"
      style={{
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: 20,
        right: 20,
        padding: 4,
        borderRadius: 100,
        background: '#DDD9D3',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      {/* ── Sound Knob ── */}
      <div className="sound-knob-wrap relative shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          background: 'radial-gradient(circle, #D8D4CE 0%, #E0DDD8 60%, #E4E0DA 100%)',
          boxShadow: `
            inset 0 2px 6px rgba(0,0,0,0.1),
            inset 0 1px 2px rgba(0,0,0,0.06),
            0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        {/* Toast */}
        <div
          className={cn(
            'absolute bottom-[calc(100%+10px)] left-0 z-[999]',
            'px-3.5 py-[6px] rounded-full whitespace-nowrap pointer-events-none',
            'font-mono text-[11px] font-semibold tracking-[0.04em] uppercase',
            'transition-all duration-250',
          )}
          style={{
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg)',
            transformOrigin: '0% 100%',
            opacity: toastVisible ? 1 : 0,
            transform: toastVisible
              ? 'scale(1) translateY(0)'
              : 'scale(0.5) translateY(8px)',
            transitionTimingFunction:
              'cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {toastText}
        </div>

        {/* Knob */}
        <button
          data-knob
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          onClick={handleSoundToggle}
          className="w-6 h-6 rounded-full cursor-pointer relative"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%), linear-gradient(180deg, #F6F3EF 0%, #EDEAE5 40%, #E6E3DE 100%)',
            boxShadow: `
              0 2px 4px rgba(0,0,0,0.1),
              0 4px 8px rgba(0,0,0,0.06),
              0 1px 0 rgba(255,255,255,0.4),
              inset 0 1px 0 rgba(255,255,255,0.9),
              inset 0 -1px 2px rgba(0,0,0,0.04)`,
            transform: soundOn ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Knob dot */}
          <div
            data-knob-dot
            className="absolute left-1/2"
            style={{
              top: 3,
              width: 3.5,
              height: 3.5,
              marginLeft: -1.75,
              borderRadius: '50%',
              background: soundOn
                ? 'radial-gradient(circle at 35% 35%, #9B8DD6, #6B5CA8)'
                : 'radial-gradient(circle at 35% 35%, #C8C4BE, #B0ACA6)',
              boxShadow: soundOn
                ? '0 0 4px rgba(107,92,168,0.6), 0 0 8px rgba(107,92,168,0.3), inset 0 1px 1px rgba(255,255,255,0.4)'
                : 'inset 0 1px 2px rgba(0,0,0,0.1)',
              opacity: soundOn ? 1 : 0.5,
              animation: soundOn ? 'ledPulse 2s ease-in-out infinite' : 'none',
              transition: 'opacity 0.3s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
          />
        </button>
      </div>

      {/* ── Nav Pill (items inside, no separate background — inherits from nav bar) ── */}
      <div
        ref={pillRef}
        className="relative flex items-center flex-1"
      >
        {/* Sliding highlight */}
        <div
          className="absolute top-1/2 pointer-events-none"
          style={{
            left: highlight.left,
            width: highlight.width,
            height: 'calc(100% - 4px)',
            borderRadius: 100,
            background: 'linear-gradient(180deg, #F6F3EF 0%, #EDEAE5 40%, #E6E3DE 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            transform: 'translateY(-50%)',
            transition: 'left 0.3s cubic-bezier(0.32,0.72,0,1), width 0.3s cubic-bezier(0.32,0.72,0,1)',
            willChange: 'transform,width',
          }}
        />

        {NAV_ITEMS.map((item, idx) => (
          <button
            data-nav-item
            key={item.sectionId}
            ref={(el) => { itemRefs.current[idx] = el }}
            onClick={() => handleNavClick(idx)}
            className={cn(
              'relative z-[1] flex-1 text-center',
              'font-mono text-[12px] font-medium tracking-[0.01em]',
              'py-2 px-0 cursor-pointer border-0 bg-transparent',
              'whitespace-nowrap select-none',
              'transition-colors duration-200',
              'active:scale-[0.97]',
              idx === activeIndex ? 'text-text-primary' : 'text-[rgba(58,54,50,0.5)]',
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Scroll-to-top (desktop only) ── */}
      <button
        data-scroll-top
        aria-label="Scroll to top"
        onClick={handleScrollTop}
        className={cn(
          'absolute top-1/2 hidden md:flex items-center justify-center',
          'w-8 h-8 rounded-full cursor-pointer border-0',
          'transition-all duration-300',
          showScrollTop
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        style={{
          transform: 'translateY(-50%)',
          right: showScrollTop ? -40 : 0,
          background: '#DDD9D3',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          color: 'rgba(58,54,50,0.5)',
          transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </nav>
  )
}
