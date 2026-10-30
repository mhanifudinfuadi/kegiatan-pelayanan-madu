# Kawaguchiko — Pelayanan Unit Kerja

Halaman landing page dengan nuansa Jepang yang tenang dan etereal: biru malam Gunung Fuji dan Danau Kawaguchiko, sakura, kertas washi, dan kanji sebagai aksen.

## Struktur

```
kegaiatan-pelayanan-madu/
├─ app/
│  ├─ layout.tsx              Root layout dengan metadata
│  ├─ page.tsx                Halaman utama (LandingPage)
│  ├─ globals.css             Global CSS Tailwind + import styles
│  ├─ admin/
│  │  ├─ login/page.tsx       Halaman login admin
│  │  └─ upload/page.tsx      Halaman upload (legacy, dialihkan ke editor)
│  └─ editor/page.tsx         Halaman editor utama (table editor)
├─ components/
│  ├─ landing/                Komponen landing page
│  │  ├─ landing-page.tsx     Orkestrator landing page
│  │  ├─ header.tsx           Header dengan jam lokal
│  │  ├─ hero.tsx             Hero section dengan video
│  │  ├─ kegiatan.tsx         Kegiatan section
│  │  ├─ layanan.tsx          Layanan section
│  │  ├─ statistik.tsx        Statistik section
│  │  ├─ tentang.tsx          Tentang section
│  │  ├─ galeri.tsx           Galeri berlapis
│  │  ├─ card-scan.tsx        Card scan section
│  │  └─ footer.tsx           Footer dengan starfield
│  └─ editor/                 Komponen editor
│     ├─ toolbar.tsx          Toolbar editor
│     ├─ sidebar.tsx          Sidebar media & pengaturan
│     └─ canvas.tsx           Canvas editor kegiatan
├─ styles/                    CSS per komponen
│  ├─ base.css                Token warna, reset, kelas dasar
│  ├─ background.css          washi, seigaiha, kabut, kanji vertikal
│  ├─ header-hero.css         header, hero, video, kelopak sakura
│  ├─ activities.css          chip filter, grid, kartu kegiatan
│  ├─ layer2.css              layanan, statistik, tentang, footer hitam, modal
│  ├─ gallery.css             galeri berlapis (layer sticky)
│  ├─ scan.css                section card scan sakura cyber
│  ├─ footer-reveal.css       footer dasar dan animasi muncul (.rv)
│  └─ footer-docs.css         footer, starfield, kartu dokumentasi
├─ lib/
│  ├─ supabase.ts             Klien Supabase & auth helpers
│  └─ utils.ts                Utility functions
├─ supabase/
│  └─ migrations/
│     └─ 001_create_editor_tables.sql  Bucket & table editor
├─ middleware.ts               Proteksi rute editor
├─ DESIGN.md                   Panduan desain
└─ package.json
```

## Urutan section di halaman

1. Hero (`#beranda`): video, caption, tombol "Lihat Kegiatan"
2. Kegiatan (`#kegiatan`): chip filter dan kartu
3. Layanan (`#layanan`): daftar kategori
4. Statistik (`#statistik`): tiga angka
5. Tentang (`#tentang`)
6. Galeri berlapis (`#galeri`)
7. Card scan (`#scan`): kartu pemindaian sakura cyber
8. Footer (`#kontak`): starfield, kartu dokumentasi, ajakan, tautan

## Halaman

- `/`: halaman publik (membaca data dari Supabase)
- `/admin/login`: halaman login admin
- `/editor`: halaman editor utama (table editor untuk mengelola kegiatan, media, dan pengaturan)

## Database (Supabase)

Buckets:
- `pelayanan-madu` — gambar kegiatan
- `editor-uploads` — file editor (dokumen, gambar, dll)

Tables:
- `activities` — data kegiatan (title, date, unit, category, description, image)
- `site_settings` — pengaturan situs (caption)
- `editor_pages` — halaman editor (slug, title, content JSONB)
- `editor_media` — media library
- `editor_users` — user editor dengan role (admin, editor, viewer)

Lihat `supabase/migrations/001_create_editor_tables.sql` untuk skema lengkap.

## Menjalankan

1. Salin `.env.example` ke `.env` dan isi kredensial Supabase
2. Jalankan migration di Supabase SQL Editor
3. Jalankan `npm install && npm run dev`

## Batasan

- Halaman publik tidak punya panel admin. Penulisan dibatasi di sisi database melalui RLS.
- Starfield dan Three.js memerlukan CDN jsDelivr.
- Efek bloom dari spesifikasi Starfield Close belum dipakai. Kilau memakai titik additive dasar.