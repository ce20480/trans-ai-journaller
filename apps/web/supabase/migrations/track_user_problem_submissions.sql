-- Add user_id to problems table for tracking who created each problem
ALTER TABLE public.problems
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create a new table to track daily problem submissions
CREATE TABLE IF NOT EXISTS public.user_problem_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, submission_date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_problem_submissions_user_date 
ON public.user_problem_submissions(user_id, submission_date);

-- Function to increment the daily submission count for a user
CREATE OR REPLACE FUNCTION increment_daily_problem_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  new_count INTEGER;
BEGIN
  -- Try to insert a new record or update the existing one
  INSERT INTO public.user_problem_submissions (user_id, submission_date, count)
  VALUES (user_uuid, today, 1)
  ON CONFLICT (user_id, submission_date)
  DO UPDATE SET count = user_problem_submissions.count + 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Add RLS policies to protect submission tracking
ALTER TABLE public.user_problem_submissions ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own submission counts
CREATE POLICY "Users can see their own submission counts"
ON public.user_problem_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Only the function can modify the table
CREATE POLICY "No direct inserts to submission counts"
ON public.user_problem_submissions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct updates to submission counts"
ON public.user_problem_submissions
FOR UPDATE
USING (false);

-- Create a trigger to update user_problem_submissions when a problem is created
CREATE OR REPLACE FUNCTION update_problem_submission_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only track for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    PERFORM increment_daily_problem_count(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_problem_insert
AFTER INSERT ON public.problems
FOR EACH ROW
EXECUTE FUNCTION update_problem_submission_count(); 