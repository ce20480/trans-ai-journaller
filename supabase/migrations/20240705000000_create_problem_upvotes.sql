-- Create a table to track user upvotes on problems
CREATE TABLE IF NOT EXISTS public.problem_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure a user can only upvote a problem once
  CONSTRAINT unique_user_problem_upvote UNIQUE (user_id, problem_id)
);

-- Enable Row Level Security
ALTER TABLE public.problem_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own upvotes
CREATE POLICY "Users can insert their own upvotes" 
  ON public.problem_upvotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own upvotes
CREATE POLICY "Users can view their own upvotes" 
  ON public.problem_upvotes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS problem_upvotes_user_id_idx ON public.problem_upvotes (user_id);
CREATE INDEX IF NOT EXISTS problem_upvotes_problem_id_idx ON public.problem_upvotes (problem_id); 