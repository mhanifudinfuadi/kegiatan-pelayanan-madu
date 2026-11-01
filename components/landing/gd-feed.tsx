"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { collectPhotos, type Activity, type PhotoItem } from "@/lib/activities"
import { fetchCommentCounts } from "@/lib/comments"
import { JENIS_KEGIATAN, normalizeJenis } from "@/lib/kegiatan-types"
import { GdPhotoCard } from "./gd-photo-card"
import { GdPostModal } from "./gd-post-modal"

interface GdFeedProps {
  activities: Activity[]
  /** Dipanggil saat data reaksi/komentar berubah agar statistik ikut segar */
  onStatsChange?: (info: { reaksi: number; komentar: number }) => void
}

const LIKE_KEY = "galeri-madu-reaksi"
const NAME_KEY = "komentar-nama"

/** Baca daftar foto yang sudah diberi hati di perangkat ini. */
function readLikes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LIKE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLikes(likes: Record<string, boolean>) {
  try {
    localStorage.setItem(LIKE_KEY, JSON.stringify(likes))
  } catch {
    /* localStorage penuh/diblokir: reaksi hanya bertahan di sesi ini */
  }
}

/**
 * Feed dokumentasi ala Instagram: filter 11 jenis kegiatan, kartu 4:5,
 * reaksi hati, dan panel dokumentasi + komentar.
 */
export function GdFeed({ activities, onStatsChange }: GdFeedProps) {
  const [jenis, setJenis] = useState<string>("semua")
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [toast, setToast] = useState("")
  const [canInteract, setCanInteract] = useState(false)

  const allPhotos = useMemo(() => collectPhotos(activities), [activities])

  // Label kategori mengikuti pilihan dashboard Madu Sport apa adanya
  const photos: PhotoItem[] = useMemo(
    () => allPhotos.map((p) => ({ ...p, category: normalizeJenis(p.category) })),
    [allPhotos]
  )

  // Urutan chip: 11 jenis wajib dulu, lalu kategori kustom yang dipilih di dashboard
  const jenisAktif = useMemo(() => {
    const dipakai = Array.from(new Set(photos.map((p) => p.category)))
    const wajib = JENIS_KEGIATAN.filter((j) => dipakai.includes(j))
    const kustom = dipakai
      .filter((j) => !(JENIS_KEGIATAN as readonly string[]).includes(j))
      .sort((a, b) => a.localeCompare(b, "id"))
    return [...wajib, ...kustom]
  }, [photos])

  useEffect(() => {
    setLikes(readLikes())
    try {
      setCanInteract(Boolean(localStorage.getItem(NAME_KEY)))
    } catch {
      /* abaikan */
    }
    fetchCommentCounts()
      .then(setCounts)
      .catch(() => { })
  }, [])

  // Sinkronkan angka untuk statistik section berikutnya
  useEffect(() => {
    onStatsChange?.({
      reaksi: Object.values(likes).filter(Boolean).length,
      komentar: Object.values(counts).reduce((a, b) => a + b, 0),
    })
  }, [likes, counts, onStatsChange])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(""), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const visible = useMemo(
    () =>
      jenis === "semua"
        ? photos
        : photos.filter((p) => p.category === jenis),
    [photos, jenis]
  )

  const openIndex = useMemo(
    () => (openKey ? visible.findIndex((p) => p.key === openKey) : -1),
    [openKey, visible]
  )
  const openPhoto = openIndex >= 0 ? visible[openIndex] : null

  const likeCountOf = useCallback(
    (key: string) => (likes[key] ? 1 : 0),
    [likes]
  )

  const toggleLike = useCallback((key: string) => {
    setLikes((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      writeLikes(next)
      return next
    })
  }, [])

  const needLogin = useCallback(() => {
    setToast("Masuk sebagai pegawai untuk memberi reaksi dan komentar — isi nama Anda di kolom komentar.")
  }, [])

  const markInteracted = useCallback(() => setCanInteract(true), [])

  const goPrev = useCallback(() => {
    if (visible.length === 0 || openIndex < 0) return
    setOpenKey(visible[(openIndex - 1 + visible.length) % visible.length].key)
  }, [openIndex, visible])

  const goNext = useCallback(() => {
    if (visible.length === 0 || openIndex < 0) return
    setOpenKey(visible[(openIndex + 1) % visible.length].key)
  }, [openIndex, visible])



  return (
    <section className="gd-feed" id="dokumentasi" data-testid="feed-section">
      <div className="gd-wrap">
        <div className="gd-feed__head">
          <div>
            <p className="gd-over">活動 — Galeri Kegiatan Pelayanan</p>
            <h2>Feed Dokumentasi</h2>
          </div>
          <span className="gd-feed__count" data-testid="feed-count">
            {visible.length} / {photos.length} foto
          </span>
        </div>

        <div className="gd-chips" role="group" aria-label="Filter jenis kegiatan">
          <button
            type="button"
            className={`gd-chip ${jenis === "semua" ? "on" : ""}`}
            onClick={() => setJenis("semua")}
            data-testid="chip-semua"
          >
            Semua
          </button>
          {jenisAktif.map((j) => (
            <button
              type="button"
              key={j}
              className={`gd-chip ${jenis === j ? "on" : ""}`}
              onClick={() => setJenis(j)}
              data-testid={`chip-${j.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {j}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="gd-empty gd-glass" data-testid="feed-empty">
            <p style={{ color: "#fff", marginBottom: ".4rem" }}>Belum ada foto dokumentasi.</p>
            <p style={{ fontSize: ".85rem" }}>
              Unggah dari <a href="/editor" style={{ color: "var(--gd-pink-100)" }}>Editor</a>, lalu klik
              “Sinkron foto”.
            </p>
          </div>
        ) : (
          <div className="gd-grid">
            {visible.map((photo, idx) => (
              <GdPhotoCard
                key={photo.key}
                photo={photo}
                index={idx}
                liked={Boolean(likes[photo.key])}
                likeCount={likeCountOf(photo.key)}
                commentCount={counts[photo.id] || 0}
                canInteract={canInteract}
                onOpen={() => setOpenKey(photo.key)}
                onLike={() => toggleLike(photo.key)}
                onNeedLogin={needLogin}
              />
            ))}
          </div>
        )}
      </div>

      {openPhoto && (
        <GdPostModal
          photo={openPhoto}
          index={openIndex}
          total={visible.length}
          liked={Boolean(likes[openPhoto.key])}
          likeCount={likeCountOf(openPhoto.key)}
          canInteract={canInteract}
          onClose={() => setOpenKey(null)}
          onPrev={goPrev}
          onNext={goNext}
          onLike={() => toggleLike(openPhoto.key)}
          onNeedLogin={needLogin}
          onCountChange={(photoKey, count) => {
            setCounts((prev) => ({ ...prev, [photoKey]: count }))
            markInteracted()
          }}
        />
      )}

      {toast && (
        <div className="gd-toast" role="status" aria-live="polite" data-testid="feed-toast">
          {toast}
        </div>
      )}
    </section>
  )
}
