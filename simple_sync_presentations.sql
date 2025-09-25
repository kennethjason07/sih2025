-- Simple function to sync storage files to existing team_presentations table
-- Run AFTER running fix_admin_presentations_access.sql

CREATE OR REPLACE FUNCTION simple_sync_presentations()
RETURNS TABLE(
    action text,
    file_path text,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    storage_file RECORD;
    team_uuid uuid;
    file_owner uuid;
    presentation_exists boolean;
    team_leader uuid;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Loop through all files in presentations bucket
    FOR storage_file IN 
        SELECT name, owner, created_at
        FROM storage.objects 
        WHERE bucket_id = 'presentations'
    LOOP
        -- Extract team_id from file path (format: team_id/filename)
        team_uuid := NULL;
        
        -- Try to extract UUID from path
        BEGIN
            IF storage_file.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/' THEN
                team_uuid := (split_part(storage_file.name, '/', 1))::uuid;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            team_uuid := NULL;
        END;
        
        -- Skip if we can't extract team_id
        IF team_uuid IS NULL THEN
            RETURN QUERY SELECT 
                'SKIP'::text, 
                storage_file.name::text, 
                'Could not extract valid team UUID from path'::text;
            CONTINUE;
        END IF;
        
        -- Check if team exists
        IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = team_uuid) THEN
            RETURN QUERY SELECT 
                'SKIP'::text, 
                storage_file.name::text, 
                'Team not found in database'::text;
            CONTINUE;
        END IF;
        
        -- Check if presentation record already exists
        SELECT EXISTS(
            SELECT 1 FROM public.team_presentations 
            WHERE file_path = storage_file.name
        ) INTO presentation_exists;
        
        IF presentation_exists THEN
            RETURN QUERY SELECT 
                'EXISTS'::text, 
                storage_file.name::text, 
                'Database record already exists'::text;
            CONTINUE;
        END IF;
        
        -- Get team leader
        SELECT leader_id INTO team_leader 
        FROM public.teams 
        WHERE id = team_uuid;
        
        -- Use storage owner if available, otherwise use team leader
        file_owner := COALESCE(storage_file.owner, team_leader);
        
        -- Skip if no valid uploader
        IF file_owner IS NULL THEN
            RETURN QUERY SELECT 
                'ERROR'::text, 
                storage_file.name::text, 
                'No valid uploader found (no owner or team leader)'::text;
            CONTINUE;
        END IF;
        
        -- Insert new presentation record
        BEGIN
            INSERT INTO public.team_presentations (
                team_id,
                presentation_name,
                file_name,
                file_path,
                file_size,
                file_type,
                upload_date,
                uploaded_by,
                description
            ) VALUES (
                team_uuid,
                split_part(storage_file.name, '/', -1), -- filename as presentation name
                split_part(storage_file.name, '/', -1), -- filename
                storage_file.name, -- full path
                1048576, -- Default 1MB (we don't have access to actual size here)
                'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- Default PowerPoint format
                storage_file.created_at,
                file_owner,
                'Synced from storage - admin sync'
            );
            
            RETURN QUERY SELECT 
                'CREATED'::text, 
                storage_file.name::text, 
                'Successfully created database record'::text;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'ERROR'::text, 
                storage_file.name::text, 
                ('Failed to create record: ' || SQLERRM)::text;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION simple_sync_presentations() TO authenticated;