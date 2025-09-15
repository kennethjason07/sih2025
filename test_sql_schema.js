// Test script to verify SQL schema file exists and is readable
const fs = require('fs');
const path = require('path');

const sqlSchemaFile = path.join(__dirname, 'SUPABASE_SCHEMA.sql');

console.log('Testing SQL Schema File...\n');

// Check if file exists
if (fs.existsSync(sqlSchemaFile)) {
    console.log('✓ SUPABASE_SCHEMA.sql file exists');
    
    // Read file content
    const content = fs.readFileSync(sqlSchemaFile, 'utf8');
    
    // Check for key components
    const hasTeamsTable = content.includes('CREATE TABLE teams');
    const hasAnnouncementsTable = content.includes('CREATE TABLE announcements');
    const hasResourcesTable = content.includes('CREATE TABLE resources');
    const hasUserRolesTable = content.includes('CREATE TABLE user_roles');
    const hasRLSEnabled = content.includes('ENABLE ROW LEVEL SECURITY');
    const hasAdminPolicy = content.includes('Admins can manage resources');
    
    console.log(`✓ Teams table definition: ${hasTeamsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Announcements table definition: ${hasAnnouncementsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Resources table definition: ${hasResourcesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ User roles table definition: ${hasUserRolesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ RLS enabled statements: ${hasRLSEnabled ? 'Found' : 'Missing'}`);
    console.log(`✓ Admin policy definition: ${hasAdminPolicy ? 'Found' : 'Missing'}`);
    
    if (hasTeamsTable && hasAnnouncementsTable && hasResourcesTable && hasUserRolesTable && hasRLSEnabled && hasAdminPolicy) {
        console.log('\n✓ All required components found in SQL schema file');
        console.log('✓ Schema file is ready for use with Supabase');
    } else {
        console.log('\n✗ Some components are missing from SQL schema file');
    }
} else {
    console.log('✗ SUPABASE_SCHEMA.sql file not found');
}

console.log('\n' + '='.repeat(50));
console.log('To use this schema with Supabase:');
console.log('1. Copy the contents of SUPABASE_SCHEMA.sql');
console.log('2. Paste into Supabase SQL editor');
console.log('3. Run each statement individually');
console.log('4. For admin access, insert a record into user_roles table:');
console.log("   INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');");
console.log('='.repeat(50));