"use client"

interface Activity {
  id: string
  title: string
  date: string
  unit: string
  category: string
  description?: string
  image?: string
}

interface StatistikProps {
  activities: Activity[]
}

export function Statistik({ activities }: StatistikProps) {
  const units = Array.from(new Set(activities.map(a => a.unit)))
  const categories = Array.from(new Set(activities.map(a => a.category)))

  const stats = [
    { num: activities.length, lbl: "Kegiatan" },
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