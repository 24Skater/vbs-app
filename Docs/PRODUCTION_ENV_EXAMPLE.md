# Production Environment Configuration

Copy these values to a `.env` file in your production server.

## Required Variables

```bash
# Domain Configuration
DOMAIN=vbs.yourchurch.org

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-database-password-here
POSTGRES_DB=vbsdb

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://vbs.yourchurch.org
```

## Optional - Email (for Magic Link login)

```bash
# Using Gmail SMTP:
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=VBS App <noreply@yourchurch.org>
```

## Optional - OAuth Providers

```bash
# Google OAuth (https://console.developers.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft/Azure AD OAuth
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Enable OAuth buttons on frontend
NEXT_PUBLIC_HAS_GOOGLE_OAUTH=false
NEXT_PUBLIC_HAS_MICROSOFT_OAUTH=false
```

---

## Deployment Commands

### Using Traefik (recommended for production with auto-SSL)

```bash
# 1. Clone the repo
git clone https://github.com/your-repo/vbs-app.git
cd vbs-app

# 2. Create .env file with your values
cp Docs/PRODUCTION_ENV_EXAMPLE.md .env
# Edit .env with your actual values

# 3. Start with Traefik
docker compose -f docker-compose.traefik.yml up -d

# 4. Push database schema
docker compose -f docker-compose.traefik.yml exec app npx prisma db push
```

### Without Traefik (behind existing reverse proxy)

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Google Forms Webhook URL

Once deployed, your webhook URL will be:

```
https://vbs.yourchurch.org/api/webhooks/google-forms
```

Update this in your Google Apps Script!

