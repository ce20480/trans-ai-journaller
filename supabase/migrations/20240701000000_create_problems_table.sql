-- Create problems table for community discussion board
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) <= 1000),
  tags TEXT[] DEFAULT '{}',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read problems
CREATE POLICY "Anyone can view problems" 
  ON public.problems 
  FOR SELECT 
  USING (true);

-- Create policy to allow anyone to insert problems (no auth required)
CREATE POLICY "Anyone can insert problems" 
  ON public.problems 
  FOR INSERT 
  WITH CHECK (true);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS problems_created_at_idx ON public.problems (created_at DESC);

-- Create index on tags for faster filtering
CREATE INDEX IF NOT EXISTS problems_tags_idx ON public.problems USING GIN (tags); 