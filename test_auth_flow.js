// Test script to verify the authentication flow
const fs = require('fs');
const path = require('path');

console.log('Testing Authentication Flow...\n');

// Check index.html
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const hasAppDiv = indexContent.includes('<div id="app">');
    const hasSupabaseScript = indexContent.includes('supabase-js@2');
    const hasMainScript = indexContent.includes('scripts/main.js');
    
    console.log('index.html checks:');
    console.log(`  Has app div: ${hasAppDiv ? '✓' : '✗'}`);
    console.log(`  Has Supabase script: ${hasSupabaseScript ? '✓' : '✗'}`);
    console.log(`  Has main script: ${hasMainScript ? '✓' : '✗'}`);
    
    if (hasAppDiv && hasSupabaseScript && hasMainScript) {
        console.log('  Status: ✓ PASSED\n');
    } else {
        console.log('  Status: ✗ FAILED\n');
    }
} else {
    console.log('✗ index.html not found\n');
}

// Check main.js
const mainPath = path.join(__dirname, 'scripts/main.js');
if (fs.existsSync(mainPath)) {
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    const hasShowAuthForm = mainContent.includes('showAuthForm()');
    const hasShowSignupForm = mainContent.includes('showSignupForm()');
    const hasHandleSignup = mainContent.includes('handleSignup(e)');
    
    console.log('scripts/main.js checks:');
    console.log(`  Has showAuthForm function: ${hasShowAuthForm ? '✓' : '✗'}`);
    console.log(`  Has showSignupForm function: ${hasShowSignupForm ? '✓' : '✗'}`);
    console.log(`  Has handleSignup function: ${hasHandleSignup ? '✓' : '✗'}`);
    
    if (hasShowAuthForm && hasShowSignupForm && hasHandleSignup) {
        console.log('  Status: ✓ PASSED\n');
    } else {
        console.log('  Status: ✗ FAILED\n');
    }
} else {
    console.log('✗ scripts/main.js not found\n');
}

// Check landing.html
const landingPath = path.join(__dirname, 'landing.html');
if (fs.existsSync(landingPath)) {
    const landingContent = fs.readFileSync(landingPath, 'utf8');
    const hasLoginLink = landingContent.includes('href="index.html"');
    
    console.log('landing.html checks:');
    console.log(`  Has login link to index.html: ${hasLoginLink ? '✓' : '✗'}`);
    
    if (hasLoginLink) {
        console.log('  Status: ✓ PASSED\n');
    } else {
        console.log('  Status: ✗ FAILED\n');
    }
} else {
    console.log('✗ landing.html not found\n');
}

console.log('='.repeat(50));
console.log('To test the authentication flow:');
console.log('1. Open index.html in your browser');
console.log('2. You should see the login form');
console.log('3. Click "Sign Up" to switch to the signup form');
console.log('4. Fill in the form and submit');
console.log('='.repeat(50));