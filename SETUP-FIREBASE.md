# Setup Firebase dan Vercel

Langkah ini menghubungkan halaman publik dan halaman admin ke Firebase, lalu
memasangnya di Vercel. Kerjakan berurutan.

## 1. Buat project Firebase

1. Buka https://console.firebase.google.com, klik **Add project**, lalu beri nama `kegiatan-pelayanan-madu`.
2. Di menu kiri, buka **Build → Firestore Database → Create database**. Pilih mode **production**.
3. Buka **Build → Storage → Get started**, pilih mode **production**.
4. Buka **Build → Authentication → Get started**, lalu di tab **Sign-in method** aktifkan **Email/Password**.

## 2. Buat akun admin

1. Di Authentication, buka tab **Users → Add user**. Isi email dan kata sandi admin.
2. Salin **User UID** akun itu. Nilainya seperti `aB3dE5...`.

## 3. Ambil konfigurasi web

1. Buka **Project settings** (ikon roda gigi) → **General → Your apps**.
2. Klik **Add app → Web (</>)**, beri nama, lalu daftarkan. Jangan centang Hosting.
3. Salin nilai `firebaseConfig` yang muncul.
4. Buka `scripts/firebase-config.js` dan ganti semua nilai `ISI_...` dengan nilai itu. Ganti `ADMIN_UID` dengan UID dari langkah 2.

## 4. Pasang aturan keamanan

Buka `firestore.rules` dan `storage.rules`, lalu ganti `ISI_UID_ADMIN` dengan UID yang sama.

Terapkan aturannya:
- **Firestore:** Firebase Console → Firestore → **Rules**, tempel isi `firestore.rules`, lalu **Publish**.
- **Storage:** Firebase Console → Storage → **Rules**, tempel isi `storage.rules`, lalu **Publish**.

Aturan ini membuat semua orang bisa membaca data dan foto, tetapi hanya UID admin yang bisa menulis.

## 5. Jalankan secara lokal

Buka folder di VS Code, lalu **Open with Live Server**:
- `http://127.0.0.1:5500/index.html` untuk halaman publik.
- `http://127.0.0.1:5500/admin.html` untuk halaman admin. Masuk dengan email dan kata sandi admin.

Kalau halaman admin menampilkan "Konfigurasi Firebase belum diisi", berarti langkah 3 belum selesai.

## 6. Deploy ke Vercel

1. Push repositori ke GitHub (lihat langkah sebelumnya).
2. Buka https://vercel.com, login dengan GitHub, lalu klik **Add New → Project**.
3. Pilih repositori `kegiatan-pelayanan-madu`, lalu **Deploy**. Framework preset: **Other**. Tidak perlu build command atau output directory.
4. Setelah deploy selesai, buka domain `.vercel.app` yang diberikan.
5. Di Firebase Console → Authentication → **Settings → Authorized domains**, tambahkan domain Vercel itu. Tanpa ini, login admin akan gagal di Vercel.

## 7. Cek hasil

- Halaman publik menampilkan kegiatan dan caption setelah admin menambah data.
- Foto muncul di kartu kegiatan, card scan, dan dokumentasi di footer.
- Halaman admin menolak akun selain admin.

## Catatan keamanan

- Jangan letakkan kata sandi admin di kode. Akun admin cukup satu.
- Config Firebase di kode publik itu wajar. Yang melindungi data adalah aturan keamanan, bukan kerahasiaan config.
- Foto maksimal 5 MB dan harus berupa gambar, sesuai aturan Storage.
