import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import '../styles/base.css'
import '../styles/background.css'
import '../styles/header-hero.css'
import '../styles/activities.css'
import '../styles/komentar.css'
import '../styles/layer2.css'
import '../styles/gallery.css'
import '../styles/galaxy-backdrop.css'
import '../styles/scan.css'
import '../styles/footer-reveal.css'
import '../styles/footer-docs.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dokuemntasi Kegiatan Pelayanan — Thou art my rarest exception.',
  description: 'Nuansa Jepang yang tenang dan etereal: biru malam Gunung Fuji dan Danau Kawaguchiko, sakura, kertas washi, dan kanji sebagai aksen.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}