-- ===========================================================================
-- SALIN SELURUH FILE INI KE SUPABASE → SQL EDITOR → RUN
-- Proyek: yrmfqgphnpkayaekvhwc
-- Tujuan: foto yang sudah ada di bucket "pelayanan-madu" (33 file) ditautkan
--         ke tabel activities agar muncul di section Kegiatan, Dokumentasi,
--         Pindai (#scan), dan Galeri.
-- Aman dijalankan berulang kali (idempoten).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- LANGKAH 1 — Kolom & tabel yang kurang
-- ---------------------------------------------------------------------------
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Samakan kolom image <-> images untuk data lama
UPDATE public.activities
SET images = ARRAY[image]
WHERE image IS NOT NULL AND image <> ''
  AND array_length(images, 1) IS NULL;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  caption TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.site_settings (id, caption)
VALUES (1, 'Pelayanan Unit Kerja — Kawaguchiko')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  body TEXT NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.editor_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- LANGKAH 2 — Izin tabel (penyebab error 42501 "permission denied")
-- ---------------------------------------------------------------------------
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activities are publicly readable" ON public.activities;
DROP POLICY IF EXISTS "Editors can manage activities" ON public.activities;
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
DROP POLICY IF EXISTS "Editors can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
DROP POLICY IF EXISTS "Anyone can comment" ON public.comments;
DROP POLICY IF EXISTS "Editors can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view their own record" ON public.editor_users;

CREATE POLICY "Activities are publicly readable"
  ON public.activities FOR SELECT USING (true);

CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Anyone can comment"
  ON public.comments FOR INSERT
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 60
    AND char_length(btrim(body)) BETWEEN 1 AND 1000
    AND char_length(device_id) > 0
  );

CREATE POLICY "Editors can manage activities"
  ON public.activities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.editor_users
                 WHERE editor_users.id = auth.uid()
                   AND editor_users.role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.editor_users
                      WHERE editor_users.id = auth.uid()
                        AND editor_users.role IN ('admin','editor')));

CREATE POLICY "Editors can manage site settings"
  ON public.site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.editor_users
                 WHERE editor_users.id = auth.uid()
                   AND editor_users.role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.editor_users
                      WHERE editor_users.id = auth.uid()
                        AND editor_users.role IN ('admin','editor')));

CREATE POLICY "Editors can delete comments"
  ON public.comments FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.editor_users
                 WHERE editor_users.id = auth.uid()
                   AND editor_users.role IN ('admin','editor')));

CREATE POLICY "Users can view their own record"
  ON public.editor_users FOR SELECT USING (auth.uid() = id);

-- GRANT ini yang paling penting: tanpa ini PostgREST menolak semua request
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.activities     TO anon, authenticated;
GRANT SELECT ON public.site_settings  TO anon, authenticated;
GRANT SELECT ON public.comments       TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.activities    TO authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated, service_role;
GRANT INSERT ON public.comments TO anon, authenticated;
GRANT DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.editor_users TO authenticated;

-- ---------------------------------------------------------------------------
-- LANGKAH 3 — Akses bucket pelayanan-madu
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pelayanan-madu','pelayanan-madu',true,8388608,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "Pelayanan madu public read"   ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor write"  ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor update" ON storage.objects;
DROP POLICY IF EXISTS "Pelayanan madu editor delete" ON storage.objects;

CREATE POLICY "Pelayanan madu public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'pelayanan-madu');

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
-- LANGKAH 4 — Tautkan SEMUA foto bucket ke tabel activities
-- (jalan tanpa perlu login / klik tombol apa pun)
-- ---------------------------------------------------------------------------
-- Bangun URL publik foto lalu isi satu kegiatan dokumentasi
DO $$
DECLARE
  base_url TEXT := coalesce(
    current_setting('app.settings.supabase_url', true),
    'https://yrmfqgphnpkayaekvhwc.supabase.co'
  );
  urls TEXT[];
  doc_id UUID;
  first_date TIMESTAMPTZ;
BEGIN
  -- Kumpulkan semua URL foto yang benar-benar ada di bucket
  SELECT array_agg(base_url || '/storage/v1/object/public/' || o.bucket_id || '/' || o.name
                   ORDER BY o.created_at),
         min(o.created_at)
    INTO urls, first_date
  FROM storage.objects o
  WHERE o.bucket_id = 'pelayanan-madu'
    AND o.name NOT LIKE '.%';

  IF urls IS NULL OR array_length(urls, 1) IS NULL THEN
    RAISE NOTICE 'Tidak ada file di bucket pelayanan-madu.';
    RETURN;
  END IF;

  -- Kegiatan dokumentasi yang sudah ada -> pakai; kalau belum, buat baru
  SELECT id INTO doc_id
  FROM public.activities
  WHERE title = 'Dokumentasi Kegiatan Pelayanan'
  ORDER BY created_at
  LIMIT 1;

  IF doc_id IS NULL THEN
    INSERT INTO public.activities
      (title, date, unit, category, description, image, images, created_at, updated_at)
    VALUES
      ('Dokumentasi Kegiatan Pelayanan',
       first_date::date,
       'Madu Sport',
       'Dokumentasi',
       'Kumpulan foto dokumentasi kegiatan pelayanan.',
       urls[1],
       urls,
       first_date,
       NOW())
    RETURNING id INTO doc_id;

    RAISE NOTICE 'Kegiatan dokumentasi dibuat dengan % foto.', array_length(urls, 1);
  ELSE
    UPDATE public.activities
    SET images  = urls,
        image   = urls[1],
        updated_at = NOW()
    WHERE id = doc_id;

    RAISE NOTICE 'Kegiatan dokumentasi diperbarui dengan % foto.', array_length(urls, 1);
  END IF;

  -- Tandai pembuat sebagai admin/editor agar bisa mengelola dari /editor
  INSERT INTO public.editor_users (id, email, role)
  SELECT u.id, u.email, 'admin'
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.editor_users)
  LIMIT 1;
END $$;

-- ---------------------------------------------------------------------------
-- LANGKAH 5 — Muat ulang cache API & laporkan hasil
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

SELECT title, date, array_length(images, 1) AS jumlah_foto, image
FROM public.activities
ORDER BY date DESC;
