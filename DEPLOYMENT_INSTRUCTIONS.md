# Deploying to Netlify

## Prerequisites
1. Make sure you have a Netlify account
2. Ensure all your changes are saved in your local project folder
3. If you haven't already, install Git on your system

## Deployment Steps

### 1. Initialize Git Repository (if not already done)
```bash
cd "c:\Users\kened\Desktop\sih2025\last try"
git init
git add .
git commit -m "Update stream dropdowns and copyright styling"
```

### 2. Deploy Using Netlify CLI
If you have Netlify CLI installed:
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the site
netlify deploy --prod
```

### 3. Deploy Using Git Integration
1. Push your changes to a GitHub/GitLab/Bitbucket repository:
```bash
git remote add origin [your-repository-url]
git push -u origin main
```

2. In Netlify:
   - Go to your Netlify dashboard
   - Click "New site from Git"
   - Connect to your Git provider
   - Select your repository
   - Set the build settings (if needed)
   - Deploy

### 4. Manual Deployment
1. In Netlify dashboard, select your site
2. Go to "Deploys" tab
3. Drag and drop your entire project folder to the deployment area

## What Was Changed
The following changes will be deployed:
1. Stream input fields replaced with dropdowns in team registration forms
2. Copyright text styling updated to grey color
3. Team size and gender validation implemented

## Testing After Deployment
After deployment, verify:
1. Stream dropdowns appear correctly on team registration pages
2. Copyright text appears in grey color in footers
3. Team validation works as expected