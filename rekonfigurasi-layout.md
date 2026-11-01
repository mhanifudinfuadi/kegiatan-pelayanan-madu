# Galeri Madu â€” Panduan Build Desain & Fitur Lengkap

> Web dokumentasi kegiatan internal pelayanan **KPP Madya Dua Jakarta Barat**
> (Direktorat Jenderal Pajak, Kementerian Keuangan) bergaya **futuristik-elegan
> Jepang** dengan nuansa romansa, berinti **feed foto ala Instagram**: setiap foto
> punya CTA *Lihat Dokumentasi*, reaksi hati, dan komentar pegawai.

---

## 1. Ringkasan Produk

| Aspek | Keputusan |
|---|---|
| Tujuan | Upgrade UI/UX `kegiatan-pelayanan-madu` â†’ futuristik, elegan, vibes romance |
| Inti | Feed foto ala Instagram + panel dokumentasi + reaksi + komentar |
| Pengguna | Pegawai (komentar & hati), pengunjung umum (lihat & baca), admin (unggah â€” tanpa menu publik) |
| Akun | NIP 9 digit. Terdaftar di Madu Sport â†’ nama otomatis. Belum terdaftar â†’ daftar sendiri dengan nama lengkap |
| Bahasa | Indonesia; footer mempertahankan caption bahasa Inggris asli |

### Jenis Kegiatan (wajib dipakai di semua kategori, caption & filter)
1. Pojok Pajak
2. Layanan di Luar Kantor
3. Klinik Pajak
4. Pendampingan Pelaporan SPT
5. Pendampingan Layanan Coretax
6. Konsultasi Perpajakan
7. Pelayanan Terpadu
8. Survei Kepuasan Wajib Pajak
9. Peningkatan Kualitas Pelayanan
10. Pajak Bertutur
11. Lain-lain

---

## 2. Arah Visual (Design Tokens)

**Tema:** malam Kawaguchikoâ€“Fuji yang gelap, kilau sakura pink, panel kaca, aksen kanji/katakana, kelopak jatuh + medan bintang.

### Warna
| Token | Hex | Pemakaian |
|---|---|---|
| `--background` | `#0B0E17` | Latar utama (malam Fuji) |
| `--card` | `#121829` | Kartu feed, panel |
| `--popover` | `#0D111E` | Dialog dokumentasi |
| `--primary` | `#EC4899` | CTA, hati, fokus |
| Sakura muda | `#F472B6` / `#F9A8D4` | Kelopak, aksen teks |
| Plum | `#831843` | Badge kegiatan, avatar |
| Indigo | `#1E1B4B` | Info box, avatar komentar |
| Sky | `#38BDF8` / `#7DD3FC` | Aksen sekunder (Fuji dingin) |
| Muted | `#94A3B8` | Teks sekunder |
| Border | `#232C45` + `rgba(236,72,153,0.2)` | Garis kaca |

### Tipografi
| Peran | Font | Paket |
|---|---|---|
| Heading (serif elegan) | Playfair Display Variable | `@fontsource-variable/playfair-display` |
| Body (sans futuristik) | Plus Jakarta Sans Variable | `@fontsource-variable/plus-jakarta-sans` |
| Overline / angka | Geist Mono Variable | `@fontsource-variable/geist-mono` |

Overline kanji: mono, `letter-spacing: 0.3em`, uppercase, contoh `æ´»å‹• â€” Galeri Kegiatan Pelayanan`.

### Efek & Utilitas
```css
.glass-panel { background: rgba(18,24,41,.75); border:1px solid rgba(236,72,153,.2);
  box-shadow:0 8px 32px rgba(0,0,0,.4); backdrop-filter: blur(24px); }
.neon-glow  { box-shadow: 0 0 25px rgba(236,72,153,.35); }
.text-glow  { text-shadow: 0 0 24px rgba(236,72,153,.45); }
@keyframes glow-pulse { 0%,100%{opacity:.45} 50%{opacity:1} }
```
- Hero scrim: `linear-gradient(180deg, rgba(11,14,23,.4) 0%, rgba(11,14,23,.85) 70%, #0B0E17 100%)` + radial pink `rgba(236,72,153,.18)`.
- **Canvas kelopak sakura** fixed full-viewport, `pointer-events:none`, Â±26 kelopak elips pink, berhenti saat `prefers-reduced-motion`.
- Motion: masuk `opacity 0â†’1, y 15â†’0, 0.4s easeOut`; hover kartu `y -6`, zoom foto `scale 1.05 / 700ms`. Transisi properti spesifik (tidak `transition: all`).

---

## 3. Struktur Halaman (urutan section `/`)

1. **Navigasi kaca** (fixed): logo `èœœ` + "Galeri Madu", tautan Galeri Â· Tentang, tombol **Masuk** & **Daftar** (atau nama pegawai + Keluar). *Tanpa menu admin.*
2. **Hero sinematik**: foto malam Fuji/danau, kanji vertikal `å¤œã®è¨˜æ†¶`, overline `èŠ±è¦‹ Â· KPP Madya Dua Jakarta Barat Â· DJP Kemenkeu`, judul *"Kegiatan Pelayanan, dalam Setiap Bingkai"*, CTA *Jelajahi Galeri* + *Tentang Kegiatan*, ajakan "Pegawai yang belum terdaftar di Madu Sport? Daftar di sini", pil statistik (Momen, Kegiatan, Komentar).
3. **Feed Dokumentasi** (`#galeri`): filter chip per jenis kegiatan; grid 1/2/3 kolom kartu 4:5.
4. **Jeda kutipan + statistik**: latar bintang, kanji besar `è¨˜æ†¶`, kutipan pelayanan, 4 penghitung animasi (Foto, Kegiatan, Komentar, Reaksi Hati).
5. **Section kaca bunga** (`#tentang`): foto sakura bercahaya dalam panel kaca + "Tentang Kegiatan Pelayanan" + 3 kartu fitur.
6. **Footer** â€” dipertahankan verbatim:
   - Judul: **And Then, There Was You.**
   - *Of all the things this world has given me, you are the one I was never prepared to feel.*
   - (garis) *I used to believe that a man could keep his world in order, that every feeling had its place and every longing its end. Then you came along, and suddenly, even silence began to speak your name.*
   - *â€” where My World Unravels* (garis)
   - *The world remains. I am simply no longer quite the same.*
   - Tautan: Galeri Â· Tentang Â· Masuk Pegawai Â· Daftar Pegawai; Â© Galeri Madu Â· KPP Madya Dua Jakarta Barat Â· Direktorat Jenderal Pajak Â· Kementerian Keuangan

---

## 4. Feed ala Instagram

**Kartu foto**
- Badge plum nama kegiatan (kiri atas).
- Hover reveal: caption (serif), tanggal Â· jenis kegiatan, tombol **Lihat Dokumentasi**.
- **Ketuk 1Ã—** â†’ buka dokumentasi (jeda 260 ms untuk membedakan ketuk ganda).
- **Ketuk 2Ã—** â†’ hati + ledakan 8 kelopak (scale `0â†’1.3â†’1`, kelopak menyebar 64 px).
- Baris aksi: â™¥ jumlah (pink terisi bila sudah disukai), ðŸ’¬ jumlah komentar.
- Pengunjung tanpa akun â†’ toast "Masuk sebagai pegawai untuk memberi reaksi dan komentar".

**Panel Dokumentasi (dialog split)**
- Kiri 55%: foto besar `object-contain`, klik ganda = hati + ledakan.
- Kanan 45%: header avatar `èœœ` + judul kegiatan + tanggal Â· jenis; caption; overline *Dokumentasi Kegiatan*; narasi lengkap; tanggal foto; baris â™¥/ðŸ’¬; utas komentar (avatar inisial, nama, tanggal, teks); input komentar (Enter untuk kirim, maks 1000 karakter).
- Belum masuk â†’ "Masuk atau daftar sebagai pegawai untuk berkomentar dan memberi hati".
- Esc menutup, â† â†’ navigasi foto, deep link `/?post=<photoId>`; scroll body dikunci saat terbuka.

---

## 5. Akun Pegawai

### Daftar (`/register`)
1. Ketik NIP 9 digit â†’ otomatis `GET /api/auth/nip-check/{nip}`:
   - `whitelisted` â†’ "Terdaftar di Madu Sport atas nama â€¦" (nama otomatis).
   - `new` â†’ "NIP belum terdaftar di Madu Sport" â†’ muncul field **Nama Lengkap**.
   - `claimed` â†’ "NIP ini sudah memiliki akun. Masuk di sini".
2. Kata sandi â‰¥ 6 karakter + konfirmasi.
3. Berhasil â†’ sesi aktif, kembali ke feed, nama tampil di navigasi & komentar.

### Masuk (`/login`)
NIP + kata sandi â†’ cookie httpOnly `madu_session` (30 hari). Keluar menghapus sesi & seluruh cache.

### Layout auth
Split dua kolom: kiri foto sakura/bintang + kutipan serif italic; kanan kartu kaca form.

---

## 6. Admin (tanpa menu publik)
Akses langsung via URL `/admin` (tidak ditautkan dari section mana pun).
- **Unggah Foto**: pilih kegiatan, tanggal foto, caption, teks dokumentasi, berkas gambar (â‰¤ 8 MB, jpg/png/webp/gif/avif) + pratinjau; strip galeri terbaru dengan hapus.
- **Kegiatan**: judul, **Jenis Kegiatan** (dropdown 11 jenis di atas), tanggal, lokasi, deskripsi; tabel + hapus (kaskade foto, reaksi, komentar).
- **NIP Pegawai**: daftarkan NIP + nama (whitelist Madu Sport), status *Sudah klaim / Belum klaim*.

---

## 7. Arsitektur Teknis

**Stack:** React 19 + Vite + TypeScript strict + Tailwind v4 + shadcn/ui + TanStack Query + motion Â· FastAPI + Pydantic v2 + MongoDB (motor).

### Data model
```
employees      {id, nip(unik,9 digit), name, password_hash, created_at}
nip_whitelist  {id, nip(unik), name, claimed, employee_id?, self_registered?, created_at}
admins         {id, username(unik), password_hash, created_at}
sessions       {token(unik), role: employee|admin, employee_id, expires_at(TTL), created_at}
activities     {id, title, description, category(Jenis Kegiatan), location, date, created_at}
photos         {id, image_url, caption, documentation, activity_id, shot_date, created_at}
reactions      {id, photo_id+employee_id (unik), created_at}
comments       {id, photo_id, employee_id, employee_name, text(â‰¤1000), created_at}
```

### API (prefix `/api`)
| Method | Path | Akses |
|---|---|---|
| GET | `/activities`, `/photos`, `/photos/{id}`, `/photos/{id}/comments`, `/stats` | Publik |
| GET | `/auth/nip-check/{nip}` | Publik |
| POST | `/auth/register` `{nip, password, name?}` | Publik |
| POST | `/auth/login`, `/auth/logout`; GET `/auth/me` | Publik/sesi |
| POST | `/photos/{id}/like` (toggle) | Pegawai |
| POST | `/photos/{id}/comments` `{text}` | Pegawai |
| DELETE | `/comments/{id}` | Penulis / admin |
| POST | `/auth/admin/login` | Admin |
| POST/PUT/DELETE | `/admin/activities[/{id}]` | Admin |
| POST | `/admin/photos` (multipart) Â· DELETE `/admin/photos/{id}` | Admin |
| GET/POST/DELETE | `/admin/nips[/{id}]` | Admin |

### Struktur berkas frontend
```
src/components/effects/SakuraCanvas.tsx
src/components/layout/SiteNav.tsx
src/components/landing/{HeroSection,QuoteSection,FloralGlassSection,FooterSection}.tsx
src/components/feed/{FeedSection,PhotoCard,PostDetailModal}.tsx
src/pages/{Home,Login,Register,Admin}.tsx
src/lib/{api,hooks,session,types,format,constants}.ts
```

---

## 8. Aksesibilitas & Kualitas
- Kontras teks di atas foto â‰¥ 7:1 (scrim gradien).
- `prefers-reduced-motion`: kelopak statis, penghitung langsung ke nilai akhir, tanpa smooth scroll.
- Setiap elemen interaktif memiliki `data-testid` kebab-case.
- Optimistic update hati dengan rollback bila gagal; toast (sonner) untuk semua error.

## 9. Tahap Lanjut
- Sambungkan akun & unggahan ke Supabase madusport087 (project URL + anon key).
- Tombol salin tautan foto untuk dibagikan ke grup pegawai.
- Lencana bulanan "Layanan Paling Diapresiasi" untuk foto dengan hati terbanyak.