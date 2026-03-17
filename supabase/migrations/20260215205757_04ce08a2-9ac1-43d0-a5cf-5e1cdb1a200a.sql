
-- Table to track user exam credits/attempts
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

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can read own credits"
ON public.user_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert (for payment flow)
CREATE POLICY "Users can insert own credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own credits (increment used_attempts)
CREATE POLICY "Users can update own credits"
ON public.user_credits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all credits
CREATE POLICY "Admins can manage credits"
ON public.user_credits
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
