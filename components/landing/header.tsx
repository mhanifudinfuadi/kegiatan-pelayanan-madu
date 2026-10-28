"use client"

import { useEffect, useState } from "react"

export function Header() {
  const [time, setTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, "0")
      const m = now.getMinutes().toString().padStart(2, "0")
      setTime(`${h}:${m}`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) return null

  return (
    <header className="top">
      <a href="#beranda" className="brand">Thou art my rarest exception.</a>
      <nav>
        <span className="clock">{time}</span>
        <a href="#kegiatan">Kegiatan</a>
        <a href="#statistik">Statistik</a>
        <a href="#tentang">Tentang</a>
      </nav>
    </header>
  )
}