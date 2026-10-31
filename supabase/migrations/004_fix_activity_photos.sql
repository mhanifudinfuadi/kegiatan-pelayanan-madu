-- Migration: Perbaikan akses & kolom agar foto dokumentasi tampil di web
-- Created: 2026-10-31
--
-- Kenapa perlu?
-- 1. Role API (anon/authenticated/service_role) tidak punya GRANT pada tabel
--    `activities` sehingga PostgREST menolak dengan 42501 "permission denied".
-- 2. Kolom `images` (migrasi 003) belum ada di database -> insert/update gagal.
-- 3. Tabel `site_settings` & `comments` belum dibuat.
-- 4. Storage bucket `pelayanan-madu` bisa di-upload lewat dashboard, tetapi
--    tanpa policy `storage.objects` upload/update/delete dari aplikasi ditolak.

-- ---------------------------------------------------------------------------
-- 1. Tabel yang dipakai halaman publik & editor
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  caption TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (id, caption)
VALUES (1, 'Pelayanan Unit Kerja — Kawaguchiko')
ON CONFLICT (id) DO NOTHING;

-- Tabel komentar publik (sama dengan migrasi 002, idempoten)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  body TEXT NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel akses editor (dipakai policy di bawah)
CREATE TABLE IF NOT EXISTS public.editor_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Kolom images (semua foto dokumentasi dalam satu kegiatan)
-- ---------------------------------------------------------------------------
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: minimal foto utama ikut masuk ke array images
UPDATE public.activities
SET images = ARRAY[image]
WHERE image IS NOT NULL
  AND image <> ''
  AND (images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0);

CREATE INDEX IF NOT EXISTS idx_activities_images ON public.activities USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_comments_activity ON public.comments(activity_id, created_at);

-- ---------------------------------------------------------------------------
-- 3. RLS tabel
-- ---------------------------------------------------------------------------
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_users ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama dengan nama yang sama agar migrasi bisa dijalankan ulang
DROP POLICY IF EXISTS "Activities are publicly readable" ON public.activities;
DROP POLICY IF EXISTS "Editors can manage activities" ON public.activities;
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
DROP POLICY IF EXISTS "Editors can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
DROP POLICY IF EXISTS "Anyone can comment" ON public.comments;
DROP POLICY IF EXISTS "Editors can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage users" ON public.editor_users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.editor_users;

-- Publik boleh membaca kegiatan & caption
CREATE POLICY "Activities are publicly readable"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can comment"
  ON public.comments FOR INSERT
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 60
    AND char_length(btrim(body)) BETWEEN 1 AND 1000
    AND char_length(device_id) > 0
  );

-- Editor/admin boleh mengelola kegiatan, caption, dan komentar
CREATE POLICY "Editors can manage activities"
  ON public.activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
        AND editor_users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
        AND editor_users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can manage site settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
        AND editor_users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
        AND editor_users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can delete comments"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
        AND editor_users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can view their own record"
  ON public.editor_users FOR SELECT
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 4. GRANT: penyebab utama error 42501 "permission denied for table activities"
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Public hanya boleh membaca tabel konten
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;

-- Akses tulis tetap dijaga RLS di atas
GRANT INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT INSERT ON public.comments TO anon, authenticated;
GRANT DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.editor_users TO authenticated;

-- service_role dipakai API server (/api/admin/sync-photos)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Storage: policy bucket pelayanan-madu
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pelayanan-madu',
  'pelayanan-madu',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Pelayanan madu public read" ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor write" ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor update" ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor delete" ON storage.objects;

-- Siapa pun boleh melihat foto (bucket publik)
CREATE POLICY "Pelayanan madu public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pelayanan-madu');

-- Hanya user login yang boleh mengunggah/mengganti/menghapus foto
CREATE POLICY "Pelayanan madu editor write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pelayanan-madu');

CREATE POLICY "Pelayanan madu editor update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pelayanan-madu')
  WITH CHECK (bucket_id = 'pelayanan-madu');

CREATE POLICY "Pelayanan madu editor delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pelayanan-madu');

-- ---------------------------------------------------------------------------
-- 6. Refresh schema cache PostgREST agar kolom/tabel baru langsung dikenali
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
