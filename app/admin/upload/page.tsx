"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { explainError, repairPhotos } from "@/lib/admin-api"
import { useRouter } from "next/navigation"

export default function AdminUpload() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    unit: "",
    category: "Pajak Bertutur",
    description: "",
  })
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
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setMessage("")
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage("Pilih setidaknya satu file untuk diunggah")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase()
        const fileName = `ke-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

        const { data, error } = await supabase.storage
          .from("pelayanan-madu")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          })

        if (error) {
          setMessage(`Gagal mengunggah ${file.name}: ${explainError(error.message)}`)
          setUploading(false)
          return
        }

        const { data: publicUrl } = supabase.storage
          .from("pelayanan-madu")
          .getPublicUrl(data.path)

        uploadedUrls.push(publicUrl.publicUrl)
        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      // Simpan kegiatan ke tabel activities agar foto muncul di laman web
      const { error: dbError } = await supabase.from("activities").insert([
        {
          title: formData.title || selectedFiles.map((f) => f.name).join(", "),
          date: formData.date || new Date().toISOString().slice(0, 10),
          unit: formData.unit || "Admin",
          category: formData.category || "Pajak Bertutur",
          description: formData.description || "",
          image: uploadedUrls[0] || "",
          images: uploadedUrls,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (dbError) {
        // Foto sudah masuk bucket tetapi gagal dicatat -> coba tautkan lewat API server
        const { data: sessionData } = await supabase.auth.getSession()
        const repair = await repairPhotos(sessionData.session?.access_token)
        throw new Error(
          repair.ok
            ? `Foto sudah diunggah dan ditautkan ke dokumentasi kegiatan (${explainError(dbError.message)}).`
            : `${explainError(dbError.message)} ${repair.message}`
        )
      }

      setMessage(
        `Berhasil mengunggah ${selectedFiles.length} foto dan mencatat kegiatan "${formData.title || "(tanpa judul)"}". Foto akan muncul di section Kegiatan, Dokumentasi, dan Pindai.`
      )
      setSelectedFiles([])
      setUploading(false)
    } catch (err: any) {
      setMessage(`Gagal menyimpan kegiatan: ${err.message}`)
      setUploading(false)
    }
  }

  const handleSync = async () => {
    setUploading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const result = await repairPhotos(sessionData.session?.access_token)
      setMessage(result.message)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    const { signOut } = await import("@/lib/supabase")
    await signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Upload
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
          <p className="text-gray-400 mb-4">
            Logged in as: <span className="text-white">{user?.email}</span>
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Detail Kegiatan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Judul</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Sosialisasi Pajak Bertutur"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Contoh: Admin Madu Sport"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-gray-400 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Cerita singkat tentang kegiatan ini…"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih Foto Dokumentasi
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Berkas terpilih ({selectedFiles.length}):
                </p>
                <ul className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-300">
                      • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uploading && (
              <div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Mengunggah… {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes("Gagal")
                  ? "bg-red-900/50 border border-red-700 text-red-300"
                  : "bg-green-900/50 border border-green-700 text-green-300"
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ cursor: uploading || selectedFiles.length === 0 ? "not-allowed" : "pointer" }}
            >
              {uploading ? "Mengunggah…" : "Unggah Foto & Simpan Kegiatan"}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <button
              onClick={handleSync}
              disabled={uploading}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition disabled:opacity-50"
            >
              Sinkronkan foto bucket ke kegiatan
            </button>
            <p className="text-xs text-gray-500 max-w-md">
              Gunakan bila foto sudah ada di bucket tetapi belum muncul di web.
            </p>
            <a href="/editor" className="text-gray-400 hover:text-white text-sm transition">
              Buka Editor
            </a>
            <a href="/" className="text-gray-400 hover:text-white text-sm transition">
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
