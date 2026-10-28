-- Migration: Komentar interaktif per foto kegiatan (ala Instagram)
-- Created: 2026-10-28
-- Satu kegiatan = satu "post". Komentar publik boleh dibaca & ditulis,
-- balasan memakai parent_id, dan pengunjung hanya bisa menghapus komentarnya sendiri.

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  body TEXT NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Publik boleh membaca semua komentar
CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT
  USING (true);

-- Pengunjung anonim boleh menulis komentar (device_id wajib terisi)
CREATE POLICY "Anyone can comment"
  ON public.comments FOR INSERT
  WITH CHECK (char_length(btrim(name)) BETWEEN 1 AND 60
    AND char_length(btrim(body)) BETWEEN 1 AND 1000
    AND char_length(device_id) > 0);

-- Pengunjung hanya bisa menghapus komentarnya sendiri (lewat fungsi RPC delete_own_comment),
-- editor/admin bisa menghapus lewat policy ini.
CREATE POLICY "Editors can delete comments"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  );

-- Hapus komentar milik sendiri: dicocokkan dengan device_id, tanpa perlu login
CREATE OR REPLACE FUNCTION public.delete_own_comment(p_id UUID, p_device TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER;
BEGIN
  IF p_device IS NULL OR char_length(p_device) < 8 THEN
    RETURN FALSE;
  END IF;
  DELETE FROM public.comments WHERE id = p_id AND device_id = p_device;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_comment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_comment(UUID, TEXT) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_comments_activity ON public.comments(activity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_device ON public.comments(device_id);
