-- Create a function to safely increment the votes for a problem
CREATE OR REPLACE FUNCTION increment_problem_votes(problem_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_votes INTEGER;
BEGIN
  UPDATE public.problems
  SET votes = votes + 1
  WHERE id = problem_id
  RETURNING votes INTO new_votes;
  
  RETURN new_votes;
END;
$$; 