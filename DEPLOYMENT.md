# Deployment Guide

This guide will help you deploy the SIH 2025 Leader Onboarding Web App to Vercel/Netlify and set up the Supabase backend.

## Prerequisites

1. A Supabase account
2. A Vercel or Netlify account
3. Node.js installed locally (for development)

## Step 1: Set up Supabase Backend

1. Create a new project in Supabase
2. Get your Project URL and anon key from the API settings
3. Update all JavaScript files with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'your-project-url.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. Create the required database tables using the SQL commands from README.md:
   - teams
   - announcements
   - resources

5. Set up Row Level Security (RLS) policies:
   ```sql
   -- Enable RLS on tables
   alter table teams enable row level security;
   alter table announcements enable row level security;
   alter table resources enable row level security;
   
   -- Teams policies
   create policy "Leaders can view their own team" on teams
   for select using (leader_id = auth.uid());
   
   create policy "Leaders can insert their own team" on teams
   for insert with check (leader_id = auth.uid());
   
   create policy "Leaders can update their own team" on teams
   for update using (leader_id = auth.uid());
   
   -- Announcements policies
   create policy "Everyone can view announcements" on announcements
   for select using (true);
   
   ```

   The complete database schema and Row Level Security policies are available in the [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) file. This file includes:
   
   - Table creation statements with proper constraints
   - Row Level Security policies for data protection
   - Role-based access control implementation using a dedicated user_roles table
   - Necessary grants and permissions

## Step 2: Deploy Frontend to Vercel

1. Push your code to a GitHub repository
2. Log in to Vercel
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: "Other"
   - Root Directory: "/"
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
6. Click "Deploy"

## Step 3: Deploy Frontend to Netlify

1. Push your code to a GitHub repository
2. Log in to Netlify
3. Click "New site from Git"
4. Connect to GitHub and select your repository
5. Configure the deployment:
   - Branch to deploy: main
   - Build command: (leave empty)
   - Publish directory: (leave empty)
6. Click "Deploy site"

## Step 4: Configure Environment Variables (Optional)

If you want to keep your Supabase credentials secure, you can use environment variables:

1. In Vercel: Project Settings → Environment Variables
2. In Netlify: Site settings → Build & deploy → Environment

Add:
- `REACT_APP_SUPABASE_URL` = your Supabase URL
- `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key

Then update your JavaScript files to use:
```javascript
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'your-default-url';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-default-key';
```

## Step 5: Set up Authentication

1. In your Supabase project, go to Authentication → Settings
2. Configure your email templates
3. Set up email confirmation requirements
4. Test sign up and login functionality

## Step 6: Test the Application

1. Visit your deployed URL
2. Test user registration and login
3. Test team registration
4. Test admin functionality with admin@example.com
5. Verify all CRUD operations work correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase URL is correct
2. **Authentication Issues**: Check that you've enabled email verification
3. **Database Connection**: Verify your Supabase anon key is correct
4. **Missing Data**: Ensure RLS policies are set up correctly

### Support

If you encounter issues, check the browser console for error messages and refer to the Supabase documentation.