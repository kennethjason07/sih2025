-- Script to set up Supabase Storage Bucket for Resources
-- Run this script in your Supabase SQL Editor

-- Create the resources bucket
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do update set public = true;

-- Set up access policies for the resources bucket
create policy "Anyone can view resources"
on storage.objects for select
using ( bucket_id = 'resources' );

create policy "Admins can upload resources"
on storage.objects for insert
with check (
  bucket_id = 'resources' 
  and exists (
    select 1 
    from public.users u 
    where u.id = auth.uid() 
    and u.role = 'admin'
    limit 1
  )
);

create policy "Admins can update resources"
on storage.objects for update
using (
  bucket_id = 'resources' 
  and exists (
    select 1 
    from public.users u 
    where u.id = auth.uid() 
    and u.role = 'admin'
    limit 1
  )
);

create policy "Admins can delete resources"
on storage.objects for delete
using (
  bucket_id = 'resources' 
  and exists (
    select 1 
    from public.users u 
    where u.id = auth.uid() 
    and u.role = 'admin'
    limit 1
  )
);