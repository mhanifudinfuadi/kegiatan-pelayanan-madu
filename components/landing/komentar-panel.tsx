  "use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  addComment,
  deleteComment,
  fetchComments,
  getDeviceId,
  getSavedName,
  timeAgo,
  type Comment,
} from "@/lib/comments"

export interface CommentActivity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  image?: string
  images?: string[]
}

interface KomentarPanelProps {
  activity: CommentActivity
  onClose: () => void
  onCountChange?: (activityId: string, count: number) => void
}

/** Inisial untuk avatar bulat, maksimal dua huruf. */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function KomentarPanel({ activity, onClose, onCountChange }: KomentarPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [sending, setSending] = useState(false)
  const [deviceId, setDeviceId] = useState("")
  const [savedName, setSavedName] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchComments(activity.id)
      setComments(rows)
      onCountChange?.(activity.id, rows.length)
    } catch (err: any) {
      setError(
        err?.code === "42P01"
          ? "Tabel komentar belum dibuat. Jalankan migrasi 002_create_comments.sql."
          : "Komentar gagal dimuat."
      )
    } finally {
      setLoading(false)
    }
  }, [activity.id, onCountChange])

  useEffect(() => {
    setDeviceId(getDeviceId())
    setSavedName(getSavedName())
    setName(getSavedName())
    setBody("")
    setReplyTo(null)
    load()
  }, [load])

  // Tutup dengan Esc dan kunci scroll halaman selama panel terbuka
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // Fokus ke kolom komentar saat panel dibuka
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120)
    return () => clearTimeout(t)
  }, [])

  const roots = useMemo(() => comments.filter((c) => !c.parent_id), [comments])
  const repliesOf = useCallback(
    (id: string) => comments.filter((c) => c.parent_id === id),
    [comments]
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    const trimmed = body.trim()
    if (!name.trim() || !trimmed) {
      setError("Nama dan komentar wajib diisi.")
      return
    }
    setSending(true)
    setError(null)
    try {
      const created = await addComment({
        activityId: activity.id,
        parentId: replyTo?.id ?? null,
        name,
        body: trimmed,
      })
      setComments((prev) => [...prev, created])
      onCountChange?.(activity.id, comments.length + 1)
      // nama sudah tersimpan, kolom nama bisa disembunyikan
      if (!savedName) setSavedName(name.trim())
      setBody("")
      setReplyTo(null)
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
      })
    } catch {
      setError("Komentar gagal dikirim. Coba lagi.")
    } finally {
      setSending(false)
    }
  }

  const remove = async (c: Comment) => {
    try {
      await deleteComment(c.id)
      const next = comments.filter((x) => x.id !== c.id && x.parent_id !== c.id)
      setComments(next)
      onCountChange?.(activity.id, next.length)
    } catch {
      setError("Komentar tidak bisa dihapus.")
    }
  }

  const startReply = (c: Comment) => {
    setReplyTo(c)
    setBody(`@${c.name} `)
    inputRef.current?.focus()
  }

  return (
    <div className="km-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="km"
        role="dialog"
        aria-modal="true"
        aria-label={`Komentar: ${activity.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kiri: foto kegiatan (post) */}
        <div className="km__media">
          {activity.image ? (
            <img src={activity.image} alt={activity.title} />
          ) : (
            <div className="km__nomedia">
              <span>活</span>
            </div>
          )}
          <div className="km__media-tag" aria-hidden="true">
            <span>{activity.category}</span>
            <span>{formatDate(activity.date)}</span>
          </div>
        </div>

        {/* Kanan: header, kolom komentar, kolom input */}
        <div className="km__side">
          <header className="km__head">
            <div className="km__avatar" aria-hidden="true">
              {initials(activity.unit || "K")}
            </div>
            <div className="km__headtext">
              <strong>{activity.unit}</strong>
              <span>
                {activity.title} · {formatDate(activity.date)}
              </span>
            </div>
            <button className="km__x" onClick={onClose} aria-label="Tutup komentar">
              ×
            </button>
          </header>

          <div className="km__list" ref={listRef} aria-live="polite">
            {activity.description && (
              <p className="km__caption">
                <strong>{activity.unit}</strong> {activity.description}
              </p>
            )}

            {loading && <p className="km__state">Memuat komentar…</p>}

            {!loading && roots.length === 0 && !error && (
              <div className="km__empty">
                <p>Belum ada komentar.</p>
                <span>Mulai percakapan dengan memberi komentar pada foto ini.</span>
              </div>
            )}

            {roots.map((c) => (
              <div key={c.id} className="km__item">
                <div className="km__avatar km__avatar--sm" aria-hidden="true">
                  {initials(c.name)}
                </div>
                <div className="km__bubblewrap">
                  <div className="km__bubble">
                    <p>
                      <strong>{c.name}</strong> {c.body}
                    </p>
                  </div>
                  <div className="km__meta">
                    <span>{timeAgo(c.created_at)}</span>
                    <button type="button" onClick={() => startReply(c)}>
                      Balas
                    </button>
                    {deviceId && c.device_id === deviceId && (
                      <button type="button" onClick={() => remove(c)}>
                        Hapus
                      </button>
                    )}
                  </div>

                  {repliesOf(c.id).map((r) => (
                    <div key={r.id} className="km__reply">
                      <div className="km__avatar km__avatar--xs" aria-hidden="true">
                        {initials(r.name)}
                      </div>
                      <div className="km__bubblewrap">
                        <div className="km__bubble">
                          <p>
                            <strong>{r.name}</strong> {r.body}
                          </p>
                        </div>
                        <div className="km__meta">
                          <span>{timeAgo(r.created_at)}</span>
                          {deviceId && r.device_id === deviceId && (
                            <button type="button" onClick={() => remove(r)}>
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <form className="km__form" onSubmit={submit}>
            {replyTo && (
              <div className="km__replying">
                Membalas <strong>{replyTo.name}</strong>
                <button type="button" onClick={() => setReplyTo(null)} aria-label="Batalkan balasan">
                  ×
                </button>
              </div>
            )}
            {error && (
              <p className="km__error" role="alert">
                {error}
              </p>
            )}
            {!savedName && (
              <input
                className="km__name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                maxLength={60}
                required
                aria-label="Nama Anda"
              />
            )}
            <div className="km__composer">
              <textarea
                ref={inputRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis komentar…"
                maxLength={1000}
                rows={1}
                required
                aria-label="Tulis komentar"
              />
              <button type="submit" disabled={sending || !body.trim()}>
                {sending ? "Mengirim…" : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
