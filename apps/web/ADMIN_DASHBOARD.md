# T2A Admin Dashboard Guide

This guide explains the Waitlist Admin Dashboard features and how to use them effectively.

## Overview

The admin dashboard allows you to:

- View all waitlist signups
- Search through submissions
- Export data to CSV
- Delete entries as needed

## Accessing the Dashboard

The waitlist admin dashboard is accessible at `/dashboard/waitlist` but only for authenticated users. If you're not already logged in, you'll be redirected to the login page.

## Features

### 1. Viewing Waitlist Entries

The dashboard displays a table of all waitlist entries, showing:

- Date submitted
- Name (if provided)
- Email address
- Source (how they found your site)

The entries are sorted by most recent first.

### 2. Searching

You can search through waitlist entries by:

1. Typing a name or email in the search box
2. Clicking the "Search" button

The search is case-insensitive and will match partial text in either the name or email fields.

### 3. Exporting Data

To export your waitlist data:

1. Click the "Export to CSV" button
2. A CSV file will download automatically
3. The file contains all entries matching your current search (or all entries if no search is active)

This is useful for importing your waitlist into other CRM systems or for backup purposes.

### 4. Deleting Entries

To delete an entry:

1. Find the entry in the table
2. Click the "Delete" button
3. Confirm the deletion in the popup dialog

**Note:** Deletion is permanent and cannot be undone.

### 5. Pagination

If you have many entries, they'll be paginated with 50 entries per page. Use the "Previous" and "Next" buttons to navigate between pages.

## Security Considerations

The admin dashboard uses your existing authentication system for security. The API endpoints for fetching and managing waitlist data are protected by:

1. Authentication checks through cookies
2. Rate limiting through middleware
3. Server-side validation

Additionally, database operations use the Supabase service role key, which is kept secure and not exposed to the client.

## Environment Setup

Ensure these environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (kept secret, server-side only)

## Troubleshooting

- If you can't access the dashboard, check that you're logged in
- If data doesn't load, check the browser console for errors and verify your Supabase configuration
- If export fails, ensure your service role key has appropriate permissions
