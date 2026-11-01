"use client"

import { useEffect, useRef, useState } from "react"

interface GdQuoteProps {
  foto: number
  kegiatan: number
  komentar: number
  reaksi: number
}

/**
 * Penghitung animasi.
 * - Angka final selalu ditampilkan bila elemen belum terlihat (data bisa datang
 *   setelah render), sehingga tidak pernah tertahan di 0.
 * - Saat elemen masuk viewport pertama kali, angka dihitung naik dari 0.
 */
function useCounter(target: number) {
  const [value, setValue] = useState(target)
  const ref = useRef<HTMLElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || animated.current) {
      setValue(target)
      return
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || target === 0) {
      animated.current = true
      setValue(target)
      return
    }

    // sudah terlihat saat render (data baru tersedia): tampilkan langsung
    const rect = el.getBoundingClientRect()
    const visible = rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0
    if (visible) {
      animated.current = true
      setValue(target)
      return
    }

    let raf = 0
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (animated.current) {
            setValue(target)
            return
          }
          if (!entry.isIntersecting) return
          animated.current = true
          const start = performance.now()
          const dur = 1200
          const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1)
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) raf = requestAnimationFrame(tick)
            else setValue(target)
          }
          raf = requestAnimationFrame(tick)
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target])

  return { value, ref }
}

/**
 * Satu angka statistik dengan animasi naik saat terlihat.
 * Angka langsung mengikuti nilai terbaru bila data dimuat setelah render.
 */
export function GdCounter({ value, label, testId }: { value: number; label: string; testId: string }) {
  const { value: shown, ref } = useCounter(value)
  return (
    <div
      className="gd-counter gd-glass"
      ref={ref as React.RefObject<HTMLDivElement>}
      data-testid={testId}
      data-value={value}
    >
      <b>{shown}</b>
      <span>{label}</span>
    </div>
  )
}

/**
 * Jeda kutipan + 4 penghitung animasi.
 * Kanji besar 記憶 di belakang, latar berbintang.
 */
export function GdQuote({ foto, kegiatan, komentar, reaksi }: GdQuoteProps) {
  return (
    <section className="gd-quote" id="statistik" data-testid="quote-section">
      <div className="gd-quote__kanji" aria-hidden="true">
        記憶
      </div>
      <div className="gd-wrap">
        <div className="gd-quote__body">
          <p>
            “Sebab dokumentasi bukan semata tentang menyimpan apa yang pernah terjadi, melainkan tentang merawat apa yang mungkin terlupakan. Tentang kesediaan mendengar cerita yang tak selalu terucap, mengabadikan harapan yang tak selalu terlihat, dan menjaga setiap kepercayaan seolah ia adalah kenangan paling berharga yang dititipkan kepada kita.”
          </p>
          <p className="gd-over" style={{ marginTop: "2rem", whiteSpace: "nowrap" }}>
            KPP Madya Dua Jakarta Barat
          </p>
        </div>

        <div className="gd-counters">
          <GdCounter value={foto} label="Foto" testId="counter-foto" />
          <GdCounter value={kegiatan} label="Kegiatan" testId="counter-kegiatan" />
          <GdCounter value={komentar} label="Komentar" testId="counter-komentar" />
          <GdCounter value={reaksi} label="suka" testId="counter-reaksi" />
        </div>
      </div>
    </section>
  )
}
