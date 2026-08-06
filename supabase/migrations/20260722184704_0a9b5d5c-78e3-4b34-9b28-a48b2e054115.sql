
GRANT SELECT ON public.linux_commands TO anon, authenticated;
ALTER TABLE public.linux_commands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read commands" ON public.linux_commands;
CREATE POLICY "Public read commands" ON public.linux_commands FOR SELECT TO anon, authenticated USING (true);
