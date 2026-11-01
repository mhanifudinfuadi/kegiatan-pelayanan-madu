"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { collectPhotos, fetchActivities, fetchCaption, type Activity } from "@/lib/activities"
import { CardScan } from "./card-scan"
import { Footer } from "./footer"
import { GdFeed } from "./gd-feed"
import { GdFloral } from "./gd-floral"
import { GdHero } from "./gd-hero"
import { GdNav } from "./gd-nav"
import { GdQuote } from "./gd-quote"
import { SakuraPetals } from "./sakura-petals"
import { Backsound } from "./backsound"
import { GalaxyBackdrop } from "./galaxy-backdrop"

/**
 * Urutan section beranda (sesuai rekonfigurasi-layout.md):
 * 1. Hero motion orang berjalan (section pertama, dipertahankan)
 * 2. Pindai kegiatan (#scan) — tetap ada, tepat setelah section motion
 * 3. Feed dokumentasi (#dokumentasi / #galeri)
 * 4. Jeda kutipan + statistik (#statistik)
 * 5. Section kaca bunga (#tentang) — tepat di atas footer
 * 6. Footer
 */
export function LandingPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(true)
  const [interaksi, setInteraksi] = useState({ reaksi: 0, komentar: 0 })

  useEffect(() => {
    let alive = true
    Promise.all([fetchActivities(), fetchCaption()])
      .then(([acts, siteCaption]) => {
        if (!alive) return
        setActivities(acts)
        setCaption(siteCaption)
      })
      .catch((err) => console.warn("Gagal memuat data:", err))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const foto = useMemo(() => collectPhotos(activities).length, [activities])

  const handleStats = useCallback(
    (info: { reaksi: number; komentar: number }) => setInteraksi(info),
    []
  )

  return (
    <main className="gd-shell">
      {/* latar galaxy + bunga kaca (fixed, z-index -1) — dirender paling awal */}
      <GalaxyBackdrop />
      <Backsound />
      <SakuraPetals />

      <GdNav />

      {/* 1 — section pertama: motion orang berjalan */}
      <GdHero
        caption={caption}
        stats={{ momen: foto, kegiatan: activities.length, komentar: interaksi.komentar }}
      />

      {/* 2 — section baru pertama setelah motion: pindai kegiatan */}
      <CardScan activities={activities} />

      {/* 3 — feed dokumentasi ala Instagram */}
      <GdFeed activities={activities} onStatsChange={handleStats} />

      {/* 4 — jeda kutipan + statistik */}
      <GdQuote
        foto={foto}
        kegiatan={activities.length}
        komentar={interaksi.komentar}
        reaksi={interaksi.reaksi}
      />

      {/* 5 — section kaca bunga (mempertahankan section bunga), tepat di atas footer */}
      <GdFloral />

      {/* 6 — footer */}
      <Footer />

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full bg-[#121829]/95 px-3 py-2 text-xs text-[#e9e7f1] shadow-lg"
        >
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#f9a8d4]/40 border-t-[#ec4899]" />
          Memuat data…
        </div>
      )}
    </main>
  )
}
