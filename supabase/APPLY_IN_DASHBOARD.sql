-- ============================================================================
-- AfroKernel - Production Supabase Dashboard Setup & Admin Users Sync
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Fixes:
--  1. Ensures all registered users on https://afrokernel.com/ are saved with
--     email, display name, roles, and stats.
--  2. Auto-registers 'admin' role for admin@afrokernel.com & admin@ak.com.
--  3. Enables real-time admin visibility on the "Users & Roles" admin page.
--  4. Backfills all existing registered users into profiles and user_roles.
-- ============================================================================

-- 1. Ensure columns exist on profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS preferred_distro TEXT DEFAULT 'ubuntu';

-- 2. Ensure user_roles table & enum exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Ensure has_role helper function exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon, authenticated;

-- 4. Trigger to handle every new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
  v_clean_email TEXT;
BEGIN
  v_clean_email := lower(trim(NEW.email));
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'Learner'
  );

  -- 1) Create or update profile
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    headline,
    preferred_distro,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_display_name,
    NEW.email,
    NEW.email,
    'ubuntu',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    headline = COALESCE(public.profiles.headline, EXCLUDED.headline),
    updated_at = now();

  -- 2) Create initial user stats (150 XP, Level 1, 1 day streak)
  INSERT INTO public.user_stats (user_id, xp, level, streak_days)
  VALUES (NEW.id, 150, 1, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3) Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 4) If admin email, grant 'admin' and 'instructor' roles automatically
  IF v_clean_email IN ('admin@afrokernel.com', 'admin@ak.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'instructor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it triggers on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill existing registered users from auth.users into profiles, stats, and roles
INSERT INTO public.profiles (id, display_name, email, headline, updated_at)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1),
    'Learner'
  ),
  u.email,
  u.email,
  now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = COALESCE(public.profiles.email, EXCLUDED.email),
  headline = COALESCE(public.profiles.headline, EXCLUDED.headline);

INSERT INTO public.user_stats (user_id, xp, level, streak_days)
SELECT u.id, 150, 1, 1
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE lower(trim(u.email)) IN ('admin@afrokernel.com', 'admin@ak.com')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'instructor'
FROM auth.users u
WHERE lower(trim(u.email)) IN ('admin@afrokernel.com', 'admin@ak.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Row Level Security policies for admin management
DO $$ BEGIN
  CREATE POLICY "admin read all profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (
      auth.uid() = id
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor')
      OR (SELECT lower(trim(email)) IN ('admin@afrokernel.com', 'admin@ak.com') FROM auth.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin update all profiles"
    ON public.profiles FOR UPDATE TO authenticated
    USING (
      auth.uid() = id
      OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin read all stats"
    ON public.user_stats FOR SELECT TO authenticated
    USING (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor')
      OR (SELECT lower(trim(email)) IN ('admin@afrokernel.com', 'admin@ak.com') FROM auth.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin write all stats"
    ON public.user_stats FOR ALL TO authenticated
    USING (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin')
    )
    WITH CHECK (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin read all roles"
    ON public.user_roles FOR SELECT TO authenticated
    USING (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin')
      OR (SELECT lower(trim(email)) IN ('admin@afrokernel.com', 'admin@ak.com') FROM auth.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin manage roles"
    ON public.user_roles FOR ALL TO authenticated
    USING (
      public.has_role(auth.uid(), 'admin')
      OR (SELECT lower(trim(email)) IN ('admin@afrokernel.com', 'admin@ak.com') FROM auth.users WHERE id = auth.uid())
    )
    WITH CHECK (
      public.has_role(auth.uid(), 'admin')
      OR (SELECT lower(trim(email)) IN ('admin@afrokernel.com', 'admin@ak.com') FROM auth.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. High-performance RPC: admin_list_learners()
-- Bypasses RLS with SECURITY DEFINER and returns all registered users directly
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
  -- Verify caller is authorized as admin or instructor
  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
    OR EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND lower(trim(u.email)) IN ('admin@afrokernel.com', 'admin@ak.com')
    )
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    COALESCE(
      p.display_name,
      au.raw_user_meta_data->>'display_name',
      au.raw_user_meta_data->>'full_name',
      split_part(au.email, '@', 1),
      'Learner'
    ) AS display_name,
    COALESCE(p.bio, '') AS bio,
    COALESCE(p.avatar_url, '') AS avatar_url,
    COALESCE(au.email::text, p.email, 'unknown@afrokernel.com') AS email,
    COALESCE(p.location, '') AS location,
    COALESCE(p.website, '') AS website,
    COALESCE(p.github_url, '') AS github_url,
    COALESCE(p.learning_goal, 'Master Linux') AS learning_goal,
    COALESCE(p.preferred_distro, 'ubuntu') AS preferred_distro,
    COALESCE(p.headline, au.email::text, '') AS headline,
    COALESCE(p.updated_at, au.updated_at, au.created_at) AS updated_at,
    au.created_at AS created_at,
    COALESCE(s.xp, 150) AS xp,
    COALESCE(s.level, 1) AS level,
    COALESCE(s.streak_days, 1) AS streak_days,
    COALESCE(
      (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = au.id),
      ARRAY['user']::text[]
    ) AS roles
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  LEFT JOIN public.user_stats s ON s.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_learners() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_learners() TO anon;

-- 8. Learning resources & storage buckets (idempotent)
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
