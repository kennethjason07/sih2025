// Supabase configuration
// Loaded from credentials.txt
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const teamForm = document.getElementById('teamRegistrationForm');
const addMemberBtn = document.getElementById('addMemberBtn');

// Add modal HTML to the page
function createModal() {
    // Check if modal already exists
    if (document.getElementById('validationModal')) return;
    
    const modalHTML = `
        <div id="validationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Validation Error</h3>
                </div>
                <div class="modal-body">
                    <p id="modalMessage"></p>
                </div>
                <div class="modal-footer">
                    <button id="closeModal" class="btn-close">OK</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listener to close button
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('validationModal').classList.remove('show');
    });
    
    // Close modal when clicking outside
    document.getElementById('validationModal').addEventListener('click', (e) => {
        if (e.target.id === 'validationModal') {
            document.getElementById('validationModal').classList.remove('show');
        }
    });
}

// Show modal with message
function showModal(message) {
    createModal();
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('validationModal').classList.add('show');
}

// Validate team size (6 members including leader)
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

// Validate gender requirement (at least one female in the entire team)
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

// Real-time validation for team size
function updateTeamSizeIndicator() {
    const memberRows = document.querySelectorAll('.member-row');
    const totalMembers = memberRows.length + 1; // +1 for leader
    
    // Update add member button state
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (totalMembers >= 6) {
        addMemberBtn.disabled = true;
        addMemberBtn.textContent = 'Maximum 6 Members Reached';
    } else {
        addMemberBtn.disabled = false;
        addMemberBtn.textContent = 'Add Another Member';
    }
    
    // Show warning if less than 6 members
    const warningElement = document.getElementById('teamSizeWarning');
    if (totalMembers < 6) {
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'teamSizeWarning';
            warning.className = 'notification warning';
            warning.innerHTML = '<i class="fas fa-exclamation-circle"></i> Team must have exactly 6 members (including leader). Currently: ' + totalMembers;
            document.querySelector('.card-header').appendChild(warning);
        } else {
            warningElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Team must have exactly 6 members (including leader). Currently: ' + totalMembers;
        }
    } else if (warningElement) {
        warningElement.remove();
    }
}

// Real-time validation for gender requirement
function updateGenderIndicator() {
    const leaderGender = document.getElementById('leaderGender').value;
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
    
    // Show warning if no female member
    const warningElement = document.getElementById('genderWarning');
    if (!hasFemale) {
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'genderWarning';
            warning.className = 'notification warning';
            warning.innerHTML = '<i class="fas fa-exclamation-circle"></i> Team must include at least one female member (including the leader).';
            document.querySelector('.card-header').appendChild(warning);
        }
    } else if (warningElement) {
        warningElement.remove();
    }
}

// Add event listeners for real-time validation
function addRealTimeValidation() {
    // Team size validation
    document.getElementById('addMemberBtn').addEventListener('click', updateTeamSizeIndicator);
    
    // Gender validation
    document.getElementById('leaderGender').addEventListener('change', updateGenderIndicator);
    
    // Add gender change listeners to member rows
    document.addEventListener('click', function(e) {
        if (e.target.matches('#addMemberBtn')) {
            // When a new member is added, update gender listeners
            setTimeout(() => {
                const newMemberGenders = document.querySelectorAll('.member-gender');
                newMemberGenders.forEach(select => {
                    select.addEventListener('change', updateGenderIndicator);
                });
                updateGenderIndicator();
            }, 100);
        }
    });
    
    // Listen for changes in existing member genders
    const memberGenders = document.querySelectorAll('.member-gender');
    memberGenders.forEach(select => {
        select.addEventListener('change', updateGenderIndicator);
    });
    
    // Initial validation
    updateTeamSizeIndicator();
    updateGenderIndicator();
}

function addMemberField() {
    const container = document.getElementById('membersContainer');
    const memberCount = container.querySelectorAll('.member-row').length + 1;
    const memberRow = document.createElement('div');
    memberRow.className = 'member-row';
    memberRow.innerHTML = `
        <div class="form-group">
            <label>Member ${memberCount} Full Name</label>
            <div class="input-group">
                <input type="text" placeholder="Member Name" class="member-name fade-in" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Gender</label>
                <select class="member-gender fade-in" required>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Stream</label>
                <div class="input-group">
                    <select class="member-stream fade-in" required>
                        <option value="">Select Stream</option>
                        <option value="CSE">CSE</option>
                        <option value="ISE">ISE</option>
                        <option value="AIML">AIML</option>
                        <option value="CSE-DS">CSE-DS</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="CSE-AIML">CSE-AIML</option>
                        <option value="CIVIL">CIVIL</option>
                        <option value="ICB">ICB</option>
                        <option value="MECHANICAL">Mechanical</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Semester</label>
                <select class="member-semester fade-in" required>
                    <option value="">Select Semester</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                    <option value="5th">5th</option>
                    <option value="6th">6th</option>
                    <option value="7th">7th</option>
                    <option value="8th">8th</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Category</label>
                <select class="member-category fade-in" required>
                    <option value="">Select Category</option>
                    <option value="GM">GM</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="OTHER">OTHER</option>
                </select>
            </div>
        </div>
        
        <div class="form-group">
            <label>Email ID</label>
            <div class="input-group">
                <input type="email" placeholder="Member Email" class="member-email fade-in" required>
            </div>
        </div>
        
        <div class="form-group">
            <label>Mobile No.</label>
            <div class="input-group">
                <input type="tel" placeholder="Member Mobile" class="member-mobile fade-in" required>
            </div>
        </div>
        
        <input type="hidden" class="member-position" value="Member">
        
        <button type="button" class="remove-member btn btn-danger">Remove Member</button>
    `;
    container.appendChild(memberRow);
    
    // Add event listener to the remove button
    memberRow.querySelector('.remove-member').addEventListener('click', function() {
        container.removeChild(memberRow);
    });
    
    // Add focus/blur events for new inputs
    const newInputs = memberRow.querySelectorAll('.input-group input, .input-group select');
    newInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.input-group').classList.add('focus');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.input-group').classList.remove('focus');
        });
    });
}

async function handleTeamRegistration(e) {
    e.preventDefault();
    
    // Check if registrations are open
    const registrationStatus = await checkRegistrationStatus();
    if (!registrationStatus.isOpen) {
        showModal(`Registration Closed: ${registrationStatus.message}`);
        return;
    }
    
    // Perform validation
    const teamSizeValidation = validateTeamSize();
    if (!teamSizeValidation.valid) {
        showModal(teamSizeValidation.message);
        return;
    }
    
    const genderValidation = validateGenderRequirement();
    if (!genderValidation.valid) {
        showModal(genderValidation.message);
        return;
    }
    
    // Get form data
    const projectType = document.getElementById('projectType').value;
    const teamName = document.getElementById('teamName').value;
    const sihPsId = document.getElementById('sihPsId').value; // Get SIH PS ID
    
    // Get leader details
    const leaderDetails = {
        position: 'Leader',
        name: document.getElementById('leaderName').value,
        gender: document.getElementById('leaderGender').value,
        stream: document.getElementById('leaderStream').value,
        semester: document.getElementById('leaderSemester').value,
        category: document.getElementById('leaderCategory').value,
        email: document.getElementById('leaderEmail').value,
        mobile: document.getElementById('leaderMobile').value
    };
    
    // Get team members
    const memberRows = document.querySelectorAll('.member-row');
    const members = [leaderDetails]; // Include leader as first member
    
    memberRows.forEach(row => {
        const member = {
            position: row.querySelector('.member-position').value,
            name: row.querySelector('.member-name').value,
            gender: row.querySelector('.member-gender').value,
            stream: row.querySelector('.member-stream').value,
            semester: row.querySelector('.member-semester').value,
            category: row.querySelector('.member-category').value,
            email: row.querySelector('.member-email').value,
            mobile: row.querySelector('.member-mobile').value
        };
        
        // Only add member if they have a name
        if (member.name) {
            members.push(member);
        }
    });
    
    // Save to Supabase
    try {
        // First, get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            throw new Error('Authentication error: ' + userError.message);
        }
        
        if (!user) {
            throw new Error('User not authenticated. Please log in again.');
        }
        
        // Insert the team record first
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert({
                team_name: teamName,
                project_type: projectType,
                sih_ps_id: sihPsId, // Add SIH PS ID
                leader_id: user.id,
                leader_name: leaderDetails.name,
                stream: leaderDetails.stream,
                semester: leaderDetails.semester,
                category: leaderDetails.category
            })
            .select()
            .single();
        
        if (teamError) {
            console.error('Supabase error details:', teamError);
            throw new Error('Error creating team: ' + teamError.message);
        }
        
        // Now insert team members (including leader)
        const teamId = teamData.id;
        const membersToInsert = members.map(member => ({
            team_id: teamId,
            position: member.position,
            full_name: member.name,
            gender: member.gender,
            stream: member.stream,
            semester: member.semester,
            category: member.category,
            email: member.email,
            mobile: member.mobile
        }));
        
        const { error: membersError } = await supabase
            .from('team_members')
            .insert(membersToInsert);
        
        if (membersError) {
            console.error('Supabase error details:', membersError);
            throw new Error('Error creating team members: ' + membersError.message);
        }
        
        console.log('Team and members created successfully:', teamData);
        
        alert('Team registered successfully! Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error registering team:', error);
        alert('Error registering team: ' + error.message);
    }
}

// Function to check if registrations are currently open
async function checkRegistrationStatus() {
    try {
        console.log('Checking registration status...');
        
        const { data: status, error } = await supabase
            .from('registration_status')
            .select('is_open, message')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error) {
            console.error('Error checking registration status:', error);
            // Default to closed if there's an error or no data
            return {
                isOpen: false,
                message: 'Unable to verify registration status. Please contact administrator.'
            };
        }
        
        console.log('Registration status:', status);
        
        return {
            isOpen: status.is_open,
            message: status.message || 'Registration status check failed'
        };
        
    } catch (error) {
        console.error('Error checking registration status:', error);
        return {
            isOpen: false,
            message: 'Unable to verify registration status. Please contact administrator.'
        };
    }
}

// Function to initialize the page and check registration status
async function initializePage() {
    console.log('Initializing team registration page...');
    
    // Check registration status on page load
    const registrationStatus = await checkRegistrationStatus();
    
    if (!registrationStatus.isOpen) {
        // Hide the registration form and show closed message
        const card = document.querySelector('.card');
        if (card) {
            card.innerHTML = `
                <div class="card-header">
                    <h2 class="fade-in">🚫 Registration Closed</h2>
                    <p class="fade-in">New team registrations are currently closed</p>
                </div>
                <div class="registration-closed-message">
                    <div class="status-icon">🔒</div>
                    <h3>Team Registration is Currently Closed</h3>
                    <p class="message">${registrationStatus.message}</p>
                    <div class="info-box">
                        <h4>For Existing Teams:</h4>
                        <p>If you have already registered your team, you can still access your dashboard and upload presentations.</p>
                        <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
                    </div>
                    <div class="contact-info">
                        <h4>Need Help?</h4>
                        <p>Contact your administrator if you believe this is an error or if you need assistance.</p>
                    </div>
                </div>
            `;
        }
    } else {
        console.log('Registrations are open. Page ready for team registration.');
    }
}

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page with registration status check
    initializePage();
    
    // Set up form submission handler
    if (teamForm) {
        teamForm.addEventListener('submit', handleTeamRegistration);
    }
    
    // Set up add member button
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', function() {
            addMemberField();
            updateTeamSizeIndicator();
        });
    }
    
    // Add real-time validation
    addRealTimeValidation();
    
    // Add focus/blur events to existing inputs
    const inputs = document.querySelectorAll('.input-group input, .input-group select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.input-group').classList.add('focus');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.input-group').classList.remove('focus');
        });
    });
});
