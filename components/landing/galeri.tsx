"use client"

import { useEffect, useRef, useState } from "react"

interface Activity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  image?: string
}

interface GaleriProps {
  activities: Activity[]
}

export function Galeri({ activities }: GaleriProps) {
  const [visibleLayers, setVisibleLayers] = useState<number[]>([])
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReduced = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  useEffect(() => {
    if (activities.length === 0) return

    const observers: IntersectionObserver[] = []
    layerRefs.current.forEach((el, idx) => {
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleLayers(prev => {
                if (prev.includes(idx)) return prev
                return [...prev, idx]
              })
              // Add 'on' class for title animation
              setTimeout(() => {
                el.classList.add("on")
              }, 100)
            }
          })
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [activities.length])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  if (activities.length === 0) {
    return (
      <section className="stack">
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
      {activities.slice(0, 5).map((act, idx) => {
        const isLight = idx % 2 === 0
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
                  <img src={act.image} alt={act.title} />
                ) : (
                  <div className="jp-mark">活</div>
                )}
              </div>
              <div>
                <div className="lnum">0{idx + 1} / 0{Math.min(activities.length, 5)}</div>
                <h2 className="ltitle">
                  <span>{act.title}</span>
                </h2>
                <p className="ldesc">{act.description || "Kegiatan yang dilaksanakan dengan penuh dedikasi."}</p>
                <div className="lmeta">
                  <span>{formatDate(act.date)}</span>
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