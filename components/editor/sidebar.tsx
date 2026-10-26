"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface EditorSidebarProps {
  selectedBucket: string
  files: any[]
  activities: any[]
  settings: any
  onRefresh: () => void
}

export function EditorSidebar({ selectedBucket, files, activities, settings, onRefresh }: EditorSidebarProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setUploading(true)
    setMessage("")

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `ke-${Date.now()}-${i}.${fileExt}`

        const { error } = await supabase.storage
          .from(selectedBucket)
          .upload(fileName, file, { upsert: false })

        if (error) throw error
      }

      setMessage(`Berhasil mengupload ${selectedFiles.length} file(s)`)
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Hapus ${fileName}?`)) return

    try {
      const { error } = await supabase.storage
        .from(selectedBucket)
        .remove([fileName])

      if (error) throw error
      setMessage(`Berhasil menghapus ${fileName}`)
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
  }

  const handleUpdateCaption = async () => {
    const caption = prompt("Caption situs:", settings?.caption || "")
    if (caption === null) return

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, caption, updated_at: new Date().toISOString() })

      if (error) throw error
      setMessage("Caption diperbarui")
      onRefresh()
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
  }

  return (
    <aside className="card" style={{ maxWidth: "380px", margin: "1.5rem", flex: "0 0 380px" }}>
      <h2>Editor Media</h2>

      <div style={{ marginTop: "1rem" }}>
        <label>Upload ke {selectedBucket === "kegiatan-images" ? "Kegiatan" : "Editor"}</label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ width: "100%", cursor: "pointer" }}
        />
        {uploading && <p style={{ fontSize: "0.85rem", color: "#6b6f7d" }}>Mengupload...</p>}
      </div>

      {message && (
        <div className="msg" style={{ marginTop: "1rem" }}>{message}</div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3>File di {selectedBucket === "kegiatan-images" ? "Kegiatan" : "Editor"}</h3>
        {files.length === 0 ? (
          <p style={{ color: "#6b6f7d", fontSize: "0.85rem" }}>Belum ada file.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {files.map((file) => (
              <li
                key={file.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem",
                  background: "#fff",
                  borderRadius: "0.5rem",
                  marginBottom: "0.5rem",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                  {file.name}
                </span>
                <button
                  className="ghost"
                  onClick={() => handleDeleteFile(file.name)}
                  style={{ color: "var(--vermilion)", padding: "0.2rem 0.5rem" }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Pengaturan Situs</h3>
        <button className="primary" onClick={handleUpdateCaption} style={{ marginTop: "0.5rem", width: "100%" }}>
          Edit Caption
        </button>
        <p style={{ fontSize: "0.8rem", color: "#6b6f7d", marginTop: "0.5rem" }}>
          Caption: {settings?.caption || "(tidak diatur)"}
        </p>
      </div>
    </aside>
  )
}