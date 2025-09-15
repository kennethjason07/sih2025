// Test script to verify the complete SQL schema file
const fs = require('fs');
const path = require('path');

const sqlSchemaFile = path.join(__dirname, 'SUPABASE_COMPLETE_SCHEMA.sql');

console.log('Testing Complete SQL Schema File...\n');

// Check if file exists
if (fs.existsSync(sqlSchemaFile)) {
    console.log('✓ SUPABASE_COMPLETE_SCHEMA.sql file exists');
    
    // Read file content
    const content = fs.readFileSync(sqlSchemaFile, 'utf8');
    
    // Check for key sections
    const hasTableCreation = content.includes('-- TABLE CREATION QUERIES');
    const hasTeamsTable = content.includes('CREATE TABLE teams');
    const hasAnnouncementsTable = content.includes('CREATE TABLE announcements');
    const hasResourcesTable = content.includes('CREATE TABLE resources');
    const hasUserRolesTable = content.includes('CREATE TABLE user_roles');
    const hasRLSEnabled = content.includes('ENABLE ROW LEVEL SECURITY');
    const hasPolicies = content.includes('-- RLS POLICIES');
    const hasAdminPolicy = content.includes('Admins can manage resources');
    const hasPermissions = content.includes('-- PERMISSIONS AND ACCESS CONTROL');
    
    console.log(`✓ Table creation section: ${hasTableCreation ? 'Found' : 'Missing'}`);
    console.log(`✓ Teams table definition: ${hasTeamsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Announcements table definition: ${hasAnnouncementsTable ? 'Found' : 'Missing'}`);
    console.log(`✓ Resources table definition: ${hasResourcesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ User roles table definition: ${hasUserRolesTable ? 'Found' : 'Missing'}`);
    console.log(`✓ RLS enabled statements: ${hasRLSEnabled ? 'Found' : 'Missing'}`);
    console.log(`✓ RLS policies section: ${hasPolicies ? 'Found' : 'Missing'}`);
    console.log(`✓ Admin policy definition: ${hasAdminPolicy ? 'Found' : 'Missing'}`);
    console.log(`✓ Permissions section: ${hasPermissions ? 'Found' : 'Missing'}`);
    
    if (hasTableCreation && hasTeamsTable && hasAnnouncementsTable && hasResourcesTable && 
        hasUserRolesTable && hasRLSEnabled && hasPolicies && hasAdminPolicy && hasPermissions) {
        console.log('\n✓ All required components found in complete SQL schema file');
        console.log('✓ Schema file is ready for use with Supabase');
    } else {
        console.log('\n✗ Some components are missing from SQL schema file');
    }
} else {
    console.log('✗ SUPABASE_COMPLETE_SCHEMA.sql file not found');
}

console.log('\n' + '='.repeat(60));
console.log('To use this schema with Supabase:');
console.log('1. Copy the contents of SUPABASE_COMPLETE_SCHEMA.sql');
console.log('2. Paste into Supabase SQL editor');
console.log('3. Run each section individually or all at once');
console.log('4. For admin access, insert a record into user_roles table:');
console.log("   INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');");
console.log('='.repeat(60));