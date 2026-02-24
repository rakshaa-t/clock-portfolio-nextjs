'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

function DialogOverlay({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Overlay>>
}) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-200',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Content>>
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Base styles
          'fixed z-50 bg-bg-raised overflow-y-auto outline-none',
          'shadow-[var(--shadow-deep)]',

          // Desktop: centered card
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'max-w-[520px] w-[90vw] max-h-[85vh]',
          'rounded-2xl p-6',

          // Animations — desktop (scale + fade)
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'duration-200',

          // Mobile: bottom sheet positioning
          'max-[480px]:top-auto max-[480px]:bottom-0 max-[480px]:left-0 max-[480px]:right-0',
          'max-[480px]:translate-x-0 max-[480px]:translate-y-0',
          'max-[480px]:w-full max-[480px]:max-w-full',
          'max-[480px]:max-h-[calc(100dvh-48px)]',
          'max-[480px]:rounded-t-2xl max-[480px]:rounded-b-none',

          // Mobile: slide-up animation override
          'max-[480px]:data-[state=open]:slide-in-from-bottom-full max-[480px]:data-[state=open]:slide-in-from-left-0 max-[480px]:data-[state=open]:slide-in-from-top-0',
          'max-[480px]:data-[state=closed]:slide-out-to-bottom-full max-[480px]:data-[state=closed]:slide-out-to-left-0 max-[480px]:data-[state=closed]:slide-out-to-top-0',
          'max-[480px]:data-[state=open]:zoom-in-100 max-[480px]:data-[state=closed]:zoom-out-100',

          className,
        )}
        {...props}
      >
        {/* Sheet handle for mobile */}
        <div className="mx-auto mb-4 hidden h-1 w-10 shrink-0 rounded-full bg-text-muted/40 max-[480px]:block" />
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Title>>
}) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-text-primary',
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Description>>
}) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
