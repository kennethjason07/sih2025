// Test script to verify user role creation during signup
// This script will help us test if the user_roles table is being updated correctly

const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to test user signup and role creation
async function testUserSignup() {
    try {
        console.log('Testing user signup and role creation...');
        
        // Generate a random email for testing
        const randomEmail = `testuser_${Math.floor(Math.random() * 10000)}@example.com`;
        const password = 'TestPassword123!';
        
        console.log('Attempting to sign up user:', randomEmail);
        
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email: randomEmail,
            password: password
        });
        
        if (error) {
            console.error('Signup failed:', error);
            return;
        }
        
        console.log('Signup successful:', data);
        
        // Wait a few seconds for the trigger to execute
        console.log('Waiting for trigger to execute...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if user records were created
        if (data.user && data.user.id) {
            await checkUserRecords(data.user.id);
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Function to check if user records exist
async function checkUserRecords(userId) {
    try {
        console.log('Checking user records for user ID:', userId);
        
        // Check users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        console.log('Users table record:', userData, userError);
        
        // Check user_roles table
        const { data: userRoleData, error: userRoleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId);
        
        console.log('User roles table records:', userRoleData, userRoleError);
        
        // Report results
        if (userData && !userError) {
            console.log('✓ User record created successfully');
        } else {
            console.log('✗ User record not found');
        }
        
        if (userRoleData && userRoleData.length > 0 && !userRoleError) {
            console.log('✓ User role record created successfully:', userRoleData[0]);
        } else {
            console.log('✗ User role record not found');
        }
        
    } catch (error) {
        console.error('Error checking user records:', error);
    }
}

// Function to manually test the trigger logic
async function testManualTrigger(userId, userEmail) {
    try {
        console.log('Manually testing trigger logic for user:', userId, userEmail);
        
        // Insert into users table (what the trigger should do)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userEmail
            })
            .select();
        
        console.log('Manual user insert result:', userData, userError);
        
        // Insert into user_roles table (what the trigger should do)
        const { data: roleData, error: roleError } = await supabase
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

// Export functions for use in other scripts
window.testSignup = {
    testUserSignup,
    checkUserRecords,
    testManualTrigger
};

// Run the test automatically when the script loads
// Uncomment the line below to run the test automatically
// testUserSignup();