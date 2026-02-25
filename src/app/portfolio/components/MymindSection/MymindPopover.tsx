'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MymindCard } from '@/types'
import { useMatchMedia } from '@/hooks/useMatchMedia'

type MymindPopoverProps = {
  card: MymindCard | null
  cardEl: HTMLElement | null
  gridEl: HTMLElement | null
  open: boolean
  onClose: () => void
}

export function MymindPopover({ card, cardEl, gridEl, open, onClose }: MymindPopoverProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280, originX: '50%', popDir: '6px' })

  // Position popover on desktop (sync before paint)
  useLayoutEffect(() => {
    if (!open || !cardEl || !gridEl || isMobile) return
    const gridRect = gridEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    const gap = 12
    const viewH = window.innerHeight
    const popWidth = Math.min(280, gridRect.width)
    let left = cardRect.left + cardRect.width / 2 - popWidth / 2
    left = Math.max(gridRect.left, Math.min(left, gridRect.right - popWidth))

    // Measure popover height (briefly show invisible)
    const wrap = wrapRef.current
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

  // Close on scroll (desktop, once:true — matches Astro mymind behavior)
  useEffect(() => {
    if (!open || isMobile) return
    function onScroll() { onClose() }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true, once: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [open, isMobile, onClose])

  // Reset copied on close and clear any pending timeout
  useEffect(() => {
    if (!open) {
      setCopied(false)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }
    }
  }, [open])

  // Focus close button on open
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      wrapRef.current?.querySelector<HTMLButtonElement>('.pop-close')?.focus()
    })
  }, [open])

  const handleCopy = useCallback(() => {
    if (!card) return
    const text = card.url && card.url !== '#' ? card.url : ('text' in card ? card.text : card.title)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => {
        setCopied(false)
        copyTimerRef.current = null
      }, 1500)
    })
  }, [card])

  if (!card) return null

  const popoverContent = (
    <>
      {/* Header */}
      <div className="pop-header">
        <div className="pop-title" style={{ fontSize: 13 }}>
          {card.title}
        </div>
        <button
          className="pop-close"
          onClick={(e) => { e.stopPropagation(); onClose() }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Source link */}
      {card.source && (
        <a
          href={card.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="pop-source"
          onClick={(e) => e.stopPropagation()}
        >
          {card.source} &#x2197;
        </a>
      )}

      {/* TLDR */}
      {card.tldr && (
        <div className="pop-tldr">
          {card.tldr}
        </div>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="pop-tags">
          {card.tags.map((tag) => (
            <span key={tag} className="pop-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pop-footer">
        <span className="pop-date">
          {card.date}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy() }}
          className={`pop-copy${copied ? ' copied' : ''}`}
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

  return (
    <>
      {/* Scrim */}
      <div
        className={open ? 'mm-scrim open' : 'mm-scrim'}
        onMouseDown={onClose}
      />

      {/* Popover wrap */}
      <div
        ref={wrapRef}
        className={open ? 'mm-popover-wrap open' : 'mm-popover-wrap'}
        role="dialog"
        aria-label="Bookmark details"
        style={
          isMobile
            ? { position: 'fixed' }
            : { position: 'fixed', top: pos.top, left: pos.left, width: pos.width }
        }
      >
        <div className="sheet-handle" />
        <div
          ref={innerRef}
          className="mm-popover"
          style={
            isMobile
              ? undefined
              : {
                  transformOrigin: `${pos.originX} ${pos.popDir.startsWith('-') ? '100%' : '0'}`,
                  ['--pop-dir' as string]: pos.popDir,
                }
          }
          onClick={(e) => e.stopPropagation()}
        >
          {popoverContent}
        </div>
      </div>
    </>
  )
}
