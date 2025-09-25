-- Admin policy for accessing all team presentations
-- Run this in your Supabase SQL editor to allow admins to view all presentations

-- Add admin policy to allow admins to view all presentations
CREATE POLICY "Admins can view all presentations" ON public.team_presentations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add admin policy for storage objects
CREATE POLICY "Admins can view all presentation files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'presentations' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);