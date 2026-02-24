'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'
import { useMatchMedia } from '@/hooks/useMatchMedia'

interface ProjectModalProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

const TILT_MAX = 0.6

export function ProjectModal({ project, open, onClose }: ProjectModalProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')
  const [slideIdx, setSlideIdx] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)
  const modalCardRef = useRef<HTMLDivElement>(null)
  const [scrollFade, setScrollFade] = useState({ top: false, bottom: false })

  // 3D tilt state refs (mutable, not triggering re-renders)
  const tiltRef = useRef({ rx: 0, ry: 0, targetRX: 0, targetRY: 0, velRX: 0, velRY: 0 })
  const tiltRaf = useRef<number | null>(null)

  // Reset carousel on open, pause videos on close
  useEffect(() => {
    if (open) {
      setSlideIdx(0)
    } else {
      // Pause and unload videos on close (matches Astro behavior)
      if (modalCardRef.current) {
        modalCardRef.current.querySelectorAll('video').forEach((v) => {
          try { v.pause(); v.removeAttribute('src'); v.load() } catch { /* */ }
        })
      }
    }
  }, [open])

  // 3D tilt effect (desktop only, respects reduced motion)
  useEffect(() => {
    if (!open || isMobile) return
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    if (reducedMotion) return
    const card = modalCardRef.current
    if (!card) return

    const t = tiltRef.current
    t.rx = 0; t.ry = 0; t.targetRX = 0; t.targetRY = 0; t.velRX = 0; t.velRY = 0

    function tiltLoop() {
      if (!open) { tiltRaf.current = null; return }
      const fx = (t.targetRX - t.rx) * 0.06
      const fy = (t.targetRY - t.ry) * 0.06
      t.velRX = (t.velRX + fx) * 0.75
      t.velRY = (t.velRY + fy) * 0.75
      t.rx += t.velRX
      t.ry += t.velRY
      if (card) {
        card.style.transform = `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`
      }
      tiltRaf.current = requestAnimationFrame(tiltLoop)
    }

    function onMouseMove(e: MouseEvent) {
      if (!card) return
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      t.targetRY = dx * TILT_MAX
      t.targetRX = -dy * TILT_MAX
    }

    // Start tilt loop after scale-in
    const startTimer = setTimeout(() => {
      tiltRaf.current = requestAnimationFrame(tiltLoop)
    }, 250)

    window.addEventListener('mousemove', onMouseMove)
    return () => {
      clearTimeout(startTimer)
      window.removeEventListener('mousemove', onMouseMove)
      if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current)
      tiltRaf.current = null
      if (card) card.style.transform = ''
    }
  }, [open, isMobile])

  // Determine if image-only (no description, no link, has external link or coming soon)
  const hasBody = project && (project.desc || (project.link && project.link !== '#' && !project.comingSoon))
  const totalSlides = project ? (project.images?.length || project.slides.length) : 0

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setSlideIdx((prev) => Math.max(0, prev - 1))
      else if (e.key === 'ArrowRight') setSlideIdx((prev) => Math.min(totalSlides - 1, prev + 1))
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, totalSlides, onClose])

  // Scroll fade detection
  const checkScrollFade = useCallback(() => {
    const el = bodyRef.current
    if (!el) return
    const atTop = el.scrollTop <= 2
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    setScrollFade({ top: !atTop, bottom: !atBottom && el.scrollHeight > el.clientHeight + 4 })
  }, [])

  useEffect(() => {
    if (!open || !hasBody) return
    const timer = setTimeout(checkScrollFade, 100)
    return () => clearTimeout(timer)
  }, [open, hasBody, checkScrollFade])

  if (!project) return null

  // Determine media for each slide
  const mediaItems = project.images ?? []
  const slideColors = project.slides

  function getDescParagraphs(): string[] {
    if (!project || !project.desc) return []
    return Array.isArray(project.desc) ? [...project.desc] : [project.desc]
  }

  const carousel = (
    <div
      className="relative w-full overflow-hidden shrink-0"
      style={{
        height: hasBody ? 320 : '100%',
        flex: hasBody ? 'none' : 1,
        background: 'var(--color-bg)',
      }}
    >
      {/* Track */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${slideIdx * 100}%)`,
          transition: 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => {
          const mediaPath = mediaItems[i]
          const color = slideColors[i] ?? slideColors[0]
          const isVideo = mediaPath?.endsWith('.mp4')
          const isSingle = totalSlides === 1

          return (
            <div key={i} className={cn('min-w-full h-full', isSingle && 'single-media')}>
              {mediaPath ? (
                isVideo ? (
                  <video
                    src={mediaPath}
                    loop
                    muted
                    playsInline
                    autoPlay={open}
                    className="w-full h-full block select-none"
                    style={{ objectFit: isSingle ? 'contain' : 'cover' }}
                    draggable={false}
                  />
                ) : (
                  <img
                    src={mediaPath}
                    alt={`${project.title} slide ${i + 1}`}
                    className="w-full h-full block select-none"
                    style={{ objectFit: isSingle ? 'contain' : 'cover' }}
                    draggable={false}
                  />
                )
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: color }}
                >
                  {project.comingSoon && (
                    <span className="font-sans text-[15px] font-medium text-white/50 tracking-[0.02em]">
                      Coming soon
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Counter */}
      {totalSlides > 1 && (
        <div
          className="absolute top-3 left-3 font-mono text-[12px] font-semibold tracking-[0.04em] text-white/80 px-2.5 py-1 rounded-xl"
          style={{
            background: 'rgba(58,54,50,0.4)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          {slideIdx + 1}/{totalSlides}
        </div>
      )}

      {/* Nav buttons */}
      {totalSlides > 1 && (
        <>
          <button
            disabled={slideIdx === 0}
            onClick={() => setSlideIdx((p) => Math.max(0, p - 1))}
            className="carousel-nav-btn absolute top-1/2 left-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 text-white/85"
            style={{
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
              opacity: slideIdx === 0 ? 0.2 : 0.45,
              transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 2 2 8 8 14"/></svg>
          </button>
          <button
            disabled={slideIdx === totalSlides - 1}
            onClick={() => setSlideIdx((p) => Math.min(totalSlides - 1, p + 1))}
            className="carousel-nav-btn absolute top-1/2 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 text-white/85"
            style={{
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
              opacity: slideIdx === totalSlides - 1 ? 0.2 : 0.45,
              transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 2 8 8 2 14"/></svg>
          </button>
        </>
      )}

      {/* Case study link overlay */}
      {project.link && project.link !== '#' && !project.comingSoon && (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[14px] left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-[12px] text-text-primary font-sans text-[13px] font-medium tracking-[0.01em] no-underline whitespace-nowrap"
          style={{
            background: 'rgba(237,234,230,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'background 0.15s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          View full case study
          <svg className="inline ml-1 -mt-0.5" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L12 4"/><path d="M5 4h7v7"/></svg>
        </a>
      )}
    </div>
  )

  const body = hasBody ? (
    <div
      ref={bodyRef}
      onScroll={checkScrollFade}
      className={cn(
        'flex-1 overflow-y-auto min-h-0',
        scrollFade.bottom && !scrollFade.top && 'modal-body-fade-bottom',
        scrollFade.top && !scrollFade.bottom && 'modal-body-fade-top',
        scrollFade.top && scrollFade.bottom && 'modal-body-fade-both',
      )}
      style={{ padding: isMobile ? '20px 20px 32px' : '24px 28px 28px' }}
    >
      {/* Title and tags only visible on first slide */}
      <div style={{ display: slideIdx === 0 ? undefined : 'none' }}>
        <h3 className="font-pixel text-[22px] font-normal text-text-primary tracking-[-0.02em] mb-3">
          {project.title}
        </h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-[8px] font-mono text-[12px] font-semibold tracking-[0.04em] uppercase text-text-secondary"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {tag}
            </span>
          ))}
          {project.link && project.link !== '#' && !project.comingSoon && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-[8px] font-mono text-[12px] font-semibold tracking-[0.04em] uppercase no-underline inline-flex items-center gap-1 text-accent"
              style={{
                background: 'var(--color-accent-subtle)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'background 0.15s cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              Case Study
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L12 4"/><path d="M5 4h7v7"/></svg>
            </a>
          )}
        </div>
      </div>
      {getDescParagraphs().length > 0 && (
        <div className="text-[14px] leading-[1.65] text-text-secondary">
          {getDescParagraphs().map((p, i) => (
            <p key={i} className={i < getDescParagraphs().length - 1 ? 'mb-3' : ''}>
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  ) : null

  // Mobile: bottom sheet style
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className="p-0 [&>div:first-child]:hidden"
          style={{
            maxHeight: 'calc(100dvh - 48px)',
            background: '#EDEAE6',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          {/* Sheet handle */}
          <div className="w-8 h-1 bg-black/15 rounded-full mx-auto mt-2.5 mb-0" />
          <div
            className="flex flex-col overflow-hidden"
            style={{
              maxHeight: 'calc(100dvh - 72px)',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="relative w-full overflow-hidden shrink-0" style={{ height: hasBody ? 220 : 'min(75dvh, 480px)' }}>
              {carousel}
            </div>
            {body}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Desktop: centered modal
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="w-[min(560px,90vw)] rounded-2xl p-0"
        style={{
          maxHeight: '85vh',
          background: '#EDEAE6',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <DialogTitle className="sr-only">{project.title}</DialogTitle>
        <div
          ref={modalCardRef}
          data-modal-card
          className="rounded-2xl overflow-hidden flex flex-col relative"
          style={{
            height: hasBody ? 'min(85vh, 520px)' : 'min(85vh, 520px)',
            maskImage: 'radial-gradient(white, black)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            willChange: 'transform',
          }}
        >
          {carousel}
          {body}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="modal-close-btn absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 text-white/85 text-[13px] z-10"
          style={{
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: 0.45,
            transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          ✕
        </button>
      </DialogContent>
    </Dialog>
  )
}
