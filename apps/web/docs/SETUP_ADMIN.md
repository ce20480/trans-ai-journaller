# Setting Up T2A Admin User and Database

This guide explains how to set up your Supabase database and create an admin user for the T2A application.

## Prerequisites

1. A Supabase account and project created
2. Supabase CLI installed (for migrations)
3. Stripe account for payment processing

## Database Setup

### 1. Run the Migrations

To set up the database with the required tables, use the Supabase migrations:

```bash
supabase migration up
```

This will create:

- The `profiles` table for storing user subscription information
- RLS policies for secure access
- Triggers for auto-creating profiles on signup

### 2. Set Environment Variables

Add the following environment variables to your project:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # For development
```

## Creating an Admin User

### Option 1: Create Using Supabase Dashboard

1. Go to the Authentication > Users section in your Supabase dashboard
2. Click "Add User" and fill in the details:
   - Email: (admin email)
   - Password: (strong password)
3. Click "Save"
4. Find the user in the list and click "Edit"
5. In the "Metadata" section, add:

```json
{
  "role": "admin"
}
```

6. Save changes

### Option 2: Create Using SQL

Execute this SQL in the Supabase SQL Editor:

```sql
-- Insert an admin user
-- REPLACE 'admin@example.com' and 'password' with your desired credentials
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'admin@example.com',
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now()
);

-- Set the password (replace 'password' with a strong password)
-- This uses Supabase's built-in password hashing
UPDATE auth.users
SET encrypted_password = crypt('password', gen_salt('bf'))
WHERE email = 'admin@example.com';
```

## Verifying Admin Access

1. Log in using the admin credentials at the `/login` page
2. You should now have access to the admin dashboard and be able to bypass payment requirements

## Setting Up Stripe

1. Create a product in your Stripe dashboard for the subscription
2. Set the price to $4.95/month
3. Update the Stripe product/price ID in your API if needed
4. Test the checkout flow using Stripe's test card:
   - Card number: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

## Next Steps

- Set up webhooks to handle subscription events from Stripe
- Create an admin dashboard for managing users and subscriptions
- Consider adding email verification for new user signups
