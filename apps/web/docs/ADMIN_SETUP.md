# Setting Up an Admin User for T2A

This guide explains how to create an admin user for the T2A application using the normal registration process and then applying admin privileges.

## Step 1: Register a New User

1. Go to `/register` in your application
2. Fill out the registration form with your desired admin email and password
3. Complete the registration process
4. Note the email address you used for registration

## Step 2: Apply Admin Privileges

After registering, you'll need to run a SQL command in your Supabase project to grant admin privileges.

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL command, replacing `'admin@example.com'` with the email you used during registration:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'admin@example.com';
```

## Step 3: Log Out and Log Back In

After applying admin privileges, you need to refresh your session:

1. Go to `/logout` or click the "Logout" button in the application
2. Wait for the logout process to complete
3. Click "Log In Again"
4. Sign in with your admin credentials

This logout and re-login step is crucial as it refreshes your user session with the new admin privileges.

## Step 4: Verify Admin Status

After logging back in:

1. You should now have access to the admin dashboard at `/admin`
2. You should be able to bypass payment requirements
3. You'll have access to admin-only features throughout the application

## Environment Variables

The following environment variables are used for payment processing:

```
# Stripe
STRIPE_API_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # For development
```

These should be set in your `.env.local` file for local development or in your deployment platform's environment variables.
