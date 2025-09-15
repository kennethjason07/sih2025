# File Upload Feature for Admin Dashboard

## Overview
This document explains how to set up and use the file upload feature in the admin dashboard, allowing admins to upload files that users can view and download.

## Features Added

1. **File Upload Capability**: Admins can upload files through the resource management section
2. **File Storage**: Files are stored in Supabase Storage
3. **File Access**: Users can download uploaded files through the resources section
4. **File Management**: Admins can delete files along with their resource records
5. **Dual Resource Support**: Resources can be either external links or uploaded files

## Setup Instructions

### 1. Create Storage Bucket
Run the `SETUP_STORAGE_BUCKET.sql` script in your Supabase SQL Editor to:
- Create a "resources" storage bucket
- Set up appropriate access policies

### 2. Configure Storage Policies
The script sets up the following policies:
- **Public Read Access**: Anyone can view/download files
- **Admin Write Access**: Only admins can upload/update/delete files

## How It Works

### For Admins
1. Go to the Admin Dashboard
2. Navigate to the "Manage Resources" section
3. Fill in the resource title
4. Either:
   - Enter an external link in the "Link" field, OR
   - Select a file to upload using the file input
5. Click "Add Resource"

### For Users
1. Go to the Resources section in their dashboard
2. Click on "Download File" for uploaded files or "Access Resource" for external links
3. Files will open in a new tab or download directly

## Supported File Types
The file upload accepts the following formats:
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: JPG, JPEG, PNG, GIF
- Archives: ZIP, RAR

## Implementation Details

### Frontend Changes
1. **HTML**: Added file input to the resource form in `admin.html`
2. **CSS**: Enhanced styling for file inputs and resource links
3. **JavaScript**: 
   - Modified `handleAddResource()` to process file uploads
   - Updated `loadResources()` to differentiate between files and links
   - Enhanced `deleteResource()` to remove files from storage
   - Added loading interface for file uploads

### Backend Integration
1. **Supabase Storage**: Files are stored in the "resources" bucket
2. **Database**: Resource records contain either external links or file URLs
3. **Security**: RLS policies ensure only admins can upload files

## File Handling Process

### Upload Process
1. Admin selects a file
2. File is uploaded to Supabase Storage with a unique name
3. Public URL is generated for the file
4. Resource record is created in the database with the file URL

### Download Process
1. User clicks on a resource link
2. If it's a file URL, the file downloads directly
3. If it's an external link, it opens in a new tab

### Delete Process
1. Admin confirms deletion of a resource
2. If it's a file resource, the file is removed from storage
3. Resource record is deleted from the database

## Security Considerations

1. **Access Control**: Only admins can upload files
2. **File Validation**: File types are restricted to safe formats
3. **Unique Naming**: Files are stored with unique names to prevent conflicts
4. **Cleanup**: Deleting resources also removes associated files

## Error Handling

The implementation includes comprehensive error handling:
- File upload errors are displayed to admins
- Database errors are logged and reported
- Failed file deletions don't prevent resource record deletion
- Loading states provide feedback during file operations

## Customization

You can customize the feature by modifying:
- Supported file types in the HTML accept attribute
- Storage bucket name in the SQL script
- File naming convention in the JavaScript code
- Styling in the CSS file

## Testing

To verify the feature works correctly:
1. Upload a file through the admin dashboard
2. Check that it appears in the resources list
3. Verify that users can download the file
4. Test deleting a file resource
5. Confirm the file is removed from storage