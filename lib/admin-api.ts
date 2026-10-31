import { supabase } from "./supabase"

/**
 * Amplop hasil operasi admin: `message` selalu bisa ditampilkan ke pengguna,
 * `repaired` berisi jumlah foto yang berhasil ditautkan ke tabel activities.
 */
export interface AdminResult {
  ok: boolean
  message: string
  repaired?: number
  total?: number
}

/**
 * Perbaiki data foto lewat API server (memakai service role).
 * Berguna saat upload ke bucket berhasil tetapi penyimpanan ke tabel gagal
 * (mis. RLS/GRANT), sehingga foto tidak muncul di web.
 */
export async function repairPhotos(sessionToken?: string | null): Promise<AdminResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`

  try {
    const res = await fetch("/api/admin/sync-photos", { method: "POST", headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        message:
          data?.message ||
          (res.status === 404
            ? "Endpoint perbaikan tidak tersedia (build statis). Jalankan migrasi 004 di Supabase SQL Editor."
            : "Gagal memperbaiki tautan foto."),
        repaired: data?.repaired,
      }
    }
    return {
      ok: true,
      message: data?.message || "Foto dokumentasi berhasil disinkronkan.",
      repaired: data?.repaired,
      total: data?.total,
    }
  } catch (err: any) {
    return { ok: false, message: `Perbaikan gagal dijalankan: ${err?.message || "jaringan"}` }
  }
}

/** Pesan error Supabase yang lebih jelas untuk pengguna. */
export function explainError(message: string): string {
  const m = message || ""
  if (/permission denied for table/i.test(m)) {
    return `${m}. Jalankan migrasi 004_fix_activity_photos.sql di Supabase SQL Editor (GRANT tabel belum aktif).`
  }
  if (/does not exist/i.test(m) && /images/i.test(m)) {
    return `${m}. Kolom images belum dibuat — jalankan migrasi 003/004.`
  }
  if (/new row violates row-level security/i.test(m)) {
    return `${m}. Akun ini belum terdaftar di tabel editor_users, atau policy storage belum dibuat (migrasi 004).`
  }
  if (/bucket not found/i.test(m)) {
    return `${m}. Bucket pelayanan-madu belum dibuat.`
  }
  return m
}
