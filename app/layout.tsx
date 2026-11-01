import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'

import { asset } from '@/lib/asset'
import { ThemeProvider } from '@/components/theme-provider'

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
import '../styles/madu-theme.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
// Tipografi tema Galeri Madu: heading serif elegan + body sans futuristik
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const _jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: 'Galeri Madu — Dokumentasi Kegiatan Pelayanan · KPP Madya Dua Jakarta Barat',
  description: 'Galeri foto kegiatan pelayanan KPP Madya Dua Jakarta Barat — Direktorat Jenderal Pajak, Kementerian Keuangan. Bergaya futuristik-elegan dengan nuansa Jepang.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: asset('/icon.svg'), type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`font-sans antialiased ${_playfair.variable} ${_jakarta.variable} ${_geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
