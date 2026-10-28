"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { supabase } from "@/lib/supabase"
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

export function LandingPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [caption, setCaption] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const play = async () => {
      try {
        const a1 = new Audio("/audio/Natawassal%20Bil%20Hubabah.mp3")
        a1.volume = 0.25
        await a1.play()
        a1.onended = async () => {
          const a2 = new Audio("/audio/CASABLANCA.mp3")
          a2.volume = 0.2
          a2.playbackRate = 0.85
          try { await a2.play() } catch {}
        }
      } catch {}
    }
    play()
  }, [])

  const fetchData = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1b2a4a] border-t-[#e58fa6] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b6f7d]">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
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
    </main>
  )
}