# VBS App (Starter – TypeScript / Next.js 14)

A starter repo for the self-hostable **VBS app** with:
- Next.js 14 (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth (email magic link)
- API stub for Google Forms webhook
- Basic pages: Home, Dashboard, Students, Check-In, Attendance, Schedule

## Quick Start (dev)

1. Install dependencies
```bash
npm install
cp .env.example .env
```

2. Start Postgres locally
```bash
docker compose up -d
```

3. Apply schema
```bash
npx prisma migrate dev --name init
```

4. Run
```bash
npm run dev
# open http://localhost:3000
```

## Docker (production)
```bash
docker build -t vbs-app:local .
```
