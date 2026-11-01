"use client"

import { useEffect, useState } from "react"
import { LimelightNav } from "@/components/ui/limelight-nav"
import { Images, BarChart2, Info } from "lucide-react"

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

  const items = [
    { id: "nav-kegiatan", icon: <Images />, label: "Kegiatan", onClick: () => { window.location.hash = "kegiatan" } },
    { id: "nav-statistik", icon: <BarChart2 />, label: "Statistik", onClick: () => { window.location.hash = "statistik" } },
    { id: "nav-tentang", icon: <Info />, label: "Tentang", onClick: () => { window.location.hash = "tentang" } },
  ]

  return (
    <header className="top">
      <a href="#beranda" className="brand">Thou art my rarest exception.</a>
      <div className="top__stack">
        <LimelightNav
          items={items}
          className="bg-transparent border-0 gap-3"
          iconContainerClassName="top__nav-item"
          iconClassName="w-5 h-5 transition-all duration-200"
        />
        <span className="top__clock" aria-hidden="true">{time}</span>
      </div>
    </header>
  )
}