-- Final Fix for Recursion Issue - Minimal and Safe Approach

-- Drop the problematic policy first
drop policy if exists "Admins can view all users" on public.users;

-- Recreate the policy with a much simpler approach to avoid any recursion
create policy "Admins can view all users" on public.users
for select using (
    -- Users can always see their own record
    auth.uid() = id or 
    -- Check admin status directly from JWT (no database query)
    (auth.jwt() ->> 'role') = 'admin'
    -- Note: Removed the subquery that was causing recursion
);

-- For other tables, keep the existing policies but simplify them as well
drop policy if exists "Admins can view all teams" on public.teams;
create policy "Admins can view all teams" on public.teams
for select using (
    (auth.jwt() ->> 'role') = 'admin' or
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

drop policy if exists "Admins can view all announcements" on public.announcements;
create policy "Admins can view all announcements" on public.announcements
for select using (
    (auth.jwt() ->> 'role') = 'admin' or
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

drop policy if exists "Admins can view all resources" on public.resources;
create policy "Admins can view all resources" on public.resources
for select using (
    (auth.jwt() ->> 'role') = 'admin' or
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);