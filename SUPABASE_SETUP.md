# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication → Settings**
2. Under **Site URL**, set: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## 3. Configure Email Settings

1. Go to **Authentication → Settings → SMTP Settings**
2. Enable custom SMTP or use Supabase's built-in email service
3. For development, you can use services like:
   - Mailgun
   - SendGrid
   - Gmail SMTP

## 4. Get API Credentials

1. Go to **Settings → API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API Keys → service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 5. Update Environment Variables

Update your `.env.local` file:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (get from Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Next.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 6. Test the Setup

1. Restart your development server
2. Go to `/admin` and create an invite
3. The magic link should now work properly

## Troubleshooting

- **"Invalid API key" error**: Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- **Magic link not working**: Verify redirect URLs in Supabase dashboard
- **Email not sending**: Check SMTP configuration in Supabase dashboard