# Unit Kerja: Proyek Pengembangan

Folder ini dibangun langsung dari halaman yang dipublish di claude.ai
(`1iyUpnXjhQgpa8NwfANiaq`). Setiap bagian CSS dan JS dipecah per komponen tanpa
mengubah isinya.

## Struktur

```
unit-kerja-dev/
├─ index.html                 kerangka halaman dan urutan bagian
├─ DESIGN.md                  panduan desain
├─ README.md
├─ .vscode/extensions.json    rekomendasi ekstensi (Live Server)
├─ styles/                    CSS per komponen (admin.css untuk halaman admin)
│  ├─ base.css                token warna, reset, kelas dasar
│  ├─ header-hero.css         header, hero, video, kelopak sakura
│  ├─ activities.css          chip filter, grid, kartu kegiatan
│  ├─ footer-reveal.css       footer dasar dan animasi muncul (.rv)
│  ├─ layer2.css              layanan, statistik, tentang, footer hitam, modal
│  ├─ gallery.css             galeri berlapis (layer sticky)
│  ├─ background.css          washi, seigaiha, kabut, kanji vertikal
│  ├─ footer-docs.css         footer, starfield, kartu dokumentasi
│  └─ scan.css                section card scan sakura cyber
├─ scripts/                   JS per komponen (script biasa, bukan module)
│  ├─ 00-hero.js              kelopak sakura
│  ├─ 01-core.js              helper $ dan h, state, koneksi platform, format tanggal
│  ├─ 02-activities.js        kartu, chip, grid, observer muncul, render
│  ├─ 03-services-stats.js    daftar layanan dari kategori, angka statistik
│  ├─ 04-clock.js             jam lokal di header
│  ├─ 05-modal.js             modal "Ajukan Pertanyaan" (stub)
│  ├─ 06-gallery.js           galeri berlapis dan efek scroll
│  ├─ 06b-starfield.js        latar Starfield Close di footer (Three.js r143)
│  ├─ 06c-docs.js             kartu dokumentasi bergeser di footer
│  ├─ 06d-scan.js             card scan sakura cyber
│  └─ 07-init.js              ambil db, langganan data kegiatan dan caption
├─ admin.html                 halaman admin
├─ firestore.rules            aturan akses Firestore
├─ storage.rules              aturan akses Storage
├─ SETUP-FIREBASE.md          langkah setup Firebase dan Vercel
├─ assets/moon-hero.mp4       video latar hero
└─ upscale/upscale.py         skrip upscale gambar dan video
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

- `index.html`: halaman publik (membaca data dari Firebase)
- `admin.html`: halaman admin (login, tambah dan hapus kegiatan, caption). Lihat `SETUP-FIREBASE.md`.

## Menjalankan

1. Buka folder `unit-kerja-dev` di VS Code.
2. Pasang Live Server, lalu klik kanan `index.html` → **Open with Live Server**.

Dibutuhkan koneksi internet untuk Google Fonts, Three.js dari jsDelivr, Firebase
dari gstatic, dan foto kegiatan dari Firebase Storage. Sebelum data tampil, isi
`scripts/firebase-config.js` dan terapkan aturan keamanan. Panduan lengkap ada di
`SETUP-FIREBASE.md`.

## Batasan

- Sebelum `firebase-config.js` diisi, kegiatan dan caption tidak tampil. Layout,
  video, latar, dan komponen statis tetap berjalan.
- Halaman belum dibandingkan secara visual dengan artifact di claude.ai. Periksa
  bagian scan, starfield, dan galeri di desktop dan ponsel.

## Urutan file JavaScript

Semua berkas dimuat berurutan dan saling membagi variabel global (`items`, `db`,
`h`, `$`, `fmtDate`). `07-init.js` harus paling akhir karena memanggil `render()`.
