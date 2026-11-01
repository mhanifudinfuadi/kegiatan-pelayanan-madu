"use client"

import { useEffect, useRef, useState } from "react"

interface GdQuoteProps {
  foto: number
  kegiatan: number
  komentar: number
  reaksi: number
}

/** Penghitung animasi; langsung ke nilai akhir bila reduced-motion. */
function useCounter(target: number) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // data belum termuat (0) atau animasi dimatikan -> ikut nilai sebenarnya
    if (reduced || target === 0 || started.current) {
      setValue(target)
      return
    }

    // elemen sudah terlihat saat nilai pertama kali tersedia (data datang setelah render):
    // langsung tampilkan angka final agar tidak tertinggal di 0
    const rect = el.getBoundingClientRect()
    const visible = rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0
    if (visible) {
      started.current = true
      setValue(target)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // sudah berjalan / sudah pernah selesai -> cukup ikuti nilai terbaru
          if (started.current) {
            setValue(target)
            return
          }
          if (!entry.isIntersecting) return
          started.current = true
          const start = performance.now()
          const dur = 1200
          const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1)
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
            // nilai bisa berubah saat animasi berjalan (data/reaksi baru)
            if (p < 1) requestAnimationFrame(tick)
            else setValue(target)
          }
          requestAnimationFrame(tick)
        })
      },
      { threshold: 0.4 }
    )
    // observer dipasang ulang setiap nilai berubah agar angka mengikuti data terbaru
    observer.observe(el)
    return () => observer.disconnect()
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
            “Pelayanan terbaik lahir dari perhatian yang tidak tergesa — pada setiap wajib pajak,
            setiap pertanyaan, dan setiap hari yang kita lalui bersama.”
          </p>
          <p className="gd-over" style={{ marginTop: "1rem" }}>
            KPP Madya Dua Jakarta Barat
          </p>
        </div>

        <div className="gd-counters">
          <GdCounter value={foto} label="Foto" testId="counter-foto" />
          <GdCounter value={kegiatan} label="Kegiatan" testId="counter-kegiatan" />
          <GdCounter value={komentar} label="Komentar" testId="counter-komentar" />
          <GdCounter value={reaksi} label="Reaksi Hati" testId="counter-reaksi" />
        </div>
      </div>
    </section>
  )
}
