'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Book } from '@/types'
import { useMatchMedia } from '@/hooks/useMatchMedia'

type BookPopoverProps = {
  book: Book | null
  cardEl: HTMLElement | null
  gridEl: HTMLElement | null
  open: boolean
  onClose: () => void
}

export function BookPopover({ book, cardEl, gridEl, open, onClose }: BookPopoverProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  // Position popover on desktop (sync before paint to avoid flash)
  useLayoutEffect(() => {
    if (!open || !cardEl || !gridEl || isMobile) return
    const wrap = wrapRef.current
    const pop = popRef.current
    if (!wrap || !pop) return

    const gridRect = gridEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    const gap = 12
    const viewH = window.innerHeight
    const popWidth = Math.min(300, gridRect.width)

    // Horizontal: center on card, clamp within grid bounds
    let left = cardRect.left + cardRect.width / 2 - popWidth / 2
    left = Math.max(gridRect.left, Math.min(left, gridRect.right - popWidth))

    // Measure height (briefly show invisible to get offsetHeight)
    wrap.style.visibility = 'hidden'
    wrap.style.top = '0px'
    wrap.style.left = left + 'px'
    wrap.style.width = popWidth + 'px'
    wrap.classList.add('open')
    const popHeight = pop.offsetHeight
    wrap.classList.remove('open')
    wrap.style.visibility = ''

    // Vertical: prefer below card, fallback above
    const spaceBelow = viewH - cardRect.bottom - gap
    const below = spaceBelow >= popHeight
    let top = below ? cardRect.bottom + gap : cardRect.top - gap - popHeight
    top = Math.max(16, Math.min(top, viewH - popHeight - 16))

    // Origin-aware scale from trigger card's center
    const originX = cardRect.left + cardRect.width / 2 - left
    pop.style.transformOrigin = `${originX}px ${below ? '0' : '100%'}`
    pop.style.setProperty('--pop-dir', below ? '8px' : '-8px')

    wrap.style.top = top + 'px'
    wrap.style.left = left + 'px'
    wrap.style.width = popWidth + 'px'
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

  // Close on scroll outside popover (continuous — NOT once:true, matching Astro books)
  useEffect(() => {
    if (!open || isMobile) return
    function onScroll(e: Event) {
      if (wrapRef.current?.contains(e.target as Node)) return
      onClose()
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [open, isMobile, onClose])

  // Focus close button on open
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      wrapRef.current?.querySelector<HTMLButtonElement>('.pop-close')?.focus()
    })
  }, [open])

  if (!book) return null

  const isFav = book.fav
  const isDone = !isFav && book.progress === 100

  return (
    <>
      {/* Scrim (transparent desktop, dark mobile via CSS) */}
      <div
        className={open ? 'mm-scrim open' : 'mm-scrim'}
        onMouseDown={onClose}
      />

      {/* Popover wrap */}
      <div
        ref={wrapRef}
        className={`book-pop-wrap${open ? ' open' : ''}`}
        role="dialog"
        aria-label="Book details"
        style={{ position: 'fixed' }}
      >
        <div className="sheet-handle" />
        <div
          ref={popRef}
          className="book-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header: title + close */}
          <div className="pop-header">
            <div className="pop-title">{book.title}</div>
            <button
              className="pop-close"
              onClick={(e) => { e.stopPropagation(); onClose() }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Meta: author + rating badge */}
          <div className="book-pop-meta">
            by {book.author}
            {isFav && <span className="book-pop-rating excellent">Excellent</span>}
            {isDone && <span className="book-pop-rating great">Great</span>}
          </div>

          {/* Progress bar */}
          <div className="book-pop-progress">
            <div className="book-pop-progress-bar">
              <div
                className="book-pop-progress-fill"
                style={{ width: '100%', transform: `scaleX(${book.progress / 100})` }}
              />
            </div>
            <span className="book-pop-pct">{book.progress}%</span>
          </div>

          {/* Highlights / notes */}
          {book.notes && book.notes.length > 0 && (
            <div className="book-pop-highlights">
              {book.notes.map((n, i) => (
                <div
                  key={i}
                  className="book-pop-highlight"
                  dangerouslySetInnerHTML={{ __html: n.note }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export type { BookPopoverProps }
