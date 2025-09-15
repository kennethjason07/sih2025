// Test script to verify all SQL schema files
const fs = require('fs');
const path = require('path');

const sqlSchemaFiles = [
  'SUPABASE_SCHEMA.sql',
  'SUPABASE_COMPLETE_SCHEMA.sql'
];

console.log('Testing All SQL Schema Files...\n');

sqlSchemaFiles.forEach(file => {
  const sqlSchemaFile = path.join(__dirname, file);
  
  console.log(`Checking ${file}...`);
  
  // Check if file exists
  if (fs.existsSync(sqlSchemaFile)) {
    console.log('✓ File exists');
    
    // Read file content
    const content = fs.readFileSync(sqlSchemaFile, 'utf8');
    
    // Check for key sections
    const hasTeamsTable = content.includes('CREATE TABLE teams');
    const hasAnnouncementsTable = content.includes('CREATE TABLE announcements');
    const hasResourcesTable = content.includes('CREATE TABLE resources');
    const hasUserRolesTable = content.includes('CREATE TABLE user_roles');
    const hasRLSEnabled = content.includes('ENABLE ROW LEVEL SECURITY');
    const hasAdminPolicy = content.includes('Admins can manage resources');
    const hasSequenceError = content.includes('GRANT USAGE ON SEQUENCES');
    
    console.log(`✓ Teams table definition: ${hasTeamsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Announcements table definition: ${hasAnnouncementsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Resources table definition: ${hasResourcesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ User roles table definition: ${hasUserRolesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ RLS enabled statements: ${hasRLSEnabled ? 'Found' : 'Missing'}`);
    console.log(`✓ Admin policy definition: ${hasAdminPolicy ? 'Found' : 'Missing'}`);
    console.log(`✓ Sequence error fixed: ${!hasSequenceError ? 'Yes' : 'No - Still contains error'}`);
    
    if (hasTeamsTable && hasAnnouncementsTable && hasResourcesTable && 
        hasUserRolesTable && hasRLSEnabled && hasAdminPolicy && !hasSequenceError) {
        console.log(`\n✓ All required components found in ${file}`);
        console.log(`✓ Schema file is ready for use with Supabase\n`);
    } else {
        console.log(`\n✗ Some components are missing or incorrect in ${file}\n`);
    }
  } else {
    console.log(`✗ ${file} not found\n`);
  }
});

console.log('='.repeat(60));
console.log('To use these schema files with Supabase:');
console.log('1. Copy the contents of either SQL file');
console.log('2. Paste into Supabase SQL editor');
console.log('3. Run each section individually or all at once');
console.log('4. For admin access, insert a record into user_roles table:');
console.log("   INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');");
console.log('='.repeat(60));