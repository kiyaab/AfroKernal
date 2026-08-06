-- Paste this into Supabase Dashboard → SQL Editor → Run
-- Fixes: admin can see all registered users + richer profiles + resources + avatars

DO $$ BEGIN
  CREATE POLICY "admin read all profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin read all stats"
    ON public.user_stats FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin write all stats"
    ON public.user_stats FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin insert stats"
    ON public.user_stats FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS preferred_distro TEXT DEFAULT 'ubuntu',
  ADD COLUMN IF NOT EXISTS headline TEXT;

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;

CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Documentation',
  resource_type TEXT NOT NULL DEFAULT 'link',
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

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public read published resources"
    ON public.learning_resources FOR SELECT TO anon, authenticated
    USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "editors manage resources"
    ON public.learning_resources FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  26214400,
  ARRAY['application/pdf', 'text/plain', 'text/markdown', 'text/x-markdown', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Course materials are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'course-materials');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload course materials"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'course-materials');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update course materials"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'course-materials');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete course materials"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'course-materials');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE OR REPLACE FUNCTION public.admin_list_learners()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  location TEXT,
  website TEXT,
  github_url TEXT,
  learning_goal TEXT,
  preferred_distro TEXT,
  headline TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
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
  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
    OR (
      SELECT lower(u.email) = 'admin@ak.com'
      FROM auth.users u
      WHERE u.id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.bio,
    p.avatar_url,
    COALESCE(p.email, au.email::text) AS email,
    p.location,
    p.website,
    p.github_url,
    p.learning_goal,
    p.preferred_distro,
    p.headline,
    p.updated_at,
    p.created_at,
    COALESCE(s.xp, 0),
    COALESCE(s.level, 1),
    COALESCE(s.streak_days, 0),
    COALESCE(
      (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = p.id),
      ARRAY['user']::text[]
    )
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_learners() TO authenticated;
