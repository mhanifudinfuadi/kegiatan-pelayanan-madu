"use client"

import { useEffect, useRef } from "react"

import { asset } from "@/lib/asset"

/**
 * Backsound latar: lagu pertama diputar setelah halaman tampil (tidak memblokir
 * render), lalu lagu kedua menyusul saat lagu pertama selesai.
 * Dibuat imperatif (bukan elemen <audio> di JSX) agar tidak ikut menahan
 * hidrasi/render halaman. Gagal autoplay (kebijakan browser) diabaikan diam-diam,
 * lalu dicoba lagi pada interaksi pertama pengunjung.
 */
const TRACKS = [
  { src: asset("/audio/Natawassal%20Bil%20Hubabah.mp3"), volume: 0.25, rate: 1 },
  { src: asset("/audio/CASABLANCA.mp3"), volume: 0.2, rate: 0.85 },
]

export function Backsound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const audio = new Audio()
    audio.preload = "none"
    audioRef.current = audio

    let index = 0
    const play = async () => {
      if (cancelled || startedRef.current) return
      const track = TRACKS[index]
      audio.src = track.src
      audio.volume = track.volume
      audio.playbackRate = track.rate
      try {
        await audio.play()
        startedRef.current = true
      } catch {
        /* autoplay diblokir; dicoba lagi saat interaksi pertama */
      }
    }

    audio.onended = () => {
      if (cancelled || index >= TRACKS.length - 1) return
      index += 1
      startedRef.current = false
      play()
    }

    // Tunggu halaman benar-benar tampil (setelah frame pertama), bukan saat loading
    let raf = 0
    const start = () => {
      raf = requestAnimationFrame(() => setTimeout(play, 300))
    }

    const onFirstInteract = () => {
      if (!startedRef.current) play()
    }

    if (document.readyState === "complete") start()
    else window.addEventListener("load", start, { once: true })

    window.addEventListener("pointerdown", onFirstInteract, { once: true })
    window.addEventListener("keydown", onFirstInteract, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener("load", start)
      window.removeEventListener("pointerdown", onFirstInteract)
      window.removeEventListener("keydown", onFirstInteract)
      audio.pause()
      audio.src = ""
    }
  }, [])

  return null
}
