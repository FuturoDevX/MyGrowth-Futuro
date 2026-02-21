# MyGrowth@Futuro

Production-oriented multi-centre professional development and compliance platform for childcare educators.

## Stack
- Next.js App Router + TypeScript + Tailwind + React Hook Form + Zod
- Prisma + MongoDB
- NextAuth credentials auth
- Background jobs worker (`npm run jobs`)
- S3 signed uploads (local fallback)
- Resend/SMTP email fallback
- Vitest + Playwright

## Quick start (MongoDB)
1. `cp .env.example .env`
2. `docker compose up --build`
3. Open app at `http://localhost:3000`
4. Check health at `http://localhost:3000/api/health`
5. Login with seeded credentials:
   - `admin@futuro.local` / `Password123!`
   - `educator@futuro.local` / `Password123!`
6. Optional dev email inbox at `http://localhost:8025` (MailHog).

### Why this is reliable
- Compose waits for MongoDB health before app/worker starts.
- App/worker run explicit DB readiness check before Prisma commands.
- First boot uses `prisma db push` + `seed`.

## Local run (without Docker)
```bash
cp .env.example .env
# IMPORTANT: swap DATABASE_URL host from mongo -> localhost in .env
npm install
npm run db:wait
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

Run worker separately (for reminders/overdues):
```bash
npm run jobs
```

## Vercel + MongoDB Atlas (production)
1. Create a MongoDB Atlas cluster and database.
2. Set `DATABASE_URL` in Vercel to your Atlas connection string (`mongodb+srv://...`).
3. Add all required env vars from `.env.example` in Vercel project settings.
4. Deploy the app (repo includes `vercel.json`).
5. Run schema sync once against production DB:
   ```bash
   DATABASE_URL='<atlas-url>' npx prisma db push
   ```
6. Seed production only if needed:
   ```bash
   DATABASE_URL='<atlas-url>' npm run seed
   ```
7. Run `npm run jobs` on a separate always-on worker host (Railway/Fly/Render/VM); do not rely on Vercel serverless for long-running workers.

## Production hardening added
- Centralized API error handling with structured HTTP responses (`ApiError` + handler).
- RBAC hardening for event management endpoints (only Admin/CM/EL can create events, invite, mark attendance).
- Basic auth brute-force protection with in-memory rate limiting on credentials login.
- Input validation tightened for key API routes and report query params.

## Troubleshooting
- If login fails, confirm `NEXTAUTH_SECRET` in `.env` is set and restart app.
- If DB connection fails locally, verify MongoDB is running and `.env` uses `localhost` host.
- If npm install fails due registry policy, run from your local machine/CI with npm registry access.

## Test commands
```bash
npm run test
npm run test:e2e
npm run build
```

## Required env vars
See `.env.example`.

## Seeded users
- `admin@futuro.local` / `Password123!`
- `educator@futuro.local` / `Password123!`
