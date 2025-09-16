-- SQL query to add SIH PS ID column to the teams table
ALTER TABLE public.teams 
ADD COLUMN sih_ps_id INTEGER;

-- Add a comment to describe the column
COMMENT ON COLUMN public.teams.sih_ps_id IS 'Smart India Hackathon Problem Statement ID';