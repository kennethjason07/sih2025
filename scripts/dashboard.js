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
            content.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Team Registration</h3>
                    </div>
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
                                        <input type="text" id="leaderStream" required placeholder="e.g., CSE, ECE, ME">
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
                                                <input type="text" placeholder="Stream" class="member-stream" required>
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
                        
                        <div class="form-group">
                            <label for="academicYear" class="required">Academic Year</label>
                            <div class="input-group">
                                <i class="fas fa-calendar"></i>
                                <input type="text" id="academicYear" value="2025–26" required readonly>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> Register Team
                        </button>
                    </form>
                </div>
            `;
            
            // Add event listeners for the form
            document.getElementById('teamForm').addEventListener('submit', handleTeamRegistration);
            document.getElementById('addMember').addEventListener('click', addMemberRow);
            
            // Load existing team data if available
            loadExistingTeamData();
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
                    <input type="text" placeholder="Stream" class="member-stream" required>
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
    
    // Get form data
    const projectType = document.getElementById('projectType').value;
    const teamName = document.getElementById('teamName').value;
    const academicYear = document.getElementById('academicYear').value;
    
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
            position: 'Member',
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
