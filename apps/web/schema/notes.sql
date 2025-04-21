-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tag TEXT, -- Tag column for AI-generated or user-defined tags
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes (user_id);

-- Set up row-level security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to view only their own notes
CREATE POLICY "Users can view their own notes" 
  ON public.notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy allowing users to insert their own notes
CREATE POLICY "Users can insert their own notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy allowing users to update their own notes
CREATE POLICY "Users can update their own notes" 
  ON public.notes 
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy allowing users to delete their own notes
CREATE POLICY "Users can delete their own notes" 
  ON public.notes 
  FOR DELETE
  USING (auth.uid() = user_id); 