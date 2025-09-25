# Admin PPT View Setup Guide

## Issue Fix: "No presentations" showing even when presentations exist

The issue occurs because Row Level Security (RLS) policies prevent admins from seeing team presentations that belong to other users. Here's how to fix it:

## Step 1: Add Admin Policies to Database

Run these SQL commands in your Supabase SQL Editor:

### 1. Allow Admins to View All Presentations
```sql
-- Add admin policy to allow admins to view all presentations
CREATE POLICY "Admins can view all presentations" ON public.team_presentations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 2. Allow Admins to Access All Storage Files
```sql
-- Add admin policy for storage objects
CREATE POLICY "Admins can view all presentation files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'presentations' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 3. Verify Your Admin User Role
Make sure your admin user has the correct role:
```sql
-- Check your user role
SELECT id, email, role FROM public.users WHERE email = 'your-admin-email@example.com';

-- If role is not 'admin', update it:
UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

## Step 2: Features Added

### 🔍 **Search Functionality**
- **Search Bar**: Search teams by name or leader name
- **Real-time filtering**: Results update as you type
- **Clear button**: Easily clear search with ✕ button
- **ESC key support**: Press Escape to clear search

### 📊 **Enhanced Interface**
- **Team count display**: Shows filtered vs total teams
- **Presentation counts**: Visual badges showing number of presentations per team
- **Professional styling**: Modern gradients and hover effects
- **Responsive design**: Works on all screen sizes

### 🐛 **Debug Features**
- **Console logging**: Detailed error messages in browser console
- **Database query debugging**: Shows what queries are being executed
- **Permission testing**: Verifies admin access to database

## Step 3: Testing the Fix

1. **Open Browser Console** (F12 → Console tab)
2. **Go to Admin Dashboard** → View PPT tab
3. **Check console output** for debug information:
   ```
   === DEBUGGING ADMIN PRESENTATION ACCESS ===
   Current user: {id: "...", email: "...", role: "admin"}
   Direct presentations query: [...] or Error: [...]
   === END DEBUG ===
   ```

4. **Expected behavior**:
   - Teams with presentations show correct counts
   - "View Presentations" button is enabled for teams with files
   - Search works for filtering teams

## Step 4: Troubleshooting

### If presentations still don't show:

1. **Check admin role**:
   ```sql
   SELECT role FROM public.users WHERE id = auth.uid();
   ```

2. **Check if policies were created**:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'team_presentations';
   ```

3. **Check console errors**: Look for specific error messages like:
   - `PGRST301`: RLS is blocking access
   - `42501`: Permission denied
   - `42P01`: Table doesn't exist

### Alternative Fix (if policies don't work):

Create a custom database function:
```sql
CREATE OR REPLACE FUNCTION get_all_presentations_for_admin()
RETURNS TABLE (
  team_id uuid,
  id uuid,
  presentation_name text,
  file_name text,
  upload_date timestamptz,
  is_active boolean,
  team_name text
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    tp.team_id,
    tp.id,
    tp.presentation_name,
    tp.file_name,
    tp.upload_date,
    tp.is_active,
    t.team_name
  FROM team_presentations tp
  JOIN teams t ON tp.team_id = t.id
  WHERE tp.is_active = true
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
  ORDER BY tp.upload_date DESC;
$$;
```

## Step 5: Usage

### Admin Search Features:
- **Search by team name**: Type team name in search box
- **Search by leader name**: Type leader's name
- **Partial matching**: Search works with partial text
- **Case insensitive**: Searches work regardless of case

### Team Management:
- **View team cards**: All teams displayed with presentation counts
- **Click to view**: Click "View Presentations" to see team's files
- **Download files**: Admins can download any team's presentations
- **Preview files**: Open presentations in browser (if supported)

The interface is now fully functional with search capabilities and proper admin access to all team presentations! 🚀