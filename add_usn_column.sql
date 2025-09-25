-- Add USN column to team_members table
-- USN (University Seat Number) is typically a unique identifier for students
-- Making it nullable initially since existing records won't have USN values

ALTER TABLE public.team_members 
ADD COLUMN usn VARCHAR(50);

-- Add a comment to document the column
COMMENT ON COLUMN public.team_members.usn IS 'University Seat Number - unique identifier for students';

-- Optional: Create an index for better query performance if USN will be used for searches
CREATE INDEX idx_team_members_usn ON public.team_members(usn);