"use client"

import { useEffect, useRef } from "react"

/**
 * Section #tentang — disesuaikan dengan design-sakura.md:
 * latar hitam + video bunga (flower.mp4) di bagian bawah (90vh).
 * Tanpa teks. Hormati prefers-reduced-motion.
 */
export function GdFloral() {
  const videoRef = useRef<HTMLVideoElement>(null)

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

  return (
    <section
      className="gd-floral"
      id="tentang"
      data-testid="floral-section"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000000",
        overflow: "hidden",
        padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "42rem",
          margin: "0 auto 3rem",
          textAlign: "center",
        }}
      >
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
