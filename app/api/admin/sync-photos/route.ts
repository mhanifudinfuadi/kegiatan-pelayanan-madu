import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Route ini butuh runtime Node (service role key tidak dibundel ke browser).
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BUCKET = "pelayanan-madu"
const EDITOR_ROLES = ["admin", "editor"]

/**
 * POST /api/admin/sync-photos
 *
 * Menautkan foto yang sudah ada di bucket `pelayanan-madu` ke tabel `activities`
 * bila foto tersebut belum tercatat (kasus upload berhasil tapi insert gagal
 * karena RLS/GRANT). Juga menambal kolom `image` dari `images` dan sebaliknya.
 *
 * Akses: pengguna login (admin/editor). Tanpa service role di server, route
 * menolak agar tidak bisa dipakai publik.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        message:
          "SUPABASE_SERVICE_ROLE_KEY belum diatur di server. Tambahkan di .env.local / Vercel, lalu jalankan migrasi 004.",
      },
      { status: 500 }
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // --- 1. Verifikasi sesi pengguna ---
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim()
  if (!token) {
    return NextResponse.json({ message: "Sesi login tidak ditemukan. Silakan login ulang." }, { status: 401 })
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) {
    return NextResponse.json({ message: "Sesi login tidak valid. Silakan login ulang." }, { status: 401 })
  }

  const { data: editorRow } = await admin
    .from("editor_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  // Pemilik akun pertama kali / admin saja; kalau tabel editor_users kosong,
  // akun yang sedang login dianggap admin agar proses bisa diselesaikan.
  const { count: editorCount } = await admin
    .from("editor_users")
    .select("id", { count: "exact", head: true })

  const isFirstUser = !editorCount || editorCount === 0
  const role = editorRow?.role
  if (!isFirstUser && !EDITOR_ROLES.includes(role || "")) {
    return NextResponse.json(
      { message: "Akun ini belum punya akses editor. Tambahkan baris di tabel editor_users." },
      { status: 403 }
    )
  }

  // --- 2. Daftar file di bucket foto kegiatan ---
  const listPage = (offset: number) =>
    admin.storage.from(BUCKET).list("", {
      limit: 100,
      offset,
      sortBy: { column: "created_at", order: "asc" },
    })

  // Storage membatasi 100 file per halaman -> ambil bertahap sampai habis
  const objects: Array<{ id?: string | null; name: string; created_at?: string | null; metadata?: any }> = []
  let listError: { message: string } | null = null
  for (let offset = 0; offset < 1000; offset += 100) {
    const page = await listPage(offset)
    if (page.error) {
      listError = page.error
      break
    }
    const rowsPage = page.data || []
    objects.push(...rowsPage)
    if (rowsPage.length < 100) break
  }

  if (listError) {
    return NextResponse.json({ message: `Gagal membaca bucket ${BUCKET}: ${listError.message}` }, { status: 500 })
  }

  const publicUrl = (path: string) =>
    admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  const files = (objects || [])
    .filter((o) => o.id && o.name && !o.name.startsWith(".") && o.metadata?.mimetype)
    .map((o) => ({
      name: o.name,
      url: publicUrl(o.name),
      created_at: o.created_at || new Date().toISOString(),
    }))

  // --- 3. Baca kegiatan yang ada ---
  const { data: activities, error: actsError } = await admin
    .from("activities")
    .select("id,title,unit,category,date,image,images,created_at")
    .order("created_at", { ascending: true })

  if (actsError) {
    return NextResponse.json(
      { message: `Gagal membaca tabel activities: ${actsError.message}` },
      { status: 500 }
    )
  }

  const rows = (activities || []) as Array<{
    id: string
    title: string
    unit: string
    category: string
    date: string
    image: string | null
    images: string[] | null
    created_at: string | null
  }>

  const recorded = new Set<string>()
  rows.forEach((row) => {
    if (row.image) recorded.add(row.image)
      ; (row.images || []).forEach((u) => u && recorded.add(u))
  })

  const orphans = files.filter((f) => !recorded.has(f.url))
  let repaired = 0

  // 3a. Foto tanpa kegiatan -> buat satu Kegiatan Dokumentasi.
  //     Bila sudah ada kegiatan hasil sinkronisasi sebelumnya, foto baru
  //     ditempelkan ke situ (upload berikutnya tetap terlihat).
  const existingDump = rows.find((r) => /dokumentasi kegiatan/i.test(r.title))
  const batchSize = 12
  const batches: typeof orphans[] = []
  for (let i = 0; i < orphans.length; i += batchSize) {
    batches.push(orphans.slice(i, i + batchSize))
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    const urls = batch.map((f) => f.url)
    // batch pertama ditempel ke kegiatan dokumentasi yang sudah ada
    if (existingDump && b === 0) {
      const merged = Array.from(new Set([...(existingDump.images || []), ...urls]))
      const { error } = await admin
        .from("activities")
        .update({ images: merged, image: merged[0] || null, updated_at: new Date().toISOString() })
        .eq("id", existingDump.id)
      if (error) {
        return NextResponse.json({ message: `Gagal memperbarui dokumentasi: ${error.message}` }, { status: 500 })
      }
      repaired += urls.length
      continue
    }

    const stamp = new Date(batch[0].created_at || Date.now())
    const tanggal = stamp.toISOString().slice(0, 10)
    const label = stamp.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

    const { error } = await admin.from("activities").insert([
      {
        title: "Dokumentasi Kegiatan Pelayanan",
        date: tanggal,
        unit: BUCKET,
        category: "Dokumentasi",
        description: `Foto dokumentasi kegiatan pelayanan yang diunggah pada ${label}.`,
        image: urls[0],
        images: urls,
        created_at: stamp.toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) {
      return NextResponse.json({ message: `Gagal menyimpan foto dokumentasi: ${error.message}` }, { status: 500 })
    }
    repaired += urls.length
  }

  // 3b. Tandai foto yang sudah ada di bucket tetapi hanya tersimpan sebagai
  //     nama file / path (bukan URL penuh), lalu rapikan image <-> images.
  let fixedRows = 0
  for (const row of rows) {
    const list = (row.images || []).filter(Boolean)
    const main = row.image || ""
    const missingMain = main && !list.includes(main)
    const needsMain = !main && list.length > 0
    if (!missingMain && !needsMain) continue

    const next = missingMain ? [main, ...list] : list
    const { error } = await admin
      .from("activities")
      .update({ images: next, image: next[0] })
      .eq("id", row.id)
    if (!error) fixedRows += 1
  }

  const total = files.length
  const message =
    repaired > 0
      ? `${repaired} foto yang belum tercatat berhasil ditautkan ke kegiatan.`
      : "Semua foto di bucket sudah tercatat pada kegiatan."

  return NextResponse.json({
    ok: true,
    message,
    repaired,
    total,
    fixedRows,
  })
}
