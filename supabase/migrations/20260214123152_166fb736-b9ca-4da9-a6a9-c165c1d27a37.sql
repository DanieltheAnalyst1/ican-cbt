
-- Create exam_attempts table to track student submissions
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  total_marks INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON public.exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own attempts
CREATE POLICY "Users can read own attempts"
  ON public.exam_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own attempts
CREATE POLICY "Users can update own attempts"
  ON public.exam_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all attempts
CREATE POLICY "Admins can read all attempts"
  ON public.exam_attempts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX idx_exam_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON public.exam_attempts(exam_id);
