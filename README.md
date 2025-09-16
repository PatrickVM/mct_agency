# Murray Creative - Talent Agency Management App

A modern, mobile-first web application for talent agency management built with Next.js 15, Supabase, and Prisma. Features invite-only access, talent profiles, admin management, and a public gallery.

## Features

- **Invite-Only Access**: Magic link authentication with email invites and QR codes
- **Talent Profiles**: Rich profiles with photos, bio, skills, and social links
- **Public Gallery**: Browse public talent profiles with search functionality
- **Admin Dashboard**: Manage invites, talent, and private notes
- **Mobile-First Design**: Responsive design with playful pastel theme
- **Secure**: Row-level security (RLS) with Supabase

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL with RLS)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui + Radix
- **Auth**: Supabase Auth (Magic Links)
- **Storage**: Supabase Storage (avatars)
- **Deployment**: Docker + docker-compose

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended)
- Supabase account

### Environment Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd murray-creative
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

1. Run Supabase migrations:
```bash
# Apply RLS policies and storage setup
supabase db push
```

2. Generate Prisma client:
```bash
pnpm db:generate
```

3. Seed the database:
```bash
pnpm db:seed
```

### Development

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:seed` - Seed database with initial data

## Docker Deployment

### Build and run with Docker:
```bash
# Build the image
docker build -t murray-creative .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.local murray-creative
```

### Using Docker Compose:
```bash
# Run the app (uses Supabase for database)
docker-compose up

# Run with local PostgreSQL for development
docker-compose --profile local-db up
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── app/               # User dashboard
│   ├── gallery/           # Public gallery
│   ├── invite/            # Invite flow
│   └── onboarding/        # User onboarding
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── auth.ts            # Auth utilities
│   ├── prisma.ts          # Prisma client
│   ├── invites.ts         # Invite management
│   ├── upload.ts          # File uploads
│   └── qr.ts              # QR code generation
└── middleware.ts          # Auth middleware

prisma/
├── schema.prisma          # Database schema
├── seed.ts               # Database seeding

supabase/
└── migrations/           # Supabase SQL migrations
```

## Key Routes

- `/` - Landing page
- `/gallery` - Public talent gallery
- `/auth/signin` - Sign in with magic link
- `/invite/accept?token=...` - Accept invite
- `/onboarding` - New user setup
- `/app` - User dashboard
- `/admin` - Admin dashboard (admin only)

## User Roles

- **User**: Can create profile, upload avatar, manage own profile
- **Admin**: Can invite users, manage all profiles, add private notes, toggle public visibility

## Database Models

- **User**: Base user with email and role
- **Profile**: Rich talent profile with bio, skills, social links
- **Note**: Private admin notes about talent
- **InviteToken**: Email and QR code invitations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- Check the [docs](./docs/) directory
- Create an issue on GitHub
- Contact the development team