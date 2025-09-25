-- Check if team_presentations table exists and its structure
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'team_presentations';

-- 2. Check table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'team_presentations'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'team_presentations';

-- 4. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'team_presentations';

-- 5. Count existing records (if any)
SELECT COUNT(*) as total_records FROM public.team_presentations;

-- 6. Check storage bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'presentations';

-- 7. List files in storage (sample)
SELECT name, id, bucket_id, owner, created_at, updated_at, last_accessed_at, metadata
FROM storage.objects 
WHERE bucket_id = 'presentations'
LIMIT 10;