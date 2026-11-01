/**
 * Jenis kegiatan pelayanan KPP Madya Dua Jakarta Barat.
 * Dipakai untuk filter feed, form editor, dan label kategori.
 */
export const JENIS_KEGIATAN = [
  "Pojok Pajak",
  "Layanan di Luar Kantor",
  "Klinik Pajak",
  "Pendampingan Pelaporan SPT",
  "Pendampingan Layanan Coretax",
  "Konsultasi Perpajakan",
  "Pelayanan Terpadu",
  "Survei Kepuasan Wajib Pajak",
  "Peningkatan Kualitas Pelayanan",
  "Pajak Bertutur",
  "Lain-lain",
] as const

export type JenisKegiatan = (typeof JENIS_KEGIATAN)[number]

/**
 * Petakan kategori bebas dari database ke 11 jenis di atas.
 * Kategori lama (mis. "Dokumentasi", "Umum") menjadi "Lain-lain".
 */
export function normalizeJenis(kategori?: string | null): JenisKegiatan {
  const raw = (kategori || "").trim().toLowerCase()
  if (!raw) return "Lain-lain"
  const exact = JENIS_KEGIATAN.find((j) => j.toLowerCase() === raw)
  if (exact) return exact
  const partial = JENIS_KEGIATAN.find(
    (j) => raw.includes(j.toLowerCase()) || j.toLowerCase().includes(raw)
  )
  return partial || "Lain-lain"
}

export const INSTITUSI = "KPP Madya Dua Jakarta Barat"
