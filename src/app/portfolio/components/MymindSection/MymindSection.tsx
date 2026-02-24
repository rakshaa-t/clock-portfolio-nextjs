'use client'

import { useCallback, useRef, useState, useMemo } from 'react'
import { MMIND_CARDS } from '@/data/mymind'
import type { MymindCard } from '@/types'
import { FilterPill, ShowMoreButton } from '@/components/ui'
import { MasonryGrid } from './MasonryGrid'
import { MymindPopover } from './MymindPopover'

const INITIAL_COUNT = 9

export function MymindSection() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [activeCardEl, setActiveCardEl] = useState<HTMLElement | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    MMIND_CARDS.forEach((card) => cats.add(card.category))
    return ['all', ...Array.from(cats)]
  }, [])

  // Filter cards by category and search
  const filteredCards = useMemo(() => {
    return (MMIND_CARDS as unknown as MymindCard[]).filter((card) => {
      // Category filter
      if (activeFilter !== 'all' && card.category !== activeFilter) return false

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const haystack = [
          card.title,
          card.tags?.join(' '),
          'caption' in card ? card.caption : undefined,
          'text' in card ? card.text : undefined,
          'author' in card ? card.author : undefined,
          'linkTitle' in card ? card.linkTitle : undefined,
          'linkDesc' in card ? card.linkDesc : undefined,
          card.source,
          card.tldr,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [activeFilter, search])

  // Determine visible cards
  const isFiltered = activeFilter !== 'all' || search.trim().length > 0
  const visibleCards = isFiltered || expanded
    ? filteredCards
    : filteredCards.slice(0, INITIAL_COUNT)

  const showShowMore = !isFiltered && filteredCards.length > INITIAL_COUNT

  function handleFilterClick(cat: string) {
    setActiveFilter(cat)
    setExpanded(false)
    setActiveIdx(null)
  }

  function handleToggleExpand() {
    setExpanded((prev) => !prev)
  }

  const handleCardClick = useCallback((globalIdx: number, el: HTMLElement) => {
    if (activeIdx === globalIdx) {
      setActiveIdx(null)
      setActiveCardEl(null)
    } else {
      setActiveIdx(globalIdx)
      setActiveCardEl(el)
    }
  }, [activeIdx])

  const handlePopoverClose = useCallback(() => {
    setActiveIdx(null)
    setActiveCardEl(null)
  }, [])

  // Find the active card data
  const activeCard = activeIdx !== null ? (MMIND_CARDS as unknown as MymindCard[])[activeIdx] : null

  return (
    <section
      id="sec-bookmarks"
      className="text-left"
      style={{ padding: '64px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
    >
      {/* Section title */}
      <h2
        className="font-pixel text-[32px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}
      >
        Things I&apos;m saving
      </h2>

      {/* Subtitle */}
      <p
        className="text-[15px] text-text-secondary leading-[1.5]"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40 }}
      >
        My bookmarks live in{' '}
        <a
          href="https://mymind.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent no-underline border-b border-accent/30 hover:border-accent/60 transition-colors duration-150"
        >
          Mymind
        </a>
        . Here&apos;s what&apos;s caught my eye lately.
      </p>

      {/* Search */}
      <div
        className="pb-3"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <input
          type="text"
          placeholder="Search my mind..."
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setExpanded(false)
            setActiveIdx(null)
          }}
          className="w-full border-none outline-none bg-transparent font-sans text-2xl font-light italic text-text-primary tracking-[-0.01em] placeholder:text-black/20 placeholder:italic"
        />
      </div>

      {/* Filter pills */}
      <div
        className="flex gap-2 pb-4 flex-wrap"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {categories.map((cat) => (
          <FilterPill
            key={cat}
            active={activeFilter === cat}
            onClick={() => handleFilterClick(cat)}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </FilterPill>
        ))}
      </div>

      {/* Masonry grid */}
      <div ref={gridRef}>
        <MasonryGrid
          cards={visibleCards}
          activeIdx={activeIdx}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Popover */}
      <MymindPopover
        card={activeCard}
        cardEl={activeCardEl}
        gridEl={gridRef.current}
        open={activeIdx !== null}
        onClose={handlePopoverClose}
      />

      {/* Show more button */}
      {showShowMore && (
        <div
          className="text-center pt-6"
          style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
        >
          <ShowMoreButton expanded={expanded} onClick={handleToggleExpand}>
            {expanded ? 'Show fewer bookmarks' : 'Show more bookmarks'}
          </ShowMoreButton>
        </div>
      )}
    </section>
  )
}
