"use client"

import { useEffect, useRef } from "react"

export function Tentang() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in")
          }
        })
      },
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="tentang" id="tentang">
      <div className="wrap">
        <p className="big rv" ref={ref}>
          Di <span>Kawaguchiko</span>, setiap kegiatan adalah<span>bukti bahwa pelayanan itu indah</span>.
        </p>
      </div>
    </section>
  )
}