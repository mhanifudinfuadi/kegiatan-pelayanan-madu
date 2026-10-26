# DESIGN.md: Landing Pelayanan Unit Kerja (Kawaguchiko)

Versi: 1.3
Referensi: artifact claude.ai `1iyUpnXjhQgpa8NwfANiaq` (halaman yang dipublish)

## 1. Konsep

Nuansa Jepang yang tenang dan etereal: biru malam Gunung Fuji dan Danau Kawaguchiko,
sakura, kertas washi, dan kanji sebagai aksen. Hero memakai video moon-walk.

## 2. Warna

| Token | Nilai | Pemakaian |
|---|---|---|
| `--indigo` | `#1b2a4a` | tombol aktif, ikon, pola seigaiha |
| `--indigo-deep` | `#0f1a33` | panel statistik, layer gelap, footer |
| `--sakura` | `#f7c6d3` | aksen eyebrow, seleksi teks, garis progres |
| `--sakura-deep` | `#e58fa6` | label unit kerja pada layer gelap |
| `--vermilion` | `#d9473f` | titik eyebrow, fokus keyboard |
| `--paper` | `#faf6f1` | kartu dan layer terang |
| `--ink` | `#14161f` | teks utama |
| `--ink-soft` | `#6b6f7d` | teks sekunder |
| `--hairline` | `#e6e0d8` | garis pemisah |

Latar halaman: gradasi washi `#fdfaf6 → #f5eee8 → #ebe3e8`, pola seigaiha (opacity 7,5%),
noise (multiply), dan dua kabut blur (indigo dan sakura) yang bergerak pelan.

Section scan dan footer memakai palet gelap sendiri: `#171019`, `#100b12`, `#f29bbd` (pink),
`#ffd0e0`, `#fbeef4`, dan `#c79bb1`.

## 3. Tipografi

| Peran | Font | Bobot |
|---|---|---|
| Judul hero, judul bagian, judul kartu | Zen Old Mincho | 700 |
| Judul section scan dan judul kartu scan | Shippori Mincho | 400 |
| Teks umum dan UI | Onest | 400 / 500 |
| Teks section scan | Noto Sans JP | 400 / 600 / 700 |

## 4. Susunan halaman

| No | Bagian | ID | Isi |
|---|---|---|---|
| 1 | Hero | `beranda` | Video latar, caption dari `site/caption`, tombol "Lihat Kegiatan" |
| 2 | Kegiatan | `kegiatan` | Chip filter kategori dan grid kartu |
| 3 | Layanan | `layanan` | Daftar kategori dengan jumlah kegiatan |
| 4 | Statistik | `statistik` | Tiga angka yang naik: kegiatan, unit kerja, kategori |
| 5 | Tentang | `tentang` | Kalimat pembuka dengan efek muncul |
| 6 | Galeri berlapis | `galeri` | Satu kegiatan per layer sticky (100svh). Layer di bawah mengecil 8% dan memudar 50% |
| 7 | Card scan | `scan` | Kartu semua kegiatan yang punya foto. Garis pemindai di 30% lebar. Foto memudar menjadi aksara saat melewati garis. Jeda, perlambat, percepat |
| 8 | Footer | `kontak` | Latar starfield (Three.js r143), kartu dokumentasi bergeser, ajakan, tombol form pertanyaan, tautan navigasi |

Header berisi jam lokal dan tautan ke Kegiatan, Statistik, dan Tentang.

## 5. Komponen dan perilaku

- **Tombol pill:** latar putih, teks indigo, huruf kapital. Hover menjadi merah muda atau merah bata.
- **Kartu kegiatan:** sudut 1,5rem, foto 190px. Tanpa foto, latar gradasi dengan kanji 活.
- **Baris layanan:** hover putih, padding bertambah, panah bergeser.
- **Layer galeri:** kanji besar di latar (opacity 6%), nomor urut `01 / 05`.
- **Card scan:** kartu 24px, chip sirkuit, 130 sel aksara per kartu. Aksara terurai di sisi kiri garis.
  Kecepatan 55 px/detik, melambat ke 35% saat kursor di atas.
- **Starfield footer:** 4.200 titik. Berhenti saat footer tidak terlihat.
- **Modal pertanyaan:** blur 12px, tutup dengan ×, klik latar, atau Esc. Kirim hanya menampilkan "Pesan diterima".

## 6. Gerak

| Elemen | Gerak | Durasi |
|---|---|---|
| Hero video | autoplay, muted, loop | — |
| Kelopak sakura | jatuh dan berputar | 8–18 detik |
| Judul layer galeri | naik dari balik masker | 1 detik |
| Kartu dan bagian | naik 24px dan memudar | 0,9 detik |
| Angka statistik | naik | 0,9 detik |
| Kabut latar | bergerak pelan | 28 dan 34 detik |
| Card scan | bergeser dan pemindaian | 60 fps, tergantung perangkat |

Saat `prefers-reduced-motion: reduce`, kelopak dimatikan, kabut diam, dan tombol tanpa transisi.

## 7. Responsif

| Lebar | Perubahan |
|---|---|
| ≤ 600px | Kartu scan lebih kecil, kelopak 10 partikel |
| ≤ 640px | Hero padding 1,5rem, layout satu kolom |
| ≤ 768px | Kanji vertikal disembunyikan. Kolom footer satu |
| ≥ 720px | Form admin dua kolom (form admin tidak ada di halaman publik) |
| ≥ 768px | Kolom footer 2fr dan 1fr |
| ≥ 900px | Layer galeri dua kolom |

## 8. Data

| Path | Isi | Baca | Tulis |
|---|---|---|---|
| `activities/{id}` | judul, tanggal, unit, kategori, deskripsi, image, createdAt | pengunjung | admin |
| `site/caption` | text | pengunjung | admin |

Halaman publik tidak punya panel admin. Penulisan dibatasi di sisi database.

## 9. Aksesibilitas

- Fokus keyboard: garis merah bata 2px.
- Elemen dekoratif memakai `aria-hidden`.
- Tombol ikon memakai `aria-label`.
- Aksara di card scan tidak dibaca pembaca layar. Judul dan tanggal tetap ada di DOM.

## 10. Batasan yang diketahui

- Versi lokal tidak terhubung ke database claude.ai.
- Starfield dan Three.js memerlukan CDN jsDelivr.
- Efek bloom dari spesifikasi Starfield Close belum dipakai. Kilau memakai titik additive dasar.
- Belum diuji di Safari iOS.

## 11. Riwayat versi

| Versi | Perubahan |
|---|---|
| 1.0 | Hero video, kegiatan, layanan, statistik, galeri berlapis, footer, panel admin |
| 1.1 | Jangkar `kontak`, dokumen ditulis ulang |
| 1.2 | Panel admin dihapus. CSS dan JS dipecah per komponen |
| 1.3 | Dibangun ulang dari halaman yang dipublish. Ditambah card scan dan footer starfield |
