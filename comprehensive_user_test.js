// Comprehensive test script to debug user_roles table issues
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function comprehensiveUserTest() {
    try {
        console.log('=== Comprehensive User Test ===');
        
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
        
        console.log('Current user:', user.id, user.email);
        
        // 1. Check auth.users table
        console.log('\n--- Checking auth.users ---');
        const { data: authUserData, error: authUserError } = await supabaseClient
            .from('auth.users')
            .select('id, email')
            .eq('id', user.id)
            .single();
        
        console.log('auth.users record:', authUserData, authUserError);
        
        // 2. Check public.users table
        console.log('\n--- Checking public.users ---');
        const { data: publicUserData, error: publicUserError } = await supabaseClient
            .from('users')
            .select('id, email')
            .eq('id', user.id)
            .maybeSingle();
        
        console.log('public.users record:', publicUserData, publicUserError);
        
        // 3. Check public.user_roles table
        console.log('\n--- Checking public.user_roles ---');
        const { data: userRoleData, error: userRoleError } = await supabaseClient
            .from('user_roles')
            .select('id, user_id, role')
            .eq('user_id', user.id)
            .maybeSingle();
        
        console.log('public.user_roles record:', userRoleData, userRoleError);
        
        // 4. Try to insert into public.users if not exists
        if (!publicUserData) {
            console.log('\n--- Inserting into public.users ---');
            const { data: insertUserData, error: insertUserError } = await supabaseClient
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email
                })
                .select();
            
            console.log('Insert into public.users result:', insertUserData, insertUserError);
        }
        
        // 5. Try to insert into public.user_roles if not exists
        if (!userRoleData) {
            console.log('\n--- Inserting into public.user_roles ---');
            const { data: insertRoleData, error: insertRoleError } = await supabaseClient
                .from('user_roles')
                .insert({
                    user_id: user.id,
                    role: 'leader'
                })
                .select();
            
            console.log('Insert into public.user_roles result:', insertRoleData, insertRoleError);
        }
        
        // 6. Final verification
        console.log('\n--- Final Verification ---');
        const { data: finalUserData, error: finalUserError } = await supabaseClient
            .from('users')
            .select('id, email')
            .eq('id', user.id)
            .single();
        
        const { data: finalRoleData, error: finalRoleError } = await supabaseClient
            .from('user_roles')
            .select('id, user_id, role')
            .eq('user_id', user.id)
            .single();
        
        console.log('Final public.users:', finalUserData, finalUserError);
        console.log('Final public.user_roles:', finalRoleData, finalRoleError);
        
        console.log('\n=== Test Complete ===');
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Run the test
comprehensiveUserTest();