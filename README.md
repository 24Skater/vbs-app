# VBS App

A self-hostable Vacation Bible School (VBS) management application designed for churches to manage student registration, check-ins, attendance tracking, payments, and schedules. Built with modern web technologies and designed for easy deployment and maintenance.

## What is This App?

VBS App is a complete management system for Vacation Bible School programs. It helps churches:

- **Manage Students** - Register and organize students by categories (Youth, Jóvenes, etc.)
- **Track Attendance** - Daily check-in system with attendance history
- **Monitor Payments** - Track payment status for registered students
- **Schedule Events** - Create and manage VBS schedules with calendar export
- **Generate Reports** - Export attendance data to CSV
- **Multi-Event Support** - Manage multiple VBS events (2024, 2025, etc.) in one system

### Key Features

- 🔐 **Secure Authentication** - Email-based magic link authentication with role-based access
- 👥 **Student Management** - Register and manage students with custom categories
- ✅ **Check-In System** - Quick daily check-in interface for staff
- 📊 **Attendance Tracking** - View and export attendance records by date
- 💰 **Payment Tracking** - Track payment status for students
- 📅 **Schedule Management** - Create schedules with calendar export (ICS format)
- 🎯 **Multi-Event Support** - Support for multiple VBS events with active event selection
- 🎨 **Customizable** - Admin panel for customizing categories, branding, and settings
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🐳 **Docker Support** - Easy deployment with Docker and Docker Compose

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Prerequisites

Before setting up, ensure you have:

- **Node.js 20+** and npm installed
- **PostgreSQL 16+** (or Docker for containerized setup)
- **Email service** for authentication (SMTP or Resend)
- **Basic terminal/command line knowledge**

## Initial Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd vbs-app

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vbsdb?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Email Configuration (choose one method)

# Option 1: SMTP
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_SERVER_SECURE="false"

# Option 2: Resend (recommended for production)
# RESEND_API_KEY="re_xxxxxxxxxxxxx"
# EMAIL_FROM="noreply@yourdomain.com"
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### Step 3: Start Database

#### Option A: Using Docker (Recommended for Development)

```bash
docker compose up -d
```

#### Option B: Using Existing PostgreSQL

- Create a database named `vbsdb` (or update `DATABASE_URL`)
- Ensure PostgreSQL is running

### Step 4: Run Database Migrations

This creates all necessary database tables:

```bash
npx prisma migrate dev
```

### Step 5: Seed Initial Data (Optional)

```bash
# Creates default categories and a demo event
npx tsx prisma/seed.ts
```

### Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Create Your First Admin User

1. Navigate to the sign-in page
2. Enter your email address
3. Check your email for the magic link
4. Sign in with the link
5. Set your role to ADMIN in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:

```bash
npx prisma studio
# Navigate to User table and change role to ADMIN
```

### Step 8: Create Your First Event

1. Sign in as admin
2. Go to `/admin/events`
3. Click "Create Event"
4. Enter year, theme, and dates
5. Check "Set as active event"
6. Click "Create Event"

## Production Deployment

### Using Docker Compose (Recommended)

1. **Configure Production Environment**

   Create a `.env` file with production values:

   ```env
   DATABASE_URL="postgresql://user:password@db:5432/vbsdb?schema=public"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-production-secret"
   EMAIL_FROM="noreply@yourdomain.com"
   # ... other environment variables
   ```

2. **Build and Start Services**

   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. **Run Migrations**

   ```bash
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

4. **Initialize Default Data**

   ```bash
   docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
   ```

### Manual Deployment

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Start Production Server**

   ```bash
   npm start
   ```

3. **Run Migrations**

   ```bash
   npx prisma migrate deploy
   ```

4. **Set Up Process Manager** (Recommended)

   Use PM2 or similar:

   ```bash
   npm install -g pm2
   pm2 start npm --name "vbs-app" -- start
   pm2 save
   pm2 startup
   ```

## User Roles

The application has three user roles:

- **ADMIN** - Full access including admin panel for managing events, users, categories, and settings
- **STAFF** - Can manage students, check-ins, attendance, and schedules
- **VIEWER** - Read-only access to dashboard

## Admin Panel

Access the admin panel at `/admin` (requires ADMIN role) to:

- **Events** - Create, edit, and activate VBS events
- **Users** - Manage user accounts and roles
- **Categories** - Create and customize student categories
- **Settings** - Customize site name, colors, and branding

See [ADMIN_PANEL.md](./Docs/ADMIN_PANEL.md) for detailed admin panel documentation.

## Maintaining the Application

### When New Updates Are Released

Follow these steps to update your installation:

#### Step 1: Backup Your Database

**Before any update, always backup your database!**

Using pg_dump:

```bash
pg_dump -U postgres vbsdb > backup_$(date +%Y%m%d).sql
```

Or using Docker:

```bash
docker compose exec db pg_dump -U postgres vbsdb > backup_$(date +%Y%m%d).sql
```

#### Step 2: Pull Latest Code

```bash
# If using git
git pull origin main

# Or download the latest release
```

#### Step 3: Update Dependencies

```bash
npm install
```

#### Step 4: Apply Database Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

#### Step 5: Rebuild and Restart

If using Docker:

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

If using manual deployment:

```bash
npm run build
# Restart your process manager (PM2, systemd, etc.)
pm2 restart vbs-app
```

#### Step 6: Verify Everything Works

1. Check the application loads: `https://yourdomain.com`
2. Test sign-in functionality
3. Verify admin panel is accessible
4. Check that existing data is intact

### Regular Maintenance Tasks

#### Weekly

- **Check for Updates**: Review the repository for new releases
- **Review Logs**: Check application logs for errors
- **Verify Backups**: Ensure database backups are running

#### Monthly

- **Update Dependencies**: Run `npm audit` and update packages
- **Review User Accounts**: Check for inactive or unauthorized users
- **Database Maintenance**: Consider running `VACUUM` on PostgreSQL

#### Before Each VBS Event

- **Create New Event**: Use admin panel to create event for the year
- **Set Active Event**: Activate the new event
- **Review Categories**: Update student categories if needed
- **Test Check-In**: Verify check-in process works
- **Train Staff**: Ensure staff know how to use the system

### Database Backups

#### Automated Backup Script

Add this to cron for automated backups:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
pg_dump -U postgres vbsdb > "$BACKUP_DIR/vbsdb_$DATE.sql"
# Keep only last 30 days
find "$BACKUP_DIR" -name "vbsdb_*.sql" -mtime +30 -delete
```

#### Restore from Backup

```bash
psql -U postgres vbsdb < backup_20240101.sql
```

### Troubleshooting

#### Application Won't Start

1. Check environment variables are set correctly
2. Verify database is running and accessible
3. Check logs: `docker compose logs app` or application logs
4. Ensure port 3000 is not in use

#### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL is running: `docker compose ps` or `systemctl status postgresql`
3. Test connection: `psql $DATABASE_URL`

#### Authentication Not Working

1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Verify email service is configured correctly
4. Check email service logs for delivery issues

#### Migration Errors

1. **Always backup before migrations!**
2. Check Prisma migration status: `npx prisma migrate status`
3. Review migration files in `prisma/migrations/`
4. If stuck, you may need to reset (development only):

   ```bash
   npx prisma migrate reset  # WARNING: Deletes all data!
   ```

## Project Structure

```text
vbs-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Seed scripts
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   └── ...              # Feature pages
│   ├── components/          # React components
│   └── lib/                 # Utilities and helpers
│       ├── auth.ts          # Authentication utilities
│       ├── event.ts         # Event management
│       ├── categories.ts    # Category management
│       ├── settings.ts      # Settings management
│       └── ...
├── docker-compose.yml       # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
└── Dockerfile              # Production Docker image
```

## Database Management

### Prisma Studio (Visual Database Editor)

View and edit data in a visual interface:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Create Migration

When schema changes are needed:

```bash
npx prisma migrate dev --name description_of_change
```

### Reset Database (Development Only)

⚠️ **WARNING**: This deletes all data!

```bash
npx prisma migrate reset
```

## Email Configuration

### Using Resend (Recommended for Production)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`:

   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

### Using SMTP

Configure your SMTP server details in `.env`:

```env
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_SERVER_SECURE="false"
```

## Security Considerations

- **Change NEXTAUTH_SECRET** in production (use a strong random value)
- **Use HTTPS** in production (set `NEXTAUTH_URL` to HTTPS)
- **Secure your database** with strong passwords
- **Limit email access** to trusted users only
- **Regular backups** of your PostgreSQL database
- **Keep dependencies updated**: Run `npm audit` regularly
- **Review user roles** periodically to ensure proper access control

## Getting Help

- **Documentation**: Check `Docs/ADMIN_PANEL.md` for admin panel details
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Database Issues**: Use Prisma Studio to inspect data
- **Logs**: Check application logs for error messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 VBS App Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Changelog

See [IMPROVEMENTS.md](./Docs/IMPROVEMENTS.md) for a detailed list of improvements and changes.

---

Made with ❤️ for churches running VBS programs
