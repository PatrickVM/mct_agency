# Architecture Overview

## System Architecture

Murray Creative is a modern web application built with a serverless architecture using Next.js 15 and Supabase. The system is designed for scalability, security, and developer experience.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │    │   Next.js App    │    │   Supabase      │
│   (Browser)     │◄──►│   (Vercel/       │◄──►│   (Database +   │
│                 │    │    Docker)       │    │    Auth + API)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture

#### Frontend (Next.js 15)
- **App Router**: File-based routing with server and client components
- **Server Components**: Default rendering for better performance
- **Client Components**: Interactive UI elements with React hooks
- **Middleware**: Authentication and route protection
- **API Routes**: Backend logic for data mutations and complex operations

#### Database (Supabase/PostgreSQL)
- **Row Level Security (RLS)**: Fine-grained access control
- **Prisma ORM**: Type-safe database operations
- **Storage**: Image uploads for avatars
- **Real-time**: WebSocket connections for live updates

#### Authentication (Supabase Auth)
- **Magic Links**: Passwordless authentication via email
- **JWT Tokens**: Secure session management
- **Role-based Access**: Admin vs regular user permissions

## Data Flow

### User Registration Flow
1. Admin creates invite token
2. Magic link sent to user email
3. User clicks link → Supabase Auth
4. Redirect to onboarding
5. Profile creation with Prisma
6. User dashboard access

### Profile Management Flow
1. User uploads avatar → Supabase Storage
2. Form submission → API route
3. Validation with Zod schemas
4. Database update via Prisma
5. RLS policies enforce permissions
6. UI updates with fresh data

### Admin Operations Flow
1. Admin authentication check
2. Protected API routes
3. Direct database operations
4. Real-time updates to admin UI
5. Audit logging (if implemented)

## Security Model

### Authentication & Authorization
- **Supabase Auth**: Handles user sessions and JWT tokens
- **RLS Policies**: Database-level security enforcement
- **Middleware**: Route-level protection
- **API Guards**: Function-level permission checks

### Data Protection
- **Environment Variables**: Secrets stored securely
- **HTTPS Only**: All communications encrypted
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### Privacy
- **Private Notes**: Admin-only, never exposed to users
- **Profile Visibility**: User-controlled public/private toggle
- **Email Privacy**: Not exposed in public gallery
- **Invite Tokens**: Time-limited and single-use

## Performance Optimizations

### Frontend
- **Static Site Generation**: Pre-rendered pages where possible
- **Image Optimization**: Next.js Image component with Supabase CDN
- **Code Splitting**: Automatic bundle optimization
- **Caching**: HTTP caching headers for static assets

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Supabase handles database connections
- **Edge Functions**: Serverless architecture for global performance
- **CDN**: Supabase global CDN for image delivery

### Mobile Performance
- **Mobile-First CSS**: Optimized for mobile devices
- **Responsive Images**: Multiple sizes served based on viewport
- **Touch-Friendly UI**: Large targets and smooth interactions
- **Progressive Enhancement**: Works without JavaScript

## Deployment Architecture

### Production (Docker)
```
┌─────────────────┐
│   Load Balancer │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Next.js App   │
│   (Docker)      │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Supabase      │
│   (Managed)     │
└─────────────────┘
```

### Development
- Local development server with hot reload
- Environment-specific configurations
- Database seeding for consistent development data
- Docker Compose for local testing

## Scalability Considerations

### Horizontal Scaling
- Stateless Next.js application
- Multiple container instances behind load balancer
- Supabase auto-scaling database
- CDN for global content delivery

### Vertical Scaling
- Supabase managed database scaling
- Container resource allocation
- Memory-efficient React components
- Optimized database queries

### Performance Monitoring
- Next.js built-in analytics
- Supabase dashboard metrics
- Error tracking (implement Sentry)
- User experience monitoring

## Future Enhancements

### Technical Debt
- Implement comprehensive testing (Jest + Playwright)
- Add error boundaries and better error handling
- Implement audit logging for admin actions
- Add database backup and recovery procedures

### Features
- Real-time notifications
- Advanced search with Elasticsearch
- Bulk operations for admin
- API versioning for mobile apps
- Multi-language support

### Infrastructure
- CI/CD pipelines
- Staging environments
- Performance monitoring
- Security scanning

## Development Workflow

### Code Organization
- Domain-driven folder structure
- Separation of concerns
- Reusable components
- Type-safe APIs

### Quality Assurance
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Prisma for database type safety

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- End-to-end tests for user flows
- Manual testing for UI/UX

This architecture provides a solid foundation for a scalable, secure, and maintainable talent management application.