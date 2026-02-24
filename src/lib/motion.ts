import type { Variants, Easing } from 'framer-motion'

/**
 * Shared Framer Motion variants — matching the Astro scroll-effects.js
 *
 * Reveal: opacity 0 → 1, blur 4px → 0, translateY 10px → 0
 * Duration: 450ms, Easing: cubic-bezier(0.32, 0.72, 0, 1)
 * Stagger: 50ms between siblings
 */

export const EASE_SMOOTH: Easing = [0.32, 0.72, 0, 1]

// ═══ Container (stagger children) ═══
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // 50ms stagger
    },
  },
}

// ═══ Scroll reveal item ═══
export const revealItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: EASE_SMOOTH,
    },
  },
}

// ═══ Section heading reveal (no blur, just fade + slide) ═══
export const revealHeading: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_SMOOTH,
    },
  },
}

// ═══ Viewport config ═══
export const VIEWPORT_ONCE = {
  once: true,
  margin: '0px 0px -40px 0px' as const,
}
