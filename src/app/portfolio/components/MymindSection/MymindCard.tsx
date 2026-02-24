'use client'

import { useRef } from 'react'
import Image from 'next/image'
import type { MymindCard as MymindCardType } from '@/types'
import { cn } from '@/lib/utils'

type MymindCardProps = {
  card: MymindCardType
  active?: boolean
  onClick?: (el: HTMLElement) => void
  className?: string
}

function MymindCard({ card, active, onClick, className }: MymindCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onClick={() => {
        if (ref.current && onClick) onClick(ref.current)
      }}
      className={cn(
        'block rounded-xl overflow-hidden cursor-pointer relative no-underline',
        'transition-[transform,box-shadow] duration-200',
        'ease-[cubic-bezier(0.32,0.72,0,1)]',
        'hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]',
        'active:scale-[0.97] active:duration-100',
        active && 'mm-card-active',
        className,
      )}
    >
      {card.type === 'image' && <ImageCard card={card} />}
      {card.type === 'note' && <NoteCard card={card} />}
      {card.type === 'link' && <LinkCard card={card} />}
    </div>
  )
}

/* ─── Image variant ─── */

function ImageCard({ card }: { card: Extract<MymindCardType, { type: 'image' }> }) {
  return (
    <div className="bg-white border border-black/[0.04] p-2">
      <div
        className="w-full rounded-[8px] overflow-hidden bg-cover"
        style={{ height: card.height ?? 120 }}
      >
        {card.img ? (
          <Image
            src={card.img}
            alt={card.caption}
            width={480}
            height={card.height ?? 120}
            className="w-full h-full object-cover block rounded-[8px]"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full rounded-[8px]"
            style={{ background: card.color ?? '#333' }}
          />
        )}
      </div>
      <div className="font-sans text-xs text-black/[0.62] pt-2 px-1 pb-1 truncate">
        {card.caption}
      </div>
    </div>
  )
}

/* ─── Note variant ─── */

function NoteCard({ card }: { card: Extract<MymindCardType, { type: 'note' }> }) {
  return (
    <div className="bg-[#FFFEF8] p-3 border border-black/[0.04]">
      <p className="font-sans text-xs text-black/[0.62] leading-[1.5] italic whitespace-pre-line">
        {card.text}
      </p>
      {card.author && (
        <span className="font-sans text-xs text-black/[0.48] mt-2 block">
          &mdash; {card.author}
        </span>
      )}
    </div>
  )
}

/* ─── Link variant ─── */

function LinkCard({ card }: { card: Extract<MymindCardType, { type: 'link' }> }) {
  return (
    <div className="bg-white p-3 border border-black/[0.05]">
      <div className="text-xs mb-1 w-6 h-6 flex items-center justify-center bg-black/[0.03] rounded-[8px]">
        {card.icon}
      </div>
      <div className="font-sans text-xs font-semibold text-[#1A1A1A] mb-1 leading-[1.3]">
        {card.linkTitle}
      </div>
      <div className="font-sans text-xs text-black/[0.55] leading-[1.4]">
        {card.linkDesc}
      </div>
    </div>
  )
}

export { MymindCard }
export type { MymindCardProps }
