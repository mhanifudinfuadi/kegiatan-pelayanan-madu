"use client"

import { useEffect, useRef, useState } from "react"
import { addComment, fetchComments, timeAgo, type Comment } from "@/lib/comments"
import { formatTanggal, type PhotoItem } from "@/lib/activities"
import { INSTITUSI } from "@/lib/kegiatan-types"

interface GdPostModalProps {
  photo: PhotoItem
  index: number
  total: number
  liked: boolean
  likeCount: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onLike: () => void
  onCountChange: (photoKey: string, count: number) => void
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

/**
 * Panel dokumentasi (dialog split): foto besar di kiri, narasi + komentar di kanan.
 * Esc menutup, panah kiri/kanan berpindah foto, klik ganda pada foto = hati.
 */
export function GdPostModal({
  photo,
  index,
  total,
  liked,
  likeCount,
  onClose,
  onPrev,
  onNext,
  onLike,
  onCountChange,
}: GdPostModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [nama, setNama] = useState("")
  const [namaTersimpan, setNamaTersimpan] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [pop, setPop] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Muat komentar setiap kali foto berganti
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError("")
    fetchComments(photo.id)
      .then((rows) => {
        if (!alive) return
        setComments(rows)
        onCountChange(photo.key, rows.length)
      })
      .catch((err: any) => {
        if (!alive) return
        const code = err?.code || ""
        setError(
          code === "PGRST205" || code === "42P01"
            ? "Tabel komentar belum dibuat. Jalankan migrasi 002/004 di Supabase."
            : code === "42501"
              ? "Akses tabel komentar ditolak. Jalankan migrasi 004 di Supabase."
              : "Komentar gagal dimuat."
        )
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id])

  useEffect(() => {
    try {
      setNamaTersimpan(localStorage.getItem("komentar-nama") || "")
      setNama(localStorage.getItem("komentar-nama") || "")
    } catch {
      /* abaikan */
    }
  }, [])

  // Esc menutup, panah berpindah foto, scroll body dikunci
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onPrev, onNext])

  const doLike = () => {
    setPop((p) => p + 1)
    onLike()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    const text = body.trim()
    const name = (namaTersimpan || nama).trim()
    if (!text) return
    if (!name) {
      setError("Isi nama Anda dulu agar komentar dikenali.")
      return
    }
    setSending(true)
    setError("")
    try {
      const created = await addComment({ activityId: photo.id, name, body: text })
      const next = [...comments, created]
      setComments(next)
      onCountChange(photo.key, next.length)
      setNamaTersimpan(name)
      try {
        localStorage.setItem("komentar-nama", name)
      } catch {
        /* abaikan */
      }
      setBody("")
      requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }))
    } catch (err: any) {
      const code = err?.code || ""
      setError(
        code === "PGRST205" || code === "42P01"
          ? "Tabel komentar belum dibuat. Jalankan migrasi 002/004 di Supabase."
          : "Komentar gagal dikirim. Coba lagi."
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="gd-modal" onClick={onClose} data-testid="post-modal" role="dialog" aria-modal="true" aria-label={`Dokumentasi ${photo.title}`}>
      <div className="gd-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="gd-modal__media" onDoubleClick={doLike}>
          <img src={photo.image} alt={photo.title} />
          {pop > 0 && (
            <span key={pop} className="gd-heart-pop" aria-hidden="true">
              ♥
            </span>
          )}
          {total > 1 && (
            <>
              <button type="button" className="gd-modal__nav prev" onClick={onPrev} aria-label="Foto sebelumnya" data-testid="post-prev">
                ‹
              </button>
              <button type="button" className="gd-modal__nav next" onClick={onNext} aria-label="Foto berikutnya" data-testid="post-next">
                ›
              </button>
            </>
          )}
        </div>

        <div className="gd-modal__side">
          <header className="gd-modal__head">
            <span className="gd-avatar" aria-hidden="true">
              蜜
            </span>
            <div className="gd-modal__headtext">
              <b>{photo.title}</b>
              <span>
                {formatTanggal(photo.date)} · {photo.category}
              </span>
            </div>
            <button type="button" className="gd-modal__x" onClick={onClose} aria-label="Tutup dokumentasi" data-testid="post-close">
              ×
            </button>
          </header>

          <div className="gd-modal__body" ref={bodyRef}>
            <p className="gd-over">活動 — Dokumentasi Kegiatan</p>
            <p className="gd-modal__doc" style={{ marginTop: ".6rem" }}>
              {photo.description || "Dokumentasi kegiatan pelayanan pada unit kerja ini."}
            </p>
            <div className="gd-modal__sub">
              <span>{INSTITUSI}</span>
              <span>{photo.unit}</span>
              <span>
                {index + 1} / {total}
              </span>
            </div>

            <div className="gd-modal__actions">
              <button type="button" onClick={doLike} className={liked ? "on" : ""} data-testid="post-like">
                <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {likeCount}
              </button>
              <span style={{ fontSize: ".82rem", color: "var(--gd-muted)" }}>💬 {comments.length}</span>
            </div>

            <div className="gd-thread" aria-live="polite">
              {loading && <p style={{ fontSize: ".85rem", color: "var(--gd-muted)" }}>Memuat komentar…</p>}
              {!loading && comments.length === 0 && !error && (
                <p style={{ fontSize: ".85rem", color: "var(--gd-muted)" }}>Belum ada komentar.</p>
              )}
              {comments.map((c) => (
                <div className="gd-comment" key={c.id}>
                  <span className="gd-avatar gd-avatar--sm" aria-hidden="true">
                    {initials(c.name)}
                  </span>
                  <div>
                    <div className="gd-comment__bubble">
                      <b>{c.name}</b>
                      {c.body}
                    </div>
                    <div className="gd-comment__meta">
                      <span>{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="gd-modal__form" onSubmit={submit} id="komentar">
            {error && (
              <p role="alert" style={{ fontSize: ".78rem", color: "var(--gd-pink-100)", marginBottom: ".5rem" }}>
                {error}
              </p>
            )}
            {!namaTersimpan && (
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Anda"
                maxLength={60}
                aria-label="Nama Anda"
                data-testid="comment-name"
              />
            )}
            <div className="gd-modal__formrow">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis komentar…"
                maxLength={1000}
                rows={2}
                aria-label="Tulis komentar"
                data-testid="comment-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    submit(e as unknown as React.FormEvent)
                  }
                }}
              />
              <button type="submit" disabled={sending || !body.trim()} data-testid="comment-submit">
                {sending ? "Mengirim…" : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
