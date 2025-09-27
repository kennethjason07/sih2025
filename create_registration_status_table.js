// Script to create registration_status table and initial data
// Run this script once to set up the registration status functionality

// Supabase configuration
const SUPABASE_URL = 'https://ghsiujmrspjjrmgsckba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoc2l1am1yc3BqanJtZ3Nja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDI0MTAsImV4cCI6MjA3MzUxODQxMH0.42kIctZtu8-aswDFgg4og51wd-OYIaT_TSsUx8XHlFs';

console.log('Setting up registration status table...');
console.log('');
console.log('Please run these SQL commands in your Supabase dashboard:');
console.log('');
console.log('1. Create the registration_status table:');
console.log('');
console.log(`CREATE TABLE registration_status (
    id SERIAL PRIMARY KEY,
    is_open BOOLEAN NOT NULL DEFAULT true,
    message TEXT DEFAULT 'Registrations are currently open',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);`);
console.log('');
console.log('2. Enable RLS (Row Level Security):');
console.log('');
console.log('ALTER TABLE registration_status ENABLE ROW LEVEL SECURITY;');
console.log('');
console.log('3. Create policies for registration_status table:');
console.log('');
console.log(`-- Allow anyone to read registration status
CREATE POLICY "Anyone can read registration status" ON registration_status
FOR SELECT USING (true);

-- Only admins can update registration status
CREATE POLICY "Only admins can update registration status" ON registration_status
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);`);
console.log('');
console.log('4. Insert initial data:');
console.log('');
console.log(`INSERT INTO registration_status (is_open, message) 
VALUES (true, 'Team registrations are currently open for SIH 2025.');`);
console.log('');
console.log('After running these commands, the registration status functionality will be ready to use.');
console.log('The admin panel will be able to control whether registrations are open or closed.');