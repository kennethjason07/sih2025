# Project Structure Overview

This document provides a complete overview of the Hackathon Leader Onboarding Web App file structure and organization.

## Root Directory

```
c:\Users\kened\Desktop\sih2025\last try\
├── .gitignore
├── 404.html
├── admin.html
├── dashboard.html
├── DEPLOYMENT.md
├── index.html
├── landing.html
├── PROJECT_STRUCTURE.md
├── PROJECT_SUMMARY.md
├── README.md
├── team-registration.html
├── verify-setup.js
├── scripts\
└── styles\
```

## Styles Directory

```
styles\
└── main.css
```

The main.css file contains all the styling for the application, including:
- Reset and base styles
- Auth form styling
- Dashboard layout (sidebar and main content)
- Card components
- Team registration form styling
- List items and resources
- Responsive design media queries

## Scripts Directory

```
scripts\
├── admin.js
├── dashboard.js
├── main.js
└── team-registration.js
```

### main.js
- Authentication logic (login/signup)
- Supabase initialization
- User role detection
- Page routing

### team-registration.js
- Team registration form handling
- Dynamic member addition/removal
- Form validation
- Supabase data submission

### dashboard.js
- Leader dashboard functionality
- Team details display and editing
- Announcements loading
- Resources loading
- Logout handling

### admin.js
- Admin dashboard functionality
- Team listing
- Announcement management
- Resource management
- CRUD operations

## HTML Pages

### index.html
- Simple redirect to landing.html

### landing.html
- Main entry point for the application
- Project overview and features
- Login/signup navigation

### 404.html
- Error page for missing routes

### team-registration.html
- Dedicated team registration page
- Form for collecting team details
- Member management interface

### dashboard.html
- Leader dashboard with sidebar navigation
- Team details view
- Announcements section
- Resources section

### admin.html
- Admin dashboard with sidebar navigation
- Team management view
- Announcement management
- Resource management

## Documentation

### README.md
- Project overview
- Features documentation
- Tech stack
- Setup instructions
- Supabase setup guide

### DEPLOYMENT.md
- Detailed deployment instructions
- Supabase backend setup
- Vercel/Netlify deployment
- Environment configuration
- Troubleshooting guide

### PROJECT_SUMMARY.md
- Comprehensive project overview
- Technical implementation details
- Security considerations
- Future enhancement suggestions

### PROJECT_STRUCTURE.md
- This file
- Complete directory structure
- File purpose documentation

## Utility Files

### verify-setup.js
- Node.js script to verify all required files exist
- Setup validation tool

### .gitignore
- Standard git ignore patterns
- Excludes unnecessary files from version control