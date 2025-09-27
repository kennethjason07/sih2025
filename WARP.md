# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **SIH 2025 Leader Onboarding Web App** - a full-stack web application built for hackathon team registration and management. It's a vanilla JavaScript frontend with Supabase backend, designed for leaders to register teams and admins to manage the entire system.

## Architecture

### Frontend Structure
- **Static HTML/CSS/JS** - No build framework, served via `npx serve`
- **Landing Page Flow**: `landing.html` → `index.html` (auth) → `dashboard.html` or `admin.html`
- **Authentication System**: Supabase Auth with email verification and role-based routing
- **Component Architecture**: 
  - `main.js` - Authentication and routing logic
  - `dashboard.js` - Leader dashboard with team management, announcements, resources, presentations
  - `admin.js` - Admin panel for content management and team oversight
  - `team-registration.js` - Team registration form handling

### Backend Architecture (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS) policies
- **Authentication**: Supabase Auth with automatic user record creation via triggers
- **Storage**: File uploads for team presentations (PPT/PPTX)
- **Real-time**: Dynamic content loading for announcements and resources

### Database Schema
The system uses 5 main tables:
- `users` - User authentication and role management (leader/admin)
- `teams` - Team registration information with leader association
- `team_members` - Detailed member information (name, stream, semester, category)
- `announcements` - Admin-created announcements displayed to leaders
- `resources` - Admin-managed resource links
- `presentations` (if applicable) - Team presentation uploads

### Key Architectural Patterns
1. **Role-Based Access Control**: Users have roles (leader/admin) with different UI flows
2. **Progressive Enhancement**: Base functionality works without JavaScript, enhanced with dynamic loading
3. **Database-First**: All business logic handled in database via RLS policies and triggers
4. **File Upload Integration**: Supabase Storage for presentation files with size/format validation

## Development Commands

### Starting Development
```powershell
# Install dependencies
npm install

# Start local development server
npm start
# This runs: npx serve . (serves on http://localhost:3000 by default)
```

### Building and Deployment
```powershell
# Build the project (currently just echoes - static files)
npm run build

# For deployment, copy all files to static hosting (Vercel/Netlify)
# No build step required - all files are static
```

### Database Management
```powershell
# Apply complete schema (run in Supabase SQL editor)
# Use SUPABASE_COMPLETE_SCHEMA.sql for initial setup

# For schema updates, check individual SQL files:
# - add_sih_ps_id_column.sql
# - setup_presentations_complete.sql  
# - admin_team_deletion_policies.sql
```

### Testing and Debugging
```powershell
# Run comprehensive auth tests
node test_auth_flow.js

# Test all SQL schemas
node test_all_sql_schemas.js

# Test admin functionality  
node test_complete_schema.js

# Test sample data insertion
node insert_sample_data.js
```

### File Operations
```powershell
# View project structure
tree /f

# Search for specific functionality
findstr /s /i "supabase" *.js
findstr /s /i "role" *.js *.sql
```

## Configuration Requirements

### Supabase Setup
1. **Update credentials** in all JavaScript files:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

2. **Apply database schema**: Run `SUPABASE_COMPLETE_SCHEMA.sql` in Supabase SQL editor

3. **Configure Storage Bucket**: For presentation uploads, run `SETUP_STORAGE_BUCKET.sql`

4. **Set up Admin User**: Use `SETUP_ADMIN_USER.sql` to create first admin account

### Row Level Security (RLS)
The application relies heavily on RLS policies:
- Leaders can only access their own team data
- Admins have full read access to all data
- Team members are tied to teams via foreign keys
- Automatic user record creation via database triggers

## Key Development Patterns

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. `handle_new_user()` trigger creates user record in `users` table
3. Frontend checks user role and redirects appropriately
4. RLS policies enforce data access based on authenticated user

### Data Consistency
The app handles edge cases where auth records exist but application records don't:
- `ensureUserExists()` function in all JS files
- Automatic record creation during login if missing
- Prevents data inconsistencies from trigger failures

### File Upload Pattern
1. Frontend validates file type/size (PPT/PPTX, max 10MB)
2. Files uploaded to Supabase Storage bucket
3. Metadata stored in database with file URLs
4. Access controlled via RLS policies

### Admin vs Leader Differentiation
- **Leaders**: Can register/edit teams, view announcements/resources, upload presentations
- **Admins**: Can manage all teams, create announcements/resources, view all presentations
- Role checking happens on both frontend (UX) and backend (security)

## Common Tasks

### Adding New Features
1. **Database changes**: Create SQL file and apply via Supabase
2. **Frontend updates**: Modify relevant JS file (`dashboard.js` for leaders, `admin.js` for admins)
3. **RLS policies**: Ensure proper access control for new tables/columns
4. **Testing**: Add test cases in appropriate test files

### Debugging Authentication Issues
1. Check browser console for Supabase errors
2. Verify user exists in both `auth.users` and `users` tables
3. Check RLS policies allow the attempted operation
4. Use `test_auth_flow.js` for systematic auth testing

### Database Schema Updates
1. Create migration SQL file
2. Test with `test_all_sql_schemas.js`
3. Apply via Supabase SQL editor
4. Update frontend code to handle new fields
5. Update RLS policies if needed

### Deployment Checklist
1. Update Supabase credentials in all JS files
2. Apply latest database schema
3. Test authentication flow end-to-end
4. Verify admin panel functionality
5. Test file upload/download functionality
6. Deploy static files to hosting platform