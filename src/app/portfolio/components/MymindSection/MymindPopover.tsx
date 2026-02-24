'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MymindCard } from '@/types'
import { useMatchMedia } from '@/hooks/useMatchMedia'
import { Drawer, DrawerContent } from '@/components/ui/Drawer'

type MymindPopoverProps = {
  card: MymindCard | null
  cardEl: HTMLElement | null
  gridEl: HTMLElement | null
  open: boolean
  onClose: () => void
}

export function MymindPopover({ card, cardEl, gridEl, open, onClose }: MymindPopoverProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')
  const popRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280, originX: '50%', popDir: '6px' })

  // Position popover on desktop
  useEffect(() => {
    if (!open || !cardEl || !gridEl || isMobile) return
    const gridRect = gridEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    const gap = 12
    const viewH = window.innerHeight
    const popWidth = Math.min(280, gridRect.width)
    let left = cardRect.left + cardRect.width / 2 - popWidth / 2
    left = Math.max(gridRect.left, Math.min(left, gridRect.right - popWidth))

    // Measure popover height (briefly show invisible)
    const wrap = popRef.current
    if (wrap) {
      wrap.style.visibility = 'hidden'
      wrap.style.top = '0px'
      wrap.style.left = left + 'px'
      wrap.style.width = popWidth + 'px'
    }
    // Force layout to measure height
    const popHeight = innerRef.current?.offsetHeight ?? 200

    const spaceBelow = viewH - cardRect.bottom - gap
    const below = spaceBelow >= popHeight
    let top = below ? cardRect.bottom + gap : cardRect.top - gap - popHeight
    top = Math.max(16, Math.min(top, viewH - popHeight - 16))

    const originX = cardRect.left + cardRect.width / 2 - left

    setPos({
      top,
      left,
      width: popWidth,
      originX: `${originX}px`,
      popDir: below ? '6px' : '-6px',
    })

    if (wrap) wrap.style.visibility = ''
  }, [open, cardEl, gridEl, isMobile])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Close on scroll (desktop)
  useEffect(() => {
    if (!open || isMobile) return
    function onScroll() { onClose() }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true, once: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [open, isMobile, onClose])

  // Reset copied on close
  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const handleCopy = useCallback(() => {
    if (!card) return
    const text = card.url && card.url !== '#' ? card.url : ('text' in card ? card.text : card.title)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [card])

  if (!card) return null

  const popoverContent = (
    <>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="font-sans text-[13px] font-semibold text-text-primary leading-[1.35] flex-1">
          {card.title}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-[12px] text-black/[0.48] border-none shrink-0 ml-2 transition-[background,color] duration-150"
          style={{ background: 'rgba(0,0,0,0.06)', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
        >
          &times;
        </button>
      </div>

      {/* Source link */}
      {card.source && (
        <a
          href={card.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-accent no-underline inline-flex items-center gap-1 mb-3 transition-opacity duration-150 hover:opacity-70"
          onClick={(e) => e.stopPropagation()}
        >
          {card.source} &#x2197;
        </a>
      )}

      {/* TLDR */}
      {card.tldr && (
        <div className="font-sans text-[12px] text-black/[0.62] leading-[1.6] mb-3">
          {card.tldr}
        </div>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-[4px] font-mono text-[12px] font-medium tracking-[0.01em] uppercase"
              style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-3 pt-2.5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
      >
        <span className="font-mono text-[12px] text-black/[0.48] tracking-[0.02em]">
          {card.date}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy() }}
          className="flex items-center gap-1 font-sans text-[12px] font-medium cursor-pointer rounded-[8px] px-2 py-1 transition-[color,border-color,background] duration-150"
          style={{
            color: copied ? 'var(--color-accent)' : 'rgba(0,0,0,0.4)',
            background: 'none',
            border: copied ? '1px solid rgba(139,126,200,0.3)' : '1px solid rgba(0,0,0,0.08)',
            transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 8 7 11 12 5"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M5 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V5"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
    </>
  )

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent>
          <div className="p-4 pb-6">
            {popoverContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: floating popover
  return (
    <>
      {/* Scrim */}
      <div
        className={open ? 'mm-scrim open' : 'mm-scrim'}
        onMouseDown={onClose}
      />

      {/* Popover */}
      <div
        ref={popRef}
        className={open ? 'mm-popover-wrap open' : 'mm-popover-wrap'}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: pos.width,
        }}
      >
        <div
          ref={innerRef}
          className="mm-popover"
          style={{
            transformOrigin: `${pos.originX} ${pos.popDir.startsWith('-') ? '100%' : '0'}`,
            ['--pop-dir' as string]: pos.popDir,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {popoverContent}
        </div>
      </div>
    </>
  )
}
