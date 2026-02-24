import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="flex items-center justify-center gap-2 font-mono text-[12px] font-medium tracking-[0.1em] uppercase text-text-muted"
      style={{ padding: '40px 24px 48px', borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      <span>&copy; Raksha T 2026. V2.0.0</span>
      <span style={{ opacity: 0.4 }}>&middot;</span>
      <Link
        href="/changelog"
        className="text-text-muted no-underline hover:underline hover:text-text-secondary"
      >
        Changelog
      </Link>
    </footer>
  )
}
