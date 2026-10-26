"use client"

import { useState } from "react"

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
                <div className="media">
                  {act.image ? (
                    <img src={act.image} alt={act.title} loading="lazy" />
                  ) : (
                    <div className="jp-mark">活</div>
                  )}
                </div>
                <div className="cbody">
                  <div className="meta">
                    <span>{formatDate(act.date)}</span>
                    <span>{act.category}</span>
                  </div>
                  <h3>{act.title}</h3>
                  {act.description && <p className="desc">{act.description}</p>}
                  <div className="unit">{act.unit}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}