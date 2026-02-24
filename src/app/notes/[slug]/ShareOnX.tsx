'use client'

import { useCallback } from 'react'

export function ShareOnX({ title }: { title: string }) {
  const handleShare = useCallback(() => {
    const text = `"${title}"\n\nhttps://raksha.design${window.location.pathname}`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank'
    )
  }, [title])

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1 font-sans text-[13px] font-medium text-text-secondary cursor-pointer"
      style={{
        background: 'none',
        border: 'none',
        borderRadius: 8,
        padding: '8px 14px',
        transition:
          'background 0.15s cubic-bezier(0.32,0.72,0,1), color 0.15s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      Share on{' '}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ marginLeft: 2 }}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </button>
  )
}
