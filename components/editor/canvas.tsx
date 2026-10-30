"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface EditorCanvasProps {
  activities: any[]
  settings: any
  onRefresh: () => void
}

export function EditorCanvas({ activities, settings, onRefresh }: EditorCanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    unit: "",
    category: "",
    description: "",
    image: "",
    images: [] as string[],
  })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      unit: "",
      category: "",
      description: "",
      image: "",
      images: [],
    })
    setEditingId(null)
  }

  const handleEdit = (act: any) => {
    setEditingId(act.id)
    const images = Array.isArray(act.images) ? act.images : act.image ? [act.image] : []
    setFormData({
      title: act.title,
      date: act.date,
      unit: act.unit,
      category: act.category,
      description: act.description || "",
      image: act.image || "",
      images,
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `ke-${Date.now()}-${i}.${fileExt}`

        const { data, error } = await supabase.storage
          .from("pelayanan-madu")
          .upload(fileName, file, { cacheControl: "3600", upsert: false })

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from("pelayanan-madu")
          .getPublicUrl(data.path)

        newUrls.push(publicUrl.publicUrl)
      }

      setFormData((prev) => {
        const next = [...prev.images, ...newUrls]
        return { ...prev, images: next, image: next[0] || prev.image }
      })
      setMessage(`Berhasil menambahkan ${newUrls.length} foto`)
    } catch (err: any) {
      setMessage(`Gagal mengupload foto: ${err.message}`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const payload = {
        ...formData,
        image: formData.images[0] || formData.image || "",
        images: formData.images,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from("activities")
          .update(payload)
          .eq("id", editingId)

        if (error) throw error
        setMessage("Kegiatan diperbarui")
      } else {
        const { error } = await supabase
          .from("activities")
          .insert([{
            ...payload,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error
        setMessage("Kegiatan ditambahkan")
      }

      resetForm()
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kegiatan ini?")) return

    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", id)

      if (error) throw error
      setMessage("Kegiatan dihapus")
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
  }

  return (
    <main className="adm" style={{ flex: 1, padding: "1.5rem" }}>
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
                required
              />
            </div>
            <div>
              <label>Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
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
              <label>URL Gambar Utama</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="full">
              <label>Foto Alternatif (bebas jumlah)</label>
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
                      key={idx}
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
                        alt=""
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
                      {idx === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "2px",
                            left: "2px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            fontSize: "0.6rem",
                            padding: "2px 4px",
                            borderRadius: "2px",
                          }}
                        >
                          Utama
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {uploading && <p style={{ fontSize: "0.85rem", color: "#6b6f7d", marginTop: "0.4rem" }}>Mengupload foto…</p>}
            </div>
          </div>

          {message && <div className="msg" style={{ marginTop: "1rem" }}>{message}</div>}

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="primary">
              {editingId ? "Perbarui" : "Simpan"}
            </button>
            {editingId && (
              <button type="button" className="ghost" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2>Daftar Kegiatan ({activities.length})</h2>
        {activities.length === 0 ? (
          <p style={{ color: "#6b6f7d" }}>Belum ada kegiatan.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Judul</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Kategori</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Unit</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Tanggal</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Foto</th>
                <th style={{ textAlign: "right", padding: "0.5rem" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => {
                const images = Array.isArray(act.images) ? act.images : act.image ? [act.image] : []
                return (
                  <tr key={act.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "0.5rem" }}>{act.title}</td>
                    <td style={{ padding: "0.5rem" }}>{act.category}</td>
                    <td style={{ padding: "0.5rem" }}>{act.unit}</td>
                    <td style={{ padding: "0.5rem" }}>{act.date}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.8rem", color: "#6b6f7d" }}>
                      {images.length} foto
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>
                      <button
                        className="ghost"
                        onClick={() => handleEdit(act)}
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
