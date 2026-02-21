# MyGrowth@Futuro

Production-oriented multi-centre professional development and compliance platform for childcare educators.

## Stack
- Next.js App Router + TypeScript + Tailwind + React Hook Form + Zod
- Prisma + PostgreSQL
- NextAuth credentials auth
- pg-boss jobs
- S3 signed uploads (local fallback)
- Resend/SMTP email fallback
- Vitest + Playwright

## Architecture
- `src/app/*`: UI routes and API routes
- `src/lib/*`: auth/RBAC, prisma client, storage, email helpers
- `src/jobs/worker.ts`: background worker (reminders, overdue reflections)
- `prisma/schema.prisma`: data model for orgs, centres, participants, training, attendance, reflections, certificates

## Core flows implemented
1. Credentials login with session/JWT and role-aware pages.
2. Event creation, targeted invite creation (with exclusion/offboarding-safe list), RSVP, attendance bulk update.
3. Attendance ATTENDED auto-creates completion and reflection (for reflection-required training types).
4. Reflection submission with participant-only ownership checks.
5. Trainer-token certificate upload endpoint.
6. CSV reporting endpoints: completions and payment preferences export.

## Setup
```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Docker local
```bash
docker compose up --build
```

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
- Vercel + managed Postgres: set env vars from `.env.example`; run `prisma migrate deploy` as build step.
- Fly.io: deploy app container + worker process; attach Postgres and object storage.

## Required env vars
See `.env.example`.

## Seeded users
- `admin@futuro.local` / `Password123!`
- `educator@futuro.local` / `Password123!`
