'use client'

import { useMemo } from 'react'
import type { MymindCard as MymindCardType } from '@/types'
import { MMIND_CARDS } from '@/data/mymind'
import { MymindCard } from './MymindCard'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useMatchMedia } from '@/hooks/useMatchMedia'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]

type MasonryGridProps = {
  cards: MymindCardType[]
  activeIdx?: number | null
  onCardClick?: (globalIdx: number, el: HTMLElement) => void
  className?: string
}

/**
 * Flex-column masonry layout.
 * Distributes cards into 3 columns on desktop, 2 on mobile (≤480px),
 * using a shortest-column-first algorithm with estimated heights.
 */
function MasonryGrid({ cards, activeIdx, onCardClick, className }: MasonryGridProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')

  const columns = useMemo(() => {
    const colCount = isMobile ? 2 : 3
    const cols: { card: MymindCardType; globalIdx: number }[][] = Array.from({ length: colCount }, () => [])
    const colHeights = new Array(colCount).fill(0)

    cards.forEach((card) => {
      // Find the shortest column
      let shortest = 0
      for (let c = 1; c < colCount; c++) {
        if (colHeights[c] < colHeights[shortest]) shortest = c
      }

      // Find global index in MMIND_CARDS for popover state tracking
      const globalIdx = (MMIND_CARDS as unknown as MymindCardType[]).indexOf(card)
      cols[shortest].push({ card, globalIdx })

      // Estimate card height from data (matches Astro implementation)
      let h = 80
      if (card.type === 'image') h = (card.height ?? 120) + 32
      else if (card.type === 'note') h = Math.max(80, Math.ceil((card.text?.length ?? 0) / 28) * 18 + 40)
      else if (card.type === 'link') h = 85

      colHeights[shortest] += h + 8
    })

    return cols
  }, [cards, isMobile])

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[520px] mx-auto',
        '[&>div]:flex-1 [&>div]:min-w-0',
        className,
      )}
    >
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2">
          {col.map(({ card, globalIdx }, cardIdx) => (
            <motion.div
              key={`${colIdx}-${cardIdx}`}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '0px 0px -40px 0px' }}
              transition={{ duration: 0.45, ease: EASE_SMOOTH }}
            >
              <MymindCard
                card={card}
                active={activeIdx === globalIdx}
                onClick={(el) => onCardClick?.(globalIdx, el)}
              />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}

export { MasonryGrid }
export type { MasonryGridProps }
