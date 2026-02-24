import Link from 'next/link'

export const metadata = {
  title: 'Changelog — Raksha Tated',
  description: 'Version history and updates to raksha.design',
}

const ENTRIES = [
  {
    version: 'V2.0.0',
    date: 'February 2026',
    title: 'Flat single-page layout',
    items: [
      'Replaced clock navigation with a flat scrollable page',
      'About, Work, Notes, Books, and Bookmarks in one continuous flow',
      'Notes now live on individual pages with rich content',
      'Books section with cover grid and expandable highlights',
      'Mymind bookmarks displayed in full-width masonry grid',
      'Bottom sheet modals on mobile for all sections',
      'Mobile bottom navigation bar for quick section jumping',
      'Improved project card hover with sliding title',
      'Retained sound knob, click sounds, and tactile design language',
      'ViewTransitions for smooth page navigation',
    ],
  },
  {
    version: 'V1.0.0',
    date: 'February 2025',
    title: 'Initial launch',
    items: [
      'Clock-based navigation with 4-quadrant menu',
      'Interactive project showcase with puzzle grid',
      'Apple Notes-style writing section',
      'Mymind bookmark board with masonry grid',
      'Kindle e-reader with book highlights and star ratings',
      'About section with company and leader dropdowns',
      'Cal.com booking integration',
      'Skeuomorphic design language throughout',
      'Synthesized clock tick and UI sounds',
    ],
  },
] as const

export default function ChangelogPage() {
  return (
    <div
      className="min-h-screen bg-bg"
      style={{ maxWidth: 520, margin: '0 auto', padding: '80px 24px 120px' }}
    >
      {/* Back link */}
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium tracking-[0.08em] uppercase text-text-secondary no-underline hover:text-text-primary transition-colors duration-200"
        style={{ marginBottom: 48, display: 'inline-flex' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 12L6 8l4-4" />
        </svg>
        Back
      </Link>

      {/* Title */}
      <h1
        className="font-sans text-[28px] font-semibold tracking-[-0.02em] text-text-primary"
        style={{ marginBottom: 8 }}
      >
        Changelog
      </h1>
      <p
        className="text-[14px] text-text-secondary leading-[1.5]"
        style={{ marginBottom: 48 }}
      >
        What&apos;s new and what&apos;s changed on this site.
      </p>

      {/* Entries */}
      {ENTRIES.map((entry) => (
        <div key={entry.version} style={{ marginBottom: 48 }}>
          <div
            className="inline-block font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-accent"
            style={{ marginBottom: 6 }}
          >
            {entry.version}
          </div>
          <div
            className="font-mono text-[12px] text-text-muted tracking-[0.04em]"
            style={{ marginBottom: 12 }}
          >
            {entry.date}
          </div>
          <div
            className="text-[16px] font-semibold text-text-primary"
            style={{ marginBottom: 8 }}
          >
            {entry.title}
          </div>
          <ul className="list-none p-0">
            {entry.items.map((item, i) => (
              <li
                key={i}
                className="relative text-[14px] leading-[1.7]"
                style={{ paddingLeft: 16, color: '#5A5550' }}
              >
                <span
                  className="absolute rounded-full bg-text-muted"
                  style={{ left: 0, top: 10, width: 4, height: 4 }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
