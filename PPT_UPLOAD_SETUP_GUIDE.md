# PPT Upload Feature Setup Guide

## Overview
This guide will help you set up the PowerPoint presentation upload functionality in your SIH 2025 portal. The feature allows team leaders to upload, manage, and download their presentation files with proper validation and security.

## Features Added
- ✅ **File Upload**: Drag & drop or click to select PPT/PPTX files
- ✅ **File Validation**: Enforces PPT/PPTX format and 10MB size limit
- ✅ **Progress Tracking**: Visual upload progress with cancellation option
- ✅ **File Management**: View, download, and delete uploaded presentations
- ✅ **Security**: Row-level security ensuring teams can only access their own files
- ✅ **Modern UI**: Responsive design with animations and hover effects

## Step 1: Database Setup

### 1.1 Create the presentations table
Execute the SQL from `team_presentations_schema.sql` in your Supabase SQL editor:

```sql
-- Run the complete SQL from team_presentations_schema.sql file
```

### 1.2 Create Storage Bucket
1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `presentations`
3. Set it as **private** (not public)

### 1.3 Configure Storage Policies
Run these storage policies in the SQL editor:

```sql
-- Allow team leaders to upload presentations
CREATE POLICY "Team leaders can upload presentations" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow team leaders to view their presentations
CREATE POLICY "Team leaders can view their presentations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow team leaders to delete their presentations
CREATE POLICY "Team leaders can delete their presentations" ON storage.objects
FOR DELETE USING (
  bucket_id = 'presentations' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 2: File Structure
The following files have been created/updated:

### New Files:
- `team_presentations_schema.sql` - Database schema for presentations table
- `PPT_UPLOAD_SETUP_GUIDE.md` - This setup guide

### Updated Files:
- `dashboard.html` - Added PPT Upload navigation tab
- `scripts/dashboard.js` - Added complete presentation upload functionality
- `styles/main.css` - Added comprehensive styling for upload interface

## Step 3: File Validation Rules

The system enforces these validation rules:
- **File Types**: Only `.ppt` and `.pptx` files are accepted
- **File Size**: Maximum 10MB per file
- **MIME Types**: `application/vnd.ms-powerpoint` and `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- **Security**: Team leaders can only upload presentations for their own team

## Step 4: User Interface Features

### Upload Interface:
- **Drag & Drop Area**: Users can drag files directly onto the upload area
- **File Selection**: Click to browse and select files
- **Progress Bar**: Shows upload progress with cancel option
- **Form Fields**: 
  - Presentation name (required)
  - Description (optional)

### File Management:
- **File List**: Shows all uploaded presentations for the team
- **File Details**: Name, size, upload date, and version
- **Actions**: Download and delete buttons for each file

### Responsive Design:
- **Desktop**: Full-featured layout with side-by-side elements
- **Tablet**: Stacked layout for better mobile experience
- **Mobile**: Optimized for touch interfaces

## Step 5: Security Features

### Database Security:
- **Row Level Security (RLS)**: Enabled on team_presentations table
- **Team Isolation**: Users can only see presentations from their own team
- **Leader Only**: Only team leaders can upload/manage presentations

### Storage Security:
- **Private Bucket**: Files are not publicly accessible
- **Signed URLs**: Temporary download links with expiration
- **User Folders**: Files stored in user-specific folders (`user_id/filename`)

### File Security:
- **Type Validation**: Server-side file type checking
- **Size Limits**: Enforced both client-side and database constraints
- **Unique Names**: Files get unique names to prevent conflicts

## Step 6: Usage Instructions

### For Team Leaders:
1. Navigate to the "PPT Upload" tab in the dashboard
2. Ensure your team is registered first
3. Drag & drop your presentation or click "Choose File"
4. Fill in the presentation name and optional description
5. Click "Upload Presentation"
6. Monitor progress and wait for success confirmation
7. View, download, or delete presentations from the list below

### File Management:
- **Download**: Click the download button to get a temporary download link
- **Delete**: Click delete with confirmation to remove presentations
- **Replace**: Delete old file and upload new version

## Step 7: Error Handling

The system handles these error scenarios:
- **No Team Registered**: Prompts user to register team first
- **Invalid File Type**: Shows error for non-PPT files
- **File Too Large**: Warns about 10MB limit
- **Upload Failures**: Cleans up partial uploads
- **Network Issues**: Provides retry options

## Step 8: Performance Considerations

### Optimizations:
- **File Chunking**: Large files are handled efficiently
- **Progress Simulation**: Provides user feedback during upload
- **Lazy Loading**: Presentations loaded on demand
- **Caching**: Uses browser caching for better performance

### Database Indexes:
- `team_id` index for fast team-based queries
- `uploaded_by` index for user-based operations
- `upload_date` index for chronological sorting

## Step 9: Testing

### Test Scenarios:
1. **Valid Upload**: Test with .ppt and .pptx files under 10MB
2. **File Validation**: Try uploading invalid file types
3. **Size Limits**: Test with files over 10MB
4. **Team Security**: Ensure users can't see other teams' files
5. **Download**: Verify download links work correctly
6. **Delete**: Test deletion with confirmation

### Browser Compatibility:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- File drag & drop support

## Step 10: Monitoring and Maintenance

### Storage Monitoring:
- Monitor storage usage in Supabase dashboard
- Set up alerts for high usage
- Implement cleanup for old files if needed

### Performance Monitoring:
- Monitor upload success rates
- Track user engagement with the feature
- Monitor database query performance

## Troubleshooting

### Common Issues:
1. **Upload Fails**: Check bucket policies and permissions
2. **Files Not Visible**: Verify RLS policies are correctly set
3. **Download Issues**: Check signed URL generation
4. **Size Errors**: Verify both client and database limits

### Support:
- Check browser console for detailed error messages
- Monitor Supabase logs for backend issues
- Ensure proper error handling in production

## Conclusion

The PPT upload feature is now fully integrated into your SIH 2025 portal with:
- ✅ Secure file upload and storage
- ✅ Modern, responsive user interface  
- ✅ Comprehensive file validation
- ✅ Team-based access control
- ✅ Professional file management system

The feature is production-ready and follows security best practices for file handling in web applications.