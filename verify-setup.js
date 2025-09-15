// Verification script to check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'index.html',
    'landing.html',
    '404.html',
    'team-registration.html',
    'dashboard.html',
    'admin.html',
    'styles/main.css',
    'scripts/main.js',
    'scripts/team-registration.js',
    'scripts/dashboard.js',
    'scripts/admin.js',
    'README.md',
    'SUPABASE_SCHEMA.sql',
    'SUPABASE_COMPLETE_SCHEMA.sql',
    'DEPLOYMENT.md',
    'PROJECT_SUMMARY.md',
    'PROJECT_STRUCTURE.md',
    'COMPLETE_DOCUMENTATION.md',
    'credentials.txt',
    'test_all_sql_schemas.js',
    'verify_credentials.js',
    'test_auth_flow.js',
    '.gitignore'
];

console.log('Verifying Hackathon Leader Onboarding Web App setup...\n');

let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✓ ${file} exists`);
    } else {
        console.log(`✗ ${file} is missing`);
        allFilesExist = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
    console.log('✓ All required files are present!');
    console.log('✓ Setup verification successful.');
    console.log('\nNext steps:');
    console.log('1. Update Supabase configuration in all JavaScript files');
    console.log('2. Open landing.html in your browser to test the application');
    console.log('3. Deploy to Vercel/Netlify for hosting');
} else {
    console.log('✗ Some required files are missing!');
    console.log('Please check the file structure and ensure all files are present.');
}

console.log('='.repeat(50));