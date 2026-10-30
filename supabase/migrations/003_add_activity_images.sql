-- Migration: Tambah kolom images (array URL foto alternatif) pada tabel activities
-- Created: 2026-10-30
-- Kolom `image` tetap sebagai foto utama (images[0]); `images` menampung semua foto alternatif.

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: isi images dengan image lama bila images masih kosong dan image terisi
UPDATE public.activities
SET images = ARRAY[image]
WHERE image IS NOT NULL
  AND (images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0);

CREATE INDEX IF NOT EXISTS idx_activities_images ON public.activities USING GIN(images);
