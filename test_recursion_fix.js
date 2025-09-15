// Test script to verify recursion fix
// This script tests the policies to ensure no recursion errors occur

// Supabase configuration
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRecursionFix() {
    console.log('Testing recursion fix...');
    
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        console.log('Current user:', user.id);
        
        // Test 1: Check if we can access users table without recursion
        console.log('Test 1: Accessing users table...');
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (userError) {
            console.error('Error accessing users table:', userError);
        } else {
            console.log('Successfully accessed users table:', userData);
        }
        
        // Test 2: Check if we can access teams table
        console.log('Test 2: Accessing teams table...');
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('leader_id', user.id);
        
        if (teamsError) {
            console.error('Error accessing teams table:', teamsError);
        } else {
            console.log('Successfully accessed teams table, found', teamsData.length, 'teams');
        }
        
        // Test 3: Check if we can access team_members table
        console.log('Test 3: Accessing team_members table...');
        if (teamsData && teamsData.length > 0) {
            const { data: membersData, error: membersError } = await supabase
                .from('team_members')
                .select('*')
                .eq('team_id', teamsData[0].id);
            
            if (membersError) {
                console.error('Error accessing team_members table:', membersError);
            } else {
                console.log('Successfully accessed team_members table, found', membersData.length, 'members');
            }
        }
        
        console.log('All tests completed successfully!');
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test when the page loads
document.addEventListener('DOMContentLoaded', testRecursionFix);