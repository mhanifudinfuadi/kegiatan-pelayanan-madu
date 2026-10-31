"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, supabase } from "@/lib/supabase"
import { explainError, repairPhotos } from "@/lib/admin-api"
import { EditorToolbar } from "@/components/editor/toolbar"
import { EditorSidebar } from "@/components/editor/sidebar"
import { EditorCanvas } from "@/components/editor/canvas"

export default function EditorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBucket, setSelectedBucket] = useState("pelayanan-madu")
  const [files, setFiles] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const router = useRouter()

  // Muat daftar file (dipisah agar bucket bisa diganti tanpa reload semua)
  const loadFiles = useCallback(async (bucket: string) => {
    const { data, error } = await supabase.storage.from(bucket).list("", { limit: 100 })
    if (error) {
      console.warn("Gagal membaca bucket:", error.message)
      setFiles([])
      return
    }
    setFiles((data || []).filter((f) => f.name && !f.name.startsWith(".")))
  }, [])

  const loadEditorData = useCallback(async () => {
    try {
      await loadFiles(selectedBucket)

      // Semua kegiatan + kolom images (semua foto dokumentasi)
      const { data: acts, error: actsError } = await supabase
        .from("activities")
        .select("*")
        .order("date", { ascending: false })

      if (actsError) {
        // kolom images belum ada -> tetap tampilkan foto utama
        const { data: fallback } = await supabase
          .from("activities")
          .select("id,title,date,unit,category,description,image,created_at")
          .order("date", { ascending: false })
        setActivities(fallback || [])
        setSyncMessage(explainError(actsError.message))
      } else {
        setActivities(acts || [])
      }

      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single()
      setSettings(settingsData)
    } catch (err) {
      console.error("Error loading editor data:", err)
    }
  }, [loadFiles, selectedBucket])

  const checkUser = useCallback(async () => {
    const { user } = await getCurrentUser()
    if (!user) {
      router.push("/admin/login")
      return
    }
    setUser(user)
    setLoading(false)
    await loadEditorData()
  }, [router, loadEditorData])

  useEffect(() => {
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ganti bucket -> muat ulang daftar file saja
  useEffect(() => {
    if (!user) return
    loadFiles(selectedBucket)
  }, [selectedBucket, user, loadFiles])

  const handleRefresh = () => {
    setSyncMessage("")
    loadEditorData()
  }

  /** Tautkan foto di bucket yang belum tercatat di tabel activities. */
  const handleSyncPhotos = async () => {
    setSyncing(true)
    setSyncMessage("")
    try {
      const { data } = await supabase.auth.getSession()
      const result = await repairPhotos(data.session?.access_token)
      setSyncMessage(result.message)
      if (result.ok) await loadEditorData()
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1b2a4a] border-t-[#e58fa6] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b6f7d]">Memuat editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] text-[#14161f]">
      <EditorToolbar
        user={user}
        selectedBucket={selectedBucket}
        onBucketChange={setSelectedBucket}
        onRefresh={handleRefresh}
        onSyncPhotos={handleSyncPhotos}
        syncing={syncing}
        onLogout={handleLogout}
      />
      {syncMessage && (
        <div
          role="status"
          className="mx-6 mt-4 rounded-lg border border-[#e6e0d8] bg-white px-4 py-3 text-sm text-[#1b2a4a]"
        >
          {syncMessage}
        </div>
      )}
      <div className="flex flex-wrap">
        <EditorSidebar
          selectedBucket={selectedBucket}
          files={files}
          activities={activities}
          settings={settings}
          onRefresh={handleRefresh}
        />
        <EditorCanvas
          activities={activities}
          settings={settings}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  )
}
