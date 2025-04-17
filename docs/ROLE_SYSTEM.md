# T2A Role System Documentation

This document explains the role-based access control system used in the T2A application.

## User Roles

The application has three distinct user roles:

### 1. Standard User

- Created through normal registration at `/register`
- Must pay for a subscription to access the dashboard and core features
- No administrative capabilities
- Default role for all newly registered users

### 2. Beta Tester

- Created by an admin through the admin dashboard
- Can access the dashboard and core features without payment
- No administrative capabilities
- Ideal for testing new features or providing early access

### 3. Admin

- Created by existing admins through the admin dashboard
- Full access to all features without payment
- Access to the admin dashboard with management capabilities
- Can create other admins and beta testers

## Access Control Matrix

| Feature         |   Standard User (Unpaid)   | Standard User (Paid) | Beta Tester | Admin |
| --------------- | :------------------------: | :------------------: | :---------: | :---: |
| Landing page    |             ✅             |          ✅          |     ✅      |  ✅   |
| Login           |             ✅             |          ✅          |     ✅      |  ✅   |
| Register        |             ✅             |          ✅          |     ✅      |  ✅   |
| Dashboard       | ❌ (Redirected to payment) |          ✅          |     ✅      |  ✅   |
| Admin Dashboard |             ❌             |          ❌          |     ❌      |  ✅   |
| Create Users    |             ❌             |          ❌          |     ❌      |  ✅   |
| Manage Waitlist |             ❌             |          ❌          |     ❌      |  ✅   |

## Creating Users with Different Roles

### Creating Beta Testers

1. Log in as an admin
2. Go to the admin dashboard
3. Click "Create User"
4. Fill in the email and password
5. Select "Beta Tester" role
6. Submit the form

### Creating Admins

1. Log in as an admin
2. Go to the admin dashboard
3. Click "Create User"
4. Fill in the email and password
5. Select "Admin" role
6. Submit the form

## Implementation Details

The role-based access control is implemented in several key parts of the application:

1. **User Metadata**: Each user has a `role` field in their metadata which is set at creation time
2. **Middleware**: Checks the user's role on protected routes and redirects as needed
3. **Admin API Endpoints**: Protected by middleware that verifies admin status
4. **Dashboard Access**: Checks for active subscription OR beta tester/admin status

## Security Considerations

- Only admins can create other admins or beta testers
- Role information is stored in secure user metadata in Supabase
- Changes to a user's role require re-authentication to take effect
- Secure API endpoints restrict access based on authenticated user roles
