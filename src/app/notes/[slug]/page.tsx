import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { NOTES } from '@/data/notes'
import type { Note, RichBlock } from '@/types'
import { ShareOnX } from './ShareOnX'

// Widen the const tuple to Note[] for easier property access
const notes: Note[] = [...NOTES]

// ═══ STATIC PARAMS ═══
export function generateStaticParams() {
  return NOTES.map((note) => ({ slug: note.slug }))
}

// ═══ METADATA ═══
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const note = notes.find((n) => n.slug === slug)
  if (!note) return { title: 'Note Not Found' }
  return {
    title: `${note.title} — Raksha Tated`,
    description: note.preview,
  }
}

// ═══ RICH BLOCK RENDERER ═══
function renderBlock(block: RichBlock): string {
  if (block.type === 'text') return block.html
  if (block.type === 'code') {
    return `<div style="position:relative"><div class="note-code">${block.html}</div></div>`
  }
  if (block.type === 'image') {
    let html = '<div class="note-img">'
    if (block.src) {
      html += `<img src="${block.src}" alt="${block.caption || ''}" loading="lazy" />`
    }
    html += '</div>'
    if (block.caption) {
      html += `<div class="note-img-caption">${block.caption}</div>`
    }
    return html
  }
  if (block.type === 'callout') {
    return `<div class="note-callout">${block.html}</div>`
  }
  return ''
}

// ═══ PAGE ═══
export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = notes.find((n) => n.slug === slug)
  if (!note) notFound()

  const bodyHtml = note.rich
    ? (note.body as RichBlock[]).map(renderBlock).join('')
    : typeof note.body === 'string'
      ? note.body
      : ''

  const currentIdx = notes.findIndex((n) => n.slug === note.slug)
  const nextNote =
    notes.length > 1 ? notes[(currentIdx + 1) % notes.length] : null

  return (
    <div
      className="min-h-screen bg-bg"
      style={{ padding: '40px 24px 80px' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Back button */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 font-sans text-[13px] font-medium text-accent no-underline"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 32,
            transition: 'opacity 0.15s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        {/* Date */}
        <div
          className="font-mono text-[12px] font-medium text-text-muted tracking-[0.02em]"
          style={{ marginBottom: 8 }}
        >
          {note.date}
        </div>

        {/* Title */}
        <h1
          className="font-pixel text-[28px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
          style={{ marginBottom: 32 }}
        >
          {note.title}
        </h1>

        {/* Body */}
        <div
          className="note-page-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <ShareOnX title={note.title} />
        </div>

        {/* Up Next */}
        {nextNote && nextNote.slug !== note.slug && (
          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="font-mono text-[12px] font-semibold tracking-[0.04em] uppercase text-text-muted"
              style={{ marginBottom: 12 }}
            >
              Up next
            </div>
            <Link
              href={`/notes/${nextNote.slug}`}
              className="note-card-link block no-underline text-inherit rounded-xl"
              style={{
                padding: 20,
                background: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition:
                  'transform 0.25s cubic-bezier(0.32,0.72,0,1), box-shadow 0.25s cubic-bezier(0.32,0.72,0,1), border-color 0.25s cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              <div
                className="font-mono text-[12px] font-medium text-text-muted tracking-[0.02em]"
                style={{ marginBottom: 6 }}
              >
                {nextNote.date}
              </div>
              <div
                className="note-card-title font-sans text-[16px] font-semibold text-text-primary leading-[1.3]"
                style={{
                  marginBottom: 6,
                  transition: 'color 0.2s cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                {nextNote.title}
              </div>
              <div className="text-[14px] text-text-secondary leading-[1.5]">
                {nextNote.preview}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
