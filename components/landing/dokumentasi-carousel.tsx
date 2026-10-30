"use client"

import type React from "react"
import { SlidingCarousel } from "@/components/carousel/sliding-carousel"

interface Activity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  image?: string
  images?: string[]
}

interface DokumentasiCarouselProps {
  activities: Activity[]
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

// Kumpulkan setiap foto dokumentasi sebagai satu slide, dengan cerita
// (judul, kategori, tanggal) kegiatan yang bersangkutan.
function buildSlides(activities: Activity[]) {
  const slides: { id: string; image: string; title: string; description: string; content: React.ReactNode }[] = []
  activities.forEach((act) => {
    const images = Array.isArray(act.images) && act.images.length > 0
      ? act.images
      : act.image
      ? [act.image]
      : []
    images.forEach((image, idx) => {
      slides.push({
        id: `${act.id}-foto-${idx}`,
        image,
        title: act.title,
        description: `${act.category} · ${formatDate(act.date)}`,
        content: (
          <div className="docs-slide-content">
            <img src={image} alt={act.title} loading="lazy" />
            <div className="docs-slide-caption">
              <strong>{act.title}</strong>
              <span>{`${act.category} · ${formatDate(act.date)}`}</span>
            </div>
          </div>
        ),
      })
    })
  })
  return slides
}

export function DokumentasiCarousel({ activities }: DokumentasiCarouselProps) {
  const slides = buildSlides(activities)

  if (slides.length === 0) {
    return (
      <section className="layer2 docs" id="dokumentasi">
        <div className="wrap">
          <p className="eyebrow light">Dokumentasi</p>
          <h2>Galeri Foto Kegiatan</h2>
          <p className="docs-empty">Belum ada foto dokumentasi kegiatan.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="layer2 docs" id="dokumentasi">
      <div className="wrap">
        <p className="eyebrow light">Dokumentasi</p>
        <h2>Cerita Kegiatan Melalui Foto</h2>
        <p className="docs-lead">
          Setiap foto adalah satu momen dari setiap jenis kegiatan pelayanan.
          Geser kanan atau kiri untuk menikmati seluruh dokumentasi.
        </p>
        <SlidingCarousel
          slides={slides.map((s) => ({
            id: s.id,
            image: s.image,
            title: s.title,
            description: s.description,
            content: s.content,
          }))}
          showControls={true}
          showIndicators={slides.length > 1}
          autoPlay={false}
          slideClassName="docs-slide"
        />
      </div>
    </section>
  )
}
