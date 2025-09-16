# Team Registration Validation Implementation

## Overview
This document summarizes the implementation of team size and gender validation for the SIH 2025 Portal team registration forms.

## Features Implemented

### 1. Team Size Validation
- **Requirement**: Teams must have exactly 6 members including the leader
- **Implementation**: 
  - Validation function checks total members (leader + team members)
  - Real-time feedback showing current member count
  - Warning message when team size is not exactly 6
  - Disable "Add Member" button when maximum is reached

### 2. Gender Validation
- **Requirement**: Teams must include at least one female member (including the leader)
- **Implementation**:
  - Validation function checks gender of all team members
  - Real-time feedback showing gender requirement status
  - Warning message when no female members are present

### 3. Modal/Popup System
- **Requirement**: Use existing modal/popup styling for validation error messages
- **Implementation**:
  - Created custom modal styles in main.css
  - Modal shows validation error messages
  - Modal can be closed with OK button or by clicking outside

### 4. Real-time Validation
- **Requirement**: Provide real-time feedback as members are added
- **Implementation**:
  - Event listeners for member addition/removal
  - Event listeners for gender selection changes
  - Dynamic updates to team size and gender indicators

## Files Modified

1. **styles/main.css**
   - Added modal/popup styles
   - Added notification styles for warnings

2. **scripts/team-registration.js**
   - Added validation functions
   - Added real-time validation updates
   - Integrated validation with form submission

3. **scripts/dashboard.js**
   - Added validation functions
   - Added real-time validation updates
   - Integrated validation with form submission

## Validation Logic

### Team Size Validation
```javascript
function validateTeamSize() {
    const memberRows = document.querySelectorAll('.member-row');
    const totalMembers = memberRows.length + 1; // +1 for leader
    
    if (totalMembers !== 6) {
        return {
            valid: false,
            message: `Team must have exactly 6 members (including the leader). Currently you have ${totalMembers} member(s).`
        };
    }
    
    return { valid: true };
}
```

### Gender Validation
```javascript
function validateGenderRequirement() {
    // Check leader gender
    const leaderGender = document.getElementById('leaderGender').value;
    
    // Check member genders
    const memberGenders = document.querySelectorAll('.member-gender');
    let hasFemale = leaderGender === 'F';
    
    if (!hasFemale) {
        for (let i = 0; i < memberGenders.length; i++) {
            if (memberGenders[i].value === 'F') {
                hasFemale = true;
                break;
            }
        }
    }
    
    if (!hasFemale) {
        return {
            valid: false,
            message: 'Team must include at least one female member (including the leader).'
        };
    }
    
    return { valid: true };
}
```

## Testing

Validation functions were tested with various scenarios:
- Team sizes of 5, 6, and 7 members
- Gender combinations with female leader, female member, and no females

All tests passed successfully.

## Usage

The validation is automatically applied when:
1. A user adds or removes team members
2. A user changes gender selections
3. A user submits the team registration form

Error messages are displayed in a modal popup using the existing application styling.