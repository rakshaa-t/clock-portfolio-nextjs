import type { Metadata, Viewport } from 'next'
import { Providers } from './Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Raksha Tated — Design Portfolio',
  description: 'Product designer crafting interfaces with uncommon care. Previously at agencies, now independent.',
  metadataBase: new URL('https://raksha.design'),
  openGraph: {
    title: 'Raksha Tated — Design Portfolio',
    description: 'Product designer crafting interfaces with uncommon care.',
    url: 'https://raksha.design',
    siteName: 'Raksha Tated',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raksha Tated — Design Portfolio',
    description: 'Product designer crafting interfaces with uncommon care.',
    images: ['/og-image.png'],
  },
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#EDEAE6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
