
-- Create exam_sections table
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

-- RLS policies for exam_sections
CREATE POLICY "Admins can manage exam_sections" ON public.exam_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read sections of published exams" ON public.exam_sections FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_sections.exam_id AND exams.published = true)
);

-- Updated_at trigger
CREATE TRIGGER update_exam_sections_updated_at BEFORE UPDATE ON public.exam_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add section_id to questions (nullable so existing questions still work)
ALTER TABLE public.questions ADD COLUMN section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL;
