// Test validation functions
console.log('Testing validation functions...');

// Mock DOM elements for testing
const mockDOM = `
<div id="leaderGender">
    <option value="M">Male</option>
    <option value="F">Female</option>
</div>
<div id="membersContainer">
    <div class="member-row">
        <select class="member-gender">
            <option value="M">Male</option>
            <option value="F">Female</option>
        </select>
    </div>
    <div class="member-row">
        <select class="member-gender">
            <option value="M">Male</option>
            <option value="F">Female</option>
        </select>
    </div>
</div>
`;

// Test team size validation
function testTeamSizeValidation() {
    console.log('Testing team size validation...');
    
    // Test case 1: Valid team size (6 members)
    const memberRows1 = [{}, {}, {}, {}, {}]; // 5 members + 1 leader = 6
    const totalMembers1 = memberRows1.length + 1;
    const result1 = totalMembers1 === 6 ? { valid: true } : { 
        valid: false, 
        message: `Team must have exactly 6 members (including the leader). Currently you have ${totalMembers1} member(s).` 
    };
    
    console.log('Test 1 (6 members):', result1);
    
    // Test case 2: Invalid team size (5 members)
    const memberRows2 = [{}, {}, {}, {}]; // 4 members + 1 leader = 5
    const totalMembers2 = memberRows2.length + 1;
    const result2 = totalMembers2 === 6 ? { valid: true } : { 
        valid: false, 
        message: `Team must have exactly 6 members (including the leader). Currently you have ${totalMembers2} member(s).` 
    };
    
    console.log('Test 2 (5 members):', result2);
    
    // Test case 3: Invalid team size (7 members)
    const memberRows3 = [{}, {}, {}, {}, {}, {}]; // 6 members + 1 leader = 7
    const totalMembers3 = memberRows3.length + 1;
    const result3 = totalMembers3 === 6 ? { valid: true } : { 
        valid: false, 
        message: `Team must have exactly 6 members (including the leader). Currently you have ${totalMembers3} member(s).` 
    };
    
    console.log('Test 3 (7 members):', result3);
}

// Test gender validation
function testGenderValidation() {
    console.log('Testing gender validation...');
    
    // Test case 1: Leader is female
    const leaderGender1 = 'F';
    const memberGenders1 = ['M', 'M', 'M', 'M', 'M'];
    let hasFemale1 = leaderGender1 === 'F';
    
    if (!hasFemale1) {
        for (let i = 0; i < memberGenders1.length; i++) {
            if (memberGenders1[i] === 'F') {
                hasFemale1 = true;
                break;
            }
        }
    }
    
    const result1 = hasFemale1 ? { valid: true } : { 
        valid: false, 
        message: 'Team must include at least one female member (including the leader).' 
    };
    
    console.log('Test 1 (female leader):', result1);
    
    // Test case 2: One member is female
    const leaderGender2 = 'M';
    const memberGenders2 = ['M', 'F', 'M', 'M', 'M'];
    let hasFemale2 = leaderGender2 === 'F';
    
    if (!hasFemale2) {
        for (let i = 0; i < memberGenders2.length; i++) {
            if (memberGenders2[i] === 'F') {
                hasFemale2 = true;
                break;
            }
        }
    }
    
    const result2 = hasFemale2 ? { valid: true } : { 
        valid: false, 
        message: 'Team must include at least one female member (including the leader).' 
    };
    
    console.log('Test 2 (female member):', result2);
    
    // Test case 3: No female members
    const leaderGender3 = 'M';
    const memberGenders3 = ['M', 'M', 'M', 'M', 'M'];
    let hasFemale3 = leaderGender3 === 'F';
    
    if (!hasFemale3) {
        for (let i = 0; i < memberGenders3.length; i++) {
            if (memberGenders3[i] === 'F') {
                hasFemale3 = true;
                break;
            }
        }
    }
    
    const result3 = hasFemale3 ? { valid: true } : { 
        valid: false, 
        message: 'Team must include at least one female member (including the leader).' 
    };
    
    console.log('Test 3 (no females):', result3);
}

// Run tests
testTeamSizeValidation();
testGenderValidation();

console.log('Validation tests completed.');