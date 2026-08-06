
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Quiz',
  passing_score INT NOT NULL DEFAULT 70,
  xp_reward INT NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes readable by authenticated" ON public.quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quizzes managed by editors" ON public.quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
CREATE TRIGGER quizzes_set_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INT NOT NULL DEFAULT 0,
  explanation TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions readable by authenticated" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "quiz_questions managed by editors" ON public.quiz_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Command challenge',
  prompt TEXT NOT NULL,
  starter_command TEXT,
  expected_output TEXT NOT NULL DEFAULT '',
  match_mode TEXT NOT NULL DEFAULT 'contains',
  xp_reward INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges readable by authenticated" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "challenges managed by editors" ON public.challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));
CREATE TRIGGER challenges_set_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  output TEXT NOT NULL DEFAULT '',
  passed BOOLEAN NOT NULL DEFAULT false,
  awarded_xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_attempts TO authenticated;
GRANT ALL ON public.challenge_attempts TO service_role;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own challenge attempts" ON public.challenge_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_xp INT NOT NULL DEFAULT 200,
  earned_xp INT NOT NULL DEFAULT 0,
  reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_goals TO authenticated;
GRANT ALL ON public.weekly_goals TO service_role;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly goals" ON public.weekly_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER weekly_goals_set_updated_at BEFORE UPDATE ON public.weekly_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'earned',
  delta INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.streak_freezes TO authenticated;
GRANT ALL ON public.streak_freezes TO service_role;
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own streak freezes" ON public.streak_freezes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'reminder',
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Learner'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  IF lower(NEW.email) = 'admin@afrokernel.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email) = 'admin@afrokernel.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  END IF;
END $$;
