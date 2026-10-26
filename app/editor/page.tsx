"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { EditorToolbar } from "@/components/editor/toolbar"
import { EditorSidebar } from "@/components/editor/sidebar"
import { EditorCanvas } from "@/components/editor/canvas"

export default function EditorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBucket, setSelectedBucket] = useState("kegiatan-images")
  const [files, setFiles] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { user } = await getCurrentUser()
    if (!user) {
      router.push("/admin/login")
    } else {
      setUser(user)
      setLoading(false)
      loadEditorData()
    }
  }

  const loadEditorData = async () => {
    try {
      // Load files from selected bucket
      const { data: filesData } = await supabase.storage
        .from(selectedBucket)
        .list("", { limit: 100 })
      setFiles(filesData || [])

      // Load activities
      const { data: acts } = await supabase
        .from("activities")
        .select("*")
        .order("date", { ascending: false })
      setActivities(acts || [])

      // Load settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single()
      setSettings(settingsData)
    } catch (err) {
      console.error("Error loading editor data:", err)
    }
  }

  const handleRefresh = () => {
    loadEditorData()
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
      />
      <div className="flex">
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