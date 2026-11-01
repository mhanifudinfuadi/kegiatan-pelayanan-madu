"use client"

import { INSTITUSI } from "@/lib/kegiatan-types"

/**
 * Section kaca bunga (#tentang) — posisinya tepat DI ATAS footer,
 * mempertahankan section bunga yang sudah ada pada layout sebelumnya.
 * Bunga kaca digambar dengan CSS agar tidak bergantung pada berkas video
 * (poster/video bunga lama tidak ada di repo).
 */
export function GdFloral() {
  return (
    <section className="gd-floral" id="tentang" data-testid="floral-section">
      <div className="gd-wrap">
        <div className="gd-floral__panel gd-glass">
          <div className="gd-floral__media">
            <div className="gd-floral__glow" aria-hidden="true" />
            {/* bunga kaca CSS (pengganti video yang tidak tersedia) */}
            <div className="gd-blossom" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <b />
            </div>

          </div>

          <div>
            <p className="gd-over">活動記録 — Tentang</p>
            <h2>Tentang Kegiatan Pelayanan</h2>
            <p>
              Galeri ini merangkum kegiatan pelayanan {INSTITUSI} — Direktorat Jenderal Pajak,
              Kementerian Keuangan. Setiap foto adalah jejak kerja pegawai yang menemani wajib pajak
              dalam menjalankan kewajibannya, direkam dengan tenang seperti bunga di malam hari.
            </p>

            <ul className="gd-features">
              <li>
                <b>Dokumentasi jujur</b>
                <span>Diambil langsung dari kegiatan yang dilaksanakan.</span>
              </li>
              <li>
                <b>Partisipasi pegawai</b>
                <span>Beri hati dan komentar untuk mengapresiasi setiap momen.</span>
              </li>
              <li>
                <b>Arsip terbuka</b>
                <span>Mudah ditelusuri berdasarkan jenis kegiatan dan tanggal.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
