"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { explainError } from "@/lib/admin-api"
import { formatTanggal, normalizeActivity } from "@/lib/activities"

interface EditorCanvasProps {
  activities: any[]
  settings: any
  onRefresh: () => void
}

const BUCKET = "pelayanan-madu"

const EMPTY_FORM = {
  title: "",
  date: "",
  unit: "",
  category: "",
  description: "",
  image: "",
  images: [] as string[],
}

/** Nama file unik & aman untuk storage. */
function makeFileName(file: File, index: number): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `ke-${Date.now()}-${index}-${rand.slice(0, 8)}.${ext}`
}

export function EditorCanvas({ activities, settings, onRefresh }: EditorCanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  // Foto yang sudah ada di bucket tetapi belum tersimpan di kegiatan ini
  const [bucketFiles, setBucketFiles] = useState<string[]>([])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setBucketFiles([])
  }

  const handleEdit = (act: any) => {
    const normalized = normalizeActivity(act)
    setEditingId(normalized.id)
    setBucketFiles([])
    setFormData({
      title: normalized.title,
      date: normalized.date,
      unit: normalized.unit,
      category: normalized.category,
      description: normalized.description || "",
      image: normalized.image || "",
      images: normalized.images || [],
    })
    setMessage(`Mengedit: ${normalized.title}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /** Ambil daftar foto yang sudah ada di bucket (belum tercatat). */
  const loadBucketFiles = async () => {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 100 })
    if (error) {
      setMessage(`Gagal membaca bucket: ${explainError(error.message)}`)
      return
    }
    const urls = (data || [])
      .filter((f) => f.name && !f.name.startsWith(".") && f.metadata?.mimetype)
      .map((f) => supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl)
      .filter((url) => !formData.images.includes(url))
    setBucketFiles(urls)
    if (urls.length === 0) setMessage("Tidak ada foto baru di bucket.")
  }

  const attachBucketFile = (url: string) => {
    setFormData((prev) => {
      const next = [...prev.images, url]
      return { ...prev, images: next, image: prev.image || next[0] }
    })
    setBucketFiles((prev) => prev.filter((u) => u !== url))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setMessage("")

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = makeFileName(file, i)

        const { data, error } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type })

        if (error) throw new Error(explainError(error.message))

        const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
        newUrls.push(publicUrl.publicUrl)
      }

      setFormData((prev) => {
        const next = [...prev.images, ...newUrls]
        return { ...prev, images: next, image: prev.image || next[0] }
      })
      setMessage(`${newUrls.length} foto berhasil diunggah. Jangan lupa simpan kegiatan.`)
    } catch (err: any) {
      setMessage(`Gagal mengupload foto: ${explainError(err.message)}`)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const next = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: next, image: next[0] || "" }
    })
  }

  const setAsMain = (index: number) => {
    setFormData((prev) => {
      const next = [...prev.images]
      const [picked] = next.splice(index, 1)
      next.unshift(picked)
      return { ...prev, images: next, image: picked }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (!formData.title.trim() || !formData.date) {
      setMessage("Judul dan tanggal wajib diisi.")
      return
    }
    if (formData.images.length === 0 && !formData.image.trim()) {
      setMessage("Pilih minimal satu foto dokumentasi.")
      return
    }

    setSaving(true)
    try {
      const images = formData.images.length
        ? formData.images
        : formData.image
          ? [formData.image]
          : []

      const payload: Record<string, any> = {
        title: formData.title.trim(),
        date: formData.date,
        unit: formData.unit.trim() || "Admin",
        category: formData.category.trim() || "Dokumentasi",
        description: formData.description,
        image: images[0] || "",
        images,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase.from("activities").update(payload).eq("id", editingId)
        if (error) throw new Error(explainError(error.message))
        setMessage("Kegiatan diperbarui — foto ikut tampil di section kegiatan, dokumentasi, dan pindai.")
      } else {
        const { error } = await supabase
          .from("activities")
          .insert([{ ...payload, created_at: new Date().toISOString() }])
        if (error) throw new Error(explainError(error.message))
        setMessage("Kegiatan ditambahkan — foto ikut tampil di section kegiatan, dokumentasi, dan pindai.")
      }

      resetForm()
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${explainError(err.message)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kegiatan ini?")) return

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id)
      if (error) throw error
      setMessage("Kegiatan dihapus")
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${explainError(err.message)}`)
    }
  }

  return (
    <main className="adm" style={{ flex: 1, padding: "1.5rem", minWidth: 0 }}>
      <div className="card">
        <h2>{editingId ? "Edit Kegiatan" : "Buat Kegiatan Baru"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div>
              <label>Judul</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Contoh: Madu Sport"
              />
            </div>
            <div>
              <label>Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Pelayanan"
              />
            </div>
            <div className="full">
              <label>Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="full">
              <label>Foto Dokumentasi (semua foto tampil di web)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ width: "100%", cursor: "pointer", marginTop: "0.25rem" }}
              />
              {formData.images.length > 0 && (
                <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {formData.images.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      style={{
                        position: "relative",
                        width: "96px",
                        height: "96px",
                        border: "1px solid var(--line)",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "var(--vermilion)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.4rem",
                          width: "20px",
                          height: "20px",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                        aria-label={`Hapus foto ke-${idx + 1}`}
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={() => setAsMain(idx)}
                        style={{
                          position: "absolute",
                          bottom: "2px",
                          left: "2px",
                          background: idx === 0 ? "rgba(0,0,0,0.6)" : "rgba(27,42,74,0.85)",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.6rem",
                          padding: "2px 4px",
                          borderRadius: "2px",
                          cursor: "pointer",
                        }}
                        aria-label={`Jadikan foto ke-${idx + 1} sebagai foto utama`}
                      >
                        {idx === 0 ? "Utama" : "Jadikan utama"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && <p style={{ fontSize: "0.85rem", color: "#6b6f7d", marginTop: "0.4rem" }}>Mengupload foto…</p>}
            </div>

            <div className="full" style={{ borderTop: "1px dashed var(--line)", paddingTop: "0.75rem" }}>
              <label>Ambil foto yang sudah ada di bucket</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                <button type="button" className="ghost" onClick={loadBucketFiles}>
                  Muat daftar foto bucket
                </button>
                <span style={{ fontSize: "0.8rem", color: "#6b6f7d", alignSelf: "center" }}>
                  {bucketFiles.length > 0 ? `${bucketFiles.length} foto siap ditautkan` : "Klik untuk memuat"}
                </span>
              </div>
              {bucketFiles.length > 0 && (
                <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {bucketFiles.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => attachBucketFile(url)}
                      title="Klik untuk menambahkan foto ini"
                      style={{
                        width: "72px",
                        height: "72px",
                        padding: 0,
                        border: "1px solid var(--line)",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "#fff",
                      }}
                    >
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {message && <div className="msg" style={{ marginTop: "1rem" }}>{message}</div>}

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="submit" className="primary" disabled={saving || uploading}>
              {saving ? "Menyimpan…" : editingId ? "Perbarui" : "Simpan"}
            </button>
            {editingId && (
              <button type="button" className="ghost" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1.5rem", overflowX: "auto" }}>
        <h2>Daftar Kegiatan ({activities.length})</h2>
        {activities.length === 0 ? (
          <p style={{ color: "#6b6f7d" }}>Belum ada kegiatan.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Foto</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Judul</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Kategori</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Unit</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Tanggal</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Jumlah Foto</th>
                <th style={{ textAlign: "right", padding: "0.5rem" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((raw) => {
                const act = normalizeActivity(raw)
                return (
                  <tr key={act.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "0.5rem", width: "72px" }}>
                      {act.image ? (
                        <img
                          src={act.image}
                          alt={act.title}
                          style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "0.4rem" }}
                        />
                      ) : (
                        <span style={{ color: "#6b6f7d", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>{act.title}</td>
                    <td style={{ padding: "0.5rem" }}>{act.category}</td>
                    <td style={{ padding: "0.5rem" }}>{act.unit}</td>
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{formatTanggal(act.date)}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.8rem", color: "#6b6f7d" }}>
                      {act.images?.length || 0} foto
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="ghost"
                        onClick={() => handleEdit(raw)}
                        style={{ padding: "0.2rem 0.5rem", marginRight: "0.25rem" }}
                      >
                        Edit
                      </button>
                      <button
                        className="ghost"
                        onClick={() => handleDelete(act.id)}
                        style={{ padding: "0.2rem 0.5rem", color: "var(--vermilion)" }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
