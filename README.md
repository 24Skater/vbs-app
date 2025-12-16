<div align="center">

# 🏕️ VBS App

### Vacation Bible School Management System

*A modern, full-featured solution for managing your VBS events*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Contributors](https://img.shields.io/github/contributors/24Skater/vbs-app)
![Issues](https://img.shields.io/github/issues/24Skater/vbs-app)
![Pull Requests](https://img.shields.io/github/issues-pr/24Skater/vbs-app)
![Security](https://img.shields.io/badge/security-policy-yellow.svg)

---

**A comprehensive, self-hosted application for managing Vacation Bible School events, students, attendance, and schedules.**

</div>

## Features

- **Student Management**: Register and manage students with categories, sizes, and payment tracking
- **Quick Check-In**: Fast and efficient daily attendance tracking
- **Schedule Management**: Create and manage event schedules with sessions, locations, and groups
- **Attendance Records**: View and export attendance data
- **Admin Panel**: Configure events, users, categories, and application settings
- **Role-Based Access Control**: Admin, Staff, and Viewer roles
- **Branding Customization**: Customize site name, logo, and colors from the admin panel
- **Modern Landing Page**: Beautiful, responsive landing page with admin-configurable branding

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js) with email magic links
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Deployment**: Docker & Docker Compose

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for database or full deployment)
- PostgreSQL 16+ (if not using Docker)

## Quick Start (Development)

### 1. Clone the repository

```bash
git clone <repository-url>
cd vbs-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vbsdb?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Email (optional for development - magic links will be logged to console)
EMAIL_FROM="noreply@example.com"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_SERVER_SECURE="false"
```

**Generate NEXTAUTH_SECRET:**
- **Windows (PowerShell)**: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
- **Windows (Git Bash)**: `openssl rand -base64 32`
- **Mac/Linux**: `openssl rand -base64 32`

### 4. Start the database

```bash
docker compose up -d
```

This starts only the PostgreSQL database in Docker.

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database (optional)

```bash
npx tsx prisma/seed.ts
```

### 7. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` with **hot reloading** - changes will appear instantly without rebuilding!

## Production Deployment

### Using Docker Compose (Recommended)

1. **Set up environment variables**

   Create a `.env` file with all required variables (see Quick Start section).

2. **Start the services**

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run database migrations**

   ```bash
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

4. **Seed the database (optional)**

   ```bash
   docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
   ```

The app will be available at `http://localhost:3000` (or your configured port).

### Manual Deployment

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Set up the database**

   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env`
   - Run migrations: `npx prisma migrate deploy`

3. **Build the application**

   ```bash
   npm run build
   ```

4. **Start the production server**

   ```bash
   npm start
   ```

## User Roles

- **ADMIN**: Full access to all features, including admin panel
- **STAFF**: Can manage students, attendance, and schedules
- **VIEWER**: Read-only access to view data

## First-Time Setup

1. **Sign in**: Go to `/auth/signin` and enter your email
2. **Check logs**: In development mode, the magic link will be logged to the console
3. **Set admin role**: The first user needs to be manually set as ADMIN in the database:

   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

   Or use Prisma Studio:

   ```bash
   npx prisma studio
   ```

4. **Configure settings**: Go to `/admin/settings` to customize:
   - Site name
   - Primary color
   - Logo URL

5. **Create an event**: Go to `/admin/events/new` to create your first VBS event
6. **Set active event**: Mark the event as active in `/admin/events`

## Project Structure

```
vbs-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Seed script
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Admin panel pages
│   │   ├── auth/         # Authentication pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   └── lib/              # Utility functions and configurations
├── public/               # Static assets
├── docker-compose.yml    # Development database only
├── docker-compose.prod.yml  # Production deployment
├── Dockerfile            # Production Docker image
└── README.md
```

## Database Management

### Run migrations

```bash
npx prisma migrate dev
```

### Open Prisma Studio

```bash
npx prisma studio
```

### Reset database (development only)

```bash
npx prisma migrate reset
```

## Email Configuration

For production, configure SMTP settings in your `.env` file. The app supports any SMTP provider (Gmail, SendGrid, AWS SES, etc.).

In development mode, if email is not configured, magic links will be logged to the console instead of being sent via email.

## Security Considerations

- All user inputs are validated using Zod schemas
- SQL injection protection via Prisma ORM
- XSS protection with HTML escaping
- CSRF protection via NextAuth and Next.js Server Actions
- Rate limiting on authentication endpoints
- Security headers configured
- Account lockout after failed login attempts
- Role-based access control (RBAC)
- IDOR protection on all resources

See `Docs/SECURITY_COMPLETE.md` for detailed security documentation.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to contribute to this project.

Please note that this project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Roadmap

- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Integration with church management systems
