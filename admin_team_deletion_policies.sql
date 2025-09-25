-- Admin Team Deletion Policies
-- This file adds the necessary policies to allow admins to delete teams and all related data
-- while preserving user login credentials

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can delete all teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can delete all team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can view all team members" ON public.team_members;

-- Enable admins to delete teams
CREATE POLICY "Admins can delete all teams" ON public.teams
FOR DELETE USING (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Enable admins to delete team members
CREATE POLICY "Admins can delete all team members" ON public.team_members
FOR DELETE USING (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Enable admins to view team members for deletion operations (if not already covered by existing policies)
CREATE POLICY "Admins can view all team members" ON public.team_members
FOR SELECT USING (
    exists (
        select 1 
        from public.users u 
        where u.id = auth.uid() 
        and u.role = 'admin'
        limit 1
    )
);

-- Enable admins to delete team presentations if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'team_presentations') THEN
        EXECUTE 'CREATE POLICY "Admins can delete all team presentations" ON public.team_presentations
        FOR DELETE USING (
            exists (
                select 1 
                from public.users u 
                where u.id = auth.uid() 
                and u.role = ''admin''
                limit 1
            )
        )';
        
        EXECUTE 'CREATE POLICY "Admins can view all team presentations" ON public.team_presentations
        FOR SELECT USING (
            exists (
                select 1 
                from public.users u 
                where u.id = auth.uid() 
                and u.role = ''admin''
                limit 1
            )
        )';
    END IF;
END $$;

-- Note: User login credentials in auth.users and public.users tables will NOT be deleted
-- Only team-related data (teams, team_members, team_presentations) will be removed