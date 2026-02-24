import type { Metadata, Viewport } from 'next'
import { Providers } from './Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Raksha Tated — Product Designer',
  description: 'Product Designer. Five years designing products, one year engineering them. Tech, healthcare and consumer apps. Select client work available.',
  metadataBase: new URL('https://raksha.design'),
  openGraph: {
    title: 'Raksha Tated — Product Designer',
    description: 'Product Designer. Five years designing products, one year engineering them. Tech, healthcare and consumer apps.',
    url: 'https://raksha.design',
    siteName: 'Raksha Tated',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raksha Tated — Product Designer',
    description: 'Product Designer. Five years designing products, one year engineering them.',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", {origin:"https://app.cal.com"});
Cal("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#3A3632"}},"hideEventTypeDetails":false,"layout":"month_view"});`,
          }}
        />
      </body>
    </html>
  )
}
