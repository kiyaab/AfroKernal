
-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================================
-- Shared updated_at helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Learner',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- user_stats: xp, streak, level
-- =========================================================
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stats read" ON public.user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own stats write" ON public.user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own stats insert" ON public.user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- learning_progress
-- =========================================================
CREATE TABLE public.learning_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, path_slug, lesson_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated;
GRANT ALL ON public.learning_progress TO service_role;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress read" ON public.learning_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own progress write" ON public.learning_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON public.learning_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- quiz_results
-- =========================================================
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  quiz_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_results TO authenticated;
GRANT ALL ON public.quiz_results TO service_role;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quiz read" ON public.quiz_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own quiz write" ON public.quiz_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- terminal_sessions
-- =========================================================
CREATE TABLE public.terminal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distro TEXT NOT NULL DEFAULT 'ubuntu',
  commands_run INTEGER NOT NULL DEFAULT 0,
  last_command TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terminal_sessions TO authenticated;
GRANT ALL ON public.terminal_sessions TO service_role;
ALTER TABLE public.terminal_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions read" ON public.terminal_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.terminal_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sessions update" ON public.terminal_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_terminal_sessions_user_created ON public.terminal_sessions(user_id, created_at DESC);
CREATE TRIGGER trg_terminal_sessions_updated BEFORE UPDATE ON public.terminal_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- linux_commands: reference docs + embeddings for RAG
-- Public-readable (anon + authenticated). Only service_role writes.
-- =========================================================
CREATE TABLE public.linux_commands (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_desc TEXT NOT NULL,
  syntax TEXT NOT NULL,
  description TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  related JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.linux_commands TO anon, authenticated;
GRANT ALL ON public.linux_commands TO service_role;
ALTER TABLE public.linux_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs public read" ON public.linux_commands FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_linux_commands_category ON public.linux_commands(category);
CREATE INDEX idx_linux_commands_embedding ON public.linux_commands USING hnsw (embedding vector_cosine_ops);
CREATE TRIGGER trg_linux_commands_updated BEFORE UPDATE ON public.linux_commands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RAG search function (SECURITY DEFINER so anon can search)
CREATE OR REPLACE FUNCTION public.match_commands(
  query_embedding vector(1536),
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  slug TEXT, name TEXT, category TEXT, short_desc TEXT, syntax TEXT,
  description TEXT, similarity FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.slug, c.name, c.category, c.short_desc, c.syntax, c.description,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.linux_commands c
  WHERE c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
GRANT EXECUTE ON FUNCTION public.match_commands(vector, INTEGER) TO anon, authenticated, service_role;

-- =========================================================
-- chat_conversations + chat_messages
-- =========================================================
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conv read" ON public.chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own conv write" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own conv update" ON public.chat_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own conv delete" ON public.chat_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_conv_updated BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own msg read" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own msg write" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at);

-- =========================================================
-- Auto-create profile + stats on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Learner')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
