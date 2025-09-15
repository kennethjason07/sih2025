# SIH 2025 Leader Onboarding Web App

A simple web application for SIH 2025 leader registration and management using HTML, CSS, JavaScript, and Supabase.

## Live Demo

[View Live Demo](#) (Add your deployed URL here)

## Features

### User Roles

1. **Leader** (default role after signup)
   - Signs up with email + password (Supabase Auth with email verification)
   - Automatically redirected to Team Registration Form after verification
   - Can view/edit their team details later
   - Dashboard contains:
     - Registered Team Details
     - Announcements (from Admin)
     - Resources (links from Admin)

2. **Admin**
   - Logs in with email + password (separate role)
   - Can create/manage Announcements & Resources
   - Can view all registered teams
   - Access to Admin Dashboard for content management

### Key Features

- **Authentication**: Email + Password signup/login with Supabase Auth and email verification
- **Team Registration Form**: Collects detailed team information including:
  - Project Type (Software/Hardware)
  - Team Name
  - Academic Year
  - Member Details (for each member including leader):
    - Position (Leader/Member)
    - Full Name
    - Gender (M/F)
    - Stream (e.g., CSE, ECE, ME, etc.)
    - Semester (e.g., 5th, 7th)
    - Category (GM, SC, ST, OBC, OTHER)
    - Email ID
    - Mobile No.
- **Leader Dashboard**: Team details, announcements, and resources
- **Admin Dashboard**: Manage announcements, resources, and view all teams
- **Dynamic Content Loading**: Announcements and resources are loaded from database instead of hardcoded
- **User Data Consistency**: Ensures user records exist in both auth.users and application tables during login
- **Responsive UI**: Clean, responsive design with dashboard navigation

## Tech Stack

- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Backend**: Supabase (Auth, Database, RLS policies)
- **Hosting**: Vercel/Netlify (static frontend) + Supabase backend

## Setup Instructions

1. Clone the repository
2. Update the Supabase configuration in all JavaScript files:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Deploy the frontend to Vercel/Netlify
4. Set up Supabase backend with required tables and RLS policies

## Project Structure

```
.
├── index.html (redirects to landing.html)
├── landing.html
├── 404.html
├── team-registration.html
├── dashboard.html
├── admin.html
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js
│   ├── team-registration.js
│   ├── dashboard.js
│   └── admin.js
├── SUPABASE_SCHEMA.sql
├── SUPABASE_COMPLETE_SCHEMA.sql
└── README.md
```

## Supabase Setup

You'll need to create the following tables in your Supabase database:

1. **users** - Stores user information and roles
2. **teams** - Stores team registration information
3. **team_members** - Stores detailed information about team members
4. **announcements** - Stores announcements from admins
5. **resources** - Stores resource links from admins

### Database Schema

The complete database schema and Row Level Security policies are available in the [SUPABASE_COMPLETE_SCHEMA.sql](SUPABASE_COMPLETE_SCHEMA.sql) file. This file includes:

- Table creation statements with proper constraints
- Custom types for data validation
- Row Level Security policies for data protection
- Role-based access control implementation
- Necessary grants and permissions
- Functions and triggers for automatic user creation

## Admin Features

Administrators can access the admin dashboard to manage content:

1. **Announcements Management**
   - Add new announcements with title and content
   - View existing announcements
   - Delete announcements

2. **Resources Management**
   - Add new resources with title and link
   - View existing resources
   - Delete resources

3. **Access Control**
   - Only users with admin role can access the admin panel
   - Admin role is verified on both client and database levels

## User Data Consistency

To ensure data consistency between Supabase Auth and application tables:

1. **During Registration**: The `handle_new_user()` trigger automatically creates records in `users` and `user_roles` tables
2. **During Login**: The application checks if user records exist and creates them if missing
3. **Error Handling**: Proper error handling prevents duplication and handles edge cases

This approach ensures that:
- All users have records in both `users` and `user_roles` tables
- Existing users from before the trigger implementation are properly handled
- Data consistency is maintained even if the registration trigger fails

## Development

Simply open `landing.html` in a browser to run the application locally.

## Deployment

1. Frontend: Deploy to Vercel or Netlify
2. Backend: Configure Supabase project and database tables

## Contributing

This project was created for SIH 2025 and demonstrates a simple but complete web application with user authentication and role-based access control.- Data consistency is maintained even if the registration trigger fails

## Development

Simply open `landing.html` in a browser to run the application locally.

## Deployment

1. Frontend: Deploy to Vercel or Netlify
2. Backend: Configure Supabase project and database tables

## Contributing

This project was created for SIH 2025 and demonstrates a simple but complete web application with user authentication and role-based access control."# sih2025" 
