"use client"

import { collectPhotos, type Activity } from "@/lib/activities"

interface StatistikProps {
  activities: Activity[]
}

export function Statistik({ activities }: StatistikProps) {
  const units = Array.from(new Set(activities.map(a => a.unit).filter(Boolean)))
  const categories = Array.from(new Set(activities.map(a => a.category).filter(Boolean)))
  const photos = collectPhotos(activities)

  const stats = [
    { num: photos.length, lbl: "Foto Dokumentasi" },
    { num: units.length, lbl: "Unit Kerja" },
    { num: categories.length, lbl: "Kategori" },
  ]

  return (
    <section className="layer2 stats" id="statistik">
      <div className="wrap">
        <p className="eyebrow light">Statistik</p>
        <h2>Angka yang Naik</h2>
        <div className="sgrid">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <span className="num">{stat.num}</span>
              <span className="lbl">{stat.lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}