-- 0) (Re‑)Enable Row Level Security
ALTER TABLE public.problems       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_upvotes ENABLE ROW LEVEL SECURITY;

-- 1) Allow admins (via JWT custom claim) to delete any problem
CREATE POLICY "Admins can delete problems"
  ON public.problems
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- 2) Allow users to delete their own upvotes (un‑vote)
CREATE POLICY "Users can delete their own upvotes"
  ON public.problem_upvotes
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- 3) Create an RPC to decrement a problem’s vote count and return the new total
CREATE OR REPLACE FUNCTION public.decrement_problem_votes(problem_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_vote_count INTEGER;
BEGIN
  UPDATE public.problems
  SET votes = GREATEST(votes - 1, 0)
  WHERE id = problem_id
  RETURNING votes INTO new_vote_count;

  RETURN new_vote_count;
END;
$$;
