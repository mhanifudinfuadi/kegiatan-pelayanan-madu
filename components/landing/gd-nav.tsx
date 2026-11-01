"use client"

import { useEffect, useState } from "react"

/**
 * Navigasi kaca (fixed). Tanpa menu admin — sesuai panduan rekonfigurasi.
 * Nama pegawai tampil di sini bila sesi tersimpan di perangkat.
 */
export function GdNav() {
  const [nama, setNama] = useState("")

  useEffect(() => {
    // nama tersimpan saat pegawai mengisi komentar
    try {
      setNama(localStorage.getItem("komentar-nama") || "")
    } catch {
      /* localStorage diblokir: biarkan kosong */
    }
  }, [])

  const keluar = () => {
    try {
      localStorage.removeItem("komentar-nama")
    } catch {
      /* abaikan */
    }
    setNama("")
  }

  return (
    <nav className="gd-nav" aria-label="Navigasi utama" data-testid="site-nav">
      <a href="#beranda" className="gd-brand" data-testid="nav-brand">
        <span className="gd-brand__mark" aria-hidden="true">
          蜜
        </span>
        Galeri Madu
      </a>

      <div className="gd-nav__links">
        <a href="#dokumentasi" data-testid="nav-galeri">
          Galeri
        </a>
        <a href="#tentang" data-testid="nav-tentang">
          Tentang
        </a>
        {nama ? (
          <>
            <span className="gd-nav__who" data-testid="nav-user">
              {nama}
            </span>
            <button type="button" className="gd-btn gd-btn--ghost" onClick={keluar} data-testid="nav-keluar">
              Keluar
            </button>
          </>
        ) : (
          <>
            <a
              href="#komentar"
              className="gd-btn gd-nav__hide"
              data-testid="nav-masuk"
              title="Isi nama Anda sekali saat memberi komentar"
            >
              Masuk
            </a>
            <a href="#dokumentasi" className="gd-btn gd-btn--primary" data-testid="nav-daftar">
              Daftar
            </a>
          </>
        )}
      </div>
    </nav>
  )
}
