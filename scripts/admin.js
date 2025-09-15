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
    
    // Add event listeners
    document.getElementById('announcementForm').addEventListener('submit', handleAddAnnouncement);
    document.getElementById('resourceForm').addEventListener('submit', handleAddResource);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Load statistics
    loadStatistics();
    
    // Load existing data
    loadAnnouncements();
    loadResources();
});

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