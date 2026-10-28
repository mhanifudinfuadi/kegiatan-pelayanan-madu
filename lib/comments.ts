import { isSupabaseConfigured, supabase } from "./supabase"

/** Satu komentar pada sebuah kegiatan (satu kegiatan = satu foto). */
export interface Comment {
  id: string
  activity_id: string
  parent_id: string | null
  name: string
  body: string
  created_at: string
  /** Penanda anonim milik perangkat ini; dipakai untuk izin hapus sendiri */
  device_id?: string | null
}

const KEY = "komentar-perangkat"

/** ID acak per perangkat, dibuat sekali dan disimpan di localStorage. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(KEY)
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, id)
  }
  return id
}

/** Simpan nama terakhir supaya pengunjung tidak mengetik ulang. */
export function getSavedName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("komentar-nama") || ""
}

export function saveName(name: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("komentar-nama", name.trim())
}

export async function fetchComments(activityId: string): Promise<Comment[]> {
  // tanpa konfigurasi Supabase, kembalikan kosong alih-alih gagal jaringan
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from("comments")
    .select("id, activity_id, parent_id, name, body, created_at")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data || []) as Comment[]
}

export async function fetchCommentCounts(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured) return {}
  const { data, error } = await supabase
    .from("comments")
    .select("activity_id, parent_id")

  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    // balasan ikut dihitung, sama seperti Instagram
    counts[row.activity_id] = (counts[row.activity_id] || 0) + 1
  }
  return counts
}

export async function addComment(input: {
  activityId: string
  parentId?: string | null
  name: string
  body: string
}): Promise<Comment> {
  if (!isSupabaseConfigured) throw new Error("Layanan komentar belum dikonfigurasi.")
  const { data, error } = await supabase
    .from("comments")
    .insert({
      activity_id: input.activityId,
      parent_id: input.parentId || null,
      name: input.name.trim().slice(0, 60),
      body: input.body.trim().slice(0, 1000),
      device_id: getDeviceId(),
    })
    .select("id, activity_id, parent_id, name, body, created_at")
    .single()

  if (error) throw error
  saveName(input.name)
  return data as Comment
}

export async function deleteComment(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Layanan komentar belum dikonfigurasi.")
  // lewat RPC: policy DELETE tidak bisa mencocokkan device_id pengunjung anonim
  const { data, error } = await supabase.rpc("delete_own_comment", {
    p_id: id,
    p_device: getDeviceId(),
  })
  if (error) throw error
  if (!data) throw new Error("Komentar tidak bisa dihapus.")
}

/** Ubah ISO menjadi label pendek ala Instagram: 5 mnt, 3 jam, 2 hr, 12 Agu. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then) / 1000
  if (diff < 60) return "baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hr`
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}
