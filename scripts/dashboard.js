// Supabase configuration
// Loaded from credentials.txt
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const userEmailSpan = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// State
let currentUser = null;

// Add focus/blur events for enhanced styling
function addFocusListeners() {
    const inputs = document.querySelectorAll('.input-group input, .input-group select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.input-group').classList.add('focus');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.input-group').classList.remove('focus');
        });
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = user;
    
    // Ensure user exists in users table
    await ensureUserExists(currentUser);
    
    // Check if user is admin (using role column in users table)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    
    // Show admin link if user is admin
    if (userData && userData.role === 'admin') {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = 'block';
        }
    }
    
    userEmailSpan.textContent = user.email;
    
    // Add event listeners
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            const view = e.target.getAttribute('data-view');
            loadView(view);
        });
    });

    logoutBtn.addEventListener('click', handleLogout);


    // Load default view
    loadView('team');
});

async function loadView(view) {
    const content = document.getElementById('dashboard-content');
    
    switch(view) {
        case 'team':
            // Show loading first
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Team Management</h3>
                    </div>
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>Checking team registration status...</p>
                    </div>
                </div>
            `;
            
            // Check team registration status and show appropriate interface
            checkTeamRegistrationStatus();
            break;
            
        case 'announcements':
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-bullhorn"></i> Announcements</h3>
                    </div>
                    <div id="announcementsContainer">
                        <p>Loading announcements...</p>
                    </div>
                </div>
            `;
            loadAnnouncements();
            break;
            
        case 'resources':
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-book"></i> Resources</h3>
                    </div>
                    <div id="resourcesContainer">
                        <p>Loading resources...</p>
                    </div>
                </div>
            `;
            loadResources();
            break;
            
        case 'presentations':
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3>📊 Team Presentation Upload</h3>
                        <p>Upload your team's presentation files (PPT/PPTX format, max 10MB)</p>
                    </div>
                    
                    <!-- Upload Section -->
                    <div class="upload-section">
                        <div class="upload-area" id="uploadArea">
                            <div class="upload-content">
                                <div class="upload-icon">📁</div>
                                <h4>Drag & Drop your presentation here</h4>
                                <p>or <button type="button" class="upload-btn" id="selectFileBtn">Choose File</button></p>
                                <input type="file" id="fileInput" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="display: none;">
                                <small>Supported formats: PPT, PPTX | Maximum size: 10MB</small>
                            </div>
                        </div>
                        
                        <!-- Upload Progress -->
                        <div class="upload-progress" id="uploadProgress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-info">
                                <span id="progressText">Uploading... 0%</span>
                                <button type="button" class="btn-cancel" id="cancelUpload">Cancel</button>
                            </div>
                        </div>
                        
                        <!-- Upload Form -->
                        <div class="upload-form" id="uploadForm" style="display: none;">
                            <div class="form-group">
                                <label for="presentationName" class="required">Presentation Name</label>
                                <div class="input-group">
                                    <input type="text" id="presentationName" required placeholder="Enter presentation name">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="presentationDescription">Description (Optional)</label>
                                <textarea id="presentationDescription" rows="3" placeholder="Brief description of your presentation"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-success" id="uploadBtn">Upload Presentation</button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Presentations List -->
                    <div class="presentations-section">
                        <div class="section-header">
                            <h4>📋 Your Team's Presentations</h4>
                            <button type="button" class="btn btn-secondary btn-small" id="refreshPresentations">Refresh</button>
                        </div>
                        <div id="presentationsList" class="presentations-list">
                            <p>Loading presentations...</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners for presentations functionality with proper timing
            setTimeout(() => {
                setupPresentationUpload();
                loadTeamPresentations();
            }, 200);
            break;
            
        case 'usn':
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3>🎓 USN Management</h3>
                        <p>Enter University Seat Numbers (USN) for your team members</p>
                    </div>
                    <div class="usn-controls">
                        <div class="controls-row">
                            <button type="button" class="btn btn-primary" id="refreshUSN">Refresh Data</button>
                            <button type="button" class="btn btn-success" id="saveAllUSN" style="display: none;">💾 Save All Changes</button>
                        </div>
                    </div>
                    <div id="usnContainer">
                        <p>Loading team members...</p>
                    </div>
                </div>
            `;
            
            // Load USN management data
            setTimeout(() => {
                loadUSNManagement();
            }, 200);
            break;
            
        case 'admin':
            window.location.href = 'admin.html';
            break;
    }
}

function addMemberRow() {
    const container = document.getElementById('membersContainer');
    const memberCount = container.querySelectorAll('.member-row').length + 1;
    const memberRow = document.createElement('div');
    memberRow.className = 'member-row';
    memberRow.innerHTML = `
        <div class="form-group">
            <label>Member ${memberCount} Full Name</label>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" placeholder="Member Name" class="member-name" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Gender</label>
                <select class="member-gender" required>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Stream</label>
                <div class="input-group">
                    <i class="fas fa-graduation-cap"></i>
                    <select class="member-stream" required>
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
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Semester</label>
                <select class="member-semester" required>
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
                <select class="member-category" required>
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
                <i class="fas fa-envelope"></i>
                <input type="email" placeholder="Member Email" class="member-email" required>
            </div>
        </div>
        
        <div class="form-group">
            <label>Mobile No.</label>
            <div class="input-group">
                <i class="fas fa-phone"></i>
                <input type="tel" placeholder="Member Mobile" class="member-mobile" required>
            </div>
        </div>
        
        <input type="hidden" class="member-position" value="Member">
        
        <button type="button" class="remove-member btn btn-danger">
            <i class="fas fa-trash"></i> Remove Member
        </button>
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

// Check team registration status and show appropriate interface
async function checkTeamRegistrationStatus() {
    const content = document.getElementById('dashboard-content');
    
    try {
        // Check if team is already registered
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('leader_id', currentUser.id)
            .single();
        
        if (teamError && teamError.code !== 'PGRST116') {
            console.error('Error fetching team data:', teamError);
            showTeamRegistrationForm();
            return;
        }
        
        if (teamData) {
            // Team is registered, show registered interface
            showRegisteredTeamInterface(teamData);
        } else {
            // No team registered, show registration form
            showTeamRegistrationForm();
        }
        
    } catch (error) {
        console.error('Error checking team status:', error);
        showTeamRegistrationForm();
    }
}

// Show interface for already registered team
async function showRegisteredTeamInterface(teamData) {
    const content = document.getElementById('dashboard-content');
    
    try {
        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', teamData.id)
            .order('position', { ascending: false }); // Leaders first
        
        if (membersError) {
            console.error('Error fetching team members:', membersError);
            return;
        }
        
        const leader = membersData.find(m => m.position === 'Leader');
        const members = membersData.filter(m => m.position === 'Member');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header team-registered-header">
                    <div class="status-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>Team Registered Successfully</span>
                    </div>
                </div>
                
                <div class="team-info-display">
                    <div class="team-summary">
                        <h3>🏆 ${teamData.team_name}</h3>
                        <div class="team-details-grid">
                            <div class="detail-item">
                                <label>Project Type:</label>
                                <span>${teamData.project_type || 'Not specified'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Problem Statement ID:</label>
                                <span>${teamData.sih_ps_id || 'Not specified'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Registration Date:</label>
                                <span>${new Date(teamData.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="team-members-display">
                        <h4>👑 Team Leader</h4>
                        ${leader ? `
                            <div class="member-display-card leader-card">
                                <div class="member-info">
                                    <h5>${leader.full_name}</h5>
                                    <div class="member-details">
                                        <span class="detail"><i class="fas fa-venus-mars"></i> ${leader.gender === 'M' ? 'Male' : 'Female'}</span>
                                        <span class="detail"><i class="fas fa-graduation-cap"></i> ${leader.stream}</span>
                                        <span class="detail"><i class="fas fa-calendar"></i> ${leader.semester} Semester</span>
                                        <span class="detail"><i class="fas fa-tag"></i> ${leader.category}</span>
                                    </div>
                                    <div class="contact-info">
                                        <span class="contact"><i class="fas fa-envelope"></i> ${leader.email}</span>
                                        <span class="contact"><i class="fas fa-phone"></i> ${leader.mobile}</span>
                                    </div>
                                </div>
                            </div>
                        ` : '<p class="no-data">Leader information not found</p>'}
                        
                        <h4>👥 Team Members</h4>
                        ${members.length > 0 ? `
                            <div class="members-grid">
                                ${members.map(member => `
                                    <div class="member-display-card">
                                        <div class="member-info">
                                            <h5>${member.full_name}</h5>
                                            <div class="member-details">
                                                <span class="detail"><i class="fas fa-venus-mars"></i> ${member.gender === 'M' ? 'Male' : 'Female'}</span>
                                                <span class="detail"><i class="fas fa-graduation-cap"></i> ${member.stream}</span>
                                                <span class="detail"><i class="fas fa-calendar"></i> ${member.semester} Semester</span>
                                                <span class="detail"><i class="fas fa-tag"></i> ${member.category}</span>
                                            </div>
                                            <div class="contact-info">
                                                <span class="contact"><i class="fas fa-envelope"></i> ${member.email}</span>
                                                <span class="contact"><i class="fas fa-phone"></i> ${member.mobile}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="no-data">No team members found</p>'}
                    </div>
                    
                    <div class="team-actions">
                        <button type="button" class="btn btn-primary" id="updateTeamBtn">
                            <i class="fas fa-edit"></i> Update Team Details
                        </button>
                        <button type="button" class="btn btn-secondary" id="refreshTeamBtn">
                            <i class="fas fa-sync"></i> Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('updateTeamBtn').addEventListener('click', () => {
            showTeamUpdateForm(teamData, membersData);
        });
        
        document.getElementById('refreshTeamBtn').addEventListener('click', () => {
            checkTeamRegistrationStatus();
        });
        
    } catch (error) {
        console.error('Error displaying registered team:', error);
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Error Loading Team Data</h3>
                </div>
                <div class="error-message">
                    <p>Unable to load team information. Please try again.</p>
                    <button type="button" class="btn btn-primary" onclick="checkTeamRegistrationStatus()">Retry</button>
                </div>
            </div>
        `;
    }
}

// Show team update form
function showTeamUpdateForm(teamData, membersData) {
    const content = document.getElementById('dashboard-content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-edit"></i> Update Team Details</h3>
                <button type="button" class="btn btn-secondary btn-small" id="cancelUpdateBtn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
            <div class="update-notice">
                <div class="notice-content">
                    <i class="fas fa-info-circle"></i>
                    <p>You are updating your existing team registration. Changes will be saved immediately.</p>
                </div>
            </div>
            ${renderTeamRegistrationForm(true)}
        </div>
    `;
    
    // Add event listeners
    document.getElementById('cancelUpdateBtn').addEventListener('click', () => {
        showRegisteredTeamInterface(teamData);
    });
    
    document.getElementById('teamForm').addEventListener('submit', (e) => {
        handleTeamUpdate(e, teamData);
    });
    
    document.getElementById('addMember').addEventListener('click', addMemberRow);
    
    // Add focus listeners and validation
    setTimeout(addFocusListeners, 100);
    setTimeout(addRealTimeValidation, 150);
    
    // Pre-fill form with existing data
    setTimeout(() => {
        prePopulateUpdateForm(teamData, membersData);
    }, 200);
}

// Show team registration form for new teams
function showTeamRegistrationForm() {
    const content = document.getElementById('dashboard-content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> Team Registration</h3>
            </div>
            ${renderTeamRegistrationForm(false)}
        </div>
    `;
    
    // Add event listeners for the form
    document.getElementById('teamForm').addEventListener('submit', handleTeamRegistration);
    document.getElementById('addMember').addEventListener('click', addMemberRow);
    
    // Add focus listeners for enhanced styling
    setTimeout(addFocusListeners, 100);
    
    // Add real-time validation
    setTimeout(addRealTimeValidation, 150);
}

// Render team registration form (reusable for both new and update)
function renderTeamRegistrationForm(isUpdate = false) {
    return `
        <form id="teamForm" class="team-form">
            <div class="form-group">
                <label for="projectType" class="required">Project Type</label>
                <select id="projectType" required>
                    <option value="">Select Project Type</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="sihPsId" class="required">Problem Statement ID</label>
                <div class="input-group">
                    <i class="fas fa-hashtag"></i>
                    <input type="number" id="sihPsId" required placeholder="Enter Problem Statement ID">
                </div>
            </div>
            
            <div class="form-group">
                <label for="teamName" class="required">Team Name (Unique)</label>
                <div class="input-group">
                    <i class="fas fa-signature"></i>
                    <input type="text" id="teamName" required placeholder="Enter your team name">
                </div>
            </div>
            
            <!-- Leader Details -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-user"></i> Leader Details</h3>
                </div>
                <div class="form-group">
                    <label for="leaderName" class="required">Full Name</label>
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="text" id="leaderName" required placeholder="Enter leader's full name">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="leaderGender" class="required">Gender</label>
                        <select id="leaderGender" required>
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="leaderStream" class="required">Stream</label>
                        <div class="input-group">
                            <i class="fas fa-graduation-cap"></i>
                            <select id="leaderStream" required>
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
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="leaderSemester" class="required">Semester</label>
                        <select id="leaderSemester" required>
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
                        <label for="leaderCategory" class="required">Category</label>
                        <select id="leaderCategory" required>
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
                    <label for="leaderEmail" class="required">Email ID</label>
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="leaderEmail" required placeholder="leader@example.com">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="leaderMobile" class="required">Mobile No.</label>
                    <div class="input-group">
                        <i class="fas fa-phone"></i>
                        <input type="tel" id="leaderMobile" required placeholder="Enter mobile number">
                    </div>
                </div>
                
                <input type="hidden" id="leaderPosition" value="Leader">
            </div>
            
            <!-- Team Members -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-users"></i> Team Members</h3>
                </div>
                <div id="membersContainer">
                    <div class="member-row">
                        <div class="form-group">
                            <label>Member 1 Full Name</label>
                            <div class="input-group">
                                <i class="fas fa-user"></i>
                                <input type="text" placeholder="Member Name" class="member-name" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Gender</label>
                                <select class="member-gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Stream</label>
                                <div class="input-group">
                                    <i class="fas fa-graduation-cap"></i>
                                    <select class="member-stream" required>
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
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Semester</label>
                                <select class="member-semester" required>
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
                                <select class="member-category" required>
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
                                <i class="fas fa-envelope"></i>
                                <input type="email" placeholder="Member Email" class="member-email" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Mobile No.</label>
                            <div class="input-group">
                                <i class="fas fa-phone"></i>
                                <input type="tel" placeholder="Member Mobile" class="member-mobile" required>
                            </div>
                        </div>
                        
                        <input type="hidden" class="member-position" value="Member">
                    </div>
                </div>
                <button type="button" id="addMember" class="btn btn-secondary">
                    <i class="fas fa-plus"></i> Add Another Member
                </button>
            </div>
            
            <button type="submit" class="btn ${isUpdate ? 'btn-primary' : 'btn-success'}">
                <i class="fas fa-${isUpdate ? 'save' : 'user-plus'}"></i> ${isUpdate ? 'Update Team' : 'Register Team'}
            </button>
        </form>
    `;
}

// Pre-populate update form with existing data
function prePopulateUpdateForm(teamData, membersData) {
    // Populate team data
    const teamNameElement = document.getElementById('teamName');
    if (teamNameElement) teamNameElement.value = teamData.team_name || '';
    
    const projectTypeElement = document.getElementById('projectType');
    if (projectTypeElement) projectTypeElement.value = teamData.project_type || '';
    
    const sihPsIdElement = document.getElementById('sihPsId');
    if (sihPsIdElement) sihPsIdElement.value = teamData.sih_ps_id || '';
    
    // Find leader and members
    const leader = membersData.find(m => m.position === 'Leader');
    const members = membersData.filter(m => m.position === 'Member');
    
    // Populate leader data
    if (leader) {
        const leaderNameElement = document.getElementById('leaderName');
        if (leaderNameElement) leaderNameElement.value = leader.full_name || '';
        
        const leaderGenderElement = document.getElementById('leaderGender');
        if (leaderGenderElement) leaderGenderElement.value = leader.gender || '';
        
        const leaderStreamElement = document.getElementById('leaderStream');
        if (leaderStreamElement) leaderStreamElement.value = leader.stream || '';
        
        const leaderSemesterElement = document.getElementById('leaderSemester');
        if (leaderSemesterElement) leaderSemesterElement.value = leader.semester || '';
        
        const leaderCategoryElement = document.getElementById('leaderCategory');
        if (leaderCategoryElement) leaderCategoryElement.value = leader.category || '';
        
        const leaderEmailElement = document.getElementById('leaderEmail');
        if (leaderEmailElement) leaderEmailElement.value = leader.email || '';
        
        const leaderMobileElement = document.getElementById('leaderMobile');
        if (leaderMobileElement) leaderMobileElement.value = leader.mobile || '';
    }
    
    // Clear and populate member data
    const membersContainer = document.getElementById('membersContainer');
    if (membersContainer) {
        while (membersContainer.children.length > 1) {
            membersContainer.removeChild(membersContainer.lastChild);
        }
        
        members.forEach((member, index) => {
            if (index > 0) {
                addMemberRow();
            }
            
            const memberRow = membersContainer.children[index];
            if (memberRow) {
                const nameElement = memberRow.querySelector('.member-name');
                if (nameElement) nameElement.value = member.full_name || '';
                
                const genderElement = memberRow.querySelector('.member-gender');
                if (genderElement) genderElement.value = member.gender || '';
                
                const streamElement = memberRow.querySelector('.member-stream');
                if (streamElement) streamElement.value = member.stream || '';
                
                const semesterElement = memberRow.querySelector('.member-semester');
                if (semesterElement) semesterElement.value = member.semester || '';
                
                const categoryElement = memberRow.querySelector('.member-category');
                if (categoryElement) categoryElement.value = member.category || '';
                
                const emailElement = memberRow.querySelector('.member-email');
                if (emailElement) emailElement.value = member.email || '';
                
                const mobileElement = memberRow.querySelector('.member-mobile');
                if (mobileElement) mobileElement.value = member.mobile || '';
            }
        });
    }
}

// Handle team update
async function handleTeamUpdate(e, existingTeamData) {
    e.preventDefault();
    
    try {
        // Get form data (reuse existing validation logic)
        const projectTypeElement = document.getElementById('projectType');
        const projectType = projectTypeElement ? projectTypeElement.value : '';
        
        const teamNameElement = document.getElementById('teamName');
        const teamName = teamNameElement ? teamNameElement.value : '';
        
        const sihPsIdElement = document.getElementById('sihPsId');
        const sihPsId = sihPsIdElement ? sihPsIdElement.value : '';
        
        // Get leader details
        const leaderDetails = {
            position: 'Leader',
            name: document.getElementById('leaderName') ? document.getElementById('leaderName').value : '',
            gender: document.getElementById('leaderGender') ? document.getElementById('leaderGender').value : '',
            stream: document.getElementById('leaderStream') ? document.getElementById('leaderStream').value : '',
            semester: document.getElementById('leaderSemester') ? document.getElementById('leaderSemester').value : '',
            category: document.getElementById('leaderCategory') ? document.getElementById('leaderCategory').value : '',
            email: document.getElementById('leaderEmail') ? document.getElementById('leaderEmail').value : '',
            mobile: document.getElementById('leaderMobile') ? document.getElementById('leaderMobile').value : ''
        };
        
        // Get team members
        const memberRows = document.querySelectorAll('.member-row');
        const members = [leaderDetails];
        
        memberRows.forEach(row => {
            const positionElement = row.querySelector('.member-position');
            const nameElement = row.querySelector('.member-name');
            const genderElement = row.querySelector('.member-gender');
            const streamElement = row.querySelector('.member-stream');
            const semesterElement = row.querySelector('.member-semester');
            const categoryElement = row.querySelector('.member-category');
            const emailElement = row.querySelector('.member-email');
            const mobileElement = row.querySelector('.member-mobile');
            
            const member = {
                position: positionElement ? positionElement.value : 'Member',
                name: nameElement ? nameElement.value : '',
                gender: genderElement ? genderElement.value : '',
                stream: streamElement ? streamElement.value : '',
                semester: semesterElement ? semesterElement.value : '',
                category: categoryElement ? categoryElement.value : '',
                email: emailElement ? emailElement.value : '',
                mobile: mobileElement ? mobileElement.value : ''
            };
            
            if (member.name) {
                members.push(member);
            }
        });
        
        // Update team record
        const { error: teamError } = await supabase
            .from('teams')
            .update({
                team_name: teamName,
                project_type: projectType,
                sih_ps_id: sihPsId,
                leader_name: leaderDetails.name,
                stream: leaderDetails.stream,
                semester: leaderDetails.semester,
                category: leaderDetails.category
            })
            .eq('id', existingTeamData.id);
        
        if (teamError) {
            throw new Error('Error updating team: ' + teamError.message);
        }
        
        // Delete existing team members
        const { error: deleteError } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', existingTeamData.id);
        
        if (deleteError) {
            throw new Error('Error updating team members: ' + deleteError.message);
        }
        
        // Insert updated team members
        const membersToInsert = members.map(member => ({
            team_id: existingTeamData.id,
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
            throw new Error('Error updating team members: ' + membersError.message);
        }
        
        alert('Team updated successfully!');
        checkTeamRegistrationStatus(); // Refresh the view
        
    } catch (error) {
        console.error('Error updating team:', error);
        alert('Error updating team: ' + error.message);
    }
}

async function loadExistingTeamData() {
    try {
        // Fetch existing team data for the current user
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('leader_id', currentUser.id)
            .single();
        
        if (teamError && teamError.code !== 'PGRST116') {
            console.error('Error fetching team data:', teamError);
            return;
        }
        
        if (!teamData) {
            // No existing team data
            return;
        }
        
        // Wait a bit to ensure the form is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Pre-fill the form with existing team data
        const teamNameElement = document.getElementById('teamName');
        if (teamNameElement) {
            teamNameElement.value = teamData.team_name || '';
        }
        
        const projectTypeElement = document.getElementById('projectType');
        if (projectTypeElement) {
            projectTypeElement.value = teamData.project_type || '';
        }
        
        const sihPsIdElement = document.getElementById('sihPsId');
        if (sihPsIdElement) {
            sihPsIdElement.value = teamData.sih_ps_id || '';
        }
        
        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', teamData.id);
        
        if (membersError) {
            console.error('Error fetching team members:', membersError);
            return;
        }
        
        // Find leader data from members
        const leaderData = membersData.find(member => member.position === 'Leader');
        
        if (leaderData) {
            // Populate all leader fields
            const fieldMappings = {
                'leaderName': 'full_name',
                'leaderGender': 'gender',
                'leaderStream': 'stream',
                'leaderSemester': 'semester',
                'leaderCategory': 'category',
                'leaderEmail': 'email',
                'leaderMobile': 'mobile'
            };
            
            Object.keys(fieldMappings).forEach(fieldId => {
                const element = document.getElementById(fieldId);
                const dataKey = fieldMappings[fieldId];
                
                if (element) {
                    element.value = leaderData[dataKey] || '';
                }
            });
        }
        
        // Clear existing member rows (except the first one)
        const membersContainer = document.getElementById('membersContainer');
        if (membersContainer) {
            while (membersContainer.children.length > 1) {
                membersContainer.removeChild(membersContainer.lastChild);
            }
            
            // Add member rows for each member (except the leader)
            const memberMembers = membersData.filter(member => member.position === 'Member');
            memberMembers.forEach((member, index) => {
                if (index > 0) {
                    addMemberRow();
                }
                
                const memberRow = membersContainer.children[index];
                if (memberRow) {
                    const fieldMappings = {
                        '.member-name': 'full_name',
                        '.member-gender': 'gender',
                        '.member-stream': 'stream',
                        '.member-semester': 'semester',
                        '.member-category': 'category',
                        '.member-email': 'email',
                        '.member-mobile': 'mobile'
                    };
                    
                    Object.keys(fieldMappings).forEach(selector => {
                        const element = memberRow.querySelector(selector);
                        const dataKey = fieldMappings[selector];
                        
                        if (element) {
                            element.value = member[dataKey] || '';
                        }
                    });
                }
            });
        }
        
        console.log('Existing team data loaded successfully');
    } catch (error) {
        console.error('Error loading existing team data:', error);
    }
}

// Test function to verify data loading
async function testDataLoading() {
    console.log('Testing data loading...');
    
    // Fetch existing team data for the current user
    const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_id', currentUser.id)
        .single();
    
    if (teamError && teamError.code !== 'PGRST116') {
        console.error('Error fetching team data:', teamError);
        return;
    }
    
    if (!teamData) {
        console.log('No existing team data found');
        return;
    }
    
    console.log('Team data:', teamData);
    
    // Fetch team members
    const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id);
    
    if (membersError) {
        console.error('Error fetching team members:', membersError);
        return;
    }
    
    console.log('Members data:', membersData);
    
    // Find leader data
    const leaderData = membersData.find(member => member.position === 'Leader');
    console.log('Leader data:', leaderData);
    
    // Check if leader fields are populated
    const leaderNameElement = document.getElementById('leaderName');
    const leaderStreamElement = document.getElementById('leaderStream');
    const leaderMobileElement = document.getElementById('leaderMobile');
    
    console.log('Leader name element value:', leaderNameElement ? leaderNameElement.value : 'Not found');
    console.log('Leader stream element value:', leaderStreamElement ? leaderStreamElement.value : 'Not found');
    console.log('Leader mobile element value:', leaderMobileElement ? leaderMobileElement.value : 'Not found');
}

async function handleTeamRegistration(e) {
    e.preventDefault();
    
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
    const projectTypeElement = document.getElementById('projectType');
    const projectType = projectTypeElement ? projectTypeElement.value : '';
    
    const teamNameElement = document.getElementById('teamName');
    const teamName = teamNameElement ? teamNameElement.value : '';
    
    const academicYearElement = document.getElementById('academicYear');
    const academicYear = academicYearElement ? academicYearElement.value : '2024-25'; // Default value
    
    const sihPsIdElement = document.getElementById('sihPsId');
    const sihPsId = sihPsIdElement ? sihPsIdElement.value : '';
    
    // Get leader details
    const leaderDetails = {
        position: 'Leader',
        name: document.getElementById('leaderName') ? document.getElementById('leaderName').value : '',
        gender: document.getElementById('leaderGender') ? document.getElementById('leaderGender').value : '',
        stream: document.getElementById('leaderStream') ? document.getElementById('leaderStream').value : '',
        semester: document.getElementById('leaderSemester') ? document.getElementById('leaderSemester').value : '',
        category: document.getElementById('leaderCategory') ? document.getElementById('leaderCategory').value : '',
        email: document.getElementById('leaderEmail') ? document.getElementById('leaderEmail').value : '',
        mobile: document.getElementById('leaderMobile') ? document.getElementById('leaderMobile').value : ''
    };
    
    // Get team members
    const memberRows = document.querySelectorAll('.member-row');
    const members = [leaderDetails]; // Include leader as first member
    
    memberRows.forEach(row => {
        const nameElement = row.querySelector('.member-name');
        const genderElement = row.querySelector('.member-gender');
        const streamElement = row.querySelector('.member-stream');
        const semesterElement = row.querySelector('.member-semester');
        const categoryElement = row.querySelector('.member-category');
        const emailElement = row.querySelector('.member-email');
        const mobileElement = row.querySelector('.member-mobile');
        
        const member = {
            position: 'Member',
            name: nameElement ? nameElement.value : '',
            gender: genderElement ? genderElement.value : '',
            stream: streamElement ? streamElement.value : '',
            semester: semesterElement ? semesterElement.value : '',
            category: categoryElement ? categoryElement.value : '',
            email: emailElement ? emailElement.value : '',
            mobile: mobileElement ? mobileElement.value : ''
        };
        
        // Only add member if they have a name
        if (member.name) {
            members.push(member);
        }
    });
    
    // Save to Supabase
    try {
        console.log('Checking for existing team for user:', currentUser.id);
        
        // First, check if team already exists for this user
        const { data: existingTeam, error: fetchError } = await supabase
            .from('teams')
            .select('id')
            .eq('leader_id', currentUser.id)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fetch error details:', {
                message: fetchError.message,
                code: fetchError.code,
                details: fetchError.details,
                hint: fetchError.hint
            });
            throw new Error('Error checking existing team: ' + fetchError.message);
        }
        
        let result;
        if (existingTeam) {
            console.log('Updating existing team:', existingTeam.id);
            
            // Update existing team
            const { data, error: updateError } = await supabase
                .from('teams')
                .update({
                    team_name: teamName,
                    project_type: projectType,
                    sih_ps_id: sihPsId, // Add Problem Statement ID
                    leader_name: leaderDetails.name,
                    stream: leaderDetails.stream,
                    semester: leaderDetails.semester,
                    category: leaderDetails.category
                })
                .eq('id', existingTeam.id);
            
            if (updateError) {
                console.error('Update error:', updateError);
                throw new Error('Error updating team: ' + updateError.message);
            }
            
            // Delete existing team members and insert new ones
            const { error: deleteError } = await supabase
                .from('team_members')
                .delete()
                .eq('team_id', existingTeam.id);
            
            if (deleteError) {
                console.error('Delete members error:', deleteError);
                throw new Error('Error updating team members: ' + deleteError.message);
            }
            
            // Insert updated team members
            const membersToInsert = members.map(member => ({
                team_id: existingTeam.id,
                position: member.position,
                full_name: member.name,
                gender: member.gender,
                stream: member.stream,
                semester: member.semester,
                category: member.category,
                email: member.email,
                mobile: member.mobile
            }));
            
            const { error: insertMembersError } = await supabase
                .from('team_members')
                .insert(membersToInsert);
            
            if (insertMembersError) {
                console.error('Insert members error:', insertMembersError);
                throw new Error('Error updating team members: ' + insertMembersError.message);
            }
            
            result = data;
        } else {
            console.log('Creating new team for user:', currentUser.id);
            
            // Insert new team
            const { data, error: insertError } = await supabase
                .from('teams')
                .insert({
                    team_name: teamName,
                    project_type: projectType,
                    sih_ps_id: sihPsId, // Add Problem Statement ID
                    leader_name: leaderDetails.name,
                    leader_id: currentUser.id,
                    stream: leaderDetails.stream,
                    semester: leaderDetails.semester,
                    category: leaderDetails.category
                })
                .select()
                .single();
            
            if (insertError) {
                console.error('Insert error details:', {
                    message: insertError.message,
                    code: insertError.code,
                    details: insertError.details,
                    hint: insertError.hint
                });
                throw new Error('Error creating team: ' + insertError.message);
            }
            
            // Insert team members
            const teamId = data.id;
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
                console.error('Members insert error:', membersError);
                throw new Error('Error creating team members: ' + membersError.message);
            }
            
            result = data;
        }
        
        console.log('Team saved successfully:', result);
        alert('Team details saved successfully!');
    } catch (error) {
        console.error('Error saving team details:', error);
        alert('Error saving team details: ' + error.message);
    }
}

async function loadAnnouncements() {
    try {
        // Fetch announcements from Supabase
        const { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }
        
        const announcementsList = document.getElementById('announcementsContainer');
        if (!announcementsList) return;
        
        if (announcements && announcements.length > 0) {
            announcementsList.innerHTML = announcements.map(announcement => `
                <div class="list-item">
                    <h4>${announcement.title}</h4>
                    <p>${announcement.content}</p>
                    <small>Posted on: ${new Date(announcement.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            announcementsList.innerHTML = '<p>No announcements available.</p>';
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        const announcementsList = document.getElementById('announcementsContainer');
        if (announcementsList) {
            announcementsList.innerHTML = '<p>Error loading announcements. Please try again later.</p>';
        }
    }
}

async function loadResources() {
    try {
        // Fetch resources from Supabase
        const { data: resources, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
        
        const resourcesList = document.getElementById('resourcesContainer');
        if (!resourcesList) return;
        
        if (resources && resources.length > 0) {
            resourcesList.innerHTML = resources.map(resource => {
                // Check if it's a file URL (from storage) or external link
                const isFile = resource.link && resource.link.includes('supabase.co/storage/v1/object/public/resources/');
                const displayText = isFile ? 'Download File' : 'Access Resource';
                
                return `
                <div class="list-item">
                    <h4>${resource.title}</h4>
                    <p><a href="${resource.link}" class="resource-link" target="_blank">${displayText}</a></p>
                </div>
            `}).join('');
        } else {
            resourcesList.innerHTML = '<p>No resources available.</p>';
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        const resourcesList = document.getElementById('resourcesContainer');
        if (resourcesList) {
            resourcesList.innerHTML = '<p>Error loading resources. Please try again later.</p>';
        }
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
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

// Function to check if user records exist
async function checkUserRecords(userId) {
    try {
        console.log('Checking user records for user ID:', userId);
        
        // Check users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        console.log('Users table record:', userData, userError);
        
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
    const addMemberBtn = document.getElementById('addMember');
    if (totalMembers >= 6) {
        addMemberBtn.disabled = true;
        addMemberBtn.innerHTML = '<i class="fas fa-users"></i> Maximum 6 Members Reached';
    } else {
        addMemberBtn.disabled = false;
        addMemberBtn.innerHTML = '<i class="fas fa-plus"></i> Add Another Member';
    }
    
    // Show warning if less than 6 members
    const warningElement = document.getElementById('teamSizeWarning');
    if (totalMembers < 6) {
        if (!warningElement) {
            const warning = document.createElement('div');
            warning.id = 'teamSizeWarning';
            warning.className = 'notification warning';
            warning.innerHTML = '<i class="fas fa-exclamation-circle"></i> Team must have exactly 6 members (including leader). Currently: ' + totalMembers;
            document.querySelector('#teamForm .card-header').appendChild(warning);
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
            document.querySelector('#teamForm .card-header').appendChild(warning);
        }
    } else if (warningElement) {
        warningElement.remove();
    }
}

// Add event listeners for real-time validation
function addRealTimeValidation() {
    // Team size validation
    document.getElementById('addMember').addEventListener('click', updateTeamSizeIndicator);
    
    // Gender validation
    document.getElementById('leaderGender').addEventListener('change', updateGenderIndicator);
    
    // Add gender change listeners to member rows
    document.addEventListener('click', function(e) {
        if (e.target.matches('#addMember')) {
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

// ============================================================================
// PRESENTATION UPLOAD FUNCTIONALITY
// ============================================================================

let selectedFile = null;
let uploadController = null;

// Setup presentation upload functionality
function setupPresentationUpload() {
    console.log('Setting up presentation upload...');
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const refreshBtn = document.getElementById('refreshPresentations');
    const cancelUploadBtn = document.getElementById('cancelUpload');
    
    // Debug logging
    console.log('Elements found:', {
        uploadArea: !!uploadArea,
        fileInput: !!fileInput,
        selectFileBtn: !!selectFileBtn,
        uploadForm: !!uploadForm,
        uploadBtn: !!uploadBtn,
        cancelBtn: !!cancelBtn,
        refreshBtn: !!refreshBtn,
        cancelUploadBtn: !!cancelUploadBtn
    });
    
    // Check if essential elements exist
    if (!uploadArea || !fileInput || !selectFileBtn) {
        console.error('Essential upload elements not found:', {
            uploadArea: !!uploadArea,
            fileInput: !!fileInput,
            selectFileBtn: !!selectFileBtn
        });
        return;
    }
    
    // File selection
    if (selectFileBtn && fileInput) {
        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleFileDrop);
    }
    
    // Form actions
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handlePresentationUpload);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetUploadForm);
    }
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', cancelCurrentUpload);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadTeamPresentations);
    }
    
    // Focus listeners for form inputs
    setTimeout(() => {
        const inputs = document.querySelectorAll('#uploadForm .input-group input, #uploadForm textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                const inputGroup = this.closest('.input-group');
                if (inputGroup) inputGroup.classList.add('focus');
            });
            
            input.addEventListener('blur', function() {
                const inputGroup = this.closest('.input-group');
                if (inputGroup) inputGroup.classList.remove('focus');
            });
        });
    }, 100);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        validateAndSetFile(files[0]);
    }
}

// Handle file selection
function handleFileSelection(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndSetFile(file);
    }
}

// Validate and set selected file
function validateAndSetFile(file) {
    // Check file type
    const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const isValidExtension = file.name.toLowerCase().endsWith('.ppt') || 
                            file.name.toLowerCase().endsWith('.pptx');
    
    if (!validTypes.includes(file.type) && !isValidExtension) {
        showModal('Please select a valid PowerPoint file (.ppt or .pptx)');
        return;
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showModal('File size exceeds the 10MB limit. Please choose a smaller file.');
        return;
    }
    
    selectedFile = file;
    showUploadForm(file);
}

// Show upload form with file details
function showUploadForm(file) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadForm = document.getElementById('uploadForm');
    
    if (!uploadArea || !uploadForm) {
        console.error('Upload area or form not found');
        showModal('Error: Upload interface not available. Please refresh the page.');
        return;
    }
    
    // Hide upload area, show form
    uploadArea.style.display = 'none';
    uploadForm.style.display = 'block';
    
    // Pre-fill presentation name with filename (without extension)
    setTimeout(() => {
        const presentationNameInput = document.getElementById('presentationName');
        if (presentationNameInput) {
            const fileName = file.name;
            const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            presentationNameInput.value = nameWithoutExt;
        }
    }, 100);
    
    // Update upload area to show selected file
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.innerHTML = `
        <div class="file-selected">
            <div class="file-icon">📄</div>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>Size: ${formatFileSize(file.size)}</p>
                <button type="button" class="btn btn-small btn-outline" onclick="resetUploadForm()">Choose Different File</button>
            </div>
        </div>
    `;
}

// Reset upload form
function resetUploadForm() {
    selectedFile = null;
    
    const uploadArea = document.getElementById('uploadArea');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    
    // Check if elements exist
    if (!uploadArea || !uploadForm) {
        console.error('Upload area or form not found during reset');
        return;
    }
    
    // Reset file input
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Hide form, show upload area
    uploadForm.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Reset upload area content
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.innerHTML = `
        <div class="upload-icon">📁</div>
        <h4>Drag & Drop your presentation here</h4>
        <p>or <button type="button" class="upload-btn" id="selectFileBtn">Choose File</button></p>
        <input type="file" id="fileInput" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="display: none;">
        <small>Supported formats: PPT, PPTX | Maximum size: 10MB</small>
    `;
    
    // Re-attach event listeners
    setTimeout(setupPresentationUpload, 100);
}

// Handle presentation upload
async function handlePresentationUpload() {
    if (!selectedFile) {
        showModal('Please select a file first.');
        return;
    }
    
    const presentationNameEl = document.getElementById('presentationName');
    const descriptionEl = document.getElementById('presentationDescription');
    
    if (!presentationNameEl) {
        showModal('Error: Presentation name field not found. Please refresh the page.');
        return;
    }
    
    const presentationName = presentationNameEl.value.trim();
    const description = descriptionEl ? descriptionEl.value.trim() : '';
    
    if (!presentationName) {
        showModal('Please enter a presentation name.');
        return;
    }
    
    try {
        // Check if user has a team
        const teamData = await getCurrentUserTeam();
        if (!teamData) {
            showModal('You must register your team first before uploading presentations.');
            return;
        }
        
        // Show upload progress
        showUploadProgress();
        
        // Create unique filename
        const fileExtension = selectedFile.name.split('.').pop();
        const timestamp = Date.now();
        const uniqueFileName = `${currentUser.id}_${timestamp}.${fileExtension}`;
        const filePath = `${currentUser.id}/${uniqueFileName}`;
        
        // Create abort controller for cancellation
        uploadController = new AbortController();
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('presentations')
            .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: false,
                signal: uploadController.signal
            });
        
        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload file: ' + uploadError.message);
        }
        
        // Save presentation metadata to database
        const { data: dbData, error: dbError } = await supabase
            .from('team_presentations')
            .insert({
                team_id: teamData.id,
                presentation_name: presentationName,
                file_name: selectedFile.name,
                file_path: filePath,
                file_size: selectedFile.size,
                file_type: selectedFile.type,
                uploaded_by: currentUser.id,
                description: description || null
            });
        
        if (dbError) {
            console.error('Database error:', dbError);
            // Try to delete uploaded file on database error
            await supabase.storage.from('presentations').remove([filePath]);
            throw new Error('Failed to save presentation data: ' + dbError.message);
        }
        
        // Success
        hideUploadProgress();
        showModal('Presentation uploaded successfully!', 'success');
        resetUploadForm();
        loadTeamPresentations();
        
    } catch (error) {
        console.error('Upload error:', error);
        hideUploadProgress();
        
        if (error.name !== 'AbortError') {
            showModal('Upload failed: ' + error.message);
        }
    } finally {
        uploadController = null;
    }
}

// Show upload progress
function showUploadProgress() {
    const uploadForm = document.getElementById('uploadForm');
    const uploadProgress = document.getElementById('uploadProgress');
    
    if (uploadForm) {
        uploadForm.style.display = 'none';
    }
    if (uploadProgress) {
        uploadProgress.style.display = 'block';
    }
    
    // Simulate progress (since Supabase doesn't provide real-time progress)
    simulateUploadProgress();
}

// Hide upload progress
function hideUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress');
    if (uploadProgress) {
        uploadProgress.style.display = 'none';
    }
}

// Simulate upload progress
function simulateUploadProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (!progressFill || !progressText) {
        console.error('Progress elements not found');
        return;
    }
    
    let progress = 0;
    const interval = setInterval(() => {
        if (uploadController && uploadController.signal.aborted) {
            clearInterval(interval);
            return;
        }
        
        progress += Math.random() * 15;
        if (progress > 95) progress = 95;
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }
        
        if (progress >= 95) {
            clearInterval(interval);
            if (progressText) {
                progressText.textContent = 'Processing...';
            }
        }
    }, 200);
}

// Cancel current upload
function cancelCurrentUpload() {
    if (uploadController) {
        uploadController.abort();
        uploadController = null;
    }
    
    hideUploadProgress();
    resetUploadForm();
}

// Get current user's team
async function getCurrentUserTeam() {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_id', currentUser.id)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching team:', error);
        return null;
    }
    
    return data;
}

// Load team presentations
async function loadTeamPresentations() {
    const presentationsList = document.getElementById('presentationsList');
    
    if (!presentationsList) {
        console.error('Presentations list element not found');
        return;
    }
    
    try {
        // Get user's team
        const teamData = await getCurrentUserTeam();
        if (!teamData) {
            presentationsList.innerHTML = `
                <div class="no-presentations">
                    <p>You must register your team first before managing presentations.</p>
                </div>
            `;
            return;
        }
        
        // Fetch presentations
        const { data: presentations, error } = await supabase
            .from('team_presentations')
            .select('*')
            .eq('team_id', teamData.id)
            .eq('is_active', true)
            .order('upload_date', { ascending: false });
        
        if (error) {
            console.error('Error loading presentations:', error);
            throw error;
        }
        
        if (!presentations || presentations.length === 0) {
            presentationsList.innerHTML = `
                <div class="no-presentations">
                    <div class="no-presentations-icon">📁</div>
                    <h4>No presentations uploaded yet</h4>
                    <p>Upload your first presentation using the form above.</p>
                </div>
            `;
            return;
        }
        
        // Display presentations
        presentationsList.innerHTML = presentations.map(presentation => `
            <div class="presentation-item" data-id="${presentation.id}">
                <div class="presentation-icon">
                    <div class="file-type-icon">📄</div>
                </div>
                <div class="presentation-details">
                    <h5>${presentation.presentation_name}</h5>
                    <p class="presentation-filename">${presentation.file_name}</p>
                    ${presentation.description ? `<p class="presentation-description">${presentation.description}</p>` : ''}
                    <div class="presentation-meta">
                        <span class="file-size">${formatFileSize(presentation.file_size)}</span>
                        <span class="upload-date">${formatDate(presentation.upload_date)}</span>
                        <span class="version">v${presentation.version}</span>
                    </div>
                </div>
                <div class="presentation-actions">
                    <button type="button" class="btn btn-small btn-outline" onclick="downloadPresentation('${presentation.id}')">Download</button>
                    <button type="button" class="btn btn-small btn-danger" onclick="deletePresentation('${presentation.id}')">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading presentations:', error);
        presentationsList.innerHTML = `
            <div class="error-message">
                <p>Error loading presentations. Please try again later.</p>
                <button type="button" class="btn btn-small" onclick="loadTeamPresentations()">Retry</button>
            </div>
        `;
    }
}

// Download presentation
async function downloadPresentation(presentationId) {
    try {
        // Get presentation data
        const { data: presentation, error } = await supabase
            .from('team_presentations')
            .select('*')
            .eq('id', presentationId)
            .single();
        
        if (error) {
            console.error('Error fetching presentation:', error);
            showModal('Error downloading presentation.');
            return;
        }
        
        // Get download URL
        const { data: urlData, error: urlError } = await supabase.storage
            .from('presentations')
            .createSignedUrl(presentation.file_path, 60); // 60 seconds expiry
        
        if (urlError) {
            console.error('Error creating download URL:', urlError);
            showModal('Error creating download link.');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = urlData.signedUrl;
        link.download = presentation.file_name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Download error:', error);
        showModal('Error downloading presentation.');
    }
}

// Delete presentation
async function deletePresentation(presentationId) {
    if (!confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Get presentation data
        const { data: presentation, error: fetchError } = await supabase
            .from('team_presentations')
            .select('*')
            .eq('id', presentationId)
            .single();
        
        if (fetchError) {
            console.error('Error fetching presentation:', fetchError);
            showModal('Error deleting presentation.');
            return;
        }
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('presentations')
            .remove([presentation.file_path]);
        
        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
        }
        
        // Delete from database
        const { error: dbError } = await supabase
            .from('team_presentations')
            .delete()
            .eq('id', presentationId);
        
        if (dbError) {
            console.error('Error deleting from database:', dbError);
            showModal('Error deleting presentation from database.');
            return;
        }
        
        showModal('Presentation deleted successfully!', 'success');
        loadTeamPresentations();
        
    } catch (error) {
        console.error('Delete error:', error);
        showModal('Error deleting presentation.');
    }
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Enhanced modal function for success messages
function showModal(message, type = 'error') {
    createModal();
    const modal = document.getElementById('validationModal');
    const header = modal.querySelector('.modal-header h3');
    const messageElement = document.getElementById('modalMessage');
    
    if (type === 'success') {
        header.textContent = 'Success';
        modal.classList.add('success');
    } else {
        header.textContent = 'Error';
        modal.classList.remove('success');
    }
    
    messageElement.textContent = message;
    modal.classList.add('show');
}

// ============================================================================
// DEPARTMENT SUMMARY FUNCTIONALITY
// ============================================================================

// Load department-wise student summary
async function loadDepartmentSummary() {
    const container = document.getElementById('departmentSummaryContainer');
    
    try {
        // Fetch all team members with team information
        const { data: members, error } = await supabase
            .from('team_members')
            .select(`
                *,
                teams:team_id (
                    team_name,
                    project_type,
                    semester,
                    category
                )
            `)
            .order('stream', { ascending: true })
            .order('full_name', { ascending: true });
        
        if (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
        
        if (!members || members.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">📊</div>
                    <h4>No student data available</h4>
                    <p>No teams have been registered yet.</p>
                </div>
            `;
            return;
        }
        
        // Group students by department/stream
        const departmentGroups = groupStudentsByDepartment(members);
        
        // Generate summary statistics
        const stats = generateSummaryStats(members, departmentGroups);
        
        // Render the summary
        container.innerHTML = renderDepartmentSummary(departmentGroups, stats);
        
    } catch (error) {
        console.error('Error loading department summary:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Error loading department summary. Please try again later.</p>
                <button type="button" class="btn btn-small" onclick="loadDepartmentSummary()">Retry</button>
            </div>
        `;
    }
}

// Group students by department/stream
function groupStudentsByDepartment(members) {
    const groups = {};
    
    members.forEach(member => {
        const stream = member.stream || 'Unknown';
        if (!groups[stream]) {
            groups[stream] = [];
        }
        groups[stream].push(member);
    });
    
    return groups;
}

// Generate summary statistics
function generateSummaryStats(members, departmentGroups) {
    const totalStudents = members.length;
    const totalDepartments = Object.keys(departmentGroups).length;
    
    // Gender distribution
    const genderCounts = members.reduce((acc, member) => {
        acc[member.gender] = (acc[member.gender] || 0) + 1;
        return acc;
    }, {});
    
    // Semester distribution
    const semesterCounts = members.reduce((acc, member) => {
        acc[member.semester] = (acc[member.semester] || 0) + 1;
        return acc;
    }, {});
    
    // Department sizes
    const departmentSizes = Object.keys(departmentGroups).map(dept => ({
        name: dept,
        count: departmentGroups[dept].length
    })).sort((a, b) => b.count - a.count);
    
    return {
        totalStudents,
        totalDepartments,
        genderCounts,
        semesterCounts,
        departmentSizes
    };
}

// Render department summary HTML with optional department filtering
function renderDepartmentSummary(departmentGroups, stats, selectedDepartment = 'all') {
    const statisticsHtml = `
        <div class="summary-statistics">
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-icon">🎓</div>
                    <div class="stat-content">
                        <h4>${stats.totalStudents}</h4>
                        <p>Total Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏫</div>
                    <div class="stat-content">
                        <h4>${stats.totalDepartments}</h4>
                        <p>Departments</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">♀️</div>
                    <div class="stat-content">
                        <h4>${stats.genderCounts.F || 0}</h4>
                        <p>Female Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">♂️</div>
                    <div class="stat-content">
                        <h4>${stats.genderCounts.M || 0}</h4>
                        <p>Male Students</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Filter departments based on selection
    let departmentsToShow = Object.keys(departmentGroups);
    if (selectedDepartment !== 'all') {
        departmentsToShow = departmentsToShow.filter(dept => dept === selectedDepartment);
    }
    
    const departmentsHtml = departmentsToShow
        .sort((a, b) => departmentGroups[b].length - departmentGroups[a].length)
        .map(department => {
            const students = departmentGroups[department];
            const femaleCount = students.filter(s => s.gender === 'F').length;
            const maleCount = students.filter(s => s.gender === 'M').length;
            
            return `
                <div class="department-section">
                    <div class="department-header">
                        <h3>
                            <span class="department-icon">📚</span>
                            ${department}
                            <span class="department-count">(${students.length} students)</span>
                        </h3>
                        <div class="department-stats">
                            <span class="gender-stat female">♀️ ${femaleCount}</span>
                            <span class="gender-stat male">♂️ ${maleCount}</span>
                        </div>
                    </div>
                    <div class="students-grid">
                        ${students.map(student => `
                            <div class="student-card">
                                <div class="student-header">
                                    <div class="student-name">${student.full_name}</div>
                                    <div class="student-gender ${student.gender === 'F' ? 'female' : 'male'}">
                                        ${student.gender === 'F' ? '♀️' : '♂️'}
                                    </div>
                                </div>
                                <div class="student-details">
                                    <div class="student-info">
                                        <span class="info-label">Position:</span>
                                        <span class="info-value ${student.position === 'Leader' ? 'leader' : 'member'}">${student.position}</span>
                                    </div>
                                    <div class="student-info">
                                        <span class="info-label">Semester:</span>
                                        <span class="info-value">${student.semester}</span>
                                    </div>
                                    <div class="student-info">
                                        <span class="info-label">Category:</span>
                                        <span class="info-value">${student.category}</span>
                                    </div>
                                    <div class="student-info">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value email">${student.email}</span>
                                    </div>
                                    <div class="student-info">
                                        <span class="info-label">Mobile:</span>
                                        <span class="info-value">${student.mobile}</span>
                                    </div>
                                    <div class="student-info">
                                        <span class="info-label">Team:</span>
                                        <span class="info-value team-name">${student.teams?.team_name || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    
    return statisticsHtml + departmentsHtml;
}

// Setup search functionality for department summary
function setupSummarySearch() {
    const searchInput = document.getElementById('searchStudents');
    const refreshBtn = document.getElementById('refreshSummary');
    const departmentFilter = document.getElementById('departmentFilter');
    const csvDownloadBtn = document.getElementById('downloadDepartmentCSV');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterStudentCards(searchTerm);
        });
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            const selectedDepartment = this.value;
            filterByDepartment(selectedDepartment);
        });
    }
    
    if (csvDownloadBtn) {
        csvDownloadBtn.addEventListener('click', function() {
            const selectedDepartment = this.getAttribute('data-department');
            if (selectedDepartment) {
                downloadDepartmentCSV(selectedDepartment);
            }
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadDepartmentSummary();
        });
    }
}

// Filter student cards based on search term
function filterStudentCards(searchTerm) {
    const studentCards = document.querySelectorAll('.student-card');
    const departmentSections = document.querySelectorAll('.department-section');
    
    studentCards.forEach(card => {
        const studentName = card.querySelector('.student-name').textContent.toLowerCase();
        const studentEmail = card.querySelector('.email').textContent.toLowerCase();
        const teamName = card.querySelector('.team-name').textContent.toLowerCase();
        
        const isVisible = searchTerm === '' || 
            studentName.includes(searchTerm) || 
            studentEmail.includes(searchTerm) || 
            teamName.includes(searchTerm);
        
        card.style.display = isVisible ? 'block' : 'none';
    });
    
    // Hide department sections that have no visible students
    departmentSections.forEach(section => {
        const visibleCards = section.querySelectorAll('.student-card:not([style*="display: none"])');
        section.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });
}

// Filter departments based on selected department
function filterByDepartment(selectedDepartment) {
    const departmentSections = document.querySelectorAll('.department-section');
    const csvDownloadBtn = document.getElementById('downloadDepartmentCSV');
    
    departmentSections.forEach(section => {
        const departmentHeader = section.querySelector('.department-header h3');
        if (departmentHeader) {
            const departmentName = departmentHeader.textContent.split('(')[0].trim();
            const departmentIcon = departmentName.split(' ')[1]; // Remove icon
            const actualDepartmentName = departmentName.replace(/📚\s*/, '').trim();
            
            const isVisible = selectedDepartment === 'all' || actualDepartmentName === selectedDepartment;
            section.style.display = isVisible ? 'block' : 'none';
        }
    });
    
    // Show/hide CSV download button based on selection
    if (csvDownloadBtn) {
        if (selectedDepartment !== 'all') {
            csvDownloadBtn.style.display = 'block';
            csvDownloadBtn.setAttribute('data-department', selectedDepartment);
        } else {
            csvDownloadBtn.style.display = 'none';
        }
    }
    
    // Also update statistics to reflect filtered data
    updateFilteredStatistics(selectedDepartment);
}

// Update statistics for filtered view
function updateFilteredStatistics(selectedDepartment) {
    if (selectedDepartment === 'all') {
        // Show all stats - reload to get original stats
        loadDepartmentSummary();
        return;
    }
    
    // Calculate stats for selected department only
    const visibleStudentCards = document.querySelectorAll('.department-section:not([style*="display: none"]) .student-card');
    const totalStudents = visibleStudentCards.length;
    
    let femaleCount = 0;
    let maleCount = 0;
    
    visibleStudentCards.forEach(card => {
        const genderElement = card.querySelector('.student-gender');
        if (genderElement && genderElement.classList.contains('female')) {
            femaleCount++;
        } else if (genderElement && genderElement.classList.contains('male')) {
            maleCount++;
        }
    });
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('h4').textContent = totalStudents;
        statCards[1].querySelector('h4').textContent = '1'; // Only one department shown
        statCards[2].querySelector('h4').textContent = femaleCount;
        statCards[3].querySelector('h4').textContent = maleCount;
    }
}

// Download CSV for selected department (regular dashboard)
async function downloadDepartmentCSV(selectedDepartment) {
    try {
        console.log('Downloading CSV for department:', selectedDepartment);
        
        // Fetch all team members for the selected department
        const { data: members, error } = await supabase
            .from('team_members')
            .select(`
                *,
                teams:team_id (
                    team_name,
                    project_type,
                    semester,
                    category
                )
            `)
            .eq('stream', selectedDepartment)
            .order('full_name', { ascending: true });
        
        if (error) {
            console.error('Error fetching department data:', error);
            alert('Error fetching department data: ' + error.message);
            return;
        }
        
        if (!members || members.length === 0) {
            alert('No students found in the selected department.');
            return;
        }
        
        // Create CSV content
        const csvHeaders = [
            'Full Name',
            'USN',
            'Gender',
            'Department',
            'Semester',
            'Category',
            'Email',
            'Mobile',
            'Position',
            'Team Name',
            'Project Type',
            'Team Semester',
            'Team Category',
            'Registration Date'
        ];
        
        let csvContent = csvHeaders.join(',') + '\n';
        
        members.forEach(member => {
            const row = [
                `"${member.full_name || ''}"`,
                `"${member.usn || ''}"`,
                `"${member.gender || ''}"`,
                `"${member.stream || ''}"`,
                `"${member.semester || ''}"`,
                `"${member.category || ''}"`,
                `"${member.email || ''}"`,
                `"${member.mobile || ''}"`,
                `"${member.position || ''}"`,
                `"${member.teams?.team_name || ''}"`,
                `"${member.teams?.project_type || ''}"`,
                `"${member.teams?.semester || ''}"`,
                `"${member.teams?.category || ''}"`,
                `"${member.created_at ? new Date(member.created_at).toLocaleDateString() : ''}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedDepartment}_students_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`CSV downloaded: ${selectedDepartment}_students_${dateStr}.csv`);
        
    } catch (error) {
        console.error('Error downloading department CSV:', error);
        alert('Error downloading CSV: ' + error.message);
    }
}

// ============================================================================
// USN MANAGEMENT FUNCTIONALITY
// ============================================================================

// Load USN management interface
async function loadUSNManagement() {
    const container = document.getElementById('usnContainer');
    const saveAllBtn = document.getElementById('saveAllUSN');
    const refreshBtn = document.getElementById('refreshUSN');
    
    try {
        // Get current user's team first
        const userTeam = await getCurrentUserTeam();
        
        // Try to get current user's team members with USN column
        let { data: teamMembers, error } = await supabase
            .from('team_members')
            .select(`
                id,
                full_name,
                position,
                stream,
                semester,
                email,
                mobile,
                usn,
                teams:team_id (
                    team_name
                )
            `)
            .eq('team_id', userTeam.id)
            .order('position', { ascending: false })
            .order('full_name', { ascending: true });
        
        // If USN column doesn't exist, try query without USN
        if (error && error.message.includes('column') && error.message.includes('usn')) {
            console.log('USN column not found, querying without USN...');
            const { data: membersWithoutUSN, error: fallbackError } = await supabase
                .from('team_members')
                .select(`
                    id,
                    full_name,
                    position,
                    stream,
                    semester,
                    email,
                    mobile,
                    teams:team_id (
                        team_name
                    )
                `)
                .eq('team_id', userTeam.id)
                .order('position', { ascending: false })
                .order('full_name', { ascending: true });
            
            if (fallbackError) {
                throw fallbackError;
            }
            
            // Add empty USN field to each member
            teamMembers = membersWithoutUSN.map(member => ({
                ...member,
                usn: null
            }));
            error = null;
        }
        
        if (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }
        
        if (!teamMembers || teamMembers.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">👥</div>
                    <h4>No Team Members Found</h4>
                    <p>You need to register your team first before managing USN numbers.</p>
                </div>
            `;
            return;
        }
        
        // Check if USN column exists by looking for fallback data
        const usnColumnExists = teamMembers.some(member => member.hasOwnProperty('usn'));
        
        // Render USN management interface
        container.innerHTML = renderUSNInterface(teamMembers, usnColumnExists);
        
        // Setup event listeners only if USN column exists
        if (usnColumnExists) {
            setupUSNEventListeners();
        }
        
    } catch (error) {
        console.error('Error loading USN management:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Error loading team members. Please try again later.</p>
                <button type="button" class="btn btn-small" onclick="loadUSNManagement()">Retry</button>
            </div>
        `;
    }
    
    // Setup refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadUSNManagement);
    }
}

// Get current user's team
async function getCurrentUserTeam() {
    const { data: teams, error } = await supabase
        .from('teams')
        .select('id, team_name')
        .eq('leader_id', currentUser.id)
        .single();
    
    if (error) {
        throw new Error('No team found for current user');
    }
    
    return teams;
}

// Render USN management interface
function renderUSNInterface(teamMembers, usnColumnExists = true) {
    const teamName = teamMembers[0]?.teams?.team_name || 'Your Team';
    
    // If USN column doesn't exist, show setup notice
    if (!usnColumnExists) {
        return `
            <div class="usn-setup-notice">
                <div class="setup-icon">⚠️</div>
                <h3>USN Column Setup Required</h3>
                <p>To use the USN management feature, you need to add the USN column to your database.</p>
                <div class="setup-instructions">
                    <h4>📋 Setup Instructions:</h4>
                    <ol>
                        <li>Execute the following SQL query in your Supabase SQL editor:</li>
                        <li><code>ALTER TABLE public.team_members ADD COLUMN usn VARCHAR(50);</code></li>
                        <li>Refresh this page after running the query</li>
                    </ol>
                </div>
                <div class="setup-actions">
                    <button type="button" class="btn btn-primary" onclick="loadUSNManagement()">
                        🔄 Check Again
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="copySetupSQL()">
                        📋 Copy SQL Query
                    </button>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="usn-management">
            <div class="team-info">
                <h4>📋 ${teamName}</h4>
                <p>Total Members: ${teamMembers.length}</p>
            </div>
            
            <div class="usn-table">
                <div class="table-header">
                    <div class="col-position">Position</div>
                    <div class="col-name">Full Name</div>
                    <div class="col-stream">Stream</div>
                    <div class="col-contact">Contact</div>
                    <div class="col-usn">USN</div>
                    <div class="col-status">Status</div>
                </div>
                
                ${teamMembers.map(member => `
                    <div class="table-row" data-member-id="${member.id}">
                        <div class="col-position">
                            <span class="position-badge ${member.position.toLowerCase()}">
                                ${member.position === 'Leader' ? '👑' : '👤'} ${member.position}
                            </span>
                        </div>
                        <div class="col-name">
                            <strong>${member.full_name}</strong>
                        </div>
                        <div class="col-stream">
                            ${member.stream} - ${member.semester}
                        </div>
                        <div class="col-contact">
                            <div>${member.email}</div>
                            <div>${member.mobile}</div>
                        </div>
                        <div class="col-usn">
                            <div class="usn-input-group">
                                <input type="text" 
                                       class="usn-input" 
                                       data-member-id="${member.id}"
                                       value="${member.usn || ''}"
                                       placeholder="Enter USN"
                                       maxlength="20"
                                       pattern="[A-Z0-9]+"
                                       title="Enter USN in uppercase letters and numbers">
                            </div>
                        </div>
                        <div class="col-status">
                            <span class="status-indicator ${member.usn ? 'completed' : 'pending'}">
                                ${member.usn ? '✅ Added' : '⏳ Pending'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="usn-summary">
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${teamMembers.filter(m => m.usn).length}</span>
                        <span class="stat-label">USNs Added</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${teamMembers.filter(m => !m.usn).length}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Math.round((teamMembers.filter(m => m.usn).length / teamMembers.length) * 100)}%</span>
                        <span class="stat-label">Complete</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup USN event listeners
function setupUSNEventListeners() {
    const saveAllBtn = document.getElementById('saveAllUSN');
    const usnInputs = document.querySelectorAll('.usn-input');
    
    // Input change detection
    usnInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Convert to uppercase
            e.target.value = e.target.value.toUpperCase();
            
            // Show save all button if there are changes
            const hasChanges = Array.from(usnInputs).some(inp => inp.value.trim() !== '');
            if (saveAllBtn && hasChanges) {
                saveAllBtn.style.display = 'inline-block';
            }
        });
        
        // Enter key to save
        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const memberId = e.target.dataset.memberId;
                await saveUSNForMember(memberId, e.target.value.trim());
            }
        });
    });
    
    // Save all button
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllUSNChanges);
    }
}

// Copy setup SQL to clipboard
function copySetupSQL() {
    const sqlQuery = 'ALTER TABLE public.team_members ADD COLUMN usn VARCHAR(50);';
    navigator.clipboard.writeText(sqlQuery).then(() => {
        alert('SQL query copied to clipboard!\n\nNow paste it in your Supabase SQL editor and run it.');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = sqlQuery;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('SQL query copied to clipboard!\n\nNow paste it in your Supabase SQL editor and run it.');
    });
}

// Save USN for individual member
async function saveUSNForMember(memberId, usn) {
    if (!usn) {
        alert('Please enter a USN before saving.');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('team_members')
            .update({ usn: usn })
            .eq('id', memberId);
        
        if (error) {
            console.error('Error saving USN:', error);
            if (error.message.includes('column') && error.message.includes('usn')) {
                alert('USN column not found in database. Please run the setup SQL query first.');
                loadUSNManagement(); // Reload to show setup notice
            } else {
                alert('Error saving USN: ' + error.message);
            }
            return;
        }
        
        // Update status indicator
        const row = document.querySelector(`[data-member-id="${memberId}"]`);
        const statusEl = row.querySelector('.status-indicator');
        statusEl.className = 'status-indicator completed';
        statusEl.textContent = '✅ Added';
        
        // Show success feedback
        const saveBtn = row.querySelector('.btn-save-usn');
        const originalContent = saveBtn.innerHTML;
        saveBtn.innerHTML = '✅';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
        }, 2000);
        
        // Update summary
        updateUSNSummary();
        
    } catch (error) {
        console.error('Error saving USN:', error);
        alert('Error saving USN. Please try again.');
    }
}

// Save all USN changes
async function saveAllUSNChanges() {
    const usnInputs = document.querySelectorAll('.usn-input');
    const updates = [];
    
    usnInputs.forEach(input => {
        const usn = input.value.trim();
        if (usn) {
            updates.push({
                id: input.dataset.memberId,
                usn: usn
            });
        }
    });
    
    if (updates.length === 0) {
        alert('No USN data to save.');
        return;
    }
    
    try {
        // Save all updates
        for (const update of updates) {
            const { error } = await supabase
                .from('team_members')
                .update({ usn: update.usn })
                .eq('id', update.id);
            
            if (error) {
                console.error(`Error saving USN for member ${update.id}:`, error);
                throw error;
            }
        }
        
        // Reload the interface to show updated data
        loadUSNManagement();
        
        // Show success message
        alert(`Successfully saved ${updates.length} USN record(s)!`);
        
    } catch (error) {
        console.error('Error saving USNs:', error);
        alert('Error saving USN data. Please try again.');
    }
}

// Update USN summary statistics
function updateUSNSummary() {
    const rows = document.querySelectorAll('.table-row');
    const completed = document.querySelectorAll('.status-indicator.completed').length;
    const pending = rows.length - completed;
    const percentage = Math.round((completed / rows.length) * 100);
    
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = completed;
        statNumbers[1].textContent = pending;
        statNumbers[2].textContent = percentage + '%';
    }
}
