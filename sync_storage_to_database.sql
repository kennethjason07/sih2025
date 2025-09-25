-- Function to sync existing storage files with team_presentations table
-- This will create database records for files that exist in storage but not in the database
-- Run this in Supabase SQL Editor AFTER running setup_presentations_complete.sql

CREATE OR REPLACE FUNCTION sync_presentations_from_storage()
RETURNS TABLE(
    action text,
    file_path text,
    team_id uuid,
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
        SELECT name, bucket_id, owner, created_at, metadata->'size' as file_size, metadata->'mimetype' as mime_type
        FROM storage.objects 
        WHERE bucket_id = 'presentations'
    LOOP
        -- Extract team_id from file path (assuming format: team_id/filename)
        team_uuid := NULL;
        IF storage_file.name ~ '^[0-9a-f-]{36}/' THEN
            team_uuid := (split_part(storage_file.name, '/', 1))::uuid;
        END IF;
        
        -- Skip if we can't extract team_id
        IF team_uuid IS NULL THEN
            RETURN QUERY SELECT 
                'SKIP'::text, 
                storage_file.name::text, 
                NULL::uuid, 
                'Could not extract team_id from path'::text;
            CONTINUE;
        END IF;
        
        -- Check if team exists
        IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = team_uuid) THEN
            RETURN QUERY SELECT 
                'SKIP'::text, 
                storage_file.name::text, 
                team_uuid, 
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
                team_uuid, 
                'Database record already exists'::text;
            CONTINUE;
        END IF;
        
        -- Get team leader as the uploader (fallback to file owner if available)
        SELECT leader_id INTO file_owner 
        FROM public.teams 
        WHERE id = team_uuid;
        
        -- If storage file has owner, use that, otherwise use team leader
        IF storage_file.owner IS NOT NULL THEN
            file_owner := storage_file.owner;
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
                COALESCE((storage_file.file_size)::bigint, 0),
                COALESCE(storage_file.mime_type::text, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
                storage_file.created_at,
                file_owner,
                'Synced from storage'
            );
            
            RETURN QUERY SELECT 
                'CREATED'::text, 
                storage_file.name::text, 
                team_uuid, 
                'Successfully created database record'::text;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'ERROR'::text, 
                storage_file.name::text, 
                team_uuid, 
                ('Failed to create record: ' || SQLERRM)::text;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION sync_presentations_from_storage() TO authenticated;

-- Example usage (uncomment to run):
-- SELECT * FROM sync_presentations_from_storage();