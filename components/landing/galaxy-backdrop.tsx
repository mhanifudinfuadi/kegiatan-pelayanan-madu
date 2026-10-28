"use client"

import { useEffect, useRef } from "react"

/**
 * Latar "Glass Flower Galaxy" — dipasang di ujung section galeri, tepat sebelum
 * section Pindaian Kegiatan. Susunan layer (bawah ke atas):
 * base → nebula → bintang → halo → bunga → vignette.
 * Nilai warna & posisi diambil dari tokens.css (design-tokens.json).
 */
export function GalaxyBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current

    // tampilkan video hanya setelah benar-benar bisa diputar, poster tetap jadi fallback
    const flower = video?.parentElement ?? null
    const onPlaying = () => flower?.classList.add("playing")
    video?.addEventListener("playing", onPlaying)

    // fallback poster + reduced-motion: video tidak diputar
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      if (video) {
        video.pause()
        video.removeAttribute("autoplay")
      }
    }

    if (!canvas) {
      return () => video?.removeEventListener("playing", onPlaying)
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return () => video?.removeEventListener("playing", onPlaying)

    // Jumlah bintang mengikuti token: 750 desktop / 300 mobile
    const stars: { x: number; y: number; r: number; a: number; p: number }[] = []
    let frame = 0
    let width = 0
    let height = 0
    let loop = (_t: number) => {}

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      width = parent.clientWidth
      height = parent.clientHeight
      const d = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * d
      canvas.height = height * d
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(d, 0, 0, d, 0, 0)

      stars.length = 0
      const n = width < 768 ? 300 : 750
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.4,
          a: Math.random() * 0.5 + 0.45,
          p: Math.random() * 6,
        })
      }
      draw(0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      // putih murni sesuai token --star-white
      ctx.fillStyle = "#FFFFFF"
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.75 + 0.25 * Math.sin(t / 1800 + s.p))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    loop = (t: number) => {
      draw(t)
      frame = requestAnimationFrame(loop)
    }

    // Hentikan animasi & video saat latar tidak terlihat (hemat CPU/baterai)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (reduce) return
          if (entry.isIntersecting) {
            if (!frame) frame = requestAnimationFrame(loop)
            video?.play().catch(() => {})
          } else {
            cancelAnimationFrame(frame)
            frame = 0
            video?.pause()
          }
        })
      },
      { threshold: 0 }
    )

    resize()
    observer.observe(canvas)
    window.addEventListener("resize", resize)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", resize)
      video?.removeEventListener("playing", onPlaying)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="fx" aria-hidden="true">
      <div className="fx__base" />
      <div className="fx__nebula" />
      <canvas className="fx__stars" ref={canvasRef} />
      <div className="fx__halo" />
      <div className="fx__flower">
        <img alt="" src="/flower/glass-flower-1280.jpg" />
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/flower/glass-flower-1280.jpg"
          src="/flower/glass-flower-1280.mp4"
        />
        <div className="fx__tint" />
      </div>
      <div className="fx__vig" />
    </div>
  )
}
