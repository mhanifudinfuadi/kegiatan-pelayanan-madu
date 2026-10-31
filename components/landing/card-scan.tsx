"use client"

import { useEffect, useRef, useState } from "react"
import { collectPhotos, formatTanggal, type Activity, type PhotoItem } from "@/lib/activities"

interface CardScanProps {
  activities: Activity[]
}

const GLYPHS = "桜花月雪京炎鋼刃水火空心和道未来電脳夜風雲龍光夢"

/** Semua foto dari semua kegiatan (satu foto = satu kartu). */
export function buildScanCards(activities: Activity[]): PhotoItem[] {
  return collectPhotos(activities)
}

export function CardScan({ activities }: CardScanProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [status, setStatus] = useState<"idle" | "scanning" | "paused">("idle")
  const [reduced, setReduced] = useState(false)
  const rafRef = useRef<number | null>(null)
  const positionRef = useRef(0)

  const allScannedImages = buildScanCards(activities)

  // Hormati preferensi reduced-motion (dibaca setelah mount agar tidak beda hasil SSR)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [])

  useEffect(() => {
    if (reduced || !trackRef.current || allScannedImages.length === 0) return

    const track = trackRef.current
    const speed = 55 // px per detik
    let lastTime = performance.now()

    // Kartu diduplikasi 3x; satu putaran = 1/3 lebar track agar mulus tanpa lompat
    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const currentSpeed = isHovering ? speed * 0.35 : speed
      positionRef.current -= currentSpeed * delta

      const loopWidth = track.scrollWidth / 3
      if (loopWidth > 0 && Math.abs(positionRef.current) >= loopWidth) {
        positionRef.current += loopWidth
      }

      track.style.transform = `translateX(${positionRef.current}px)`
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isHovering, reduced, allScannedImages.length])

  // Reset posisi saat daftar foto berubah
  useEffect(() => {
    positionRef.current = 0
    if (trackRef.current) trackRef.current.style.transform = "translateX(0px)"
  }, [allScannedImages.length])

  const handleMouseEnter = () => {
    setIsHovering(true)
    setStatus("paused")
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setStatus("idle")
  }

  const handlePause = () => {
    setIsHovering(true)
    setStatus("paused")
  }

  const handleResume = () => {
    setIsHovering(false)
    setStatus("idle")
  }

  if (allScannedImages.length === 0) {
    return (
      <section className="sc" id="scan">
        <div className="wrap">
          <p className="eyebrow light">Scan</p>
          <h2 className="sc-title">Pindaian <span>Kegiatan</span></h2>
          <p className="sc-lead">Garis pemindai bergerak melintasi kartu kegiatan yang ada fotonya.</p>
          <div className="sc-empty" style={{ marginTop: "2rem" }}>
            Belum ada foto kegiatan yang diunggah.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="sc" id="scan" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="wrap">
        <p className="eyebrow light">Scan</p>
        <h2 className="sc-title">Pindaian <span>Kegiatan</span></h2>
        <p className="sc-lead">
          {allScannedImages.length} foto dokumentasi melintas di garis pemindai. Foto memudar menjadi aksara saat melewati garis. Jeda, perlambat, percepat.
        </p>

        <div className="sc-stage">
          <div className="sc-track" ref={trackRef} style={{ animation: reduced ? "none" : undefined }}>
            {/** Duplicate 3x untuk efek infinite scroll */}
            {[0, 1, 2].map((copy) =>
              allScannedImages.map((photo) => (
                <div key={`${photo.key}-${copy}`} className="sc-card">
                  <div className="sc-chip">
                    <span>{GLYPHS}桜花月雪京炎鋼刃水火空心和道未来電脳夜</span>
                  </div>
                  <div
                    className="sc-photo"
                    role="img"
                    aria-label={photo.title}
                    style={{ backgroundImage: `url("${photo.image}")` }}
                  />
                  <div className="sc-glyphs" aria-hidden="true">
                    {Array.from({ length: 130 }).map((_, i) => (
                      <span key={i}>{GLYPHS[i % GLYPHS.length]}</span>
                    ))}
                  </div>
                  <div className="sc-info">
                    <span className="sc-tag">{photo.category}</span>
                    <h2>{photo.title}</h2>
                    <p>
                      {formatTanggal(photo.date)}
                      {photo.unit ? ` · ${photo.unit}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="sc-beam" ref={beamRef} />
        </div>

        <div className="sc-controls">
          <button className="sc-btn" onClick={handlePause} disabled={status === "paused" || reduced}>
            Jeda
          </button>
          <button className="sc-btn" onClick={handleResume} disabled={status === "idle" || reduced}>
            Lanjut
          </button>
          <span className="sc-status">{status === "paused" ? "Dijeda" : status === "idle" ? "Berjalan" : "Memindai"}</span>
        </div>
      </div>
    </section>
  )
}
