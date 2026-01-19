-- Add DELETE policy for match_results table
-- This is needed for the admin to reset/undo match results

-- Allow authenticated users to delete match results
create policy "Authenticated users can delete match results"
  on match_results for delete using (auth.uid() is not null);
