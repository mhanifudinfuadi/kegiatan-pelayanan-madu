"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * Section #tentang — disesuaikan dengan design-sakura.md:
 * latar hitam dengan efek bintang bergerak (seperti footer), konten difokuskan
 * ke tengah laman. Tanpa teks di luar konten. Hormati prefers-reduced-motion.
 */
export function GdFloral() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const starRef = useRef<HTMLCanvasElement>(null)

  // --- Video bunga (background, bawah) ---
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      video.pause()
      video.removeAttribute("autoplay")
      return
    }

    const play = () => video.play().catch(() => {})
    play()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play()
          else video.pause()
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // --- Efek bintang bergerak di latar hitam (mirip footer) ---
  useEffect(() => {
    const canvas = starRef.current
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let frame = 0

    const stars: { x: number; y: number; z: number; p: number }[] = []
    const starCount = 420

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars.length = 0
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width,
          y: (Math.random() - 0.5) * height,
          z: Math.random() * 1000,
          p: Math.random(),
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "#FFFFFF"
      for (const s of stars) {
        s.z -= 1.2
        if (s.z <= 0) s.z = 1000
        const k = 1000 / s.z
        const px = s.x * k + width / 2
        const py = s.y * k + height / 2
        const r = (1 - s.z / 1000) * 1.5
        const a = 0.5 + 0.5 * Math.sin(Date.now() / 1000 + s.p)
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section
      className="gd-floral"
      id="tentang"
      data-testid="floral-section"
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "#000000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem)",
      }}
    >
      <canvas ref={starRef} className="floral-stars" aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "42rem" }}>
        <p
          style={{
            letterSpacing: ".2em",
            color: "#E9B6C9",
            fontSize: ".8rem",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          花見 · TENTANG KEGIATAN
        </p>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontFamily: "serif", margin: "0 0 1.5rem", color: "#F3EBDD" }}>
          そして、君がいた。
        </h2>
        <p
          style={{
            color: "#8F8BA8",
            lineHeight: 1.7,
            margin: "0 0 1rem",
            maxWidth: "42rem",
          }}
        >
          Of all the things this world has given me, you are the one I was never prepared to feel.
        </p>
        <p
          style={{
            color: "#F3EBDD",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: "42rem",
          }}
        >
          Sometimes we document not just as an act of memory, but as a tribute to the quiet brilliance of the things that truly matter.
        </p>
      </div>

      <div
        className="video-container"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "80vh",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <video
          id="bg-video"
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "110%",
            objectFit: "cover",
            display: "block",
            transform: "translateY(0%)",
          }}
        >
          <source
            src="https://api.getlayers.ai/storage/v1/object/public/public/assets/loopstack-f8c64439bf/flower.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </section>
  )
}
