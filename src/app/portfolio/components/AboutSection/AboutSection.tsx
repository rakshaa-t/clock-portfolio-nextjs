'use client'

import { useCallback, useState } from 'react'
import { useAudio, ensureAudioCtx } from '@/hooks/useAudio'
import { motion } from 'framer-motion'
import { AboutDropdownTrigger } from './AboutDropdown'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]
import { LocationToggle } from './LocationToggle'
import { StackCards } from './StackCards'

// ═══ Click sound (short noise burst) ═══
function useAboutClickSound() {
  const { soundOn } = useAudio()

  return useCallback(
    (type: 'primary' | 'secondary') => {
      if (!soundOn) return
      try {
        const ctx = ensureAudioCtx()

        const t = ctx.currentTime
        const bufLen = Math.ceil(ctx.sampleRate * 0.015)
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < bufLen; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3)

        const src = ctx.createBufferSource()
        src.buffer = buf
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = type === 'primary' ? 2200 : 3400
        bp.Q.value = type === 'primary' ? 1.2 : 1.8
        const g = ctx.createGain()
        g.gain.setValueAtTime(type === 'primary' ? 0.5 : 0.35, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
        src.connect(bp)
        bp.connect(g)
        g.connect(ctx.destination)
        src.start(t)
        src.stop(t + 0.025)
      } catch {
        // Audio unavailable
      }
    },
    [soundOn]
  )
}

// ═══ Email link with copy behavior ═══
function EmailLink() {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (copied) {
      setCopied(false)
      return
    }

    // Open mail client via hidden iframe
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    if (iframe.contentWindow) {
      iframe.contentWindow.location.href = 'mailto:hey@raksha.design'
    }
    setTimeout(() => document.body.removeChild(iframe), 500)

    navigator.clipboard.writeText('hey@raksha.design').then(() => {
      setCopied(true)
    })
  }, [copied])

  return (
    <a
      href="mailto:hey@raksha.design"
      className="text-text-primary underline decoration-[rgba(0,0,0,0.15)] underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-[rgba(0,0,0,0.4)] inline-block"
      style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      onClick={handleClick}
    >
      {copied ? 'copied to clipboard' : 'hey@raksha.design'}
    </a>
  )
}

// ═══ SVG Icons ═══
function ArrowUpRight() {
  return (
    <svg
      className="inline ml-1.5 -mt-0.5"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12L12 4" />
      <path d="M5 4h7v7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768M17.5 4l-6.768 6.768" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// ═══ ABOUT SECTION ═══
export function AboutSection() {
  const clickSound = useAboutClickSound()
  const [openDrop, setOpenDrop] = useState<string | null>(null)

  const toggleDrop = useCallback((key: string) => {
    setOpenDrop((prev) => (prev === key ? null : key))
  }, [])

  return (
    <section
      id="sec-about"
      className="text-left"
      style={{ padding: '64px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
    >
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="font-pixel text-[32px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}
      >
        Raksha Tated
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH, delay: 0.05 }}
        className="text-[15px] text-text-secondary leading-[1.5]"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40 }}
      >
        Product Designer
      </motion.p>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH, delay: 0.1 }}
        className="text-left"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 32 }}
      >
        <p className="text-[16px] leading-[1.7] text-text-primary mb-4">
          I work with{' '}
          <AboutDropdownTrigger dataKey="agencies" open={openDrop === 'agencies'} onToggle={() => toggleDrop('agencies')}>agencies</AboutDropdownTrigger>,{' '}
          <AboutDropdownTrigger dataKey="companies" open={openDrop === 'companies'} onToggle={() => toggleDrop('companies')}>companies</AboutDropdownTrigger> and{' '}
          <AboutDropdownTrigger dataKey="leaders" open={openDrop === 'leaders'} onToggle={() => toggleDrop('leaders')}>founders</AboutDropdownTrigger> — mostly on
          consumer iOS apps, healthcare platforms and AI software. I care a lot about the space
          between design and code.
        </p>
        <p className="text-[15px] leading-[1.75] text-text-secondary">
          If you&apos;d like to work together,{' '}
          <a
            href="https://cal.com/raksha-tated-v2ee58/15min"
            className="text-text-primary underline decoration-[rgba(0,0,0,0.15)] underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-[rgba(0,0,0,0.4)]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            book a call
          </a>{' '}
          or email <EmailLink />. I&apos;ll get back within 12 hours. For anything else,{' '}
          <a
            href="https://x.com/rakshaa_t"
            className="text-text-primary underline decoration-[rgba(0,0,0,0.15)] underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-[rgba(0,0,0,0.4)]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            DM me on X
          </a>
          .
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH, delay: 0.15 }}
        className="flex flex-col items-start gap-4"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 32 }}
      >
        {/* Primary CTA — keyboard key style */}
        <div className="inline-block">
          <a
            href="https://cal.com/raksha-tated-v2ee58/15min?user=raksha-tated-v2ee58"
            className="cta-primary block relative no-underline text-white font-sans text-[14px] font-semibold tracking-[0.03em]"
            style={{
              padding: '16px 40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(180deg,#7E6EBE 0%,#6B5CA8 30%,#6050A0 70%,#5848A0 100%)',
              boxShadow: '0 4px 0 0 #483C88, 0 8px 14px rgba(72,60,136,0.25)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              transform: 'translateY(0)',
              transition:
                'transform 0.08s cubic-bezier(0.32,0.72,0,1), box-shadow 0.08s cubic-bezier(0.32,0.72,0,1)',
            }}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={() => clickSound('primary')}
            onTouchStart={() => clickSound('primary')}
          >
            Reach out
            <ArrowUpRight />
          </a>
        </div>

        {/* Secondary CTAs — 3D icon buttons */}
        <div className="inline-flex gap-2 items-center">
          {[
            { href: 'https://x.com/rakshaa_t', label: 'Twitter', icon: <XIcon /> },
            { href: 'https://github.com/rakshaa-t', label: 'GitHub', icon: <GitHubIcon /> },
            { href: 'https://www.linkedin.com/in/rakshatated/', label: 'LinkedIn', icon: <LinkedInIcon /> },
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-icon w-8 h-8 rounded-[8px] flex items-center justify-center no-underline text-text-muted"
              style={{
                background:
                  'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #F4F1ED 0%, #E2DFDA 100%)',
                boxShadow: '0 2px 0 0 #C4C0BA, 0 4px 6px rgba(0,0,0,0.06)',
                transform: 'translateY(0)',
                transition:
                  'transform 0.1s cubic-bezier(0.32,0.72,0,1), box-shadow 0.1s cubic-bezier(0.32,0.72,0,1), color 0.1s cubic-bezier(0.32,0.72,0,1)',
              }}
              onMouseDown={() => clickSound('secondary')}
              onTouchStart={() => clickSound('secondary')}
            >
              {icon}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Details Row */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH, delay: 0.2 }}
        className="flex flex-col gap-5 pt-6"
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Timezones */}
        <div className="flex items-center gap-4 text-[13px]">
          <span className="font-mono text-[12px] font-semibold tracking-[0.06em] uppercase text-text-muted min-w-[80px] shrink-0">
            Timezones
          </span>
          <LocationToggle />
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 text-[13px]">
          <span className="font-mono text-[12px] font-semibold tracking-[0.06em] uppercase text-text-muted min-w-[80px] shrink-0">
            Status
          </span>
          <span className="flex items-center gap-2 text-text-secondary">
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #6BE08A, #34C759)',
                boxShadow: '0 0 3px rgba(52,199,89,0.5), 0 0 7px rgba(52,199,89,0.2)',
                animation: 'ledPulse 2.5s cubic-bezier(0.32,0.72,0,1) infinite',
              }}
            />
            In the studio
          </span>
        </div>

        {/* Stack */}
        <div className="flex items-center gap-4 text-[13px]">
          <span className="font-mono text-[12px] font-semibold tracking-[0.06em] uppercase text-text-muted min-w-[80px] shrink-0">
            Stack
          </span>
          <StackCards />
        </div>
      </motion.div>
    </section>
  )
}
