# AGENTS.md — Aturan untuk AI Assistant

Berlaku untuk Claude Code, Cursor, Copilot, Codex, dan asisten lain.

## Tujuan proyek
Background web satu halaman: bunga kaca biru terang di atas latar ungu galaxy dengan bintang putih. Tidak ada teks.

## Sumber kebenaran
- Visual: `DESIGN.md`
- Nilai: `design-tokens.json` (dibuat ulang menjadi `tokens.css`)

## Do
- Ubah nilai warna di `design-tokens.json` dan `tokens.css` secara bersamaan.
- Pertahankan urutan layer: base, nebula, bintang, halo, bunga, vignette.
- Uji di lebar 1440 px dan 390 px.
- Jelaskan perubahan visual dengan singkat dan sebut file yang diubah.

## Don't
- Jangan menambah dependensi, framework, atau CDN tanpa persetujuan.
- Jangan mengubah warna bunga dengan `filter: hue-rotate` (tidak bekerja pada abu-abu).
- Jangan menaruh teks atau tombol di atas kepala bunga.
- Jangan menimpa file di `assets/source/`.
- Jangan menghapus fallback poster dan penanganan reduced-motion.

## Gaya kode
- Indentasi 2 spasi, nama class `kebab-case` atau BEM ringan (`bg__flower`).
- Komentar singkat dalam bahasa Indonesia.
- JS maksimal satu file kecil; tanpa library.

## Lisensi aset
Aset video dan poster dari GetLayers (https://getlayers.ai). Pastikan lisensi sesuai sebelum dipublikasikan.
