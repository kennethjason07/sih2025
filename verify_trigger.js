// Script to verify if the trigger is working correctly
// This script will help us test if the user_roles table is being updated during signup

const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        
        return {
            userExists: !!userData && !userError,
            roleExists: !!userRoleData && userRoleData.length > 0 && !userRoleError
        };
    } catch (error) {
        console.error('Error checking user records:', error);
        return {
            userExists: false,
            roleExists: false
        };
    }
}

// Function to manually create user records (fallback)
async function createUserRecords(userId, userEmail) {
    try {
        console.log('Creating user records for:', userId, userEmail);
        
        // Create user record
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userEmail
            });
        
        if (userError) {
            console.error('Error creating user record:', userError);
        } else {
            console.log('User record created successfully');
        }
        
        // Create user role record
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role: 'leader'
            });
        
        if (roleError) {
            console.error('Error creating user role record:', roleError);
        } else {
            console.log('User role record created successfully');
        }
    } catch (error) {
        console.error('Error creating user records:', error);
    }
}

// Export functions for use in other scripts
window.verifyTrigger = {
    checkUserRecords,
    createUserRecords
};