// Test script to verify if the trigger function is working correctly
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTrigger() {
    try {
        console.log('Testing trigger function...');
        
        // This would normally be done by Supabase Auth, but we can check if the function exists
        // and test the logic by calling it directly
        
        // First, let's check if we can see the function
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .limit(1);
        
        console.log('Users table accessible:', !!data, error);
        
        // Check user_roles table
        const { data: rolesData, error: rolesError } = await supabaseClient
            .from('user_roles')
            .select('*')
            .limit(1);
        
        console.log('User roles table accessible:', !!rolesData, rolesError);
        
        // Try to sign up a new user to test the trigger
        console.log('To test the trigger, please sign up a new user in the application and check if records are created in both tables.');
        
        // Let's also manually test the trigger function logic
        console.log('Testing trigger function logic manually...');
        
        // Create a test user (this simulates what the trigger should do)
        // Note: This is just for testing - in real usage, the trigger handles this automatically
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Add a function to manually test the trigger logic
async function testManualTrigger(userId, userEmail) {
    try {
        console.log('Manually testing trigger logic for user:', userId, userEmail);
        
        // Insert into users table (what the trigger should do)
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .insert({
                id: userId,
                email: userEmail
            })
            .select();
        
        console.log('Manual user insert result:', userData, userError);
        
        // Insert into user_roles table (what the trigger should do)
        const { data: roleData, error: roleError } = await supabaseClient
            .from('user_roles')
            .insert({
                user_id: userId,
                role: 'leader'
            })
            .select();
        
        console.log('Manual role insert result:', roleData, roleError);
        
    } catch (error) {
        console.error('Manual trigger test error:', error);
    }
}

// Run the test
testTrigger();