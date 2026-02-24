'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type ShowMoreButtonProps = {
  expanded?: boolean
  children?: React.ReactNode
  className?: string
} & React.ComponentPropsWithoutRef<'button'>

function ShowMoreButton({
  expanded = false,
  className,
  children,
  ...props
}: ShowMoreButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'text-sm font-mono',
        'text-text-secondary',
        'hover:text-accent',
        'transition-colors duration-150',
        'cursor-pointer select-none outline-none',
        'active:scale-[0.97]',
        className,
      )}
      aria-expanded={expanded}
      {...props}
    >
      {children ?? (expanded ? 'Show less' : 'Show more')}
    </button>
  )
}

export { ShowMoreButton }
export type { ShowMoreButtonProps }
