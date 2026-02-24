'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type TagProps = {
  variant?: 'default' | 'link'
  href?: string
  className?: string
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<'span'>

function Tag({
  variant = 'default',
  href,
  className,
  children,
  ...props
}: TagProps) {
  const classes = cn(
    'inline-flex items-center',
    'text-xs font-semibold tracking-[0.04em]',
    'px-2.5 py-1 rounded-[8px]',
    'border border-black/[0.06]',
    'text-text-primary bg-bg-raised',
    className,
  )

  if (variant === 'link' && href) {
    return (
      <a
        href={href}
        className={cn(
          classes,
          'cursor-pointer no-underline',
          'hover:bg-accent-subtle hover:border-accent/20',
          'transition-colors duration-150',
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export { Tag }
export type { TagProps }
