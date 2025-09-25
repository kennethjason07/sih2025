-- Create RPC function to get all presentations for admin
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION get_all_presentations_admin()
RETURNS TABLE(
    id uuid,
    team_id uuid,
    presentation_name character varying,
    file_name character varying,
    file_path character varying,
    file_size bigint,
    file_type character varying,
    upload_date timestamp with time zone,
    uploaded_by uuid,
    is_active boolean,
    version integer,
    description text,
    team_name text,
    leader_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Return all presentations with team info
    RETURN QUERY
    SELECT 
        tp.id,
        tp.team_id,
        tp.presentation_name,
        tp.file_name,
        tp.file_path,
        tp.file_size,
        tp.file_type,
        tp.upload_date,
        tp.uploaded_by,
        tp.is_active,
        tp.version,
        tp.description,
        t.team_name,
        t.leader_name
    FROM public.team_presentations tp
    LEFT JOIN public.teams t ON tp.team_id = t.id
    ORDER BY tp.upload_date DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_presentations_admin() TO authenticated;