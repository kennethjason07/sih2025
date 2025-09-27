// Supabase configuration
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const resetPasswordForm = document.getElementById('resetPasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordStrengthDiv = document.getElementById('passwordStrength');
const submitBtn = document.getElementById('submitBtn');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we have a valid reset session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session) {
        // No active session, redirect to login
        showError('Invalid or expired reset link. Please request a new password reset.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }
    
    // Add event listeners
    resetPasswordForm.addEventListener('submit', handlePasswordReset);
    newPasswordInput.addEventListener('input', checkPasswordStrength);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
});

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleButton = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        input.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = newPasswordInput.value;
    const strengthDiv = passwordStrengthDiv;
    
    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }
    
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength += 1;
    } else {
        feedback.push('At least 8 characters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('One uppercase letter');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('One lowercase letter');
    }
    
    // Number check
    if (/\d/.test(password)) {
        strength += 1;
    } else {
        feedback.push('One number');
    }
    
    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('One special character');
    }
    
    // Display strength
    let strengthText = '';
    let strengthClass = '';
    
    if (strength <= 2) {
        strengthText = '❌ Weak';
        strengthClass = 'weak';
    } else if (strength <= 3) {
        strengthText = '⚠️ Medium';
        strengthClass = 'medium';
    } else if (strength <= 4) {
        strengthText = '✅ Strong';
        strengthClass = 'strong';
    } else {
        strengthText = '🔒 Very Strong';
        strengthClass = 'very-strong';
    }
    
    strengthDiv.innerHTML = `
        <div class="password-strength ${strengthClass}">
            <strong>Password Strength: ${strengthText}</strong>
            ${feedback.length > 0 ? `<br><small>Missing: ${feedback.join(', ')}</small>` : ''}
        </div>
    `;
}

// Validate password match
function validatePasswordMatch() {
    const password = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
        confirmPasswordInput.style.borderColor = '#dc3545';
    } else {
        confirmPasswordInput.setCustomValidity('');
        confirmPasswordInput.style.borderColor = '#e2e8f0';
    }
}

// Handle password reset form submission
async function handlePasswordReset(e) {
    e.preventDefault();
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validate passwords
    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Show loading state
    showLoadingInterface('Updating password...');
    
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        hideLoadingInterface();
        
        if (error) {
            showError('Error updating password: ' + error.message);
            return;
        }
        
        // Success - show success message and redirect
        showSuccessMessage();
        
    } catch (error) {
        console.error('Password reset error:', error);
        hideLoadingInterface();
        showError('An unexpected error occurred. Please try again.');
    }
}

// Show success message
function showSuccessMessage() {
    const container = document.querySelector('.auth-container');
    container.innerHTML = `
        <h2 style="color: #28a745;">✅ Password Updated Successfully!</h2>
        <div class="password-reset-success">
            <p>Your password has been updated successfully.</p>
            <p>You will be redirected to the login page in a few seconds.</p>
        </div>
        <button class="btn" onclick="redirectToLogin()">
            Login Now
        </button>
    `;
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
        redirectToLogin();
    }, 3000);
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        text-align: center;
        animation: fadeIn 0.5s ease-out;
    `;
    errorDiv.textContent = message;
    
    // Insert at the top of the form
    const form = document.getElementById('resetPasswordForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show loading interface
function showLoadingInterface(message) {
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
        const messageElement = loadingOverlay.querySelector('#loading-message');
        if (messageElement) {
            messageElement.textContent = message || 'Processing...';
        }
        loadingOverlay.style.display = 'flex';
    }
}

// Hide loading interface
function hideLoadingInterface() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}