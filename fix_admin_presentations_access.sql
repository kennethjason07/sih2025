-- Fix admin access to existing team_presentations table
-- Run this in Supabase SQL Editor

-- 1. First, let's check what we have
SELECT COUNT(*) as total_records FROM public.team_presentations;
SELECT COUNT(*) as total_storage_files FROM storage.objects WHERE bucket_id = 'presentations';

-- 2. Check current RLS policies
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'team_presentations';

-- 3. Add admin policies if they don't exist (these will be created only if they don't exist)

-- Drop existing admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Admins can insert presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Admins can update all presentations" ON public.team_presentations;
DROP POLICY IF EXISTS "Admins can delete all presentations" ON public.team_presentations;

-- Create admin policies
CREATE POLICY "Admins can view all presentations" ON public.team_presentations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

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

-- 4. Add storage policies for admin access
DROP POLICY IF EXISTS "Admins can view all presentation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload presentation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete presentation files" ON storage.objects;

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

-- 5. Check what files exist in storage vs database
WITH storage_files AS (
    SELECT name as file_path, owner, created_at, 
           split_part(name, '/', 1)::uuid as extracted_team_id
    FROM storage.objects 
    WHERE bucket_id = 'presentations'
      AND name ~ '^[0-9a-f-]{36}/'
),
database_records AS (
    SELECT file_path, team_id, uploaded_by
    FROM public.team_presentations
)
SELECT 
    sf.file_path,
    sf.extracted_team_id,
    sf.owner,
    CASE WHEN dr.file_path IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as db_status
FROM storage_files sf
LEFT JOIN database_records dr ON sf.file_path = dr.file_path
ORDER BY db_status, sf.file_path;