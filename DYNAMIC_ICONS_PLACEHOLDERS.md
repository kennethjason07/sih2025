# Dynamic Icons and Placeholders Implementation

## Problem
The Font Awesome icons and placeholder text in input fields remained visible even when the user was typing, which could cause visual clutter and reduce the clean appearance of the forms.

## Solution Implemented
Implemented dynamic behavior where:
1. Font Awesome icons fade out when the user starts typing in an input field
2. Placeholder text disappears when the user starts typing
3. Both icons and placeholders reappear when the input field is empty
4. Smooth transitions for a polished user experience

## Technical Implementation

### CSS Changes
```css
.input-group i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray);
    transition: color 0.3s ease, opacity 0.3s ease; /* Added opacity transition */
    z-index: 2;
    width: 1.5em;
    text-align: center;
    opacity: 1;
}

.input-group input {
    padding-left: 7rem;
    position: relative;
    z-index: 1;
    transition: padding-left 0.3s ease;
}

.input-group input::placeholder {
    padding-left: 2.5rem;
    transition: padding-left 0.3s ease;
}

/* Hide placeholder when input is focused */
.input-group input:focus::placeholder {
    color: transparent;
}

/* Adjust padding when input has content */
.input-group input:not(:placeholder-shown) {
    padding-left: 1rem;
}

.input-group input:not(:placeholder-shown)::placeholder {
    padding-left: 0;
}
```

### JavaScript Implementation
Added event listeners to all input fields with icons:

```javascript
// Handle input event
input.addEventListener('input', function() {
    if (this.value.length > 0) {
        icon.style.opacity = '0';  // Hide icon
        this.removeAttribute('placeholder');  // Remove placeholder
    } else {
        icon.style.opacity = '1';  // Show icon
        // Restore original placeholder based on input type/field
        if (this.id === 'teamName') {
            this.setAttribute('placeholder', 'Enter your team name');
        } else if (this.id === 'leaderName' || this.classList.contains('member-name')) {
            this.setAttribute('placeholder', this.id === 'leaderName' ? 'Enter leader\'s full name' : 'Member Name');
        } else if (this.id === 'leaderStream' || this.classList.contains('member-stream')) {
            this.setAttribute('placeholder', this.id === 'leaderStream' ? 'e.g., CSE, ECE, ME' : 'Stream');
        } else if (this.id === 'leaderEmail' || this.classList.contains('member-email')) {
            this.setAttribute('placeholder', this.id === 'leaderEmail' ? 'leader@example.com' : 'Member Email');
        } else if (this.id === 'leaderMobile' || this.classList.contains('member-mobile')) {
            this.setAttribute('placeholder', this.id === 'leaderMobile' ? 'Enter mobile number' : 'Member Mobile');
        }
    }
});
```

## Files Modified
- `scripts/main.js` - Added dynamic icon/placerholder behavior to login and signup forms
- `scripts/admin-login.js` - Added dynamic icon/placerholder behavior to admin login form
- `admin-login.html` - Added icon class to Font Awesome icons
- `team-registration.html` - Added icon class to Font Awesome icons and implemented dynamic behavior
- `styles/main.css` - Added CSS transitions and dynamic styling rules
- `test_dynamic_icons.html` - Created test file to demonstrate functionality
- `test_team_registration_dynamic.html` - Created test file to demonstrate functionality for team registration
- `DYNAMIC_ICONS_PLACEHOLDERS.md` - This documentation file

## Visual Improvements
- Clean, uncluttered input fields when user is typing
- Smooth transitions for professional appearance
- Improved focus state with hidden placeholders
- Consistent behavior across all forms
- Better mobile responsiveness

## Testing
The implementation has been tested on:
- Login form
- Signup form
- Admin login form
- Team registration form
- All screen sizes (desktop, tablet, mobile)

The dynamic behavior works consistently across all input fields, providing a clean and modern user experience.