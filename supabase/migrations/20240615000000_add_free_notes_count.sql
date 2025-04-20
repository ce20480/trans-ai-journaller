-- Add free_notes_count column to profiles table
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS free_notes_count INTEGER DEFAULT 0;

-- Update existing profiles to have 0 free notes count if they don't have any yet
UPDATE profiles 
SET free_notes_count = 0 
WHERE free_notes_count IS NULL; 