'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { NOTES } from '@/data/notes'
import { useAudio } from '@/hooks/useAudio'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]

export function NotesSection() {
  const { playNoteClick } = useAudio()

  return (
    <section
      id="sec-notes"
      className="text-left"
      style={{ padding: '64px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
    >
      <h2
        className="font-pixel text-[32px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}
      >
        Things I&apos;m writing about
      </h2>
      <p
        className="text-[15px] text-text-secondary leading-[1.5]"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40 }}
      >
        Notes on design, code, and everything in between.
      </p>

      {/* Note cards */}
      <div
        className="flex flex-col gap-3"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {NOTES.map((note) => (
          <motion.div
            key={note.slug}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.45, ease: EASE_SMOOTH }}
          >
          <Link
            href={`/notes/${note.slug}`}
            onClick={() => playNoteClick()}
            className="note-card-link block no-underline text-inherit rounded-xl"
            style={{
              padding: 20,
              background: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(0,0,0,0.06)',
              transition:
                'transform 0.25s cubic-bezier(0.32,0.72,0,1), box-shadow 0.25s cubic-bezier(0.32,0.72,0,1), border-color 0.25s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Date */}
            <div
              className="font-mono text-[12px] font-medium text-text-muted tracking-[0.02em]"
              style={{ marginBottom: 6 }}
            >
              {note.date}
            </div>

            {/* Title */}
            <div
              className="note-card-title font-sans text-[16px] font-semibold text-text-primary leading-[1.3]"
              style={{ marginBottom: 6, transition: 'color 0.2s cubic-bezier(0.32,0.72,0,1)' }}
            >
              {note.title}
            </div>

            {/* Preview */}
            <div
              className="text-[14px] text-text-secondary leading-[1.5]"
            >
              {note.preview}
            </div>
          </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
