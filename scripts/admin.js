// Supabase configuration
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const userEmailSpan = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// State
let currentUser = null;
let allTeams = []; // Store all teams for search filtering

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Ensure user exists in users table
    await ensureUserExists(user);
    
    // Check if user is admin (using role column in users table)
    const isAdmin = await checkIfAdmin(user);
    
    if (!isAdmin) {
        // Redirect to dashboard if not admin
        window.location.href = 'dashboard.html';
        return;
    }
    
    currentUser = user;
    userEmailSpan.textContent = user.email;
    
    // Add event listeners for navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // Add form event listeners
    document.getElementById('announcementForm').addEventListener('submit', handleAddAnnouncement);
    document.getElementById('resourceForm').addEventListener('submit', handleAddResource);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add registration status form event listener (will be attached when needed)
    setTimeout(() => {
        const registrationStatusForm = document.getElementById('registrationStatusForm');
        if (registrationStatusForm) {
            registrationStatusForm.addEventListener('submit', handleRegistrationStatusUpdate);
        }
    }, 100);
    
    // The refresh button is handled dynamically in the loadTeams function
    
    // Load initial data
    loadStatistics();
    loadAnnouncements();
    loadResources();
    loadTeams();
    
    // Show all sections by default
    switchView('dashboard');
    
    // Test download button availability
    setTimeout(() => {
        testDownloadButton();
    }, 1000);
});

// Function to switch between views
function switchView(view) {
    const adminContent = document.querySelector('.admin-content');
    
    // Hide all sections
    const sections = adminContent.querySelectorAll('.card');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    switch(view) {
        case 'dashboard':
            // Show statistics and both forms/lists
            document.querySelector('.admin-content .card:nth-child(1)').style.display = 'block'; // Statistics
            document.querySelector('.admin-content .card:nth-child(3)').style.display = 'block'; // Announcements
            document.querySelector('.admin-content .card:nth-child(4)').style.display = 'block'; // Resources
            document.querySelector('.admin-content .card:nth-child(5)').style.display = 'block'; // Teams
            break;
        case 'registration-control':
            document.getElementById('registrationControlCard').style.display = 'block';
            // Load registration status when switching to registration control
            loadRegistrationStatus();
            break;
        case 'announcements':
            document.querySelector('.admin-content .card:nth-child(3)').style.display = 'block'; // Announcements
            break;
        case 'resources':
            document.querySelector('.admin-content .card:nth-child(4)').style.display = 'block'; // Resources
            break;
        case 'teams':
            document.querySelector('.admin-content .card:nth-child(5)').style.display = 'block'; // Teams
            // Load teams when switching to teams view
            loadTeams();
            // Test if download button is available
            setTimeout(() => {
                testDownloadButton();
            }, 500);
            break;
        case 'view-ppt':
            document.getElementById('viewPptCard').style.display = 'block';
            // Debug admin access
            debugAdminPresentationAccess();
            // Load team presentations when switching to view PPT
            loadTeamPresentationsForAdmin();
            break;
        case 'summary':
            document.getElementById('summaryCard').style.display = 'block';
            // Load summary statistics when switching to summary view
            loadSummaryStats();
            break;
        case 'download-csv':
            document.getElementById('downloadCsvCard').style.display = 'block';
            // Attach event listener for download button
            setTimeout(() => {
                const downloadBtn = document.getElementById('downloadCsvPageBtn');
                if (downloadBtn) {
                    // Remove existing listener to prevent duplicates
                    downloadBtn.replaceWith(downloadBtn.cloneNode(true));
                    document.getElementById('downloadCsvPageBtn').addEventListener('click', downloadTeamsCsv);
                }
            }, 100);
            break;
        case 'department-summary':
            document.getElementById('departmentSummaryCard').style.display = 'block';
            // Load department summary when switching to department summary view
            setTimeout(() => {
                loadAdminDepartmentSummary();
                setupAdminSummarySearch();
            }, 100);
            break;
    }
}

async function loadStatistics() {
    try {
        // Fetch total number of teams
        const { count: totalTeams, error: teamsError } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true });
        
        if (teamsError) {
            console.error('Error fetching teams count:', teamsError);
        } else {
            document.getElementById('totalTeams').textContent = totalTeams || 0;
        }
        
        // Fetch total number of members
        const { count: totalMembers, error: membersError } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true });
        
        if (membersError) {
            console.error('Error fetching members count:', membersError);
        } else {
            document.getElementById('totalMembers').textContent = totalMembers || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function handleAddAnnouncement(e) {
    e.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    
    try {
        const { data, error } = await supabase
            .from('announcements')
            .insert([
                {
                    title: title,
                    content: content,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            console.error('Error adding announcement:', error);
            alert('Error adding announcement: ' + error.message);
            return;
        }
        
        console.log('Announcement added:', data);
        alert('Announcement added successfully!');
        
        // Reset form
        document.getElementById('announcementForm').reset();
        
        // Reload announcements
        loadAnnouncements();
        
        // Reload statistics
        loadStatistics();
    } catch (error) {
        console.error('Error adding announcement:', error);
        alert('Error adding announcement: ' + error.message);
    }
}

async function handleAddResource(e) {
    e.preventDefault();
    
    const title = document.getElementById('resourceTitle').value;
    const link = document.getElementById('resourceLink').value;
    const fileInput = document.getElementById('resourceFile');
    const file = fileInput.files[0];
    
    // Validate input
    if (!title) {
        alert('Please enter a title for the resource.');
        return;
    }
    
    if (!link && !file) {
        alert('Please either enter a link or select a file to upload.');
        return;
    }
    
    if (link && file) {
        alert('Please either enter a link or select a file, not both.');
        return;
    }
    
    try {
        let fileUrl = link || null;
        let fileName = null;
        
        // Handle file upload if a file is selected
        if (file) {
            // Show loading interface
            showLoadingInterface('Uploading file...');
            
            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileNameWithTimestamp = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            console.log('Uploading file:', file.name, 'as', fileNameWithTimestamp);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resources')
                .upload(fileNameWithTimestamp, file);
            
            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                hideLoadingInterface();
                alert('Error uploading file: ' + uploadError.message);
                return;
            }
            
            console.log('File uploaded successfully:', uploadData);
            
            // Get public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('resources')
                .getPublicUrl(fileNameWithTimestamp);
            
            fileUrl = publicUrlData.publicUrl;
            fileName = file.name;
            
            console.log('File URL:', fileUrl);
        }
        
        // Insert resource record into database
        console.log('Inserting resource record with URL:', fileUrl);
        
        const { data, error } = await supabase
            .from('resources')
            .insert([
                {
                    title: title,
                    link: fileUrl,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) {
            console.error('Error adding resource to database:', error);
            hideLoadingInterface();
            alert('Error adding resource: ' + error.message);
            return;
        }
        
        console.log('Resource added successfully:', data);
        hideLoadingInterface();
        alert('Resource added successfully!');
        
        // Reset form
        document.getElementById('resourceForm').reset();
        
        // Reload resources
        loadResources();
        
        // Reload statistics
        loadStatistics();
    } catch (error) {
        console.error('Error adding resource:', error);
        hideLoadingInterface();
        alert('Error adding resource: ' + error.message);
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
        
        const announcementsList = document.getElementById('announcementsList');
        if (!announcementsList) return;
        
        if (announcements && announcements.length > 0) {
            announcementsList.innerHTML = `
                <h4>Existing Announcements</h4>
                ${announcements.map(announcement => `
                    <div class="list-item">
                        <h5>${announcement.title}</h5>
                        <p>${announcement.content}</p>
                        <small>Posted on: ${new Date(announcement.created_at).toLocaleDateString()}</small>
                        <button class="btn btn-danger btn-small" onclick="deleteAnnouncement('${announcement.id}')">Delete</button>
                    </div>
                `).join('')}
            `;
        } else {
            announcementsList.innerHTML = '<h4>Existing Announcements</h4><p>No announcements available.</p>';
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        const announcementsList = document.getElementById('announcementsList');
        if (announcementsList) {
            announcementsList.innerHTML = '<h4>Existing Announcements</h4><p>Error loading announcements. Please try again later.</p>';
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
        
        const resourcesList = document.getElementById('resourcesList');
        if (!resourcesList) return;
        
        if (resources && resources.length > 0) {
            resourcesList.innerHTML = `
                <h4>Existing Resources</h4>
                ${resources.map(resource => {
                    // Check if it's a file URL (from storage) or external link
                    const isFile = resource.link && resource.link.includes('supabase.co/storage/v1/object/public/resources/');
                    const displayText = isFile ? 'Download File' : 'Access Resource';
                    
                    return `
                    <div class="list-item">
                        <h5>${resource.title}</h5>
                        <p><a href="${resource.link}" class="resource-link" target="_blank">${displayText}</a></p>
                        <small>Added on: ${new Date(resource.created_at).toLocaleDateString()}</small>
                        <button class="btn btn-danger btn-small" onclick="deleteResource('${resource.id}')">Delete</button>
                    </div>
                `}).join('')}
            `;
        } else {
            resourcesList.innerHTML = '<h4>Existing Resources</h4><p>No resources available.</p>';
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        const resourcesList = document.getElementById('resourcesList');
        if (resourcesList) {
            resourcesList.innerHTML = '<h4>Existing Resources</h4><p>Error loading resources. Please try again later.</p>';
        }
    }
}

// Function to attach event listeners for team buttons
function attachTeamButtonListeners() {
    // Add event listener for refresh button
    const refreshBtn = document.getElementById('refreshTeamsBtn');
    if (refreshBtn) {
        // Remove existing listener to prevent duplicates
        refreshBtn.replaceWith(refreshBtn.cloneNode(true));
        document.getElementById('refreshTeamsBtn').addEventListener('click', loadTeams);
    }
    
    // Add event listener for download CSV button
    const downloadBtn = document.getElementById('downloadCsvBtn');
    if (downloadBtn) {
        // Remove existing listener to prevent duplicates
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        document.getElementById('downloadCsvBtn').addEventListener('click', downloadTeamsCsv);
    }
    
    // Add event listeners for search functionality
    const searchInput = document.getElementById('teamSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        // Remove existing listeners to prevent duplicates
        searchInput.replaceWith(searchInput.cloneNode(true));
        const newSearchInput = document.getElementById('teamSearchInput');
        
        newSearchInput.addEventListener('input', handleTeamSearch);
        newSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                handleTeamSearch();
            }
        });
    }
    
    if (clearSearchBtn) {
        // Remove existing listener to prevent duplicates
        clearSearchBtn.replaceWith(clearSearchBtn.cloneNode(true));
        const newClearBtn = document.getElementById('clearSearchBtn');
        
        newClearBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('teamSearchInput');
            if (searchInput) {
                searchInput.value = '';
                handleTeamSearch();
            }
        });
    }
}

// Function to handle team search
function handleTeamSearch() {
    const searchInput = document.getElementById('teamSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const teamsContainer = document.getElementById('teamsContainer');
    
    if (!searchInput || !teamsContainer) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Show/hide clear button based on search input
    if (clearSearchBtn) {
        if (searchTerm) {
            clearSearchBtn.style.display = 'flex';
            clearSearchBtn.style.opacity = '1';
        } else {
            clearSearchBtn.style.opacity = '0';
            setTimeout(() => {
                if (clearSearchBtn.style.opacity === '0') {
                    clearSearchBtn.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Filter teams based on search term
    const filteredTeams = searchTerm 
        ? allTeams.filter(team => 
            team.team_name.toLowerCase().includes(searchTerm)
          )
        : allTeams;
    
    // Generate HTML for filtered teams
    if (filteredTeams.length > 0) {
        const teamsHTML = filteredTeams.map(team => {
            const hasPresentation = team.presentation_count > 0;
            const presentationText = hasPresentation 
                ? `View Presentations (${team.presentation_count})` 
                : 'No Presentations';
            const presentationClass = hasPresentation 
                ? 'btn btn-secondary btn-small view-team-presentations' 
                : 'btn btn-secondary btn-small view-team-presentations disabled';
                
            return `
                <div class="list-item">
                    <h5>Team: ${team.team_name}</h5>
                    <p><strong>Project Type:</strong> ${team.project_type || 'Not specified'}</p>
                    <p><strong>SIH PS ID:</strong> ${team.sih_ps_id || 'Not assigned'}</p>
                    <p><strong>Leader:</strong> ${team.leader_display || 'Unknown'}</p>
                    <p><strong>Members:</strong> ${team.team_members?.[0]?.count || 0} registered</p>
                    <p><strong>Presentations:</strong> <span class="presentation-count ${hasPresentation ? 'has-presentations' : 'no-presentations'}">${team.presentation_count}</span></p>
                    <p><strong>Registered on:</strong> ${new Date(team.created_at).toLocaleDateString()}</p>
                    <div class="team-buttons">
                        <button class="btn btn-primary btn-small view-team-details" data-team-id="${team.id}">
                            View Details
                        </button>
                        <button class="${presentationClass}" data-team-id="${team.id}" ${hasPresentation ? '' : 'disabled'}>
                            ${presentationText}
                        </button>
                        <button class="btn btn-danger btn-small delete-team-btn" data-team-id="${team.id}" data-team-name="${team.team_name}">
                            🗑️ Delete Team
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        teamsContainer.innerHTML = teamsHTML;
        
        // Re-attach event listeners for view details buttons
        document.querySelectorAll('.view-team-details').forEach(button => {
            button.addEventListener('click', function() {
                const teamId = this.getAttribute('data-team-id');
                viewTeamDetails(teamId);
            });
        });
        
        // Re-attach event listeners for view presentations buttons (only non-disabled ones)
        document.querySelectorAll('.view-team-presentations:not(.disabled)').forEach(button => {
            button.addEventListener('click', function() {
                const teamId = this.getAttribute('data-team-id');
                checkTeamPresentationsAndShow(teamId);
            });
        });
        
        // Add click handler for disabled presentation buttons to show info popup
        document.querySelectorAll('.view-team-presentations.disabled').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const teamElement = this.closest('.list-item');
                const teamName = teamElement.querySelector('h5').textContent.replace('Team: ', '');
                showModal(
                    'No Presentations', 
                    `<p><strong>${teamName}</strong> has not uploaded any presentations yet.</p><p>Presentations will appear here once the team uploads them.</p>`,
                    'info'
                );
            });
        });
        
        // Re-attach event listeners for delete team buttons
        document.querySelectorAll('.delete-team-btn').forEach(button => {
            button.addEventListener('click', function() {
                const teamId = this.getAttribute('data-team-id');
                const teamName = this.getAttribute('data-team-name');
                deleteTeam(teamId, teamName);
            });
        });
    } else {
        const noResultsMessage = searchTerm 
            ? `<p>No teams found matching "${searchTerm}". Try a different search term.</p>`
            : `<p>No teams registered yet.</p>`;
        teamsContainer.innerHTML = noResultsMessage;
    }
    
    // Update the teams count in the header
    const headerElement = document.querySelector('#teamsList h4');
    if (headerElement) {
        const totalCount = allTeams.length;
        const filteredCount = filteredTeams.length;
        
        if (searchTerm && filteredCount !== totalCount) {
            headerElement.textContent = `All Teams (${filteredCount} of ${totalCount} shown)`;
        } else {
            headerElement.textContent = `All Teams (${totalCount})`;
        }
    }
}

async function loadTeams() {
    try {
        // Fetch teams from Supabase with team members count
        const { data: teams, error } = await supabase
            .from('teams')
            .select(`
                id,
                team_name,
                project_type,
                created_at,
                leader_id,
                leader_name,
                sih_ps_id,
                team_members(count)
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
        
        // Store teams globally for search functionality
        allTeams = teams || [];
        
        // Clear any existing search when refreshing
        const searchInput = document.getElementById('teamSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Set leader information and presentation counts for each team
        if (teams && teams.length > 0) {
            teams.forEach(team => {
                // Use leader_name if available, otherwise we'll try to fetch email from users table
                team.leader_display = team.leader_name || 'Unknown';
                // Initialize presentation count
                team.presentation_count = 0;
            });
            
            // For teams with leader_id, try to fetch email from users table
            const leaderIds = teams
                .filter(team => team.leader_id)
                .map(team => team.leader_id);
            
            if (leaderIds.length > 0) {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, email')
                    .in('id', leaderIds);
                
                if (!usersError && users) {
                    // Create a map of user id to email
                    const userMap = {};
                    users.forEach(user => {
                        userMap[user.id] = user.email;
                    });
                    
                    // Update teams with email if available
                    teams.forEach(team => {
                        if (team.leader_id && userMap[team.leader_id]) {
                            team.leader_display = userMap[team.leader_id];
                        }
                    });
                }
            }
            
            // Fetch presentation counts for all teams
            const teamIds = teams.map(team => team.id);
            if (teamIds.length > 0) {
                const { data: presentations, error: presError } = await supabase
                    .from('team_presentations')
                    .select('team_id')
                    .in('team_id', teamIds)
                    .eq('is_active', true);
                    
                if (!presError && presentations) {
                    // Count presentations per team
                    const presentationCounts = {};
                    presentations.forEach(pres => {
                        presentationCounts[pres.team_id] = (presentationCounts[pres.team_id] || 0) + 1;
                    });
                    
                    // Update teams with presentation counts
                    teams.forEach(team => {
                        team.presentation_count = presentationCounts[team.id] || 0;
                    });
                }
            }
        }
        
        const teamsList = document.getElementById('teamsList');
        if (!teamsList) return;
        
        if (teams && teams.length > 0) {
            const teamsHTML = teams.map(team => {
                const hasPresentation = team.presentation_count > 0;
                const presentationText = hasPresentation 
                    ? `View Presentations (${team.presentation_count})` 
                    : 'No Presentations';
                const presentationClass = hasPresentation 
                    ? 'btn btn-secondary btn-small view-team-presentations' 
                    : 'btn btn-secondary btn-small view-team-presentations disabled';
                    
                return `
                    <div class="list-item">
                        <h5>Team: ${team.team_name}</h5>
                        <p><strong>Project Type:</strong> ${team.project_type || 'Not specified'}</p>
                        <p><strong>SIH PS ID:</strong> ${team.sih_ps_id || 'Not assigned'}</p>
                        <p><strong>Leader:</strong> ${team.leader_display || 'Unknown'}</p>
                        <p><strong>Members:</strong> ${team.team_members?.[0]?.count || 0} registered</p>
                        <p><strong>Presentations:</strong> <span class="presentation-count ${hasPresentation ? 'has-presentations' : 'no-presentations'}">${team.presentation_count}</span></p>
                        <p><strong>Registered on:</strong> ${new Date(team.created_at).toLocaleDateString()}</p>
                        <div class="team-buttons">
                            <button class="btn btn-primary btn-small view-team-details" data-team-id="${team.id}">
                                View Details
                            </button>
                            <button class="${presentationClass}" data-team-id="${team.id}" ${hasPresentation ? '' : 'disabled'}>
                                ${presentationText}
                            </button>
                            <button class="btn btn-danger btn-small delete-team-btn" data-team-id="${team.id}" data-team-name="${team.team_name}">
                                🗑️ Delete Team
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            teamsList.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4>All Teams (${teams.length})</h4>
                    <div class="teams-header-controls">
                        <div class="search-container">
                            <div class="input-group search-input-group">
                                <input type="text" id="teamSearchInput" placeholder="Search by team name..." class="search-input">
                                <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">
                                    ✕
                                </button>
                            </div>
                        </div>
                        <button id="refreshTeamsBtn" class="btn btn-secondary btn-small" style="width: auto;">
                            Refresh Teams
                        </button>
                    </div>
                </div>
                <div id="teamsContainer">
                    ${teamsHTML}
                </div>
            `;
            
            // Add event listeners for view details buttons
            document.querySelectorAll('.view-team-details').forEach(button => {
                button.addEventListener('click', function() {
                    const teamId = this.getAttribute('data-team-id');
                    viewTeamDetails(teamId);
                });
            });
            
            // Add event listeners for view presentations buttons (only non-disabled ones)
            document.querySelectorAll('.view-team-presentations:not(.disabled)').forEach(button => {
                button.addEventListener('click', function() {
                    const teamId = this.getAttribute('data-team-id');
                    checkTeamPresentationsAndShow(teamId);
                });
            });
            
            // Add click handler for disabled presentation buttons to show info popup
            document.querySelectorAll('.view-team-presentations.disabled').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const teamElement = this.closest('.list-item');
                    const teamName = teamElement.querySelector('h5').textContent.replace('Team: ', '');
                    showModal(
                        'No Presentations', 
                        `<p><strong>${teamName}</strong> has not uploaded any presentations yet.</p><p>Presentations will appear here once the team uploads them.</p>`,
                        'info'
                    );
                });
            });
            
            // Add event listeners for delete team buttons
            document.querySelectorAll('.delete-team-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const teamId = this.getAttribute('data-team-id');
                    const teamName = this.getAttribute('data-team-name');
                    deleteTeam(teamId, teamName);
                });
            });
            
            // Attach button listeners
            attachTeamButtonListeners();
        } else {
            // Clear teams array when no teams
            allTeams = [];
            
            teamsList.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4>All Teams</h4>
                    <div class="teams-header-controls">
                        <div class="search-container">
                            <div class="input-group search-input-group">
                                <input type="text" id="teamSearchInput" placeholder="Search by team name..." class="search-input">
                                <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">
                                    ✕
                                </button>
                            </div>
                        </div>
                        <button id="refreshTeamsBtn" class="btn btn-secondary btn-small" style="width: auto;">
                            Refresh Teams
                        </button>
                    </div>
                </div>
                <div id="teamsContainer">
                    <p>No teams registered yet.</p>
                </div>
            `;
            
            // Attach button listeners
            attachTeamButtonListeners();
        }
    } catch (error) {
        console.error('Error loading teams:', error);
        
        // Clear teams array on error
        allTeams = [];
        
        const teamsList = document.getElementById('teamsList');
        if (teamsList) {
            teamsList.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4>All Teams</h4>
                    <div class="teams-header-controls">
                        <div class="search-container">
                            <div class="input-group search-input-group">
                                <input type="text" id="teamSearchInput" placeholder="Search by team name..." class="search-input">
                                <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">
                                    ✕
                                </button>
                            </div>
                        </div>
                        <button id="refreshTeamsBtn" class="btn btn-secondary btn-small" style="width: auto;">
                            Refresh Teams
                        </button>
                    </div>
                </div>
                <div id="teamsContainer">
                    <p>Error loading teams. Please try again later.</p>
                </div>
            `;
            
            // Attach button listeners
            attachTeamButtonListeners();
        }
    }
}

// Function to load summary statistics
async function loadSummaryStats() {
    try {
        const summaryContent = document.getElementById('summaryContent');
        if (!summaryContent) return;
        
        // Show loading message
        summaryContent.innerHTML = '<p>Loading summary statistics...</p>';
        
        // Fetch all teams with their members
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select(`
                id,
                team_name,
                project_type
            `);
        
        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            summaryContent.innerHTML = '<p>Error loading summary statistics. Please try again later.</p>';
            return;
        }
        
        // Fetch all team members
        const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
                team_id,
                stream
            `);
        
        if (membersError) {
            console.error('Error fetching team members:', membersError);
            summaryContent.innerHTML = '<p>Error loading summary statistics. Please try again later.</p>';
            return;
        }
        
        // Process data to get teams per department
        const deptStats = {};
        const projectTypeStats = {};
        
        // Initialize department stats
        const departments = ['CSE', 'ISE', 'AIML', 'CSE-DS', 'ECE', 'EEE', 'CSE-AIML', 'CIVIL', 'ICB', 'MECHANICAL'];
        departments.forEach(dept => {
            deptStats[dept] = 0;
        });
        
        // Initialize project type stats
        projectTypeStats['Software'] = 0;
        projectTypeStats['Hardware'] = 0;
        
        // Process teams and members
        const teamDeptMap = {};
        
        // Group members by team
        const membersByTeam = {};
        members.forEach(member => {
            if (!membersByTeam[member.team_id]) {
                membersByTeam[member.team_id] = [];
            }
            membersByTeam[member.team_id].push(member.stream);
        });
        
        // For each team, determine which departments it belongs to
        teams.forEach(team => {
            // Update project type stats
            if (team.project_type) {
                projectTypeStats[team.project_type] = (projectTypeStats[team.project_type] || 0) + 1;
            }
            
            // Get streams for this team
            const teamStreams = membersByTeam[team.id] || [];
            
            // Create a set of unique departments for this team
            const teamDepts = new Set();
            teamStreams.forEach(stream => {
                if (departments.includes(stream)) {
                    teamDepts.add(stream);
                }
            });
            
            // Update department stats - each team counts for each department it has members from
            teamDepts.forEach(dept => {
                deptStats[dept] = (deptStats[dept] || 0) + 1;
            });
            
            // Store team departments for display
            teamDeptMap[team.id] = Array.from(teamDepts);
        });
        
        // Generate HTML for summary statistics
        let summaryHTML = `
            <div class="stats-container">
                <div class="stat-item">
                    <h4>${teams.length || 0}</h4>
                    <p>Total Teams</p>
                </div>
                <div class="stat-item">
                    <h4>${members.length || 0}</h4>
                    <p>Total Members</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Teams per Department</h3>
                </div>
                <div class="stats-container">
        `;
        
        // Add department stats
        departments.forEach(dept => {
            summaryHTML += `
                <div class="stat-item">
                    <h4>${deptStats[dept] || 0}</h4>
                    <p>${dept} Teams</p>
                </div>
            `;
        });
        
        summaryHTML += `
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Teams per Project Type</h3>
                </div>
                <div class="stats-container">
                    <div class="stat-item">
                        <h4>${projectTypeStats['Software'] || 0}</h4>
                        <p>Software Teams</p>
                    </div>
                    <div class="stat-item">
                        <h4>${projectTypeStats['Hardware'] || 0}</h4>
                        <p>Hardware Teams</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Department Breakdown</h3>
                </div>
                <div class="admin-list">
        `;
        
        // Add detailed department breakdown
        departments.forEach(dept => {
            const deptTeams = teams.filter(team => {
                const teamStreams = membersByTeam[team.id] || [];
                return teamStreams.includes(dept);
            });
            
            summaryHTML += `
                <div class="list-item">
                    <h4>${dept} Department</h4>
                    <p><strong>Teams:</strong> ${deptStats[dept] || 0}</p>
                    <p><strong>Team List:</strong> ${deptTeams.map(t => t.team_name).join(', ') || 'None'}</p>
                </div>
            `;
        });
        
        summaryHTML += `
                </div>
            </div>
        `;
        
        summaryContent.innerHTML = summaryHTML;
    } catch (error) {
        console.error('Error loading summary stats:', error);
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
            summaryContent.innerHTML = '<p>Error loading summary statistics. Please try again later.</p>';
        }
    }
}

// Function to view team details
async function viewTeamDetails(teamId) {
    try {
        // Fetch team details and members
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select(`
                id,
                team_name,
                project_type,
                created_at,
                leader_id,
                leader_name,
                sih_ps_id
            `)
            .eq('id', teamId)
            .single();
        
        if (teamError) {
            console.error('Error fetching team:', teamError);
            alert('Error fetching team details: ' + teamError.message);
            return;
        }
        
        // Set leader display name
        let leaderDisplay = team.leader_name || 'Unknown';
        
        // Try to fetch leader email if leader_id is available
        if (team.leader_id) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('email')
                .eq('id', team.leader_id)
                .single();
            
            if (!userError && userData) {
                leaderDisplay = userData.email;
            }
        }
        
        // Add leader display info to team object
        team.leader_display = leaderDisplay;
        
        // Fetch team members
        const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', teamId)
            .order('position', { ascending: true });
        
        if (membersError) {
            console.error('Error fetching team members:', membersError);
            alert('Error fetching team members: ' + membersError.message);
            return;
        }
        
        // Create modal to display team details
        createTeamDetailsModal(team, members);
    } catch (error) {
        console.error('Error viewing team details:', error);
        alert('Error viewing team details: ' + error.message);
    }
}

// Function to create team details modal
function createTeamDetailsModal(team, members) {
    // Remove existing modal if any
    const existingModal = document.getElementById('teamDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="teamDetailsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Team Details: ${team.team_name}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="team-info">
                        <p><strong>Project Type:</strong> ${team.project_type || 'Not specified'}</p>
                        <p><strong>SIH PS ID:</strong> ${team.sih_ps_id || 'Not assigned'}</p>
                        <p><strong>Leader:</strong> ${team.leader_display || 'Unknown'}</p>
                        <p><strong>Registered on:</strong> ${new Date(team.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="team-members">
                        <h4>Team Members</h4>
                        ${members.map(member => `
                            <div class="member-detail">
                                <h5>${member.full_name} ${member.position === 'Leader' ? '(Leader)' : ''}</h5>
                                <p><strong>Gender:</strong> ${member.gender}</p>
                                <p><strong>Stream:</strong> ${member.stream}</p>
                                <p><strong>Semester:</strong> ${member.semester}</p>
                                <p><strong>Category:</strong> ${member.category}</p>
                                <p><strong>Email:</strong> ${member.email}</p>
                                <p><strong>Mobile:</strong> ${member.mobile}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners to close modal
    document.querySelector('#teamDetailsModal .close-modal').addEventListener('click', closeModal);
    document.querySelector('#teamDetailsModal .close-modal-btn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    document.getElementById('teamDetailsModal').addEventListener('click', function(e) {
        if (e.target.id === 'teamDetailsModal') {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Show modal
    document.getElementById('teamDetailsModal').classList.add('show');
}

// Function to close modal
function closeModal() {
    const teamModal = document.getElementById('teamDetailsModal');
    if (teamModal) {
        teamModal.classList.remove('show');
        setTimeout(() => {
            if (teamModal.parentNode) {
                teamModal.remove();
            }
        }, 300);
    }
    
    // Also close any message modals
    const messageModal = document.getElementById('messageModal');
    if (messageModal) {
        messageModal.classList.remove('show');
        setTimeout(() => {
            if (messageModal.parentNode) {
                messageModal.remove();
            }
        }, 300);
    }
}

// Function to show a simple message modal
function showModal(title, message, type = 'info') {
    // Remove existing message modal if any
    const existingModal = document.getElementById('messageModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Determine icon based on type
    let icon = 'ℹ️';
    let headerColor = 'var(--primary)';
    if (type === 'error') {
        icon = '❌';
        headerColor = 'var(--danger)';
    } else if (type === 'success') {
        icon = '✅';
        headerColor = 'var(--success)';
    } else if (type === 'warning') {
        icon = '⚠️';
        headerColor = 'var(--warning)';
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="messageModal" class="modal">
            <div class="modal-content">
                <div class="modal-header" style="background: ${headerColor};">
                    <h3>${icon} ${title}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal-btn">OK</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners to close modal
    document.querySelector('#messageModal .close-modal').addEventListener('click', closeModal);
    document.querySelector('#messageModal .close-modal-btn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    document.getElementById('messageModal').addEventListener('click', function(e) {
        if (e.target.id === 'messageModal') {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Show modal
    document.getElementById('messageModal').classList.add('show');
}

// Simple loading toast functions
function showLoadingToast(message = 'Loading...') {
    const toast = document.createElement('div');
    toast.id = 'loadingToast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = `<span>⏳</span> ${message}`;
    document.body.appendChild(toast);
    return toast;
}

function hideLoadingToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting announcement:', error);
            alert('Error deleting announcement: ' + error.message);
            return;
        }
        
        console.log('Announcement deleted successfully');
        alert('Announcement deleted successfully!');
        
        // Reload announcements
        loadAnnouncements();
        
        // Reload statistics
        loadStatistics();
    } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement: ' + error.message);
    }
}

async function deleteResource(id) {
    if (!confirm('Are you sure you want to delete this resource? This will also delete any associated files.')) {
        return;
    }
    
    try {
        // First, get the resource to check if it has a file URL
        const { data: resource, error: fetchError } = await supabase
            .from('resources')
            .select('link')
            .eq('id', id)
            .single();
        
        if (fetchError) {
            console.error('Error fetching resource:', fetchError);
            alert('Error fetching resource: ' + fetchError.message);
            return;
        }
        
        // If the resource has a file URL, delete the file from storage
        if (resource.link && resource.link.includes('supabase.co/storage/v1/object/public/resources/')) {
            // Extract the file name from the URL
            const urlParts = resource.link.split('/');
            const fileName = urlParts[urlParts.length - 1];
            
            // Delete the file from storage
            const { error: deleteFileError } = await supabase.storage
                .from('resources')
                .remove([fileName]);
            
            if (deleteFileError) {
                console.error('Error deleting file from storage:', deleteFileError);
                // Continue with resource deletion even if file deletion fails
            }
        }
        
        // Delete the resource record from database
        const { error: deleteResourceError } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);
        
        if (deleteResourceError) {
            console.error('Error deleting resource:', deleteResourceError);
            alert('Error deleting resource: ' + deleteResourceError.message);
            return;
        }
        
        console.log('Resource deleted successfully');
        alert('Resource deleted successfully!');
        
        // Reload resources
        loadResources();
        
        // Reload statistics
        loadStatistics();
    } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Error deleting resource: ' + error.message);
    }
}

// Function to delete a team and all its associated data
async function deleteTeam(teamId, teamName) {
    // Show confirmation dialog
    const confirmed = await showDeleteConfirmationModal(teamName);
    if (!confirmed) {
        return;
    }
    
    const loadingToast = showLoadingToast('Deleting team...');
    
    try {
        console.log('Starting team deletion process for team:', teamId, teamName);
        
        // Step 1: Delete team presentations if they exist
        const { error: presentationError } = await supabase
            .from('team_presentations')
            .delete()
            .eq('team_id', teamId);
        
        if (presentationError && presentationError.code !== '42P01') { // 42P01 = table doesn't exist
            console.error('Error deleting team presentations:', presentationError);
            hideLoadingToast(loadingToast);
            showModal('Error', `Failed to delete team presentations: ${presentationError.message}`, 'error');
            return;
        }
        
        console.log('Team presentations deleted successfully');
        
        // Step 2: Delete team members (this will cascade delete team member registration data)
        const { error: membersError } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId);
        
        if (membersError) {
            console.error('Error deleting team members:', membersError);
            hideLoadingToast(loadingToast);
            showModal('Error', `Failed to delete team members: ${membersError.message}`, 'error');
            return;
        }
        
        console.log('Team members deleted successfully');
        
        // Step 3: Delete the team record (this is the final step)
        const { error: teamError } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);
        
        if (teamError) {
            console.error('Error deleting team:', teamError);
            hideLoadingToast(loadingToast);
            showModal('Error', `Failed to delete team: ${teamError.message}`, 'error');
            return;
        }
        
        console.log('Team deleted successfully');
        hideLoadingToast(loadingToast);
        
        // Show success message
        showModal('Success', 
            `<p><strong>${teamName}</strong> has been successfully deleted.</p>
             <p><strong>Deleted:</strong></p>
             <ul>
                <li>Team record and all team details</li>
                <li>All team member registration data</li>
                <li>All team presentations and uploads</li>
             </ul>
             <p><strong>Preserved:</strong> User login credentials remain intact</p>`, 
            'success'
        );
        
        // Refresh the teams list and statistics
        loadTeams();
        loadStatistics();
        
    } catch (error) {
        console.error('Unexpected error during team deletion:', error);
        hideLoadingToast(loadingToast);
        showModal('Error', `An unexpected error occurred: ${error.message}`, 'error');
    }
}

// Function to show delete confirmation modal
function showDeleteConfirmationModal(teamName) {
    return new Promise((resolve) => {
        // Remove existing modal if any
        const existingModal = document.getElementById('deleteConfirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create confirmation modal HTML
        const modalHTML = `
            <div id="deleteConfirmModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header" style="background: var(--danger);">
                        <h3>⚠️ Delete Team: ${teamName}</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="delete-warning">
                            <p><strong>WARNING:</strong> This action cannot be undone!</p>
                            
                            <div class="delete-details">
                                <h4>📝 What will be deleted:</h4>
                                <ul class="delete-list">
                                    <li>✗ Team record and all team information</li>
                                    <li>✗ All team member registration details</li>
                                    <li>✗ All uploaded presentations and files</li>
                                    <li>✗ All team activity history</li>
                                </ul>
                                
                                <h4>💾 What will be preserved:</h4>
                                <ul class="preserve-list">
                                    <li>✓ User login credentials (email/password)</li>
                                    <li>✓ User accounts remain active</li>
                                    <li>✓ Users can register new teams</li>
                                </ul>
                            </div>
                            
                            <div class="confirmation-text">
                                <p>Type the team name <strong>${teamName}</strong> to confirm deletion:</p>
                                <input type="text" id="confirmTeamName" placeholder="Enter team name to confirm" class="confirm-input">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary cancel-delete-btn">Cancel</button>
                        <button class="btn btn-danger confirm-delete-btn" disabled>Delete Team</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Get modal elements
        const modal = document.getElementById('deleteConfirmModal');
        const confirmInput = document.getElementById('confirmTeamName');
        const confirmButton = modal.querySelector('.confirm-delete-btn');
        const cancelButton = modal.querySelector('.cancel-delete-btn');
        const closeButton = modal.querySelector('.close-modal');
        
        // Enable/disable confirm button based on input
        confirmInput.addEventListener('input', function() {
            if (this.value.trim() === teamName) {
                confirmButton.disabled = false;
                confirmButton.classList.add('enabled');
            } else {
                confirmButton.disabled = true;
                confirmButton.classList.remove('enabled');
            }
        });
        
        // Handle confirm deletion
        confirmButton.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            resolve(true);
        });
        
        // Handle cancel/close
        const handleCancel = function() {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            resolve(false);
        };
        
        cancelButton.addEventListener('click', handleCancel);
        closeButton.addEventListener('click', handleCancel);
        
        // Close on escape key
        const handleEscape = function(e) {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Close when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target.id === 'deleteConfirmModal') {
                handleCancel();
            }
        });
        
        // Show modal
        modal.classList.add('show');
        
        // Focus on input
        setTimeout(() => {
            confirmInput.focus();
        }, 100);
    });
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

async function checkIfAdmin(user) {
    try {
        // First check if user exists in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (userError) {
            console.error('Error fetching user data:', userError);
            return false;
        }
        
        // Check if user has admin role
        return userData && userData.role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
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

// Global variable to store all teams for search functionality
let allTeamsWithPresentations = [];

// Load team presentations for admin view
async function loadTeamPresentationsForAdmin() {
    const container = document.getElementById('viewPptContent');
    if (!container) return;

    container.innerHTML = '<p class="fade-in">Loading team presentations...</p>';

    try {
        console.log('Admin loading teams and presentations...');
        
        // Fetch all teams
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id, team_name, leader_name, created_at')
            .order('team_name', { ascending: true });

        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            container.innerHTML = `<p>Error loading teams: ${teamsError.message}. Please try again.</p>`;
            return;
        }

        if (!teams || teams.length === 0) {
            container.innerHTML = '<p>No teams found.</p>';
            return;
        }

        console.log('Found teams:', teams.length);

        // Fetch all presentations with detailed info (try different approaches for admin access)
        let presentations, presError;
        
        // First try: Direct query (may fail due to RLS)
        const directResult = await supabase
            .from('team_presentations')
            .select('team_id, id, presentation_name, file_name, upload_date, is_active')
            .eq('is_active', true)
            .order('upload_date', { ascending: false });
        
        presentations = directResult.data;
        presError = directResult.error;
        
        // If direct query fails due to RLS, try with admin bypass
        if (presError && presError.code === 'PGRST301') {
            console.log('RLS blocking access, trying admin bypass...');
            
            // Alternative: Query with explicit admin check
            const adminResult = await supabase
                .from('team_presentations')
                .select(`
                    team_id, id, presentation_name, file_name, upload_date, is_active,
                    teams!team_presentations_team_id_fkey(team_name)
                `)
                .eq('is_active', true)
                .order('upload_date', { ascending: false });
            
            presentations = adminResult.data;
            presError = adminResult.error;
        }

        console.log('Presentations query result:', { presentations, presError });
        
        if (presError) {
            console.error('Error fetching presentations:', presError);
            // Continue without presentations data but show warning
            console.warn('Could not fetch presentations, showing teams without counts');
        }

        // Group presentations by team
        const presByTeam = {};
        if (presentations && !presError) {
            presentations.forEach(p => {
                if (!presByTeam[p.team_id]) presByTeam[p.team_id] = [];
                presByTeam[p.team_id].push(p);
            });
        }

        console.log('Presentations by team:', presByTeam);

        // Store teams with presentation data globally for search
        allTeamsWithPresentations = teams.map(team => ({
            ...team,
            presentationCount: presByTeam[team.id]?.length || 0,
            presentations: presByTeam[team.id] || []
        }));

        // Build interface with search bar - show all teams initially
        const html = `
            <div class="admin-list">
                <div class="admin-ppt-header">
                    <div class="admin-ppt-search">
                        <div class="teams-header-controls">
                            <div class="search-container">
                                <div class="input-group search-input-group">
                                    <input type="text" id="adminTeamSearchInput" placeholder="Search teams by name or leader..." class="search-input">
                                    <button id="adminClearSearchBtn" class="clear-search-btn" style="display: none;">
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <button id="refreshViewPptBtn" class="btn btn-secondary btn-small">Refresh</button>
                        </div>
                    </div>
                    <div class="teams-count">
                        <h4>Teams: ${allTeamsWithPresentations.length} | Total Presentations: ${allTeamsWithPresentations.reduce((sum, t) => sum + t.presentationCount, 0)}</h4>
                    </div>
                </div>
                <div id="adminTeamsContainer">
                    ${allTeamsWithPresentations.length > 0 ? allTeamsWithPresentations.map(team => {
                        const count = team.presentationCount;
                        return `
                            <div class="list-item admin-team-card">
                                <h5>Team: ${team.team_name}</h5>
                                <p><strong>Leader:</strong> ${team.leader_name || 'Unknown'}</p>
                                <p><strong>Presentations:</strong> ${count} <span class="presentation-count ${count === 0 ? 'zero' : ''}">${count}</span></p>
                                <button class="btn btn-primary btn-small view-team-ppts" data-team-id="${team.id}" ${count === 0 ? 'disabled' : ''}>
                                    ${count === 0 ? 'No Presentations' : 'View Presentations (' + count + ')'}
                                </button>
                            </div>
                        `;
                    }).join('') : `
                        <div class="admin-no-presentations">
                            <h4>No teams available</h4>
                            <p>No teams have been registered yet.</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Attach search listeners
        setupAdminSearchListeners();

        // Attach other listeners
        const refreshBtn = document.getElementById('refreshViewPptBtn');
        if (refreshBtn) {
            refreshBtn.replaceWith(refreshBtn.cloneNode(true));
            document.getElementById('refreshViewPptBtn').addEventListener('click', () => {
                // Clear search input when refreshing
                const searchInput = document.getElementById('adminTeamSearchInput');
                if (searchInput) {
                    searchInput.value = '';
                }
                loadTeamPresentationsForAdmin();
            });
        }

        document.querySelectorAll('.view-team-ppts').forEach(btn => {
            btn.addEventListener('click', () => {
                const teamId = btn.getAttribute('data-team-id');
                viewTeamPresentations(teamId);
            });
        });

    } catch (error) {
        console.error('Error loading admin team presentations:', error);
        container.innerHTML = `<p>Error loading presentations: ${error.message}. Please check your database setup and admin permissions.</p>`;
    }
}

// Setup search functionality for admin teams
function setupAdminSearchListeners() {
    const searchInput = document.getElementById('adminTeamSearchInput');
    const clearBtn = document.getElementById('adminClearSearchBtn');
    
    if (searchInput) {
        // Remove existing listeners
        searchInput.replaceWith(searchInput.cloneNode(true));
        const newSearchInput = document.getElementById('adminTeamSearchInput');
        
        newSearchInput.addEventListener('input', handleAdminTeamSearch);
        newSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                handleAdminTeamSearch();
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.replaceWith(clearBtn.cloneNode(true));
        const newClearBtn = document.getElementById('adminClearSearchBtn');
        
        newClearBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('adminTeamSearchInput');
            if (searchInput) {
                searchInput.value = '';
                handleAdminTeamSearch();
            }
        });
    }
}

// Handle team search for admin
function handleAdminTeamSearch() {
    const searchInput = document.getElementById('adminTeamSearchInput');
    const clearBtn = document.getElementById('adminClearSearchBtn');
    const container = document.getElementById('adminTeamsContainer');
    
    if (!searchInput || !container) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Show/hide clear button
    if (clearBtn) {
        if (searchTerm) {
            clearBtn.style.display = 'flex';
            clearBtn.style.opacity = '1';
        } else {
            clearBtn.style.opacity = '0';
            setTimeout(() => {
                if (clearBtn.style.opacity === '0') {
                    clearBtn.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Filter teams locally instead of reloading from database
    const filteredTeams = searchTerm 
        ? allTeamsWithPresentations.filter(team => 
            team.team_name.toLowerCase().includes(searchTerm) ||
            (team.leader_name && team.leader_name.toLowerCase().includes(searchTerm))
          )
        : allTeamsWithPresentations;
    
    // Update the teams container with filtered results
    if (filteredTeams.length > 0) {
        container.innerHTML = filteredTeams.map(team => {
            const count = team.presentationCount;
            return `
                <div class="list-item admin-team-card">
                    <h5>Team: ${team.team_name}</h5>
                    <p><strong>Leader:</strong> ${team.leader_name || 'Unknown'}</p>
                    <p><strong>Presentations:</strong> ${count} <span class="presentation-count ${count === 0 ? 'zero' : ''}">${count}</span></p>
                    <button class="btn btn-primary btn-small view-team-ppts" data-team-id="${team.id}" ${count === 0 ? 'disabled' : ''}>
                        ${count === 0 ? 'No Presentations' : 'View Presentations (' + count + ')'}
                    </button>
                </div>
            `;
        }).join('');
        
        // Re-attach event listeners for view presentations buttons
        document.querySelectorAll('.view-team-ppts').forEach(btn => {
            btn.addEventListener('click', () => {
                const teamId = btn.getAttribute('data-team-id');
                viewTeamPresentations(teamId);
            });
        });
    } else {
        container.innerHTML = `
            <div class="admin-no-presentations">
                <h4>${searchTerm ? 'No teams found' : 'No teams available'}</h4>
                <p>${searchTerm ? `No teams match "${searchTerm}". Try a different search term.` : 'No teams have been registered yet.'}</p>
            </div>
        `;
    }
    
    // Update the header count
    const headerElement = document.querySelector('.teams-count h4');
    if (headerElement) {
        const totalCount = allTeamsWithPresentations.length;
        const filteredCount = filteredTeams.length;
        const totalPresentations = filteredTeams.reduce((sum, t) => sum + t.presentationCount, 0);
        
        if (searchTerm && filteredCount !== totalCount) {
            headerElement.textContent = `Teams: ${filteredCount} of ${totalCount} | Total Presentations: ${totalPresentations}`;
        } else {
            headerElement.textContent = `Teams: ${totalCount} | Total Presentations: ${totalPresentations}`;
        }
    }
}

// Check if team has presentations and navigate to presentations view
// Note: This function should only be called for teams that have presentations
// since the UI already shows the correct state
async function checkTeamPresentationsAndShow(teamId) {
    try {
        // Navigate to presentations view
        switchView('view-ppt');
        // Update sidebar active state
        document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        document.querySelector('[data-view="view-ppt"]').classList.add('active');
        // Small delay to ensure the view is loaded before calling viewTeamPresentations
        setTimeout(() => {
            viewTeamPresentations(teamId);
        }, 100);
        
    } catch (error) {
        console.error('Error navigating to presentations:', error);
        showModal('Error', 'An error occurred while loading presentations. Please try again.', 'error');
    }
}

// View presentations for a specific team
async function viewTeamPresentations(teamId) {
    const container = document.getElementById('viewPptContent');
    if (!container) return;

    try {
        // Fetch team info
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, team_name, leader_name')
            .eq('id', teamId)
            .single();

        if (teamError) {
            console.error('Error fetching team:', teamError);
            alert('Error loading team details');
            return;
        }

        // Fetch presentations
        const { data: presentations, error: presError } = await supabase
            .from('team_presentations')
            .select('*')
            .eq('team_id', teamId)
            .order('upload_date', { ascending: false });

        if (presError) {
            console.error('Error fetching presentations:', presError);
            alert('Error loading presentations');
            return;
        }

        // Build presentation list with actions
        const html = `
            <div class="admin-list">
                <div class="team-presentation-header">
                    <h3>📋 Presentations for: ${team.team_name}</h3>
                    <button id="backToTeamsBtn" class="btn btn-secondary btn-small back-nav-btn">Back to Teams</button>
                </div>
                ${presentations && presentations.length > 0 ? presentations.map(p => {
                    const fileSize = p.file_size ? formatFileSize(p.file_size) : 'Unknown size';
                    const uploadDate = new Date(p.upload_date).toLocaleString();
                    return `
                        <div class="presentation-item-admin">
                            <div class="presentation-details-admin">
                                <h5>📄 ${p.presentation_name} <small style="color:#64748b;">(v${p.version || 1})</small></h5>
                                <p><strong>File:</strong> ${p.file_name}</p>
                                ${p.description ? `<p><strong>Description:</strong> ${p.description}</p>` : ''}
                                <div class="presentation-meta-admin">
                                    <span><strong>Size:</strong> ${fileSize}</span>
                                    <span><strong>Uploaded:</strong> ${uploadDate}</span>
                                    <span><strong>Type:</strong> ${p.file_name.split('.').pop().toUpperCase()}</span>
                                </div>
                            </div>
                            <div class="admin-ppt-actions">
                                <button class="btn btn-outline" data-action="download" data-path="${p.file_path}" data-filename="${p.file_name}">
                                    ⬇️ Download
                                </button>
                                <button class="btn btn-primary" data-action="preview" data-path="${p.file_path}">
                                    🔍 Preview
                                </button>
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="admin-no-presentations"><h4>No presentations uploaded for this team</h4><p>This team has not uploaded any presentations yet.</p></div>'}
            </div>
        `;

        container.innerHTML = html;

        // Back button
        const backBtn = document.getElementById('backToTeamsBtn');
        if (backBtn) {
            backBtn.addEventListener('click', loadTeamPresentationsForAdmin);
        }

        // Attach action handlers
        container.querySelectorAll('[data-action="download"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const path = btn.getAttribute('data-path');
                const filename = btn.getAttribute('data-filename');
                await adminDownloadPresentation(path, filename);
            });
        });

        container.querySelectorAll('[data-action="preview"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const path = btn.getAttribute('data-path');
                await adminPreviewPresentation(path);
            });
        });

    } catch (error) {
        console.error('Error viewing team presentations:', error);
        container.innerHTML = '<p>Error loading team presentations.</p>';
    }
}

// Admin download presentation
async function adminDownloadPresentation(filePath, fileName) {
    try {
        const { data, error } = await supabase.storage
            .from('presentations')
            .createSignedUrl(filePath, 120);

        if (error) throw error;

        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = fileName || 'presentation.pptx';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download presentation.');
    }
}

// Admin preview presentation (uses signed URL and opens in new tab; browsers may download PPT instead of inline view)
async function adminPreviewPresentation(filePath) {
    try {
        const { data, error } = await supabase.storage
            .from('presentations')
            .createSignedUrl(filePath, 120);

        if (error) throw error;

        // Try to open in a new tab. Many browsers download PPTs; if so, users can use Download.
        window.open(data.signedUrl, '_blank');
    } catch (error) {
        console.error('Preview error:', error);
        alert('Failed to open preview. Try downloading instead.');
    }
}

// Debug function to test admin access to presentations
async function debugAdminPresentationAccess() {
    console.log('=== DEBUGGING ADMIN PRESENTATION ACCESS ===');
    
    try {
        // Test current user role
        const { data: currentUserData, error: userError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('id', currentUser.id)
            .single();
        
        console.log('Current user:', currentUserData, 'Error:', userError);
        
        // Test direct presentations query
        const { data: presentations, error: presError } = await supabase
            .from('team_presentations')
            .select('*')
            .limit(5);
        
        console.log('Direct presentations query:', presentations, 'Error:', presError);
        
        // Test teams query
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id, team_name')
            .limit(3);
        
        console.log('Teams query:', teams, 'Error:', teamsError);
        
        // Test RLS bypass for admin - direct query using admin policies
        const { data: allPresentations, error: allPresError } = await supabase
            .from('team_presentations')
            .select('*');
        
        console.log('All presentations (RPC):', allPresentations, 'Error:', allPresError);
        
    } catch (error) {
        console.error('Debug error:', error);
    }
    
    console.log('=== END DEBUG ===');
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to test if download button is available
function testDownloadButton() {
    console.log('Testing download button availability...');
    const downloadBtn = document.getElementById('downloadCsvPageBtn');
    if (downloadBtn) {
        console.log('Download button found:', downloadBtn);
        console.log('Download button click handlers:', downloadBtn.onclick);
    } else {
        console.log('Download button not found');
    }
}

// Function to download teams data as CSV
async function downloadTeamsCsv() {
    console.log('Download CSV button clicked');
    try {
        // Show loading interface
        showLoadingInterface('Generating CSV file...');
        
        // Fetch all teams with their members
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select(`
                id,
                team_name,
                project_type,
                sih_ps_id,
                leader_name,
                leader_id,
                stream,
                semester,
                category,
                created_at
            `)
            .order('created_at', { ascending: false });
        
        if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            hideLoadingInterface();
            alert('Error fetching teams: ' + teamsError.message);
            return;
        }
        
        // Fetch all team members with complete registration data
        const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
                team_id,
                position,
                full_name,
                usn,
                gender,
                stream,
                semester,
                category,
                email,
                mobile,
                created_at
            `);
        
        if (membersError) {
            console.error('Error fetching members:', membersError);
            hideLoadingInterface();
            alert('Error fetching members: ' + membersError.message);
            return;
        }
        
        // Process data for CSV
        const csvData = [];
        const csvHeaders = [
            'Team',
            'Project Type', 
            'SIH PS ID',
            'Leader Name',
            'Team Leader Stream',
            'Team Leader Semester', 
            'Team Leader Category',
            'Team Registration Date',
            'Position',
            'Students Name',
            'USN',
            'Gender',
            'Dept',
            'Semester',
            'Category',
            'Email',
            'Mob No',
            'Member Registration Date'
        ];
        
        // Add CSV header
        csvData.push(csvHeaders.join(','));
        
        // Group members by team
        const membersByTeam = {};
        members.forEach(member => {
            if (!membersByTeam[member.team_id]) {
                membersByTeam[member.team_id] = [];
            }
            membersByTeam[member.team_id].push(member);
        });
        
        // Process each team
        teams.forEach(team => {
            const teamMembers = membersByTeam[team.id] || [];
            const leader = teamMembers.find(m => m.position === 'Leader');
            const otherMembers = teamMembers.filter(m => m.position !== 'Leader');
            
            // Add leader and team info
            if (leader) {
                const row = [
                    `"${team.team_name}"`,
                    `"${team.project_type || ''}"`,
                    `"${team.sih_ps_id || ''}"`,
                    `"${team.leader_name || leader.full_name}"`,
                    `"${team.stream || leader.stream}"`,
                    `"${team.semester || leader.semester}"`,
                    `"${team.category || leader.category}"`,
                    `"${new Date(team.created_at).toLocaleDateString()}"`,
                    `"${leader.position}"`,
                    `"${leader.full_name}"`,
                    `"${leader.usn || ''}"`,
                    `"${leader.gender}"`,
                    `"${leader.stream}"`,
                    `"${leader.semester}"`,
                    `"${leader.category}"`,
                    `"${leader.email}"`,
                    `"${leader.mobile}"`,
                    `"${new Date(leader.created_at).toLocaleDateString()}"`
                ];
                csvData.push(row.join(','));
            }
            
            // Add other members
            otherMembers.forEach(member => {
                const row = [
                    `"${team.team_name}"`,
                    `"${team.project_type || ''}"`,
                    `"${team.sih_ps_id || ''}"`,
                    `"${team.leader_name || ''}"`,
                    `"${team.stream || ''}"`,
                    `"${team.semester || ''}"`,
                    `"${team.category || ''}"`,
                    `"${new Date(team.created_at).toLocaleDateString()}"`,
                    `"${member.position}"`,
                    `"${member.full_name}"`,
                    `"${member.usn || ''}"`,
                    `"${member.gender}"`,
                    `"${member.stream}"`,
                    `"${member.semester}"`,
                    `"${member.category}"`,
                    `"${member.email}"`,
                    `"${member.mobile}"`,
                    `"${new Date(member.created_at).toLocaleDateString()}"`
                ];
                csvData.push(row.join(','));
            });
        });
        
        // Create and download CSV file
        const csvContent = csvData.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `sih2025_teams_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        hideLoadingInterface();
        console.log('CSV download completed');
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        hideLoadingInterface();
        alert('Error downloading CSV: ' + error.message);
    }
}

// ============================================================================
// ADMIN DEPARTMENT SUMMARY FUNCTIONALITY  
// ============================================================================

// Load department-wise student summary for admin (can see ALL students)
async function loadAdminDepartmentSummary() {
    console.log('Loading admin department summary...');
    const container = document.getElementById('adminDepartmentSummaryContainer');
    
    try {
        // Admin can fetch ALL team members from all teams
        // First, let's try a simpler query to see if it works
        const { data: members, error } = await supabase
            .from('team_members')
            .select('*');
        
        console.log('Members query result:', { members: members?.length || 0, error });
        
        if (error) {
            console.error('Error fetching students for admin:', error);
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
        
        // Fetch team data separately to avoid join issues
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id, team_name, project_type, leader_name, semester, category');
        
        console.log('Teams query result:', { teams: teams?.length || 0, teamsError });
        
        if (teamsError) {
            console.error('Error fetching teams for admin:', teamsError);
            // Continue without team data if teams fetch fails
        }
        
        // Create a map of team_id to team data for easy lookup
        const teamsMap = {};
        if (teams) {
            teams.forEach(team => {
                teamsMap[team.id] = team;
            });
        }
        
        // Add team data to members manually
        members.forEach(member => {
            if (member.team_id && teamsMap[member.team_id]) {
                member.teams = teamsMap[member.team_id];
            }
        });
        
        // Sort members by stream and then by name (client-side)
        members.sort((a, b) => {
            const streamA = (a.stream || 'Unknown').toLowerCase();
            const streamB = (b.stream || 'Unknown').toLowerCase();
            if (streamA !== streamB) {
                return streamA.localeCompare(streamB);
            }
            const nameA = (a.full_name || '').toLowerCase();
            const nameB = (b.full_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        console.log('Processed members:', members.length, 'with teams data merged');
        
        // Group students by department/stream
        const departmentGroups = groupStudentsByDepartment(members);
        
        // Generate summary statistics
        const stats = generateSummaryStats(members, departmentGroups);
        
        // Render the summary (using existing functions but with admin styling)
        container.innerHTML = renderAdminDepartmentSummary(departmentGroups, stats);
        
    } catch (error) {
        console.error('Error loading admin department summary:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Error loading department summary. Please try again later.</p>
                <button type="button" class="btn btn-small" onclick="loadAdminDepartmentSummary()">Retry</button>
            </div>
        `;
    }
}

// Group students by department/stream (reuse existing function logic)
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

// Generate summary statistics (reuse existing function logic)
function generateSummaryStats(members, departmentGroups) {
    const totalStudents = members.length;
    const totalDepartments = Object.keys(departmentGroups).length;
    
    // Gender distribution
    const genderCounts = members.reduce((acc, member) => {
        acc[member.gender] = (acc[member.gender] || 0) + 1;
        return acc;
    }, {});
    
    // Position distribution
    const positionCounts = members.reduce((acc, member) => {
        acc[member.position] = (acc[member.position] || 0) + 1;
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
        positionCounts,
        semesterCounts,
        departmentSizes
    };
}

// Render admin department summary HTML (similar to regular but with admin styling)
function renderAdminDepartmentSummary(departmentGroups, stats) {
    const statisticsHtml = `
        <div class="admin-summary-statistics">
            <div class="stats-container">
                <div class="stat-item">
                    <h4>${stats.totalStudents}</h4>
                    <p>Total Students</p>
                </div>
                <div class="stat-item">
                    <h4>${stats.totalDepartments}</h4>
                    <p>Departments</p>
                </div>
                <div class="stat-item">
                    <h4>${stats.genderCounts.F || 0}</h4>
                    <p>Female Students</p>
                </div>
                <div class="stat-item">
                    <h4>${stats.genderCounts.M || 0}</h4>
                    <p>Male Students</p>
                </div>
                <div class="stat-item">
                    <h4>${stats.positionCounts.Leader || 0}</h4>
                    <p>Team Leaders</p>
                </div>
            </div>
        </div>
    `;
    
    const departmentsHtml = Object.keys(departmentGroups)
        .sort((a, b) => departmentGroups[b].length - departmentGroups[a].length)
        .map(department => {
            const students = departmentGroups[department];
            const femaleCount = students.filter(s => s.gender === 'F').length;
            const maleCount = students.filter(s => s.gender === 'M').length;
            const leaderCount = students.filter(s => s.position === 'Leader').length;
            
            return `
                <div class="admin-department-section">
                    <div class="admin-department-header">
                        <h3>
                            <span class="department-icon">📚</span>
                            ${department}
                            <span class="department-count">(${students.length} students)</span>
                        </h3>
                        <div class="department-stats">
                            <span class="gender-stat female">♀️ ${femaleCount}</span>
                            <span class="gender-stat male">♂️ ${maleCount}</span>
                            <span class="position-stat leader">👑 ${leaderCount} Leaders</span>
                        </div>
                    </div>
                    <div class="admin-students-grid">
                        ${students.map(student => `
                            <div class="admin-student-card">
                                <div class="student-header">
                                    <div class="student-name">${student.full_name}</div>
                                    <div class="student-badges">
                                        <div class="student-gender ${student.gender === 'F' ? 'female' : 'male'}">
                                            ${student.gender === 'F' ? '♀️' : '♂️'}
                                        </div>
                                        ${student.position === 'Leader' ? '<div class="leader-badge">👑</div>' : ''}
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
                                        <span class="info-value team-name">${student.teams?.team_name || `Team ID: ${student.team_id}` || 'N/A'}</span>
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

// Setup search functionality for admin department summary
function setupAdminSummarySearch() {
    const searchInput = document.getElementById('adminSearchStudents');
    const refreshBtn = document.getElementById('adminRefreshSummary');
    const departmentFilter = document.getElementById('adminDepartmentFilter');
    const csvDownloadBtn = document.getElementById('adminDownloadDepartmentCSV');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterAdminStudentCards(searchTerm);
        });
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            const selectedDepartment = this.value;
            filterAdminByDepartment(selectedDepartment);
        });
    }
    
    if (csvDownloadBtn) {
        csvDownloadBtn.addEventListener('click', function() {
            const selectedDepartment = this.getAttribute('data-department');
            if (selectedDepartment) {
                downloadAdminDepartmentCSV(selectedDepartment);
            }
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadAdminDepartmentSummary();
        });
    }
}

// Filter student cards for admin view
function filterAdminStudentCards(searchTerm) {
    const studentCards = document.querySelectorAll('.admin-student-card');
    const departmentSections = document.querySelectorAll('.admin-department-section');
    
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
        const visibleCards = section.querySelectorAll('.admin-student-card:not([style*="display: none"])');
        section.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });
}

// Filter admin departments based on selected department
function filterAdminByDepartment(selectedDepartment) {
    const departmentSections = document.querySelectorAll('.admin-department-section');
    const csvDownloadBtn = document.getElementById('adminDownloadDepartmentCSV');
    
    departmentSections.forEach(section => {
        const departmentHeader = section.querySelector('.admin-department-header h3');
        if (departmentHeader) {
            const departmentName = departmentHeader.textContent.split('(')[0].trim();
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
    
    // Also update admin statistics to reflect filtered data
    updateAdminFilteredStatistics(selectedDepartment);
}

// Update admin statistics for filtered view
function updateAdminFilteredStatistics(selectedDepartment) {
    if (selectedDepartment === 'all') {
        // Show all stats - reload to get original stats
        loadAdminDepartmentSummary();
        return;
    }
    
    // Calculate stats for selected department only
    const visibleStudentCards = document.querySelectorAll('.admin-department-section:not([style*="display: none"]) .admin-student-card');
    const totalStudents = visibleStudentCards.length;
    
    let femaleCount = 0;
    let maleCount = 0;
    let leaderCount = 0;
    
    visibleStudentCards.forEach(card => {
        const genderElement = card.querySelector('.student-gender');
        if (genderElement && genderElement.classList.contains('female')) {
            femaleCount++;
        } else if (genderElement && genderElement.classList.contains('male')) {
            maleCount++;
        }
        
        // Check if this is a leader
        const leaderBadge = card.querySelector('.leader-badge');
        if (leaderBadge) {
            leaderCount++;
        }
    });
    
    // Update admin stat cards
    const statItems = document.querySelectorAll('.admin-summary-statistics .stat-item');
    if (statItems.length >= 5) {
        statItems[0].querySelector('h4').textContent = totalStudents;
        statItems[1].querySelector('h4').textContent = '1'; // Only one department shown
        statItems[2].querySelector('h4').textContent = femaleCount;
        statItems[3].querySelector('h4').textContent = maleCount;
        statItems[4].querySelector('h4').textContent = leaderCount;
    }
}

// Download CSV for selected department (admin dashboard)
async function downloadAdminDepartmentCSV(selectedDepartment) {
    try {
        console.log('Admin downloading CSV for department:', selectedDepartment);
        
        // Show loading interface
        showLoadingInterface(`Generating ${selectedDepartment} department CSV...`);
        
        // Admin can fetch ALL team members for the selected department (bypassing RLS)
        const { data: members, error } = await supabase
            .from('team_members')
            .select(`
                *,
                teams:team_id (
                    team_name,
                    project_type,
                    leader_name,
                    semester,
                    category
                )
            `)
            .eq('stream', selectedDepartment)
            .order('full_name', { ascending: true });
        
        if (error) {
            console.error('Error fetching admin department data:', error);
            hideLoadingInterface();
            alert('Error fetching department data: ' + error.message);
            return;
        }
        
        if (!members || members.length === 0) {
            hideLoadingInterface();
            alert('No students found in the selected department.');
            return;
        }
        
        // Create comprehensive CSV content for admin
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
            'Team Leader',
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
                `"${member.teams?.leader_name || ''}"`,
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
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedDepartment}_Department_Students_${dateStr}_${timeStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        hideLoadingInterface();
        console.log(`Admin CSV downloaded: ${selectedDepartment}_Department_Students_${dateStr}_${timeStr}.csv`);
        
        // Show success message
        setTimeout(() => {
            alert(`CSV file downloaded successfully!\n\nFile: ${selectedDepartment}_Department_Students_${dateStr}_${timeStr}.csv\nRecords: ${members.length} students`);
        }, 500);
        
    } catch (error) {
        console.error('Error downloading admin department CSV:', error);
        hideLoadingInterface();
        alert('Error downloading CSV: ' + error.message);
    }
}

// Show loading interface
function showLoadingInterface(message) {
    // Create loading overlay if it doesn't exist
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 1.2rem;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div style="text-align: center; background: rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 10px; backdrop-filter: blur(10px);">
            <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
            <div>${message || 'Loading...'}</div>
        </div>
    `;
    overlay.style.display = 'flex';
}

// Hide loading interface
function hideLoadingInterface() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Registration Status Management Functions

// Load current registration status
async function loadRegistrationStatus() {
    try {
        console.log('Loading registration status...');
        
        // Fetch current registration status
        const { data: status, error } = await supabase
            .from('registration_status')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error) {
            console.error('Error fetching registration status:', error);
            updateRegistrationStatusDisplay(
                false, 
                'Error loading registration status. Please check database setup.', 
                'Unknown'
            );
            return;
        }
        
        console.log('Registration status loaded:', status);
        
        // Update UI with current status
        updateRegistrationStatusDisplay(
            status.is_open,
            status.message,
            status.updated_at
        );
        
        // Update form fields with current values
        const statusSelect = document.getElementById('registrationStatusSelect');
        const messageInput = document.getElementById('statusMessageInput');
        
        if (statusSelect) {
            statusSelect.value = status.is_open.toString();
        }
        
        if (messageInput) {
            messageInput.value = status.message || '';
        }
        
    } catch (error) {
        console.error('Error loading registration status:', error);
        updateRegistrationStatusDisplay(
            false, 
            'Error loading registration status: ' + error.message, 
            'Unknown'
        );
    }
}

// Update the registration status display in UI
function updateRegistrationStatusDisplay(isOpen, message, lastUpdated) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusMessage = document.getElementById('statusMessage');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (statusIndicator) {
        statusIndicator.innerHTML = isOpen ? '🟢' : '🔴';
        statusIndicator.className = `status-indicator ${isOpen ? 'open' : 'closed'}`;
    }
    
    if (statusText) {
        statusText.textContent = isOpen ? 'OPEN' : 'CLOSED';
        statusText.className = `status-text ${isOpen ? 'open' : 'closed'}`;
    }
    
    if (statusMessage) {
        statusMessage.textContent = message || 'No message set';
        statusMessage.className = `status-message ${isOpen ? 'open' : 'closed'}`;
    }
    
    if (lastUpdatedElement) {
        const formattedDate = lastUpdated !== 'Unknown' 
            ? new Date(lastUpdated).toLocaleString()
            : 'Unknown';
        lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
    }
}

// Handle registration status update
async function handleRegistrationStatusUpdate(e) {
    e.preventDefault();
    
    const statusSelect = document.getElementById('registrationStatusSelect');
    const messageInput = document.getElementById('statusMessageInput');
    
    if (!statusSelect || !messageInput) {
        alert('Form elements not found');
        return;
    }
    
    const isOpen = statusSelect.value === 'true';
    const message = messageInput.value.trim();
    
    if (!message) {
        alert('Please enter a status message');
        return;
    }
    
    try {
        console.log('Updating registration status...', { isOpen, message });
        
        showLoadingInterface('Updating registration status...');
        
        // Update registration status in database
        const { data, error } = await supabase
            .from('registration_status')
            .upsert([
                {
                    is_open: isOpen,
                    message: message,
                    updated_at: new Date().toISOString(),
                    updated_by: currentUser.id
                }
            ], {
                onConflict: 'id'
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error updating registration status:', error);
            hideLoadingInterface();
            alert('Error updating registration status: ' + error.message);
            return;
        }
        
        console.log('Registration status updated successfully:', data);
        
        hideLoadingInterface();
        
        // Show success message
        alert(`Registration status updated successfully!\n\nStatus: ${isOpen ? 'OPEN' : 'CLOSED'}\nMessage: ${message}`);
        
        // Refresh the status display
        loadRegistrationStatus();
        
    } catch (error) {
        console.error('Error updating registration status:', error);
        hideLoadingInterface();
        alert('Error updating registration status: ' + error.message);
    }
}

// Global function to check if registrations are open (used by other pages)
async function checkRegistrationStatus() {
    try {
        const { data: status, error } = await supabase
            .from('registration_status')
            .select('is_open, message')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error) {
            console.error('Error checking registration status:', error);
            // Default to closed if there's an error
            return {
                isOpen: false,
                message: 'Unable to verify registration status. Please try again later.'
            };
        }
        
        return {
            isOpen: status.is_open,
            message: status.message
        };
        
    } catch (error) {
        console.error('Error checking registration status:', error);
        return {
            isOpen: false,
            message: 'Unable to verify registration status. Please try again later.'
        };
    }
}
