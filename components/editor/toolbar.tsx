"use client"

import { useState } from "react"
import { signOut } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface EditorToolbarProps {
  user: any
  selectedBucket: string
  onBucketChange: (bucket: string) => void
  onRefresh: () => void
}

export function EditorToolbar({ user, selectedBucket, onBucketChange, onRefresh }: EditorToolbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const buckets = [
    { id: "kegiatan-images", label: "Kegiatan Images" },
    { id: "editor-uploads", label: "Editor Uploads" },
  ]

  const handleLogout = async () => {
    await signOut()
    router.push("/admin/login")
  }

  return (
    <header className="adm-top">
      <div>
        <strong>Editor Kawaguchiko</strong>
        <span style={{ marginLeft: "1rem", fontSize: "0.8rem", color: "#6b6f7d" }}>
          {user?.email}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <select
          value={selectedBucket}
          onChange={(e) => onBucketChange(e.target.value)}
          style={{
            border: "1px solid var(--line)",
            borderRadius: "0.8rem",
            padding: "0.5rem 1rem",
            background: "#fff",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          {buckets.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
        <button className="ghost" onClick={onRefresh}> refresh</button>
        <button className="ghost" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
        {menuOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: "1rem",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "0.8rem",
            padding: "0.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 100,
          }}>
            <a href="/admin/upload" style={{ display: "block", padding: "0.5rem 1rem", textDecoration: "none", color: "var(--indigo)" }}>
              Upload Manager
            </a>
            <button
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 1rem",
                background: "none",
                border: "none",
                color: "var(--vermilion)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}