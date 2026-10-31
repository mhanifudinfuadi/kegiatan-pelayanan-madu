"use client"

import type React from "react"
import { SlidingCarousel } from "@/components/carousel/sliding-carousel"
import { collectPhotos, formatTanggal, type Activity } from "@/lib/activities"

interface DokumentasiCarouselProps {
  activities: Activity[]
}

// Kumpulkan setiap foto dokumentasi sebagai satu slide, dengan cerita
// (judul, kategori, tanggal) kegiatan yang bersangkutan.
function buildSlides(activities: Activity[]) {
  const slides: { id: string; image: string; title: string; description: string; content: React.ReactNode }[] = []

  collectPhotos(activities).forEach((photo) => {
    slides.push({
      id: photo.key,
      image: photo.image,
      title: photo.title,
      description: `${photo.category} · ${formatTanggal(photo.date)}`,
      content: (
        <div className="docs-slide-content">
          <img src={photo.image} alt={photo.title} loading="lazy" />
          <div className="docs-slide-caption">
            <strong>{photo.title}</strong>
            <span>{`${photo.category} · ${formatTanggal(photo.date)}`}</span>
          </div>
        </div>
      ),
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
          <p className="docs-empty" style={{ marginTop: ".5rem" }}>
            Unggah foto dari <a href="/editor">Editor</a>, lalu klik “Sinkron foto” bila foto sudah ada di bucket.
          </p>
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
          {slides.length} foto dari {activities.length} kegiatan pelayanan.
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
