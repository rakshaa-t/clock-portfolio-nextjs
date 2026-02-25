'use client'

import { useCallback, useRef, useState } from 'react'
import { PUZZLE_PROJECTS } from '@/data/projects'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'
import { useMatchMedia } from '@/hooks/useMatchMedia'
import { useAudio } from '@/hooks/useAudio'
import { motion } from 'framer-motion'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]
const TILT_MAX = 4 // degrees — matches Astro

interface PuzzleGridProps {
  onCardClick: (project: Project, el: HTMLElement) => void
}

const INITIAL_COUNT = 6

export function PuzzleGrid({ onCardClick }: PuzzleGridProps) {
  const [expanded, setExpanded] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const isMobile = useMatchMedia('(max-width: 480px)')
  const gridRef = useRef<HTMLDivElement>(null)
  const { playNoteClick } = useAudio()

  // 3D tilt on hover (desktop only)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width   // 0→1
    const y = (e.clientY - rect.top) / rect.height    // 0→1
    const rotateY = (x - 0.5) * TILT_MAX * 2
    const rotateX = (0.5 - y) * TILT_MAX * 2
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.01)`
    card.style.transition = 'none'
  }, [isMobile])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transition = ''
    card.style.transform = ''
  }, [])

  const projects = PUZZLE_PROJECTS as readonly Project[]
  const visibleProjects = expanded ? projects : projects.slice(0, INITIAL_COUNT)

  function handleShowMore() {
    if (expanded) {
      // Collapse: hide extra cards, then scroll grid into view
      setCollapsing(true)
      setExpanded(false)
      setTimeout(() => setCollapsing(false), 50)
      // Scroll the grid top into view
      if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      setExpanded(true)
    }
  }

  function handleCardClick(proj: Project, cardEl: HTMLElement) {
    playNoteClick()

    // External link cards — open in new tab (both mobile & desktop)
    if ('externalLink' in proj) {
      if (proj.externalLink) {
        window.open(proj.externalLink, '_blank')
      }
      // Empty externalLink = no-op (non-clickable)
      return
    }

    // All other cards — open modal (both mobile & desktop, matching Astro)
    onCardClick(proj, cardEl)
  }

  return (
    <>
      <div
        ref={gridRef}
        className={cn(
          'grid grid-cols-2 gap-3',
          collapsing && 'puzzle-collapsing',
        )}
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {visibleProjects.map((proj, idx) => {
          const isExtra = idx >= INITIAL_COUNT
          const thumbSrc = proj.thumb ?? null
          const isVideo = thumbSrc?.endsWith('.mp4')
          // Clickable: anything that's not an empty externalLink
          const isClickable = !('externalLink' in proj && !proj.externalLink)

          return (
            <motion.div
              key={proj.title}
              {...(!isExtra ? {
                initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
                whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
                viewport: { once: true, margin: '0px 0px -40px 0px' },
                transition: { duration: 0.45, ease: EASE_SMOOTH },
              } : {})}
            >
            <div
              className={cn(
                'puzzle-card rounded-xl relative overflow-hidden aspect-[4/3]',
                isClickable ? 'cursor-pointer' : 'cursor-default',
                isExtra && expanded && 'puzzle-extra-reveal',
              )}
              style={{
                boxShadow: 'var(--shadow-object)',
                background: '#f0eee9',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.06)',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s cubic-bezier(0.32,0.72,0,1)',
                transformStyle: 'preserve-3d',
                animationDelay: isExtra ? `${(idx - INITIAL_COUNT) * 0.04}s` : undefined,
              }}
              onClick={(e) => isClickable && handleCardClick(proj, e.currentTarget)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Image/video */}
              <div
                className="puzzle-img-wrap w-full h-full transition-transform duration-300"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
              >
                {thumbSrc ? (
                  isVideo ? (
                    <video
                      src={thumbSrc}
                      loop
                      muted
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <img
                      src={thumbSrc}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover block"
                    />
                  )
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: proj.slides[0] }}
                  />
                )}
              </div>

              {/* Hover overlay with title */}
              <div
                className="puzzle-title-overlay absolute bottom-0 left-0 right-0 flex items-center px-3 h-7 z-[3]"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  transform: 'translateY(100%)',
                  transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <span className="font-sans text-[12px] font-medium text-text-primary tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">
                  {proj.title}
                </span>
              </div>

              {/* Specular highlight (desktop only) */}
              {!isMobile && (
                <div
                  className="puzzle-specular absolute inset-0 rounded-xl pointer-events-none z-[2]"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 55%)',
                    transition: 'opacity 0.2s cubic-bezier(0.32,0.72,0,1)',
                  }}
                />
              )}
            </div>
            </motion.div>
          )
        })}
      </div>

      {/* Show more button */}
      {projects.length > INITIAL_COUNT && (
        <button
          onClick={handleShowMore}
          className="block mx-auto mt-8 font-mono text-[12px] font-medium tracking-[0.01em] uppercase py-2 px-5 rounded-xl border-0 cursor-pointer active:scale-[0.97]"
          style={{
            background: 'rgba(0,0,0,0.04)',
            color: 'rgba(0,0,0,0.45)',
            transition: 'background 0.15s cubic-bezier(0.32,0.72,0,1), color 0.15s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          {expanded ? 'Show less' : 'Show more work'}
        </button>
      )}
    </>
  )
}
