-- Table to store team presentation files (PPT uploads)
-- This should be added to your Supabase database

CREATE TABLE public.team_presentations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  presentation_name character varying NOT NULL,
  file_name character varying NOT NULL,
  file_path character varying NOT NULL,
  file_size bigint NOT NULL,
  file_type character varying NOT NULL,
  upload_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  uploaded_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  description text,
  CONSTRAINT team_presentations_pkey PRIMARY KEY (id),
  CONSTRAINT team_presentations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT team_presentations_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id),
  CONSTRAINT team_presentations_file_size_check CHECK (file_size <= 10485760), -- 10MB limit
  CONSTRAINT team_presentations_file_type_check CHECK (file_type IN ('application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'))
);

-- Index for better query performance
CREATE INDEX team_presentations_team_id_idx ON public.team_presentations(team_id);
CREATE INDEX team_presentations_uploaded_by_idx ON public.team_presentations(uploaded_by);
CREATE INDEX team_presentations_upload_date_idx ON public.team_presentations(upload_date);

-- RLS (Row Level Security) policies
ALTER TABLE public.team_presentations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see presentations from their own team
CREATE POLICY "Users can view their team presentations" ON public.team_presentations
FOR SELECT USING (
  team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  )
);

-- Policy: Only team leaders can upload presentations
CREATE POLICY "Team leaders can upload presentations" ON public.team_presentations
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND 
  team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  )
);

-- Policy: Only team leaders can update their presentations
CREATE POLICY "Team leaders can update their presentations" ON public.team_presentations
FOR UPDATE USING (
  uploaded_by = auth.uid() AND 
  team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  )
);

-- Policy: Only team leaders can delete their presentations
CREATE POLICY "Team leaders can delete their presentations" ON public.team_presentations
FOR DELETE USING (
  uploaded_by = auth.uid() AND 
  team_id IN (
    SELECT id FROM public.teams WHERE leader_id = auth.uid()
  )
);

-- Create a storage bucket for presentations (run this in Supabase SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('presentations', 'presentations', false);

-- Storage policies for the presentations bucket
-- CREATE POLICY "Team leaders can upload presentations" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'presentations' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Team leaders can view their presentations" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'presentations' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Team leaders can delete their presentations" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'presentations' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );