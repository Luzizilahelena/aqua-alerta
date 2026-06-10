
-- 1) GRANT execute on existing helper functions
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- 2) Extend profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS bio text;

-- 3) Update new-user handler to capture extra signup fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, neighborhood, avatar_url, phone, birth_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'neighborhood',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'birth_date','')::date
  );
  RETURN NEW;
END;
$$;

-- 4) Report reactions
CREATE TABLE IF NOT EXISTS public.report_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like','dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);

GRANT SELECT ON public.report_reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_reactions TO authenticated;
GRANT ALL ON public.report_reactions TO service_role;

ALTER TABLE public.report_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by everyone"
  ON public.report_reactions FOR SELECT USING (true);
CREATE POLICY "Users insert own reactions"
  ON public.report_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reactions"
  ON public.report_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reactions"
  ON public.report_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins delete any reaction"
  ON public.report_reactions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5) Report comments
CREATE TABLE IF NOT EXISTS public.report_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.report_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_comments TO authenticated;
GRANT ALL ON public.report_comments TO service_role;

ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone"
  ON public.report_comments FOR SELECT USING (true);
CREATE POLICY "Users insert own comments"
  ON public.report_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments"
  ON public.report_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own comments"
  ON public.report_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins delete any comment"
  ON public.report_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER report_comments_set_updated_at
  BEFORE UPDATE ON public.report_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
