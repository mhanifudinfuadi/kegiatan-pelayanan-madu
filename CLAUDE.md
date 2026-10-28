# CLAUDE.md — Konteks Proyek untuk Claude Code

Proyek: **Glass Flower Galaxy** — background layout web (bunga kaca biru terang, latar ungu galaxy, bintang putih, tanpa teks).

## Baca dulu
1. `DESIGN.md` — sumber kebenaran visual (palet, layer, komposisi, kode referensi).
2. `design-tokens.json` / `tokens.css` — nilai warna dan ukuran. Jangan menulis ulang hex di tempat lain.
3. `AGENTS.md` — aturan umum untuk semua AI assistant.

## Struktur
```
/
├── CLAUDE.md
├── AGENTS.md
├── DESIGN.md
├── README.md
├── design-tokens.json
├── tokens.css
├── index.html
└── assets/
    ├── glass-flower-1280.mp4
    ├── glass-flower-1280.jpg
    └── source/            # master 4K, jangan di-commit ke produksi
```

## Aturan kerja
- Stack: HTML + CSS + JS vanilla, satu halaman, tanpa framework dan tanpa build step kecuali diminta.
- Semua warna lewat CSS variable dari `tokens.css`.
- Bunga memakai `mix-blend-mode: screen` pada wrapper, dan layer tint `mix-blend-mode: color` di dalam wrapper yang sama. Jangan memindahkan tint keluar wrapper, karena latar ikut berubah warna.
- Jangan menambahkan teks, logo, atau konten ke halaman kecuali diminta.
- Bintang: putih murni `#FFFFFF`, 750 titik desktop / 300 mobile.
- Hormati `prefers-reduced-motion`.
- Jangan memakai video master 4K di web. Pakai versi di `assets/`.

## Perintah
- Preview: `python3 -m http.server 8000`
- Encode ulang aset: lihat bagian 8 di `DESIGN.md`.

## Sebelum menyelesaikan tugas
Jalankan checklist di `DESIGN.md` bagian 11 dan sebutkan item yang belum bisa diverifikasi.
