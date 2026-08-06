-- Store signup email on profiles for admin visibility
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

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
