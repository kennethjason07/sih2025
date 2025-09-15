// Supabase configuration
// Loaded from credentials.txt
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const teamForm = document.getElementById('teamRegistrationForm');
const addMemberBtn = document.getElementById('addMemberBtn');

// Add event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Pre-fill leader name with user's email
    document.getElementById('leaderEmail').value = user.email;
    
    // Add event listeners
    teamForm.addEventListener('submit', handleTeamRegistration);
    addMemberBtn.addEventListener('click', addMemberField);
    
    // Icon-related functionality removed as per user request
});

function addMemberField() {
    const container = document.getElementById('membersContainer');
    const memberCount = container.querySelectorAll('.member-row').length + 1;
    const memberRow = document.createElement('div');
    memberRow.className = 'member-row';
    memberRow.innerHTML = `
        <div class="form-group">
            <label>Member ${memberCount} Full Name</label>
            <div class="input-group">
                <input type="text" placeholder="Member Name" class="member-name">
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Gender</label>
                <select class="member-gender">
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Stream</label>
                <div class="input-group">
                    <input type="text" placeholder="Stream" class="member-stream">
                </div>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Semester</label>
                <select class="member-semester">
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
                <select class="member-category">
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
                <input type="email" placeholder="Member Email" class="member-email">
            </div>
        </div>
        
        <div class="form-group">
            <label>Mobile No.</label>
            <div class="input-group">
                <input type="tel" placeholder="Member Mobile" class="member-mobile">
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
                project_type: projectType,  // Add project_type
                leader_name: leaderDetails.name,
                leader_id: user.id,
                stream: leaderDetails.stream,
                semester: leaderDetails.semester,
                category: leaderDetails.category
                // Remove members field since we're storing in team_members table
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