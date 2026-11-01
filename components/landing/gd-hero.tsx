"use client"

import { Hero } from "./hero"
import { INSTITUSI } from "@/lib/kegiatan-types"

interface GdHeroProps {
  caption?: string
  /** Statistik ringkas untuk pil di bawah hero */
  stats: { momen: number; kegiatan: number; komentar: number }
}

/**
 * Section pertama: motion orang berjalan tetap dipertahankan (Hero lama),
 * ditambah lapisan scrim pink, judul serif, CTA, dan pil statistik.
 * Section baru berikutnya dimulai SETELAH section motion ini.
 */
export function GdHero({ caption, stats }: GdHeroProps) {
  return (
    <section className="gd-hero" id="beranda" data-testid="hero-section">
      {/* motion orang yang berjalan — komponen hero asli, tidak diubah */}
      <Hero caption={caption} />
      <div className="gd-hero__scrim" aria-hidden="true" />

      <div className="gd-hero__inner">
        <p className="gd-over" data-testid="hero-overline">
          花見 · {INSTITUSI} · DJP Kemenkeu
        </p>
        <h1 className="gd-hero__title" data-testid="hero-title">
          Kegiatan Pelayanan, <em>dalam Setiap Bingkai</em>
        </h1>
        <p className="gd-hero__lead">
          Setiap momen pelayanan kepada wajib pajak direkam dalam satu galeri yang tenang dan elegan —
          dari Pojok Pajak hingga Pajak Bertutur.
        </p>

        <div className="gd-hero__cta">
          <a href="#dokumentasi" className="gd-btn gd-btn--primary" data-testid="hero-cta-galeri">
            Jelajahi Galeri →
          </a>
          <a href="#tentang" className="gd-btn" data-testid="hero-cta-tentang">
            Tentang Kegiatan
          </a>
        </div>

        <ul className="gd-stats" data-testid="hero-stats">
          <li className="gd-glass">
            <b>{stats.momen}</b>
            <span>Momen</span>
          </li>
          <li className="gd-glass">
            <b>{stats.kegiatan}</b>
            <span>Kegiatan</span>
          </li>
          <li className="gd-glass">
            <b>{stats.komentar}</b>
            <span>Komentar</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
