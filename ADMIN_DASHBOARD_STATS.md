# Admin Dashboard Statistics Feature

## Overview
This document explains the implementation of the statistics feature in the admin dashboard, which displays the total number of teams and members registered in SIH 2025.

## Features Added

1. **Total Teams Counter**: Displays the total number of registered teams
2. **Total Members Counter**: Displays the total number of registered members (including leaders)
3. **Real-time Updates**: Statistics automatically update when new teams or members are added
4. **Responsive Design**: Statistics layout adapts to different screen sizes

## Implementation Details

### Frontend Changes

#### 1. HTML Structure (`admin.html`)
- Added a new "Statistics" card section at the top of the admin content
- Created two stat items for teams and members counters
- Used appropriate IDs for JavaScript manipulation

#### 2. CSS Styling (`styles/main.css`)
- Added `.stats-container` for flex layout of statistics
- Created `.stat-item` for individual statistic display
- Added responsive design for mobile devices
- Styled counters with large, prominent numbers

#### 3. JavaScript Functionality (`scripts/admin.js`)
- Added `loadStatistics()` function to fetch and display statistics
- Integrated statistics loading into the main initialization flow
- Updated existing functions to refresh statistics after changes

### Backend Integration

The statistics feature uses Supabase's count functionality:

```javascript
// Fetch total number of teams
const { count: totalTeams, error: teamsError } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

// Fetch total number of members
const { count: totalMembers, error: membersError } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true });
```

## How It Works

1. **On Page Load**: Statistics are automatically loaded and displayed
2. **After Changes**: When announcements or resources are added/removed, statistics are refreshed
3. **Real-time Counting**: Uses Supabase's efficient counting mechanism without fetching all records

## Data Sources

- **Teams Count**: Derived from the `teams` table
- **Members Count**: Derived from the `team_members` table (includes both leaders and members)

## Responsive Design

The statistics section is fully responsive:
- On desktop: Statistics appear side-by-side in a flex container
- On mobile: Statistics stack vertically for better readability

## Error Handling

The implementation includes proper error handling:
- Errors in fetching statistics are logged to the console
- Failed statistics requests don't break the rest of the dashboard
- Default values (0) are displayed if statistics can't be loaded

## Customization

You can easily customize the statistics display by modifying:
- CSS styles in `styles/main.css` (colors, fonts, spacing)
- HTML structure in `admin.html` (add more statistics)
- JavaScript in `scripts/admin.js` (add more data sources)

## Testing

To verify the statistics feature is working correctly:
1. Register a few teams through the leader dashboard
2. Check that the team count increases in the admin dashboard
3. Add team members and verify the member count increases
4. Test on different screen sizes to ensure responsive behavior