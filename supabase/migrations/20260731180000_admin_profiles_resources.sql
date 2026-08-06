-- AfroKernel: admin visibility, richer profiles, learning resources, PDF support, avatars storage

-- =========================================================
-- Admin can read ALL profiles & stats (fixes empty admin users list)
-- =========================================================
CREATE POLICY "admin read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "admin read all stats"
  ON public.user_stats FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "admin write all stats"
  ON public.user_stats FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin insert stats"
  ON public.user_stats FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Richer profile fields
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS preferred_distro TEXT DEFAULT 'ubuntu',
  ADD COLUMN IF NOT EXISTS headline TEXT;

-- =========================================================
-- Lesson PDF URL (first-class, not overloaded video_url)
-- =========================================================
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- =========================================================
-- Learning resources / documentation PDFs (admin-managed)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Documentation',
  resource_type TEXT NOT NULL DEFAULT 'link', -- link | pdf | course
  url TEXT NOT NULL,
  cover_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.learning_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learning_resources TO authenticated;
GRANT ALL ON public.learning_resources TO service_role;

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published resources"
  ON public.learning_resources FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "editors manage resources"
  ON public.learning_resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE TRIGGER trg_learning_resources_updated
  BEFORE UPDATE ON public.learning_resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.learning_resources (title, description, category, resource_type, url, sort_order)
SELECT * FROM (VALUES
  (
    'Full Linux Command Reference (PDF)',
    'Complete MTS / AfroKernel Linux command reference for offline study.',
    'Courses & PDFs',
    'pdf',
    '/docs/linux-command-reference.pdf',
    1
  ),
  (
    'Ubuntu Server Guide',
    'Official Ubuntu server administration documentation.',
    'Documentation',
    'link',
    'https://ubuntu.com/server/docs',
    2
  ),
  (
    'RHEL System Administration',
    'Red Hat Enterprise Linux sysadmin docs.',
    'Documentation',
    'link',
    'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux',
    3
  ),
  (
    'systemd Manual',
    'System and service manager reference.',
    'Documentation',
    'link',
    'https://www.freedesktop.org/software/systemd/man/',
    4
  )
) AS v(title, description, category, resource_type, url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.learning_resources LIMIT 1);

-- =========================================================
-- Avatar storage bucket
-- =========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- Admin RPC: list all learners (belt-and-suspenders)
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_list_learners()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  github_url TEXT,
  learning_goal TEXT,
  preferred_distro TEXT,
  headline TEXT,
  updated_at TIMESTAMPTZ,
  xp INTEGER,
  level INTEGER,
  streak_days INTEGER,
  roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.location,
    p.website,
    p.github_url,
    p.learning_goal,
    p.preferred_distro,
    p.headline,
    p.updated_at,
    COALESCE(s.xp, 0),
    COALESCE(s.level, 1),
    COALESCE(s.streak_days, 0),
    COALESCE(
      (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = p.id),
      ARRAY['user']::text[]
    )
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_learners() TO authenticated;
