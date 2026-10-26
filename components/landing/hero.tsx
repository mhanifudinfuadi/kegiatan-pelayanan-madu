"use client"

import { useEffect, useRef } from "react"

interface HeroProps {
  caption?: string
}

export function Hero({ caption }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)

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

    if (textRef.current) observer.observe(textRef.current)
    if (btnRef.current) observer.observe(btnRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="hero" id="beranda">
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/moon-walk.mp4" type="video/mp4" />
      </video>

      <div className="mist m1" />
      <div className="mist m2" />

      <div className="hero-text" ref={textRef}>
        <p className="jp">桜 · 雪 · 月 · 花</p>
        <h1>Pelayanan<br />Unit Kerja</h1>
        <p className="caption rv">
          {caption || "Kawaguchiko — di tepi danau, di bawah bulan purnama, setiap kegiatan adalah satu langkah menuju kebaikan bersama."}
        </p>
        <a href="#kegiatan" className="btn rv" ref={btnRef}>
          Lihat Kegiatan
          <span>→</span>
        </a>
      </div>
    </section>
  )
}