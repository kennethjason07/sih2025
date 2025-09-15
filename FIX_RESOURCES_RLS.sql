-- Script to fix RLS policies for resources table
-- Run this script in your Supabase SQL Editor

-- Drop existing policies if they exist
drop policy if exists "Admins can insert resources" on public.resources;
drop policy if exists "Admins can update resources" on public.resources;
drop policy if exists "Admins can delete resources" on public.resources;

-- Admins can insert resources
create policy "Admins can insert resources" on public.resources
for insert with check (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can update resources
create policy "Admins can update resources" on public.resources
for update using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Admins can delete resources
create policy "Admins can delete resources" on public.resources
for delete using (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);