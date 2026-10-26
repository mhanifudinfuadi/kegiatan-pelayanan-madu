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
  })
  const [message, setMessage] = useState("")

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      unit: "",
      category: "",
      description: "",
      image: "",
    })
    setEditingId(null)
  }

  const handleEdit = (act: any) => {
    setEditingId(act.id)
    setFormData({
      title: act.title,
      date: act.date,
      unit: act.unit,
      category: act.category,
      description: act.description || "",
      image: act.image || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      if (editingId) {
        const { error } = await supabase
          .from("activities")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        setMessage("Kegiatan diperbarui")
      } else {
        const { error } = await supabase
          .from("activities")
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
              <label>URL Gambar</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
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
                <th style={{ textAlign: "right", padding: "0.5rem" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "0.5rem" }}>{act.title}</td>
                  <td style={{ padding: "0.5rem" }}>{act.category}</td>
                  <td style={{ padding: "0.5rem" }}>{act.unit}</td>
                  <td style={{ padding: "0.5rem" }}>{act.date}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}