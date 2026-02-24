'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type FilterPillProps = {
  active?: boolean
  children?: React.ReactNode
  className?: string
} & React.ComponentPropsWithoutRef<'button'>

function FilterPill({
  active = false,
  className,
  children,
  ...props
}: FilterPillProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center',
        'text-xs font-mono font-medium uppercase tracking-[0.01em]',
        'px-1.5 py-0.5 rounded-xs',
        'cursor-pointer select-none outline-none',
        'transition-colors duration-150',
        'active:scale-[0.97]',

        // Default state
        !active && [
          'text-text-secondary bg-transparent',
          'hover:text-text-primary hover:bg-black/[0.04]',
        ],

        // Active state
        active && [
          'bg-accent text-white',
        ],

        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { FilterPill }
export type { FilterPillProps }
