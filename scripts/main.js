// Supabase configuration
// Loaded from credentials.txt
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const app = document.getElementById('app');

// State
let currentUser = null;
let userRole = 'leader'; // default role

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        currentUser = user;
        // Check if user is admin
        if (user.email === 'admin@example.com') { // Simple check for demo
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        showAuthForm();
    }
});

// Authentication Functions
function showAuthForm() {
    app.innerHTML = `
        <div class="auth-container">
            <h2><i class="fas fa-sign-in-alt"></i> Login to SIH 2025 Portal</h2>
            <form id="authForm" autocomplete="off">
                <div class="form-group">
                    <label for="email" class="required">Email</label>
                    <div class="input-group">
                        <i class="fas fa-envelope icon"></i>
                        <input type="email" id="email" required autocomplete="off" value="" placeholder="Enter your email">
                    </div>
                </div>
                <div class="form-group">
                    <label for="password" class="required">Password</label>
                    <div class="input-group">
                        <i class="fas fa-lock icon"></i>
                        <input type="password" id="password" required autocomplete="off" value="" placeholder="Enter your password">
                    </div>
                </div>
                <button type="submit" class="btn">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
                <p style="text-align: center; margin-top: 1rem;">
                    <a href="#" id="showPasswordReset">Forgot Password?</a>
                </p>
                <p style="text-align: center; margin-top: 0.5rem;">
                    Don't have an account? <a href="#" id="showSignup">Sign Up</a>
                </p>
                <p style="text-align: center;">
                    <a href="admin-login.html"><i class="fas fa-user-shield"></i> Admin Login</a>
                </p>
            </form>
        </div>
    `;
    
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
            this.setAttribute('placeholder', 'Enter your email');
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
    
    document.getElementById('authForm').addEventListener('submit', handleLogin);
    document.getElementById('showSignup').addEventListener('click', showSignupForm);
    document.getElementById('showPasswordReset').addEventListener('click', showPasswordResetForm);
}

function showSignupForm() {
    app.innerHTML = `
        <div class="auth-container">
            <h2><i class="fas fa-user-plus"></i> Sign Up for SIH 2025</h2>
            <form id="signupForm" autocomplete="off">
                <div class="form-group">
                    <label for="signupEmail" class="required">Email</label>
                    <div class="input-group">
                        <i class="fas fa-envelope icon"></i>
                        <input type="email" id="signupEmail" required autocomplete="off" value="" placeholder="Enter your email">
                    </div>
                </div>
                <div class="form-group">
                    <label for="signupPassword" class="required">Password</label>
                    <div class="input-group">
                        <i class="fas fa-lock icon"></i>
                        <input type="password" id="signupPassword" required autocomplete="off" value="" placeholder="Create a password">
                    </div>
                </div>
                <button type="submit" class="btn">
                    <i class="fas fa-user-plus"></i> Sign Up
                </button>
                <p style="text-align: center; margin-top: 1rem;">
                    Already have an account? <a href="#" id="showLogin">Login</a>
                </p>
            </form>
        </div>
    `;
    
    // Clear any existing values
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    
    // Add event listeners for input focus and blur
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const emailIcon = emailInput.previousElementSibling;
    const passwordIcon = passwordInput.previousElementSibling;
    
    // Handle email input
    emailInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            emailIcon.style.opacity = '0';
            this.removeAttribute('placeholder');
        } else {
            emailIcon.style.opacity = '1';
            this.setAttribute('placeholder', 'Enter your email');
        }
    });
    
    // Handle password input
    passwordInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            passwordIcon.style.opacity = '0';
            this.removeAttribute('placeholder');
        } else {
            passwordIcon.style.opacity = '1';
            this.setAttribute('placeholder', 'Create a password');
        }
    });
    
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('showLogin').addEventListener('click', showAuthForm);
}

function showPasswordResetForm() {
    app.innerHTML = `
        <div class="auth-container">
            <h2><i class="fas fa-key"></i> Reset Password</h2>
            <p style="text-align: center; margin-bottom: 1.5rem; color: #666;">
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <form id="passwordResetForm" autocomplete="off">
                <div class="form-group">
                    <label for="resetEmail" class="required">Email</label>
                    <div class="input-group">
                        <i class="fas fa-envelope icon"></i>
                        <input type="email" id="resetEmail" required autocomplete="off" value="" placeholder="Enter your email">
                    </div>
                </div>
                <button type="submit" class="btn">
                    <i class="fas fa-paper-plane"></i> Send Reset Link
                </button>
                <p style="text-align: center; margin-top: 1rem;">
                    Remember your password? <a href="#" id="showLogin">Back to Login</a>
                </p>
            </form>
        </div>
    `;
    
    // Clear any existing values
    document.getElementById('resetEmail').value = '';
    
    // Add event listeners for input focus and blur
    const emailInput = document.getElementById('resetEmail');
    const emailIcon = emailInput.previousElementSibling;
    
    // Handle email input
    emailInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            emailIcon.style.opacity = '0';
            this.removeAttribute('placeholder');
        } else {
            emailIcon.style.opacity = '1';
            this.setAttribute('placeholder', 'Enter your email');
        }
    });
    
    document.getElementById('passwordResetForm').addEventListener('submit', handlePasswordReset);
    document.getElementById('showLogin').addEventListener('click', showAuthForm);
}

// Rate limiting variables
let lastPasswordResetAttempt = 0;
const PASSWORD_RESET_COOLDOWN = 60000; // 1 minute cooldown

async function handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    const now = Date.now();
    
    // Check rate limiting
    if (now - lastPasswordResetAttempt < PASSWORD_RESET_COOLDOWN) {
        const remainingTime = Math.ceil((PASSWORD_RESET_COOLDOWN - (now - lastPasswordResetAttempt)) / 1000);
        alert(`Please wait ${remainingTime} seconds before requesting another password reset.`);
        return;
    }
    
    // Show loading interface
    showLoadingInterface('Sending reset email...');
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        
        // Update last attempt time
        lastPasswordResetAttempt = now;
        
        hideLoadingInterface();
        
        if (error) {
            // Handle specific error types
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                alert('Too many password reset requests. Please wait a few minutes and try again.');
            } else if (error.message.includes('email not found') || error.message.includes('user not found')) {
                alert('If an account with this email exists, you will receive a password reset link.');
            } else {
                alert('Error: ' + error.message);
            }
            return;
        }
        
        // Show success message
        app.innerHTML = `
            <div class="auth-container">
                <h2><i class="fas fa-check-circle" style="color: #28a745;"></i> Email Sent!</h2>
                <p style="text-align: center; margin-bottom: 1.5rem; color: #666;">
                    We've sent a password reset link to <strong>${email}</strong>.
                    Please check your email and click the link to reset your password.
                </p>
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: #155724; text-align: center;">
                        <i class="fas fa-info-circle"></i> Don't forget to check your spam folder if you don't see the email.
                    </p>
                </div>
                <button class="btn" onclick="showAuthForm()">
                    <i class="fas fa-arrow-left"></i> Back to Login
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('Password reset error:', error);
        hideLoadingInterface();
        alert('An unexpected error occurred. Please try again.');
    }
}

// Rate limiting for login attempts
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 3000; // 3 seconds cooldown between attempts
let failedLoginCount = 0;

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const now = Date.now();
    
    // Check rate limiting
    if (now - lastLoginAttempt < LOGIN_COOLDOWN) {
        const remainingTime = Math.ceil((LOGIN_COOLDOWN - (now - lastLoginAttempt)) / 1000);
        alert(`Please wait ${remainingTime} seconds before trying again.`);
        return;
    }
    
    // Show loading interface
    showLoadingInterface('Logging in...');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        // Update last attempt time
        lastLoginAttempt = now;
        
        if (error) {
            failedLoginCount++;
            hideLoadingInterface();
            
            // Handle specific error types
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                alert('Too many login attempts. Please wait a few minutes and try again.');
            } else if (failedLoginCount >= 3) {
                alert('Multiple failed attempts detected. Please double-check your credentials or reset your password.');
            } else {
                alert('Login failed: ' + error.message);
            }
            return;
        }
        
        // Reset failed count on successful login
        failedLoginCount = 0;
        
        currentUser = data.user;
        
        console.log('User logged in:', currentUser);
        
        // Ensure user exists in users table
        await ensureUserExists(currentUser);
        
        // Redirect based on user role (using role column in users table)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single();
        
        if (userError) {
            console.error('Error fetching user role:', userError);
        }
        
        console.log('User data:', userData);
        
        hideLoadingInterface();
        
        if (userData && userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            // Check if team is registered, if not redirect to team registration
            // For demo, we'll redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        hideLoadingInterface();
        alert('An unexpected error occurred during login.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    console.log('Attempting to sign up user:', email);
    
    // Show loading interface immediately when signup starts
    showLoadingInterface('Signing up...');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            console.error('Signup failed:', error);
            hideLoadingInterface();
            alert('Signup failed: ' + error.message);
            return;
        }
        
        console.log('Signup response:', data);
        
        if (data.user) {
            // Show the alert while keeping the loading interface visible
            setTimeout(() => {
                hideLoadingInterface();
                alert('Signup successful! Please check your email for verification.');
                showAuthForm();
            }, 100); // Small delay to ensure UI update
            
            // After signup, let's check if the trigger worked
            setTimeout(async () => {
                console.log('Checking if user records were created...');
                await checkUserRecords(data.user.id, email);
            }, 3000); // Increased timeout to give more time for trigger to execute
        } else {
            hideLoadingInterface();
        }
    } catch (error) {
        console.error('Signup error:', error);
        hideLoadingInterface();
        alert('An unexpected error occurred during signup.');
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
                <p id="loading-message">${message || 'Processing...'}</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    } else {
        // Update the message if overlay already exists
        const messageElement = loadingOverlay.querySelector('#loading-message');
        if (messageElement) {
            messageElement.textContent = message || 'Processing...';
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

// Function to check if user records exist
async function checkUserRecords(userId, userEmail) {
    try {
        console.log('Checking user records for user ID:', userId);
        
        // Check users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        console.log('Users table record:', userData, userError);
        
        // Report results
        if (userData && !userError) {
            console.log('✓ User record created successfully');
        } else {
            console.log('✗ User record not found');
        }
        
    } catch (error) {
        console.error('Error checking user records:', error);
    }
}

// Function to manually create user record if missing
async function createMissingUserRecord(userId, userEmail) {
    try {
        console.log('Creating missing user record for:', userId, userEmail);
        const { error: insertUserError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userEmail
            });
        
        if (insertUserError) {
            console.error('Error creating user record:', insertUserError);
        } else {
            console.log('User record created successfully');
        }
    } catch (error) {
        console.error('Error in createMissingUserRecord:', error);
    }
}

// Function to manually create user role record if missing
async function createMissingUserRoleRecord(userId) {
    try {
        console.log('Creating missing user role record for:', userId);
        const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role: 'leader'
            });
        
        if (insertRoleError) {
            console.error('Error creating user role record:', insertRoleError);
        } else {
            console.log('User role record created successfully');
        }
    } catch (error) {
        console.error('Error in createMissingUserRoleRecord:', error);
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    userRole = 'leader';
    window.location.href = 'index.html';
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
                    email: user.email
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