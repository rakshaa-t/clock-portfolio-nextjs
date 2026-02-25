'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Project } from '@/types'
import { useMatchMedia } from '@/hooks/useMatchMedia'

interface ProjectModalProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

const TILT_MAX = 0.6
const PLACEHOLDER_DESC =
  'A detailed case study for this project is coming soon. Check back for an in-depth look at the design process, challenges, and outcomes.'

export function ProjectModal({ project, open, onClose }: ProjectModalProps) {
  const isMobile = useMatchMedia('(max-width: 480px)')
  const [slideIdx, setSlideIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalCardRef = useRef<HTMLDivElement>(null)
  const carouselScrollRef = useRef<HTMLDivElement>(null)
  const descWrapRef = useRef<HTMLDivElement>(null)
  const [descFade, setDescFade] = useState({ top: false, bottom: false })

  // 3D tilt state refs
  const tiltRef = useRef({ rx: 0, ry: 0, targetRX: 0, targetRY: 0, velRX: 0, velRY: 0 })
  const tiltRaf = useRef<number | null>(null)
  const tiltRect = useRef({ cx: 0, cy: 0, w: 0, h: 0 })
  const openRef = useRef(false)

  // Mount portal on client
  useEffect(() => { setMounted(true) }, [])

  // Keep openRef in sync
  useEffect(() => { openRef.current = open }, [open])

  // Reset on open, cleanup on close
  useEffect(() => {
    if (open) {
      setSlideIdx(0)
      document.body.style.overflow = 'hidden'
      // Reset carousel scroll
      if (carouselScrollRef.current) carouselScrollRef.current.scrollLeft = 0
      // Reset desc scroll
      if (descWrapRef.current) {
        descWrapRef.current.scrollTop = 0
        setDescFade({ top: false, bottom: false })
      }
      // Check desc overflow after render
      requestAnimationFrame(() => {
        if (descWrapRef.current) {
          const hasOverflow = descWrapRef.current.scrollHeight > descWrapRef.current.clientHeight + 4
          setDescFade({ top: false, bottom: hasOverflow })
        }
      })
    } else {
      document.body.style.overflow = ''
      // Pause and unload carousel videos
      if (carouselScrollRef.current) {
        carouselScrollRef.current.querySelectorAll('video').forEach((v) => {
          try { v.pause(); v.removeAttribute('src'); v.load() } catch { /* */ }
        })
      }
      // Cancel tilt
      if (tiltRaf.current) { cancelAnimationFrame(tiltRaf.current); tiltRaf.current = null }
      if (modalCardRef.current) {
        modalCardRef.current.style.transform = ''
        modalCardRef.current.style.willChange = ''
      }
    }
  }, [open])

  // ── 3D Tilt (desktop only) ──
  useEffect(() => {
    if (!open || isMobile) return
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) return
    const card = modalCardRef.current
    if (!card) return

    const t = tiltRef.current
    t.rx = 0; t.ry = 0; t.targetRX = 0; t.targetRY = 0; t.velRX = 0; t.velRY = 0
    card.style.willChange = 'transform'

    function updateTiltRect() {
      if (!card) return
      const saved = card.style.transform
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
      const r = card.getBoundingClientRect()
      card.style.transform = saved
      tiltRect.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height }
    }

    function tiltLoop() {
      if (!openRef.current) { tiltRaf.current = null; return }
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

    function onMouseEnter() { updateTiltRect() }
    function onMouseMove(e: MouseEvent) {
      if (!tiltRect.current.w) updateTiltRect()
      const nx = (e.clientX - tiltRect.current.cx) / tiltRect.current.w
      const ny = (e.clientY - tiltRect.current.cy) / tiltRect.current.h
      t.targetRY = nx * TILT_MAX * 2
      t.targetRX = -ny * TILT_MAX * 2
    }
    function onMouseLeave() { t.targetRX = 0; t.targetRY = 0 }

    // Start tilt after CSS scale-in transition ends
    function onTransitionEnd(e: TransitionEvent) {
      if (e.target !== card || e.propertyName !== 'transform') return
      card!.removeEventListener('transitionend', onTransitionEnd)
      if (openRef.current && !tiltRaf.current) {
        tiltRaf.current = requestAnimationFrame(tiltLoop)
      }
    }
    card.addEventListener('transitionend', onTransitionEnd)
    card.addEventListener('mouseenter', onMouseEnter)
    card.addEventListener('mousemove', onMouseMove)
    card.addEventListener('mouseleave', onMouseLeave)

    return () => {
      card.removeEventListener('transitionend', onTransitionEnd)
      card.removeEventListener('mouseenter', onMouseEnter)
      card.removeEventListener('mousemove', onMouseMove)
      card.removeEventListener('mouseleave', onMouseLeave)
      if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current)
      tiltRaf.current = null
      card.style.transform = ''
      card.style.willChange = ''
    }
  }, [open, isMobile])

  // ── Snap-scroll slide observer ──
  useEffect(() => {
    if (!open || !carouselScrollRef.current) return
    const scroll = carouselScrollRef.current
    const slides = scroll.querySelectorAll('.carousel-slide')
    if (!slides.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = [...slides].indexOf(entry.target as Element)
            if (idx >= 0) setSlideIdx(idx)
          }
        }
      },
      { root: scroll, threshold: 0.6 }
    )
    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [open, project])

  // ── Keyboard nav ──
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') { scrollToSlide(slideIdx + 1); return }
      if (e.key === 'ArrowLeft') { scrollToSlide(slideIdx - 1); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slideIdx, onClose])

  // ── Description scroll fade ──
  const checkDescFade = useCallback(() => {
    const el = descWrapRef.current
    if (!el) return
    const atTop = el.scrollTop <= 2
    const hasOverflow = el.scrollHeight > el.clientHeight + 4
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 4
    setDescFade({ top: !atTop, bottom: hasOverflow && !atBottom })
  }, [])

  // ── Scroll carousel to slide ──
  function scrollToSlide(idx: number) {
    if (!carouselScrollRef.current || !project) return
    const total = (project.images?.length || project.slides.length)
    const clamped = Math.max(0, Math.min(total - 1, idx))
    const slides = carouselScrollRef.current.querySelectorAll('.carousel-slide')
    const slide = slides[clamped] as HTMLElement
    if (!slide) return
    // Custom smooth scroll
    const startLeft = carouselScrollRef.current.scrollLeft
    const targetLeft = slide.offsetLeft
    const diff = targetLeft - startLeft
    if (Math.abs(diff) < 2) return
    const duration = Math.min(400, Math.max(200, Math.abs(diff) * 0.4))
    const startTime = performance.now()
    function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      if (carouselScrollRef.current) {
        carouselScrollRef.current.scrollLeft = startLeft + diff * easeOut(progress)
      }
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  if (!mounted || !project) return null

  const isComingSoon = !!project.comingSoon
  const slides = project.images ?? []
  const slideColors = project.slides
  const totalSlides = slides.length || slideColors.length
  const hideNav = isComingSoon || totalSlides <= 1
  const hasLink = project.link && project.link !== '#' && !isComingSoon

  // Description paragraphs (or placeholder)
  function getDesc(): string[] {
    if (!project!.desc) return [PLACEHOLDER_DESC]
    if (Array.isArray(project!.desc)) {
      const d = project!.desc[slideIdx] || project!.desc[0]
      return d.split('\n\n')
    }
    return (project!.desc as string).split('\n\n')
  }

  // ── Fade mask for desc wrap ──
  function getDescMask(): string | undefined {
    if (descFade.top && descFade.bottom) {
      return 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 8px, rgba(0,0,0,0.85) 16px, #000 28px, #000 calc(100% - 28px), rgba(0,0,0,0.85) calc(100% - 16px), rgba(0,0,0,0.4) calc(100% - 8px), transparent 100%)'
    }
    if (descFade.top) {
      return 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 8px, rgba(0,0,0,0.85) 16px, #000 28px, #000 100%)'
    }
    if (descFade.bottom) {
      return 'linear-gradient(to bottom, #000 0%, #000 calc(100% - 28px), rgba(0,0,0,0.85) calc(100% - 16px), rgba(0,0,0,0.4) calc(100% - 8px), transparent 100%)'
    }
    return undefined
  }

  const modal = (
    <div
      ref={overlayRef}
      className={`modal-overlay ${open ? 'open' : ''}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: isMobile ? 'stretch' : 'center',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: isMobile ? 'rgba(0,0,0,0.5)' : 'rgba(58,54,50,0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal card */}
      <div
        ref={modalCardRef}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          width: isMobile ? '100%' : 'min(640px, 92vw)',
          maxHeight: isMobile ? '100dvh' : 'min(85vh, 800px)',
          background: '#EDEAE6',
          borderRadius: isMobile ? 0 : 20,
          boxShadow: isMobile ? 'none' : '0 16px 16px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : (isMobile ? 'scale(0.97)' : 'scale(0.95)'),
          isolation: 'isolate',
          transition: isMobile
            ? 'opacity 0.25s cubic-bezier(0.32,0.72,0,1), transform 0.25s cubic-bezier(0.32,0.72,0,1)'
            : 'opacity 0.2s cubic-bezier(0.32,0.72,0,1), transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Inner container (clips content) */}
        <div
          className={isComingSoon ? 'coming-soon' : ''}
          style={{
            borderRadius: isMobile ? 0 : 20,
            overflow: 'hidden',
            height: isMobile ? '100dvh' : 'min(85vh, 800px)',
            maxHeight: isMobile ? '100dvh' : undefined,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            maskImage: 'radial-gradient(white, black)',
            paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
          }}
        >
          {/* ── Carousel ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              flexShrink: 0,
              ...(isMobile
                ? { height: '90vw', flex: '0 0 auto' }
                : { aspectRatio: '5/4' }
              ),
              overflow: 'hidden',
              background: 'var(--color-bg)',
            }}
          >
            {/* Scroll container — snap-scroll like Astro */}
            <div
              ref={carouselScrollRef}
              style={{
                display: 'flex',
                height: '100%',
                padding: 0,
                gap: 0,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {isComingSoon ? (
                <div className="carousel-slide" style={{ minWidth: isMobile ? '100vw' : '100%', height: '100%', scrollSnapAlign: isMobile ? 'center' : 'start', flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: slideColors[0] }}>
                    <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>
                      I&apos;m working on it
                    </span>
                  </div>
                </div>
              ) : (
                Array.from({ length: totalSlides }).map((_, i) => {
                  const mediaPath = slides[i]
                  const color = slideColors[i] ?? slideColors[0]
                  const isVideo = mediaPath?.endsWith('.mp4')

                  return (
                    <div
                      key={i}
                      className="carousel-slide"
                      style={{
                        minWidth: isMobile ? '100vw' : '100%',
                        width: isMobile ? '100vw' : undefined,
                        height: '100%',
                        scrollSnapAlign: isMobile ? 'center' : 'start',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {mediaPath ? (
                        isVideo ? (
                          <video
                            src={mediaPath}
                            autoPlay
                            muted
                            playsInline
                            preload="metadata"
                            style={{
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'center',
                              userSelect: 'none',
                            }}
                            draggable={false}
                          />
                        ) : (
                          <img
                            src={mediaPath}
                            alt={`${project.title} slide ${i + 1}`}
                            loading={i < 2 ? 'eager' : 'lazy'}
                            style={{
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'center',
                              userSelect: 'none',
                            }}
                            draggable={false}
                          />
                        )
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color }}>
                          <span style={{ fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                            {i === 0 ? project.title.substring(0, 2).toUpperCase() : `IMG ${i + 1}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Counter */}
            {totalSlides > 1 && !isComingSoon && (
              <div
                style={{
                  position: 'absolute', top: 12, left: 12, zIndex: 5,
                  background: 'rgba(58,54,50,0.4)',
                  color: 'rgba(255,255,255,0.8)',
                  padding: '4px 10px', borderRadius: 12,
                  fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                {slideIdx + 1} / {totalSlides}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="modal-close-btn"
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.25)', border: 'none',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 13, color: 'rgba(255,255,255,0.85)',
                opacity: isMobile ? 1 : 0.45,
                transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1), background 0.2s cubic-bezier(0.32,0.72,0,1), transform 0.2s cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              ✕
            </button>

            {/* Carousel nav buttons */}
            {!hideNav && (
              <>
                <button
                  className="carousel-nav-btn"
                  onClick={() => scrollToSlide(slideIdx - 1)}
                  disabled={slideIdx === 0}
                  aria-label="Previous slide"
                  style={{
                    position: 'absolute', top: '50%', left: 16, zIndex: 5,
                    transform: 'translateY(-50%)',
                    width: isMobile ? 30 : 32, height: isMobile ? 30 : 32,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.25)', border: 'none',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: slideIdx === 0 ? 'default' : 'pointer',
                    color: 'rgba(255,255,255,0.85)',
                    opacity: slideIdx === 0 ? 0.2 : 0.45,
                    pointerEvents: slideIdx === 0 ? 'none' : 'auto',
                    transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1), background 0.2s cubic-bezier(0.32,0.72,0,1), transform 0.2s cubic-bezier(0.32,0.72,0,1)',
                  }}
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 2 2 8 8 14" /></svg>
                </button>
                <button
                  className="carousel-nav-btn"
                  onClick={() => scrollToSlide(slideIdx + 1)}
                  disabled={slideIdx === totalSlides - 1}
                  aria-label="Next slide"
                  style={{
                    position: 'absolute', top: '50%', right: 16, zIndex: 5,
                    transform: 'translateY(-50%)',
                    width: isMobile ? 30 : 32, height: isMobile ? 30 : 32,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.25)', border: 'none',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: slideIdx === totalSlides - 1 ? 'default' : 'pointer',
                    color: 'rgba(255,255,255,0.85)',
                    opacity: slideIdx === totalSlides - 1 ? 0.2 : 0.45,
                    pointerEvents: slideIdx === totalSlides - 1 ? 'none' : 'auto',
                    transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1), background 0.2s cubic-bezier(0.32,0.72,0,1), transform 0.2s cubic-bezier(0.32,0.72,0,1)',
                  }}
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 2 8 8 2 14" /></svg>
                </button>
              </>
            )}
          </div>

          {/* ── Modal Body ── */}
          <div
            style={{
              padding: isMobile ? '20px 20px 32px' : '20px 24px 24px',
              flexShrink: 0,
              overflowY: isMobile ? 'auto' : undefined,
              flex: isMobile ? 1 : undefined,
              minHeight: 0,
            }}
          >
            {/* Meta — title + tags link */}
            <div style={{ marginBottom: 16 }}>
              <h3
                style={{
                  fontFamily: "'GeistPixel', sans-serif",
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 400,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}
              >
                {project.title}
              </h3>

              {/* Tags area — only show case study link, matching Astro */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {hasLink && (
                  <a
                    href={project.link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-tag-link"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 12, fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-subtle)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: 'background 0.15s cubic-bezier(0.32,0.72,0,1)',
                    }}
                  >
                    View full case study
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L12 4" /><path d="M5 4h7v7" /></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Description wrap — scrollable with fade masks */}
            <div
              ref={descWrapRef}
              onScroll={checkDescFade}
              style={{
                paddingTop: 16,
                borderTop: '1px solid rgba(0,0,0,0.08)',
                maxHeight: isMobile ? 'none' : 200,
                overflowY: isMobile ? undefined : 'auto',
                maskImage: getDescMask(),
                WebkitMaskImage: getDescMask(),
              }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                {getDesc().map((p, i) => (
                  <p key={i} style={{ marginBottom: i < getDesc().length - 1 ? 12 : 0 }}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
