'use client'

import { cn } from '@/lib/utils'
import type { Book } from '@/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui'
import { useMatchMedia } from '@/hooks/useMatchMedia'

// ═══ Shared book detail content ═══

function BookDetailContent({ book }: { book: Book }) {
  const isFav = book.fav
  const isDone = !isFav && book.progress === 100

  return (
    <div className="text-left">
      {/* Title + close handled by popover/drawer wrappers */}
      <div className="mb-3">
        <p className="text-[15px] font-semibold leading-[1.3] text-text-primary">
          {book.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[12px] text-text-secondary">
            by {book.author}
          </span>
          {isFav && (
            <span
              className={cn(
                'inline-block rounded px-2.5 py-1',
                'font-mono text-[12px] font-semibold uppercase tracking-[0.04em]',
                'border border-[rgba(192,57,43,0.15)] bg-[rgba(192,57,43,0.1)] text-[#C0392B]',
              )}
            >
              Excellent
            </span>
          )}
          {isDone && (
            <span
              className={cn(
                'inline-block rounded px-2.5 py-1',
                'font-mono text-[12px] font-semibold uppercase tracking-[0.04em]',
                'border border-[rgba(139,126,200,0.15)] bg-[rgba(139,126,200,0.12)] text-[#8B7EC8]',
              )}
            >
              Great
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-black/[0.06]">
          <div
            className="h-full rounded-sm bg-[#8B7EC8] transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${book.progress}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-[12px] text-text-muted">
          {book.progress}%
        </span>
      </div>

      {/* Highlights / notes */}
      {book.notes.length > 0 && (
        <div className="max-h-[180px] overflow-y-auto border-t border-black/[0.05] pt-2.5 mt-1">
          {book.notes.map((n, i) => (
            <div
              key={i}
              className={cn(
                'py-2 text-[12px] leading-[1.55] text-text-secondary',
                i < book.notes.length - 1 && 'border-b border-black/[0.04]',
                '[&_mark]:rounded-[2px] [&_mark]:bg-[rgba(139,126,200,0.15)] [&_mark]:px-[2px] [&_mark]:py-[1px] [&_mark]:text-text-primary',
              )}
              dangerouslySetInnerHTML={{ __html: n.note }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══ BookPopover — desktop popover / mobile drawer ═══

type BookPopoverProps = {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function BookPopover({
  book,
  open,
  onOpenChange,
  children,
}: BookPopoverProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="sr-only">{book.title}</DrawerTitle>
          <BookDetailContent book={book} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={12}
        collisionPadding={16}
        className={cn(
          'max-w-[280px] w-[280px] rounded-[12px] p-4',
          'bg-white',
          'shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]',
        )}
      >
        <BookDetailContent book={book} />
      </PopoverContent>
    </Popover>
  )
}

export { BookPopover, BookDetailContent }
export type { BookPopoverProps }
