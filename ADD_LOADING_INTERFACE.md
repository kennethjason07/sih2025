# Add Loading Interface for Authentication

## Overview
Added a loading interface that appears when users click the signup or login buttons, providing visual feedback during the authentication process.

## Changes Made

### 1. Updated JavaScript Functions
Modified both `handleSignup` and `handleLogin` functions in [scripts/main.js](file:///c:/Users/kened/Desktop/sih2025/last%20try/scripts/main.js) to show a loading interface during processing.

### 2. Added Loading Interface Functions
Created two new functions:
- `showLoadingInterface(message)` - Displays the loading overlay with a custom message
- `hideLoadingInterface()` - Hides the loading overlay

### 3. Added CSS Styles
Added new CSS rules in [styles/main.css](file:///c:/Users/kened/Desktop/sih2025/last%20try/styles/main.css) for the loading overlay, including:
- Overlay positioning and styling
- Spinner animation
- Message text styling

## Implementation Details

### JavaScript Changes

#### handleSignup Function
```javascript
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    console.log('Attempting to sign up user:', email);
    
    // Show loading interface
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
            // Keep the loading interface visible until the alert is shown
            alert('Signup successful! Please check your email for verification.');
            
            // After signup, let's check if the trigger worked
            setTimeout(async () => {
                console.log('Checking if user records were created...');
                await checkUserRecords(data.user.id, email);
                hideLoadingInterface(); // Hide loading interface after checking
            }, 3000);
            showAuthForm();
        } else {
            hideLoadingInterface();
        }
    } catch (error) {
        console.error('Signup error:', error);
        hideLoadingInterface();
        alert('An unexpected error occurred during signup.');
    }
}
```

#### New Loading Functions
```javascript
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
```

### CSS Changes
```css
/* Loading Overlay */
#loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.loading-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

#loading-message {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
}
```

## Files Updated
1. [scripts/main.js](file:///c:/Users/kened/Desktop/sih2025/last%20try/scripts/main.js) - Added loading interface to authentication functions
2. [styles/main.css](file:///c:/Users/kened/Desktop/sih2025/last%20try/styles/main.css) - Added CSS for loading interface
3. [ADD_LOADING_INTERFACE.md](file:///c:/Users/kened/Desktop/sih2025/last%20try/ADD_LOADING_INTERFACE.md) - This documentation

## Behavior
1. When a user clicks the signup button, a loading overlay appears with a spinner and the message "Signing up..."
2. The overlay remains visible until the signup process completes
3. After the success alert is shown, the overlay stays visible while checking user records
4. The overlay is hidden after all processing is complete
5. If an error occurs, the overlay is hidden and an error message is displayed
6. The same behavior applies to the login process with the message "Logging in..."

## Testing
To test the loading interface:
1. Open the application
2. Navigate to the signup page
3. Fill in the form and click "Sign Up"
4. Verify that the loading overlay appears immediately
5. Verify that the overlay remains visible until the success alert appears
6. Test the same behavior for the login process