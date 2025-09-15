// Script to insert sample data into announcements and resources tables
// Loaded from credentials.txt
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample announcements data
const sampleAnnouncements = [
  {
    title: "Welcome to SIH 2025!",
    content: "We're excited to have you participate in this year's SIH 2025. Please make sure to complete your team registration.",
    created_at: new Date().toISOString()
  },
  {
    title: "Important Dates",
    content: "Registration closes on October 1st. The SIH 2025 begins on October 15th.",
    created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
  },
  {
    title: "Submission Guidelines",
    content: "All projects must be submitted by October 20th at 11:59 PM. Late submissions will not be accepted.",
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

// Sample resources data
const sampleResources = [
  {
    title: "SIH 2025 Guidelines",
    link: "https://example.com/guidelines",
    created_at: new Date().toISOString()
  },
  {
    title: "API Documentation",
    link: "https://api.example.com/docs",
    created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
  },
  {
    title: "Code of Conduct",
    link: "https://example.com/conduct",
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

// Function to insert sample data
async function insertSampleData() {
  try {
    console.log("Inserting sample announcements...");
    
    // Insert announcements
    const { data: announcementsData, error: announcementsError } = await supabaseClient
      .from('announcements')
      .insert(sampleAnnouncements);
    
    if (announcementsError) {
      console.error("Error inserting announcements:", announcementsError);
    } else {
      console.log("Announcements inserted successfully:", announcementsData);
    }
    
    console.log("Inserting sample resources...");
    
    // Insert resources
    const { data: resourcesData, error: resourcesError } = await supabaseClient
      .from('resources')
      .insert(sampleResources);
    
    if (resourcesError) {
      console.error("Error inserting resources:", resourcesError);
    } else {
      console.log("Resources inserted successfully:", resourcesData);
    }
    
    console.log("Sample data insertion completed.");
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
}

// Run the function
insertSampleData();