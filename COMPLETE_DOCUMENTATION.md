# SIH 2025 Leader Onboarding Web App - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [File Structure](#file-structure)
5. [Setup Instructions](#setup-instructions)
6. [Supabase Setup](#supabase-setup)
7. [Database Schema](#database-schema)
8. [Row Level Security Policies](#row-level-security-policies)
9. [Deployment Guide](#deployment-guide)
10. [Development](#development)
11. [Project Summary](#project-summary)

## Project Overview

This project is a complete web application for managing SIH 2025 team registrations, built with plain HTML, CSS, and JavaScript with Supabase as the backend. It features role-based access control with separate dashboards for leaders and administrators.

## Features

### User Roles

#### Leader (default role after signup)
- Signs up with email + password (Supabase Auth with email verification)
- Automatically redirected to Team Registration Form after verification
- Can view/edit their team details later
- Dashboard contains:
  - Registered Team Details
  - Announcements (from Admin)
  - Resources (links from Admin)

#### Admin
- Logs in with email + password (separate role)
- Can create/manage Announcements & Resources
- Can view all registered teams

### Key Features
- **Authentication**: Email + Password signup/login with Supabase Auth and email verification
- **Team Registration Form**: Collects team details including members
- **Leader Dashboard**: Team details, announcements, and resources
- **Admin Dashboard**: Manage announcements, resources, and view all teams
- **Responsive UI**: Clean, responsive design with dashboard navigation

## Tech Stack

- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Backend**: Supabase (Auth, Database, RLS policies)
- **Hosting**: Vercel/Netlify (static frontend) + Supabase backend

## File Structure

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
├── README.md
├── DEPLOYMENT.md
├── PROJECT_SUMMARY.md
├── PROJECT_STRUCTURE.md
├── COMPLETE_DOCUMENTATION.md
├── verify-setup.js
└── .gitignore
```

## Setup Instructions

1. Clone the repository
2. Update the Supabase configuration in all JavaScript files:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Deploy the frontend to Vercel/Netlify
4. Set up Supabase backend with required tables and RLS policies

## Supabase Setup

You'll need to create the following tables in your Supabase database:

### Database Schema

The complete database schema is available in the [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) file, which includes:

1. **teams table** - Stores team registration information
2. **announcements table** - Stores announcements from admins
3. **resources table** - Stores resource links from admins
4. **user_roles table** - Manages user roles for access control

The schema includes proper foreign key relationships, default values, and constraints to ensure data integrity.

## Row Level Security Policies

Enable RLS on tables:
```sql
alter table teams enable row level security;
alter table announcements enable row level security;
alter table resources enable row level security;
```

Teams policies:
```sql
create policy "Leaders can view their own team" on teams
for select using (leader_id = auth.uid());

create policy "Leaders can insert their own team" on teams
for insert with check (leader_id = auth.uid());

create policy "Leaders can update their own team" on teams
for update using (leader_id = auth.uid());
```

Announcements policies:
```sql
create policy "Everyone can view announcements" on announcements
for select using (true);
```

## Row Level Security Policies

The complete RLS policies are defined in the [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) file. Key policies include:

1. **Teams policies**:
   - Leaders can view their own team
   - Leaders can insert their own team
   - Leaders can update their own team

2. **Announcements policies**:
   - Everyone can view announcements

3. **Resources policies**:
   - Everyone can view resources
   - Admins can manage resources (using user_roles table)

4. **User roles policies**:
   - Users can view their own roles

The implementation uses a dedicated `user_roles` table for role-based access control, which is more flexible and secure than hardcoding user IDs or email patterns.

## Deployment Guide

### Step 1: Set up Supabase Backend
1. Create a new project in Supabase
2. Get your Project URL and anon key from the API settings
3. Update all JavaScript files with your Supabase credentials
4. Create the required database tables
5. Set up Row Level Security (RLS) policies

### Step 2: Deploy Frontend to Vercel
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

### Step 3: Deploy Frontend to Netlify
1. Push your code to a GitHub repository
2. Log in to Netlify
3. Click "New site from Git"
4. Connect to GitHub and select your repository
5. Configure the deployment:
   - Branch to deploy: main
   - Build command: (leave empty)
   - Publish directory: (leave empty)
6. Click "Deploy site"

## Development

Simply open `landing.html` in a browser to run the application locally.

## Project Summary

This project demonstrates a complete, production-ready web application built with vanilla web technologies and a modern backend service. It showcases best practices in authentication, role-based access control, responsive design, and database integration.

### Key Components

1. **Authentication System**
   - Email/password signup and login using Supabase Auth
   - Email verification workflow
   - Session management
   - Role-based redirection (leader vs admin)

2. **Core Features**
   - Team Management
   - Content Management
   - UI/UX Design

3. **Security**
   - Email verification for all users
   - Role-based access control
   - Secure credential storage
   - Protected routes

4. **Responsive Design**
   - Desktop browsers
   - Tablet devices
   - Mobile phones

The application is fully functional and ready for deployment. All files have been verified and the project structure follows best practices for maintainability and scalability.