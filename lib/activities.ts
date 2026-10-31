import { isSupabaseConfigured, supabase } from "./supabase"

/** Satu kegiatan pelayanan. `images` berisi semua foto dokumentasi. */
export interface Activity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  /** Foto utama (sama dengan images[0]) */
  image?: string
  images?: string[]
}

/** Satu foto dokumentasi beserta kegiatan asalnya (dipakai carousel & pindai). */
export interface PhotoItem extends Activity {
  image: string
  key: string
}

interface RawActivity {
  id?: string | number
  title?: string | null
  date?: string | null
  unit?: string | null
  category?: string | null
  description?: string | null
  image?: string | null
  images?: string[] | null
}

const BUCKET = "pelayanan-madu"

/**
 * URL foto dari database bisa tersimpan sebagai:
 * - URL penuh  -> dipakai apa adanya
 * - nama file  -> "25854a62-....png" (isi bucket pelayanan-madu)
 * - path storage -> "pelayanan-madu/25854a62-....png"
 * Semua bentuk dinormalkan menjadi URL publik yang bisa dirender <img>.
 */
export function resolvePhotoUrl(value?: string | null): string {
  if (!value) return ""
  const raw = String(value).trim()
  if (!raw) return ""
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw
  }
  const path = raw.replace(/^\/+/, "").replace(new RegExp(`^${BUCKET}/`), "")
  if (!isSupabaseConfigured) return path
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "")
  return `${base}/storage/v1/object/public/${BUCKET}/${encodeURI(path)}`
}

/** Gabungkan image + images menjadi daftar URL unik. */
export function photoList(act: RawActivity): string[] {
  const list: string[] = []
  const push = (v?: string | null) => {
    const url = resolvePhotoUrl(v)
    if (url && !list.includes(url)) list.push(url)
  }
  // image utama dulu agar konsisten sebagai sampul kartu
  push(act.image)
  if (Array.isArray(act.images)) act.images.forEach(push)
  return list
}

export function normalizeActivity(act: RawActivity, index = 0): Activity {
  const photos = photoList(act)
  return {
    id: String(act.id ?? `kegiatan-${index}`),
    title: act.title || "Kegiatan Pelayanan",
    date: act.date || "",
    unit: act.unit || "",
    category: act.category || "Umum",
    description: act.description || "",
    image: photos[0] || "",
    images: photos,
  }
}

export function normalizeActivities(acts: RawActivity[]): Activity[] {
  return (acts || []).map(normalizeActivity)
}

/** Semua foto dari semua kegiatan, satu foto = satu item. */
export function collectPhotos(activities: Activity[]): PhotoItem[] {
  const photos: PhotoItem[] = []
  activities.forEach((act) => {
    const list = act.images && act.images.length
      ? act.images
      : act.image
        ? [act.image]
        : []
    list.forEach((image, idx) => {
      if (!image) return
      photos.push({ ...act, image, key: `${act.id}-foto-${idx}` })
    })
  })
  return photos
}

export function formatTanggal(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

/**
 * Ambil semua kegiatan (termasuk semua foto di kolom images).
 * Bila kolom `images` belum ada di database, ulangi tanpa kolom tersebut
 * agar halaman tetap menampilkan foto utama.
 */
export interface FetchResult {
  data: Activity[]
  /** Pesan teknis bila tabel tidak bisa dibaca (mis. GRANT belum dibuat) */
  error?: string
}

export async function fetchActivitiesResult(): Promise<FetchResult> {
  if (!isSupabaseConfigured) return { data: [] }

  const query = (columns: string) =>
    supabase.from("activities").select(columns).order("date", { ascending: false })

  const withImages = await query("*")
  if (!withImages.error) return { data: normalizeActivities((withImages.data || []) as RawActivity[]) }

  console.warn("Could not fetch activities with images column:", withImages.error.message)

  const fallback = await query("id,title,date,unit,category,description,image")
  if (fallback.error) {
    console.warn("Could not fetch activities:", fallback.error.message)
    return { data: [], error: fallback.error.message }
  }
  return {
    data: normalizeActivities((fallback.data || []) as RawActivity[]),
    error: withImages.error.message,
  }
}

export async function fetchActivities(): Promise<Activity[]> {
  return (await fetchActivitiesResult()).data
}

export async function fetchCaption(): Promise<string> {
  if (!isSupabaseConfigured) return ""
  const { data, error } = await supabase
    .from("site_settings")
    .select("caption")
    .eq("id", 1)
    .single()
  if (error) {
    // tabel belum dibuat -> cukup diam, caption kosong
    return ""
  }
  return data?.caption || ""
}
