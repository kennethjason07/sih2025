-- Complete setup for team_presentations table and admin access
-- Run this in Supabase SQL Editor

-- 1. Create team_presentations table (if not exists)
CREATE TABLE IF NOT EXISTS public.team_presentations (
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS team_presentations_team_id_idx ON public.team_presentations(team_id);
CREATE INDEX IF NOT EXISTS team_presentations_uploaded_by_idx ON public.team_presentations(uploaded_by);
CREATE INDEX IF NOT EXISTS team_presentations_upload_date_idx ON public.team_presentations(upload_date);

-- 3. Enable RLS
ALTER TABLE public.team_presentations ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their team presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Team leaders can upload presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Team leaders can update their presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Team leaders can delete their presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Admins can view all presentations" ON public.team_presentations;

-- 5. Create fresh RLS policies

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

-- Policy: Admins can view all presentations
CREATE POLICY "Admins can view all presentations" ON public.team_presentations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can manage all presentations  
CREATE POLICY "Admins can insert presentations" ON public.team_presentations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all presentations" ON public.team_presentations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete all presentations" ON public.team_presentations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Grant permissions
GRANT ALL ON TABLE public.team_presentations TO authenticated;

-- 7. Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('presentations', 'presentations', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Team leaders can upload presentations" ON storage.objects;
DROP POLICY IF EXISTS "Team leaders can view their presentations" ON storage.objects;
DROP POLICY IF EXISTS "Team leaders can delete their presentations" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all presentation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload presentation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete presentation files" ON storage.objects;

-- 9. Create storage policies
CREATE POLICY "Team leaders can upload presentations" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Team leaders can view their presentations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Team leaders can delete their presentations" ON storage.objects
FOR DELETE USING (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin storage policies
CREATE POLICY "Admins can view all presentation files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'presentations' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can upload presentation files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'presentations' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete presentation files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'presentations' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);