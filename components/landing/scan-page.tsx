"use client"

import { useEffect, useState } from "react"
import { fetchActivitiesResult, type Activity } from "@/lib/activities"
import { CardScan } from "./card-scan"

/**
 * Halaman mandiri /scan: memuat kegiatan yang sama seperti beranda
 * agar semua foto dokumentasi ikut tampil di section pindai.
 */
export function ScanPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchActivitiesResult()
      .then((res) => {
        setActivities(res.data)
        setError(res.error || "")
      })
      .catch((err) => setError(err?.message || "Gagal memuat foto dokumentasi."))
      .finally(() => setLoading(false))
  }, [])

  const needsMigration = /permission denied|does not exist|schema cache/i.test(error)

  return (
    <main>
      <div style={{ padding: "1.5rem 5vw 0", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <a href="/" style={{ fontSize: ".85rem", color: "var(--ink-soft)" }}>
          ← Kembali ke beranda
        </a>
        <span style={{ fontSize: ".8rem", color: "var(--ink-soft)" }}>
          {loading ? "Memuat…" : `${activities.length} kegiatan`}
        </span>
      </div>

      {error && (
        <p role="alert" style={{ padding: "0 5vw", color: "#ffb3c6", fontSize: ".85rem", maxWidth: "70ch" }}>
          {needsMigration
            ? "Data kegiatan belum bisa dibaca. Jalankan migrasi supabase/migrations/004_fix_activity_photos.sql di Supabase SQL Editor, lalu muat ulang halaman."
            : `Gagal memuat data: ${error}`}
        </p>
      )}

      <CardScan activities={activities} />
    </main>
  )
}
