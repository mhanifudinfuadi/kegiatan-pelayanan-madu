"use client"

import { useEffect, useState } from "react"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { Header } from "./header"
import { Hero } from "./hero"
import { Kegiatan } from "./kegiatan"
import { Layanan } from "./layanan"
import { Statistik } from "./statistik"
import { Tentang } from "./tentang"
import { Galeri } from "./galeri"
import { GalaxyBackdrop } from "./galaxy-backdrop"
import { CardScan } from "./card-scan"
import { Footer } from "./footer"
import { SakuraPetals } from "./sakura-petals"
import { Backsound } from "./backsound"

export function LandingPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [caption, setCaption] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Backsound dipasang terpisah agar tidak menahan render halaman

  // Muat data setelah mount; fetchData sengaja tidak dipanggil saat render
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    // env belum diisi: tampilkan halaman apa adanya tanpa panggilan jaringan
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      // Fetch activities
      const { data: acts, error: actsError } = await supabase
        .from("activities")
        .select("*")
        .order("date", { ascending: false })

      if (actsError) {
        console.warn("Could not fetch activities:", actsError.message)
      } else if (acts) {
        setActivities(acts)
      }

      // Fetch site caption
      const { data: settings, error: settingsError } = await supabase
        .from("site_settings")
        .select("caption")
        .eq("id", 1)
        .single()

      if (settingsError) {
        console.warn("Could not fetch site settings:", settingsError.message)
      } else if (settings) {
        setCaption(settings.caption || "")
      }
    } catch (err) {
      console.warn("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <Backsound />
      <SakuraPetals />
      <Header />
      <Hero caption={caption} />
      <Kegiatan activities={activities} />
      <Layanan activities={activities} />
      <Statistik activities={activities} />
      <Tentang />
      <Galeri activities={activities} />
      <GalaxyBackdrop />
      <CardScan activities={activities} />
      <Footer />

      {/* Indikator kecil saat data masih dimuat; halaman tetap tampil */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#1b2a4a]/90 px-3 py-2 text-xs text-[#faf6f1] shadow-lg"
        >
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#faf6f1]/40 border-t-[#e58fa6]" />
          Memuat data…
        </div>
      )}
    </main>
  )
}