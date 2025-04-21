-- Create a waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Make sure emails are unique
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);


-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON public.waitlist (email);

-- Set up row-level security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create a new policy that allows both anonymous AND authenticated users to insert
CREATE POLICY "Allow inserts to waitlist" 
  ON public.waitlist 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Optionally, add a policy for authenticated users to view their own submissions
CREATE POLICY "Allow users to view their own entries" 
  ON public.waitlist 
  FOR SELECT 
  TO authenticated
  USING (auth.uid()::text = source);

-- Only allow service role/admin to SELECT, UPDATE, DELETE
CREATE POLICY "Allow service role to manage waitlist" 
  ON public.waitlist 
  USING (auth.role() = 'service_role'); 