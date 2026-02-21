# MyGrowth@Futuro

Production-oriented multi-centre professional development and compliance platform for childcare educators.

## Stack
- Next.js App Router + TypeScript + Tailwind + React Hook Form + Zod
- Prisma (current schema uses PostgreSQL)
- NextAuth credentials auth
- pg-boss jobs
- S3 signed uploads (local fallback)
- Resend/SMTP email fallback
- Vitest + Playwright

## What to do to make this work (fastest path)
1. **Use Docker path first**.
2. `cp .env.example .env`
3. `docker compose up --build`
4. Open app at `http://localhost:3000`
5. Check health at `http://localhost:3000/api/health`
6. Login with seeded credentials:
   - `admin@futuro.local` / `Password123!`
   - `educator@futuro.local` / `Password123!`
7. Optional dev email inbox at `http://localhost:8025` (MailHog).

### Why this is now more reliable
- Compose waits for Postgres health before app/worker starts.
- App/worker run an explicit DB readiness script before Prisma commands.
- First boot uses `prisma db push` + `seed` while migration SQL is still scaffolded.

## Local (non-docker) run
```bash
cp .env.example .env
# IMPORTANT: swap DATABASE_URL host from db -> localhost in .env
npm install
npm run db:wait
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```


## Production hardening added
- Centralized API error handling with structured HTTP responses (`ApiError` + handler).
- RBAC hardening for event management endpoints (only Admin/CM/EL can create events, invite, mark attendance).
- Basic auth brute-force protection with in-memory rate limiting on credentials login.
- Input validation tightened for key API routes and report query params.

## Troubleshooting
- If login fails, confirm `NEXTAUTH_SECRET` in `.env` is set and restart app.
- If DB connection fails locally, verify Postgres is running and `.env` uses `localhost` host.
- If npm install fails due registry policy, run from your local machine/CI with npm registry access.

## Architecture
- `src/app/*`: UI routes and API routes
- `src/lib/*`: auth/RBAC, prisma client, storage, email helpers
- `src/jobs/worker.ts`: background worker (reminders, overdue reflections)
- `src/scripts/wait-for-db.ts`: DB readiness check used in local/docker startup
- `prisma/schema.prisma`: data model for orgs, centres, participants, training, attendance, reflections, certificates

## Core flows implemented
1. Credentials login with session/JWT and role-aware pages.
2. Event creation, targeted invite creation (with exclusion/offboarding-safe list), RSVP, attendance bulk update.
3. Attendance ATTENDED auto-creates completion and reflection (for reflection-required training types).
4. Reflection submission with participant-only ownership checks.
5. Trainer-token certificate upload endpoint.
6. CSV reporting endpoints: completions and payment preferences export.

## Jobs
```bash
npm run jobs
```

## Test commands
```bash
npm run test
npm run test:e2e
npm run build
```

## Deployment notes
- **Vercel (recommended app hosting)**
  - This repository now includes `vercel.json` for Next.js deployment.
  - Set env vars from `.env.example` in your Vercel project.
  - Build command is `npm run prisma:generate && npm run build`.
- **MongoDB + Vercel option**
  - If you want MongoDB Atlas on Vercel, set `DATABASE_URL` to your Atlas connection string.
  - You must also migrate `prisma/schema.prisma` from the PostgreSQL provider to MongoDB before production use.
  - Keep the worker (`npm run jobs`) on a separate always-on runner (not Vercel serverless).
- Fly.io: deploy app container + worker process; attach your database and object storage.

## Required env vars
See `.env.example`.

## Seeded users
- `admin@futuro.local` / `Password123!`
- `educator@futuro.local` / `Password123!`
