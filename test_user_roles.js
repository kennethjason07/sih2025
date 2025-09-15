// Test script to verify user_roles table insertion
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUserRoles() {
    try {
        // Get current user
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError) {
            console.error('Auth error:', authError);
            return;
        }
        
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        console.log('Current user:', user);
        
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
        
        console.log('User data check:', userData, userError);
        
        // Check if user exists in user_roles table
        const { data: userRoleData, error: userRoleError } = await supabaseClient
            .from('user_roles')
            .select('id, role')
            .eq('user_id', user.id)
            .maybeSingle();
        
        console.log('User role data check:', userRoleData, userRoleError);
        
        // Try to insert into user_roles table
        if (!userRoleData) {
            console.log('Inserting user role...');
            const { data: insertData, error: insertError } = await supabaseClient
                .from('user_roles')
                .insert({
                    user_id: user.id,
                    role: 'leader'
                })
                .select();
            
            console.log('Insert result:', insertData, insertError);
        } else {
            console.log('User already has a role');
        }
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Run the test
testUserRoles();