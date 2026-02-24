'use client'

import { useMemo, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { KINDLE_BOOKS } from '@/data/books'
import { cn } from '@/lib/utils'
import type { Book, BookCategory } from '@/types'
import { FilterPill, ShowMoreButton } from '@/components/ui'
import { BookCover } from './BookCover'
import { BookPopover } from './BookPopover'
import { motion } from 'framer-motion'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]

// ═══ Constants ═══

const BOOKS_INITIAL = 8

const FILTERS: { label: string; value: BookCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Great', value: 'great' },
  { label: 'Reading', value: 'reading' },
]

// ═══ Category logic ═══

function getBookCategory(book: Book): BookCategory {
  if (book.fav) return 'excellent'
  if (book.progress === 100) return 'great'
  return 'reading'
}

// ═══ BooksSection ═══

export function BooksSection() {
  const [activeFilter, setActiveFilter] = useState<BookCategory>('all')
  const [expanded, setExpanded] = useState(false)
  const [openBookIdx, setOpenBookIdx] = useState<number | null>(null)
  const { playBookClick } = useAudio()

  // Filter books by active category
  const filteredBooks = useMemo(() => {
    if (activeFilter === 'all') return [...KINDLE_BOOKS]
    return KINDLE_BOOKS.filter((book) => getBookCategory(book) === activeFilter)
  }, [activeFilter])

  // Determine which books to show
  const isFiltered = activeFilter !== 'all'
  const visibleBooks = isFiltered || expanded
    ? filteredBooks
    : filteredBooks.slice(0, BOOKS_INITIAL)
  const hasMore = !isFiltered && filteredBooks.length > BOOKS_INITIAL

  function handleFilterChange(filter: BookCategory) {
    setActiveFilter(filter)
    setExpanded(false)
    setOpenBookIdx(null)
  }

  function handleToggleExpanded() {
    setExpanded((prev) => !prev)
    setOpenBookIdx(null)
  }

  function handleBookOpenChange(globalIdx: number, isOpen: boolean) {
    if (isOpen) {
      playBookClick()
      setOpenBookIdx(globalIdx)
    } else {
      setOpenBookIdx(null)
    }
  }

  return (
    <section
      id="sec-books"
      className="text-left"
      style={{ padding: '64px 24px', borderBottom: 'none' }}
    >
      {/* Section title */}
      <h2
        className="font-pixel text-[32px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}
      >
        Books I&apos;m loving
      </h2>
      <p
        className="text-[15px] text-text-secondary leading-[1.5]"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40 }}
      >
        My shelf and my learnings.
      </p>

      {/* Filter pills */}
      <div
        className="flex flex-wrap gap-2"
        style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 16 }}
      >
        {FILTERS.map((f) => (
          <FilterPill
            key={f.value}
            active={activeFilter === f.value}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </FilterPill>
        ))}
      </div>

      {/* Cover grid */}
      <div
        className={cn(
          'grid gap-3',
          'grid-cols-4',
          'max-[480px]:grid-cols-3',
        )}
        style={{ maxWidth: 520, margin: '0 auto' }}
      >
        {visibleBooks.map((book, i) => {
          // Find the global index so we can track open state correctly
          const globalIdx = KINDLE_BOOKS.indexOf(book)
          const isOpen = openBookIdx === globalIdx

          return (
            <motion.div
              key={globalIdx}
              className="relative book-cover-item"
              style={{ zIndex: isOpen ? 50 : undefined }}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '0px 0px -40px 0px' }}
              transition={{ duration: 0.45, ease: EASE_SMOOTH }}
            >
            <BookPopover
              book={book}
              open={isOpen}
              onOpenChange={(isOpen) => handleBookOpenChange(globalIdx, isOpen)}
            >
              <BookCover
                book={book}
                active={isOpen}
              />
            </BookPopover>
            </motion.div>
          )
        })}
      </div>

      {/* Show more / show less */}
      {hasMore && (
        <div className="mt-4 text-center" style={{ maxWidth: 520, margin: '16px auto 0' }}>
          <ShowMoreButton
            expanded={expanded}
            onClick={handleToggleExpanded}
          >
            {expanded ? 'Show fewer books' : 'Show more books'}
          </ShowMoreButton>
        </div>
      )}
    </section>
  )
}
