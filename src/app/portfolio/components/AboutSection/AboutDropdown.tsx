'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// ═══ Dropdown data ═══
const DROP_DATA: Record<string, { name: string }[]> = {
  agencies: [{ name: 'Doodleblue' }],
  companies: [
    { name: 'Adiagnosis' }, { name: 'Dealdoc' }, { name: 'Tickle' }, { name: 'Ova App' },
    { name: 'Cognix Health' }, { name: 'Bewakoof.com' }, { name: 'Meyraki' },
    { name: 'Indian Oil Company' }, { name: 'Inaam' }, { name: 'ENA' }, { name: 'Kodo Card' },
    { name: 'Euman Technologies' }, { name: 'KG International' }, { name: 'Tennishop UAE' },
    { name: 'Nourish App' }, { name: 'Unidel' }, { name: 'Lido Learning' },
    { name: 'Unifynd' }, { name: 'Reverce' }, { name: 'Nesto Group' },
  ],
  leaders: [
    { name: 'Tina Hua' }, { name: 'Angie Lee' }, { name: 'Aritra Senugupta' },
    { name: 'Sarthak Sharma' }, { name: 'Max McQuillan' }, { name: 'Hannah Wartooth' },
    { name: 'Neerav J' }, { name: 'Amrita Singh' }, { name: 'Rohit Biwas' },
    { name: 'Arash' }, { name: 'Sunny' }, { name: 'Raj Karan' }, { name: 'Deepti Singhi' },
    { name: 'Nyshita Jain' }, { name: 'Thomas Phua' }, { name: 'Rohit Goel' },
    { name: 'Sagar Sharma' }, { name: 'Maruthy Ramgandhi' },
  ],
}

interface AboutDropdownTriggerProps {
  dataKey: keyof typeof DROP_DATA
  children: React.ReactNode
  open?: boolean
  onToggle?: () => void
}

export function AboutDropdownTrigger({ dataKey, children, open: controlledOpen, onToggle }: AboutDropdownTriggerProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const wrapRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLSpanElement>(null)
  const [showFade, setShowFade] = useState(false)
  const items = DROP_DATA[dataKey] ?? []

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggle) {
      onToggle()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }, [onToggle])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleDocClick() {
      if (onToggle) {
        onToggle()
      } else {
        setInternalOpen(false)
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [open, onToggle])

  // Check if list needs fade gradient (scrollable)
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current
    setShowFade(el.scrollHeight > el.clientHeight + 2)
    function onScroll() {
      setShowFade(el.scrollTop + el.clientHeight < el.scrollHeight - 2)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [open])

  return (
    <span
      className="relative cursor-pointer text-text-primary underline decoration-[rgba(0,0,0,0.15)] underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-[rgba(0,0,0,0.4)]"
      style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      onClick={handleClick}
    >
      {children}

      {/* Dropdown wrap — uses <span> with display:block to avoid <div> inside <p> hydration error */}
      <span
        ref={wrapRef}
        className={cn(
          'absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] rounded-[10px] block',
          'transition-all duration-150 pointer-events-none opacity-0 -translate-y-1',
          open && 'opacity-100 translate-y-0 pointer-events-auto',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          ref={listRef}
          className="block py-2 rounded-[10px] max-h-[200px] overflow-y-auto overscroll-none"
          style={{
            background: 'var(--color-text-primary)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            WebkitOverflowScrolling: 'auto',
          }}
        >
          {items.map((item) => (
            <span
              key={item.name}
              className="block px-3.5 py-1.5 font-mono text-[12px] font-medium whitespace-nowrap opacity-85"
              style={{ color: 'var(--color-bg)' }}
            >
              {item.name}
            </span>
          ))}
        </span>

        {/* Scroll fade gradient */}
        <span
          className={cn(
            'absolute bottom-0 left-0 right-0 h-7 pointer-events-none rounded-b-[10px] block',
            'transition-opacity duration-150',
            !showFade && 'opacity-0',
          )}
          style={{
            background: `linear-gradient(transparent, var(--color-text-primary))`,
            transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
          }}
        />
      </span>
    </span>
  )
}
