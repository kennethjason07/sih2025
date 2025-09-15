// Supabase configuration
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');

// Initialize the admin login page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Check if user is admin
        const isAdmin = await checkIfAdmin(user);
        if (isAdmin) {
            window.location.href = 'admin.html';
        } else {
            // If not admin, logout and show login form
            await supabase.auth.signOut();
            showAdminLoginForm();
        }
    } else {
        showAdminLoginForm();
    }
});

function showAdminLoginForm() {
    // Clear any existing values
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    
    // Add event listeners for input focus and blur
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailIcon = emailInput.previousElementSibling;
    const passwordIcon = passwordInput.previousElementSibling;
    
    // Handle email input
    emailInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            emailIcon.style.opacity = '0';
            this.removeAttribute('placeholder');
        } else {
            emailIcon.style.opacity = '1';
            this.setAttribute('placeholder', 'Enter your admin email');
        }
    });
    
    // Handle password input
    passwordInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            passwordIcon.style.opacity = '0';
            this.removeAttribute('placeholder');
        } else {
            passwordIcon.style.opacity = '1';
            this.setAttribute('placeholder', 'Enter your password');
        }
    });
    
    adminLoginForm.addEventListener('submit', handleAdminLogin);
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading interface
    showLoadingInterface('Logging in as admin...');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            hideLoadingInterface();
            alert('Admin login failed: ' + error.message);
            return;
        }
        
        const user = data.user;
        console.log('Admin user logged in:', user);
        
        // Ensure user exists in users table
        await ensureUserExists(user);
        
        // Check if user is admin
        const isAdmin = await checkIfAdmin(user);
        
        if (isAdmin) {
            hideLoadingInterface();
            window.location.href = 'admin.html';
        } else {
            hideLoadingInterface();
            alert('Access denied. You do not have admin privileges.');
            await supabase.auth.signOut();
        }
    } catch (error) {
        console.error('Admin login error:', error);
        hideLoadingInterface();
        alert('An unexpected error occurred during admin login.');
    }
}

async function checkIfAdmin(user) {
    try {
        // First check if user exists in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (userError) {
            console.error('Error fetching user data:', userError);
            return false;
        }
        
        // Check if user has admin role
        return userData && userData.role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

async function ensureUserExists(user) {
    try {
        console.log('Ensuring user exists for:', user.id, user.email);
        
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
        
        console.log('User data check result:', userData, userError);
        
        // If user doesn't exist in users table, create the record
        if (!userData) {
            console.log('User not found in users table, creating record...');
            const { error: insertUserError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    role: 'leader' // Default role is leader
                });
            
            if (insertUserError) {
                // Check if it's a duplicate key error
                if (insertUserError.code === '23505') {
                    console.log('User already exists (duplicate key error), continuing...');
                } else {
                    console.error('Error creating user record:', insertUserError);
                }
            } else {
                console.log('User record created successfully');
            }
        } else {
            console.log('User already exists in users table');
        }
    } catch (error) {
        console.error('Error ensuring user exists:', error);
    }
}

// Function to show loading interface
function showLoadingInterface(message) {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p id="loading-message"><i class="fas fa-lock"></i> ${message || 'Processing...'}</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    } else {
        // Update the message if overlay already exists
        const messageElement = loadingOverlay.querySelector('#loading-message');
        if (messageElement) {
            messageElement.innerHTML = `<i class="fas fa-lock"></i> ${message || 'Processing...'}`;
        }
        loadingOverlay.style.display = 'flex';
    }
}

// Function to hide loading interface
function hideLoadingInterface() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}