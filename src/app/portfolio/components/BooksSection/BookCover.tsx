'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { Book } from '@/types'

type BookCoverProps = {
  book: Book
  active?: boolean
  onClick?: () => void
  className?: string
}

function BookCover({ book, active = false, onClick, className }: BookCoverProps) {
  const isFav = book.fav
  const isDone = !isFav && book.progress === 100

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-[6px] outline-none',
        'transition-[transform,box-shadow] duration-200',
        '[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
        'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:z-[2]',
        'active:scale-[0.97]',
        active && 'shadow-[0_0_0_2px_var(--accent),0_4px_12px_rgba(139,126,200,0.15)]',
        'group',
        className,
      )}
    >
      <div className="relative">
        <Image
          src={book.cover}
          alt={book.title}
          width={130}
          height={195}
          className="block w-full rounded-[6px] object-cover"
          style={{ aspectRatio: '2/3' }}
          loading="lazy"
        />

        {/* Badge — fav or done */}
        {(isFav || isDone) && (
          <div
            data-tip={isFav ? 'Excellent' : 'Great'}
            className={cn(
              'book-badge absolute top-1 right-1',
              'flex h-5 w-5 items-center justify-center rounded-full',
              'bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
              'transition-[transform,box-shadow] duration-200',
              '[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
              'group-hover:scale-[1.15] group-hover:shadow-[0_2px_6px_rgba(0,0,0,0.18)]',
              isFav && 'border-[1.5px] border-[rgba(192,57,43,0.2)]',
              isDone && 'border-[1.5px] border-[rgba(139,126,200,0.2)]',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFav ? '#C0392B' : '#8B7EC8'}
              stroke="none"
              width={12}
              height={12}
              className={cn(
                'transition-transform duration-200',
                '[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
                'group-hover:rotate-[15deg] group-hover:scale-[1.1]',
              )}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

export { BookCover }
export type { BookCoverProps }
