"use client"

import { useEffect, useRef, useState } from "react"
import { formatTanggal, type Activity } from "@/lib/activities"

interface GaleriProps {
  activities: Activity[]
}

export function Galeri({ activities }: GaleriProps) {
  const [visibleLayers, setVisibleLayers] = useState<number[]>([])
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  // Maksimal 5 kegiatan; utamakan yang punya foto
  const shown = activities.filter((a) => a.image || (a.images?.length || 0) > 0).slice(0, 5)

  useEffect(() => {
    if (shown.length === 0) return

    const observers: IntersectionObserver[] = []
    layerRefs.current.forEach((el, idx) => {
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleLayers(prev => (prev.includes(idx) ? prev : [...prev, idx]))
              setTimeout(() => el.classList.add("on"), 100)
            }
          })
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [shown.length])

  if (shown.length === 0) {
    return (
      <section className="stack" id="galeri">
        <div className="layer light">
          <div className="inner">
            <p className="lempty">Belum ada kegiatan untuk galeri.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="stack" id="galeri">
      {shown.map((act, idx) => {
        const isLight = idx % 2 === 0
        const extra = (act.images || []).filter((url) => url !== act.image)
        return (
          <div
            key={act.id}
            ref={(el) => { layerRefs.current[idx] = el }}
            className={`layer ${isLight ? "light" : "dark"}`}
          >
            <div className="inner">
              <div className="ghost-w">{act.category}</div>
              <div className="lmedia">
                {act.image ? (
                  <img src={act.image} alt={act.title} loading="lazy" />
                ) : (
                  <div className="jp-mark">活</div>
                )}
                {extra.length > 0 && (
                  <div className="galeri-thumbs">
                    {extra.slice(0, 4).map((url) => (
                      <img key={url} src={url} alt="" loading="lazy" />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="lnum">0{idx + 1} / 0{shown.length}</div>
                <h2 className="ltitle">
                  <span>{act.title}</span>
                </h2>
                <p className="ldesc">{act.description || "Kegiatan yang dilaksanakan dengan penuh dedikasi."}</p>
                <div className="lmeta">
                  <span>{formatTanggal(act.date)}</span>
                  <span>{act.unit}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
