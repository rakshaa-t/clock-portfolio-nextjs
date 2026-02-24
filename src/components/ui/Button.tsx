'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles shared by all variants
  [
    'inline-flex items-center justify-center gap-2',
    'cursor-pointer select-none outline-none',
    'transition-all duration-200 ease-[var(--ease-smooth)]',
    'active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'rounded-xl px-5 py-2.5 text-sm font-semibold text-white',
          'bg-gradient-to-b from-[#8B7EC8] to-[#6C5CA8]',
          'shadow-[0_2px_0_0_#5A4C96,0_4px_12px_rgba(108,92,168,0.3)]',
          // Pressed 3D compression
          'active:translate-y-[1px]',
          'active:shadow-[0_1px_0_0_#5A4C96,0_2px_6px_rgba(108,92,168,0.2)]',
          // Hover glow
          'hover:shadow-[0_2px_0_0_#5A4C96,0_6px_20px_rgba(108,92,168,0.4)]',
          // Top highlight for 3D effect
          'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-white/25 before:rounded-t-xl',
          'relative overflow-hidden',
        ],
        secondary: [
          'h-8 w-8 rounded-full',
          'bg-[radial-gradient(circle_at_30%_30%,#F5F0E8,#E8E2D8)]',
          'shadow-[var(--shadow-object)]',
          'border border-black/[0.04]',
          // Hover lift
          'hover:-translate-y-0.5',
          'hover:shadow-[var(--shadow-object-hover)]',
          // Press
          'active:translate-y-0',
          'active:shadow-[var(--shadow-object-pressed)]',
        ],
        ghost: [
          'rounded-[8px] px-2 py-1 text-sm font-medium',
          'text-text-secondary bg-transparent',
          'hover:text-accent',
          'hover:bg-accent-subtle',
        ],
      },
      size: {
        default: '',
        sm: 'text-xs px-3 py-1.5',
        lg: 'text-base px-6 py-3',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

type ButtonProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
