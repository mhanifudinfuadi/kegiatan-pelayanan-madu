"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchCommentCounts } from "@/lib/comments"
import { KomentarPanel } from "./komentar-panel"

interface Activity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  image?: string
}

interface KegiatanProps {
  activities: Activity[]
}

export function Kegiatan({ activities }: KegiatanProps) {
  const [activeCategory, setActiveCategory] = useState("semua")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [openId, setOpenId] = useState<string | null>(null)

  // Jumlah komentar per kegiatan, dimuat sekali saat halaman siap
  useEffect(() => {
    fetchCommentCounts()
      .then(setCounts)
      .catch(() => {})
  }, [])

  const handleCountChange = useCallback((id: string, n: number) => {
    setCounts((prev) => (prev[id] === n ? prev : { ...prev, [id]: n }))
  }, [])

  // lewat useMemo agar referensinya stabil saat panel memuat komentar
  const openActivity = useMemo(
    () => activities.find((a) => a.id === openId) || null,
    [activities, openId]
  )

  const categories = ["semua", ...Array.from(new Set(activities.map(a => a.category)))]

  const filtered = activeCategory === "semua"
    ? activities
    : activities.filter(a => a.category === activeCategory)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <section className="acts" id="kegiatan">
      <div className="ghost">Kegiatan</div>
      <div className="wrap">
        <p className="eyebrow">Kegiatan</p>
        <h2>Yang Telah Dibuat</h2>

        <div className="chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "on" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">Belum ada kegiatan.</div>
        ) : (
          <div className="grid">
            {filtered.map((act) => (
              <article key={act.id} className="card">
                {/* klik foto = buka komentar, seperti membuka post di Instagram */}
                <button
                  type="button"
                  className="media media--btn"
                  onClick={() => setOpenId(act.id)}
                  aria-label={`Lihat dan komentari ${act.title}`}
                >
                  {act.image ? (
                    <img src={act.image} alt={act.title} loading="lazy" />
                  ) : (
                    <div className="jp-mark">活</div>
                  )}
                  <span className="media__hint" aria-hidden="true">
                    Komentar
                  </span>
                </button>
                <div className="cbody">
                  <div className="meta">
                    <span>{formatDate(act.date)}</span>
                    <span>{act.category}</span>
                  </div>
                  <h3>{act.title}</h3>
                  {act.description && <p className="desc">{act.description}</p>}
                  <div className="cfoot">
                    <div className="unit">{act.unit}</div>
                    <button
                      type="button"
                      className="cbtn"
                      onClick={() => setOpenId(act.id)}
                      aria-label={`Komentar ${act.title}, ${counts[act.id] || 0} komentar`}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <path
                          d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20l1-4.8A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{counts[act.id] || 0}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {openActivity && (
        <KomentarPanel
          activity={openActivity}
          onClose={() => setOpenId(null)}
          onCountChange={handleCountChange}
        />
      )}
    </section>
  )
}