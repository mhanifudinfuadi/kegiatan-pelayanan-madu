"use client"

import { useEffect, useState } from "react"
import { LimelightNav } from "@/components/ui/limelight-nav"
import { Images, Info, Scan } from "lucide-react"

/**
 * Navigasi kaca (fixed). Tanpa menu admin — sesuai panduan rekonfigurasi.
 * Nama pegawai tampil di sini bila sesi tersimpan di perangkat.
 */
export function GdNav() {
  const [nama, setNama] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    // nama tersimpan saat pegawai mengisi komentar
    try {
      setNama(localStorage.getItem("komentar-nama") || "")
    } catch {
      /* localStorage diblokir: biarkan kosong */
    }

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

  const keluar = () => {
    try {
      localStorage.removeItem("komentar-nama")
    } catch {
      /* abaikan */
    }
    setNama("")
  }

  const items = [
    { id: "nav-galeri", icon: <Images />, label: "Galeri", onClick: () => { window.location.hash = "dokumentasi" } },
    { id: "nav-tentang", icon: <Info />, label: "Tentang", onClick: () => { window.location.hash = "tentang" } },
    { id: "nav-pindai", icon: <Scan />, label: "Pindai", onClick: () => { window.location.hash = "scan" } },
  ]

  return (
    <nav className="gd-nav" aria-label="Navigasi utama" data-testid="site-nav">
      <a href="#beranda" className="gd-brand" data-testid="nav-brand">
        <span className="gd-brand__mark" aria-hidden="true">
          蜜
        </span>
        Galeri Madu
        <span className="gd-nav__clock" style={{ marginLeft: "0.6rem", fontFamily: "var(--gd-font-mono)", fontSize: "0.85rem", color: "rgba(233,231,241,0.78)" }}>
          {time}
        </span>
      </a>

      <div className="gd-nav__links">
        <LimelightNav items={items} className="bg-transparent border-0 gap-4" />
        {nama ? (
          <>
            <span className="gd-nav__who" data-testid="nav-user">
              {nama}
            </span>
            <button type="button" className="gd-btn gd-btn--ghost" onClick={keluar} data-testid="nav-keluar">
              Keluar
            </button>
          </>
        ) : null}
      </div>
    </nav>
  )
}
