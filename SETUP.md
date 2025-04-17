# Setup Guide for T2A Database and Email Integration

This guide will help you set up Supabase (database) and Resend (email) for your T2A application.

## 1. Supabase Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com).

2. **Create a new project**:

   - Choose a name for your project
   - Set a secure database password
   - Choose a region closest to your target audience

3. **Set up the database schema**:

   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy the contents of `schema.sql` from this repository
   - Run the SQL to create the waitlist table and security policies

4. **Get your API credentials**:
   - In your Supabase dashboard, go to Project Settings > API
   - Copy the "URL" and "anon/public" key
   - Add these to your `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

## 2. Resend Setup (for emails)

1. **Create a Resend account** at [resend.com](https://resend.com).

2. **Verify your domain** (recommended) or use Resend's test domain.

3. **Create an API key**:

   - Navigate to API Keys in the Resend dashboard
   - Create a new API key
   - Add it to your `.env.local` file:
     ```
     RESEND_API_KEY=your_resend_api_key
     ```

4. **Update the email sender address**:
   - Open `src/app/api/waitlist/route.ts`
   - Update the `from` field with your verified domain or use Resend's test email:
     ```js
     from: 'T2A <yourname@yourdomain.com>',
     ```

## 3. Testing Your Setup

1. **Start your development server**:

   ```
   yarn dev
   ```

2. **Visit your landing page**:
   - Navigate to the waitlist section
   - Submit your email to test the integration
   - Check your Supabase database to confirm the entry was added
   - Check your email to confirm you received the welcome message

## 4. Production Deployment

When deploying to production (e.g., Vercel), make sure to add all environment variables to your deployment platform.

## Troubleshooting

- **Database errors**: Check the Supabase logs in the dashboard
- **Email errors**: Check the Resend logs in the dashboard
- **API errors**: Check the browser console and server logs
