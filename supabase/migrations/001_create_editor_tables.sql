-- Migration: Create editor tables for internal project (like previous kantor project)
-- Created: 2026-10-26

-- 1. Storage bucket for kegiatan images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pelayanan-madu',
  'pelayanan-madu',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage bucket for editor uploads (documents, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-uploads',
  'editor-uploads',
  true,
  104857600, -- 100MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Activities table (kegiatan)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Site settings table (caption, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  caption TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Editor content table (rich text editor content)
CREATE TABLE IF NOT EXISTS public.editor_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Editor media library table
CREATE TABLE IF NOT EXISTS public.editor_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Editor users table (for admin access control)
CREATE TABLE IF NOT EXISTS public.editor_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
-- Public can read activities
CREATE POLICY "Activities are publicly readable"
  ON public.activities FOR SELECT
  USING (true);

-- Only authenticated editor_users can insert/update/delete
CREATE POLICY "Editors can manage activities"
  ON public.activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  );

-- RLS Policies for site_settings
CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage site settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  );

-- RLS Policies for editor_pages
CREATE POLICY "Published pages are publicly readable"
  ON public.editor_pages FOR SELECT
  USING (published = true OR (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  ));

CREATE POLICY "Editors can manage pages"
  ON public.editor_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  );

-- RLS Policies for editor_media
CREATE POLICY "Media is publicly readable"
  ON public.editor_media FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage media"
  ON public.editor_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users
      WHERE editor_users.id = auth.uid()
      AND editor_users.role IN ('admin', 'editor')
    )
  );

-- RLS Policies for editor_users
CREATE POLICY "Admins can manage users"
  ON public.editor_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.editor_users eu
      WHERE eu.id = auth.uid()
      AND eu.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own record"
  ON public.editor_users FOR SELECT
  USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_editor_pages_slug ON public.editor_pages(slug);
CREATE INDEX IF NOT EXISTS idx_editor_media_bucket ON public.editor_media(bucket);

-- Insert default site settings
INSERT INTO public.site_settings (id, caption) VALUES (1, 'Pelayanan Unit Kerja — Kawaguchiko')
ON CONFLICT (id) DO NOTHING;