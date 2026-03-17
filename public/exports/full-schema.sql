-- ============================================================
-- ICAN CBT Platform — Full Database Schema
-- Run this in your external Supabase project's SQL Editor
-- ============================================================

-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  total_marks INTEGER NOT NULL DEFAULT 100,
  instructions TEXT DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- 5. Exam sections table
CREATE TABLE public.exam_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  total_questions INTEGER NOT NULL DEFAULT 1,
  required_questions INTEGER NOT NULL DEFAULT 1,
  is_compulsory BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;

-- 6. Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
  question_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL DEFAULT '',
  required TEXT NOT NULL DEFAULT '',
  financial_tables JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 7. Sub-questions table
CREATE TABLE public.sub_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  marks INTEGER NOT NULL DEFAULT 5,
  model_answer TEXT DEFAULT '',
  hints JSONB DEFAULT '[]'::jsonb,
  key_points JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sub_questions ENABLE ROW LEVEL SECURITY;

-- 8. Exam attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  total_marks INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- 9. User credits table
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_attempts integer NOT NULL DEFAULT 0,
  used_attempts integer NOT NULL DEFAULT 0,
  amount_paid integer NOT NULL DEFAULT 0,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exam_sections_updated_at BEFORE UPDATE ON public.exam_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sub_questions_updated_at BEFORE UPDATE ON public.sub_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Performance indexes
CREATE INDEX idx_exam_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX idx_questions_section ON public.questions(section_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- exams
CREATE POLICY "Admins can manage exams" ON public.exams FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read published exams" ON public.exams FOR SELECT USING (published = true);

-- exam_sections
CREATE POLICY "Admins can manage exam_sections" ON public.exam_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read sections of published exams" ON public.exam_sections FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_sections.exam_id AND exams.published = true)
);

-- questions
CREATE POLICY "Admins can manage questions" ON public.questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read questions of published exams" ON public.questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = questions.exam_id AND exams.published = true)
);

-- sub_questions
CREATE POLICY "Admins can manage sub_questions" ON public.sub_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read sub_questions of published exams" ON public.sub_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.exams e ON e.id = q.exam_id
    WHERE q.id = sub_questions.question_id AND e.published = true
  )
);

-- exam_attempts
CREATE POLICY "Users can insert own attempts" ON public.exam_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own attempts" ON public.exam_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.exam_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all attempts" ON public.exam_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_credits
CREATE POLICY "Users can read own credits" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.user_credits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.user_credits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage credits" ON public.user_credits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('exam-images', 'exam-images', true);

CREATE POLICY "Anyone can view exam images" ON storage.objects FOR SELECT USING (bucket_id = 'exam-images');
CREATE POLICY "Admins can upload exam images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exam-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete exam images" ON storage.objects FOR DELETE USING (bucket_id = 'exam-images' AND public.has_role(auth.uid(), 'admin'));
