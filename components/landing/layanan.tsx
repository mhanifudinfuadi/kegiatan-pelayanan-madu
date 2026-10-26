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

interface LayananProps {
  activities: Activity[]
}

export function Layanan({ activities }: LayananProps) {
  const categories = Array.from(new Set(activities.map(a => a.category)))

  const rows = categories.map((cat) => ({
    name: cat,
    count: activities.filter(a => a.category === cat).length,
  }))

  return (
    <section className="layer2" id="layanan">
      <div className="wrap">
        <p className="eyebrow">Layanan</p>
        <h2>Kategori</h2>
        <ul className="srows">
          {rows.map((row, idx) => (
            <li key={row.name} className="srow">
              <span className="idx">0{idx + 1}</span>
              <h3>{row.name}</h3>
              <span className="cnt">{row.count} kegiatan</span>
              <span className="go">→</span>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="lempty">Belum ada kategori.</li>
          )}
        </ul>
      </div>
    </section>
  )
}