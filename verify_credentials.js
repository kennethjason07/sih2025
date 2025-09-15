// Verification script to check if all JavaScript files have the correct Supabase credentials
const fs = require('fs');
const path = require('path');

// Read credentials from credentials.txt
const credentialsPath = path.join(__dirname, 'credentials.txt');
const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');

// Extract URL and API key
const urlMatch = credentialsContent.match(/Project URL: (.+)/);
const apiKeyMatch = credentialsContent.match(/API Key:(.+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

console.log('Verifying Supabase credentials in JavaScript files...\n');

if (!supabaseUrl || !supabaseKey) {
    console.log('✗ Could not extract credentials from credentials.txt');
    process.exit(1);
}

console.log(`Expected URL: ${supabaseUrl}`);
console.log(`Expected API Key: ${supabaseKey}\n`);

const jsFiles = [
    'scripts/main.js',
    'scripts/team-registration.js',
    'scripts/dashboard.js',
    'scripts/admin.js'
];

let allFilesCorrect = true;

jsFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const hasCorrectUrl = content.includes(supabaseUrl);
        const hasCorrectKey = content.includes(supabaseKey);
        
        console.log(`Checking ${file}:`);
        console.log(`  URL correct: ${hasCorrectUrl ? '✓' : '✗'}`);
        console.log(`  API Key correct: ${hasCorrectKey ? '✓' : '✗'}`);
        
        if (hasCorrectUrl && hasCorrectKey) {
            console.log(`  Status: ✓ PASSED\n`);
        } else {
            console.log(`  Status: ✗ FAILED\n`);
            allFilesCorrect = false;
        }
    } else {
        console.log(`✗ ${file} not found\n`);
        allFilesCorrect = false;
    }
});

console.log('='.repeat(50));
if (allFilesCorrect) {
    console.log('✓ All JavaScript files have been updated with the correct Supabase credentials!');
    console.log('✓ Your application is now ready to connect to Supabase.');
} else {
    console.log('✗ Some files are missing or have incorrect Supabase credentials.');
    console.log('✗ Please check the files and try again.');
}
console.log('='.repeat(50));