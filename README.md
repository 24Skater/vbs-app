<div align="center">

# ✝️ VBS App

### Vacation Bible School Management System

*Built for the Church, by a follower of Christ*

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

---

## ✝️ Why I Built This

> *"Whatever you do, work at it with all your heart, as working for the Lord."* — Colossians 3:23

I am a follower of **Jesus Christ** — my Lord and Savior who died on the cross for my sins and rose again three days later. I believe He is the only way to salvation and eternal life.

**I built VBS App because I saw a need in the Church.**

When I looked for software to help churches manage their Vacation Bible School programs, I found very few options — and most were either expensive, outdated, or didn't meet the real needs of church volunteers and staff. Churches shouldn't have to struggle with spreadsheets or pay high fees just to organize an event that shares the Gospel with children.

**This is my offering to the Body of Christ.**

VBS App is:
- 🆓 **Free and open source** — No licensing fees, ever
- ⛪ **Built for churches** — By someone who understands ministry
- 🔒 **Self-hosted** — Your data stays with your church
- 🛠️ **Modern & maintainable** — Built with current technology
- 🤝 **Community-driven** — Contributions welcome from fellow believers

My prayer is that this tool helps churches focus on what matters most: **sharing the love of Jesus with the next generation.**

> *"Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these."* — Matthew 19:14

---

## Features

- **Student Management**: Register and manage students with categories, sizes, and payment tracking
- **Quick Check-In**: Fast and efficient daily attendance tracking
- **Schedule Management**: Create and manage event schedules with sessions, locations, and groups
- **Attendance Records**: View and export attendance data
- **Admin Panel**: Configure events, users, categories, and application settings
- **Role-Based Access Control**: Admin, Staff, and Viewer roles
- **Branding Customization**: Customize church name, logo, colors, and contact info
- **Modern Landing Page**: Beautiful, responsive landing page with admin-configurable branding
- **Google Forms Integration**: Self-service student registration via Google Forms
- **Reports Module**: Export student lists, attendance, schedules, and enrollment reports
- **Dashboard Analytics**: Visual charts for categories, teachers, age distribution, and payments
- **First-Launch Setup**: Guided setup wizard for first-time installation

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

VBS App includes a **setup wizard** that automatically appears on first launch:

1. **Visit the app**: Go to `http://localhost:3000`
2. **Create admin account**: You'll be redirected to `/setup` to create the first admin
3. **Sign in**: Use your new credentials at `/auth/signin`
4. **Configure branding**: Go to `/admin/settings` to customize:
   - Church name, address, contact info
   - Logo upload
   - Primary/secondary colors
   - Social media links
   - Welcome message
5. **Create an event**: Go to `/admin/events/new` to create your first VBS event
6. **Set active event**: Mark the event as active in `/admin/events`
7. **(Optional) Enable Google Forms**: Go to `/admin/integrations/google-forms` for self-service registration

## Project Structure

```
vbs-app/
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Seed script
├── src/
│   ├── app/
│   │   ├── admin/            # Admin panel pages
│   │   │   ├── integrations/ # Google Forms, etc.
│   │   │   ├── settings/     # Branding & settings
│   │   │   └── ...
│   │   ├── auth/             # Authentication pages
│   │   ├── setup/            # First-launch setup wizard
│   │   ├── students/         # Student management
│   │   ├── reports/          # Reports module
│   │   ├── dashboard/        # Dashboard with analytics
│   │   └── api/              # API routes
│   │       └── webhooks/     # Google Forms webhook
│   ├── components/           # React components
│   └── lib/                  # Utilities & configurations
├── Docs/
│   ├── GOOGLE_FORMS_INTEGRATION.md
│   ├── PRODUCTION_ENV_EXAMPLE.md
│   ├── PRODUCTION_ROADMAP.md
│   └── ...
├── docker-compose.yml        # Development (database only)
├── docker-compose.prod.yml   # Production deployment
├── docker-compose.traefik.yml # Production with auto-SSL
├── Dockerfile                # Production Docker image
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
- Webhook secret validation for Google Forms integration
- Image upload validation and size limits

See `Docs/SECURITY_COMPLETE.md` for detailed security documentation.

### Recommended Deployment Security

For production deployments, we recommend:

1. **Cloudflare Tunnel** - No open ports on your router
2. **HTTPS only** - Auto-SSL via Traefik or Cloudflare
3. **Strong passwords** - Enforce via the built-in password policy
4. **Regular backups** - Database backups before updates

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to contribute to this project.

Please note that this project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Integrations

### Google Forms (Self-Service Registration)

Parents can register students via a Google Form that automatically syncs to VBS App.

1. Enable in **Admin → Google Forms**
2. Create a Google Form with student fields
3. Add the provided Apps Script
4. Students appear automatically in VBS App!

See `Docs/GOOGLE_FORMS_INTEGRATION.md` for detailed setup instructions.

### Deployment Options

- **Cloudflare Tunnel** (Recommended) - Zero open ports, free SSL
- **Traefik Reverse Proxy** - Auto SSL with Let's Encrypt
- **Docker Compose** - Standard container deployment

See `Docs/PRODUCTION_ENV_EXAMPLE.md` for configuration details.

## Roadmap

- [x] Google Forms integration
- [x] Advanced reporting and analytics
- [x] Dashboard with charts and stats
- [ ] Email notifications
- [ ] Mobile app / PWA
- [ ] Multi-language support
- [ ] Planning Center integration
- [ ] Online payment processing
