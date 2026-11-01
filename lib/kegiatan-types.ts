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
 * Kategori bawaan bila kegiatan tidak memilih jenis apa pun.
 * Seluruh foto dokumentasi yang diunggah dari dashboard Madu Sport
 * berkategori "Pajak Bertutur", jadi nilai ini dipakai sebagai default.
 * Jangan mengganti kategori yang memang sudah dipilih di dashboard.
 */
export const KATEGORI_BAWAAN: JenisKegiatan = "Pajak Bertutur"

/**
 * Label kategori untuk ditampilkan:
 * - kategori apa pun yang dipilih di dashboard Madu Sport dipakai apa adanya
 * - kategori kosong / hanya penanda sistem ("Dokumentasi", "Umum", "Lainnya")
 *   ditampilkan sebagai kategori bawaan
 */
export function labelJenis(kategori?: string | null): string {
  const raw = (kategori || "").trim()
  if (!raw) return KATEGORI_BAWAAN
  if (/^(dokumentasi|umum|lainnya|lain-lain)$/i.test(raw)) return KATEGORI_BAWAAN
  return raw
}

/**
 * Petakan kategori dari database ke daftar jenis kegiatan.
 * Kategori di luar daftar tetap dipertahankan (tidak dipaksa "Lain-lain"),
 * supaya pilihan kategori dari dashboard Madu Sport tidak hilang.
 */
export function normalizeJenis(kategori?: string | null): string {
  const raw = (kategori || "").trim()
  if (!raw) return KATEGORI_BAWAAN
  if (/^(dokumentasi|umum|lainnya|lain-lain)$/i.test(raw)) return KATEGORI_BAWAAN
  return raw
}

export const INSTITUSI = "KPP Madya Dua Jakarta Barat"
