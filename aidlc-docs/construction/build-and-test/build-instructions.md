# Build Instructions — Marathon Management Platform

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.17.0+ (LTS) |
| npm | 9+ (bundled with Node) |
| Supabase project | Free tier sufficient |

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `NEXT_PUBLIC_RACE_NAME` | Set to your event name, e.g. `City Marathon 2026` |

## Step 1 — Database Setup

Run the migration in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query):

```sql
-- paste contents of supabase/migrations/001_initial_schema.sql
```

Or with the Supabase CLI:
```bash
npx supabase db push
```

## Step 2 — Create Admin User

Supabase Dashboard → Authentication → Users → **Add user**:
- Email: `admin@marathon.test` (or any email you choose)
- Password: set a strong password
- Check **Auto Confirm User**

## Step 3 — Install Dependencies

```bash
npm install
```

Expected output: packages installed with no peer-dependency errors.

## Step 4 — Development Build (Demo)

```bash
npm run dev
```

Open **http://localhost:3000** — should redirect to `/register`.

## Step 5 — Production Build (Optional, for deploy verification)

```bash
npm run build
```

Expected: `Route (app)` table printed, no TypeScript or compilation errors, `✓ Compiled successfully`.

## Step 6 — TypeScript Type Check

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Error: supabaseUrl is required` | Missing `.env.local` | Create `.env.local` from example |
| `relation "participants" does not exist` | Migration not run | Run `001_initial_schema.sql` in Supabase |
| 401 on participant insert | RLS not enabled or anon policy missing | Re-run migration |
| Redirect loop on `/admin/*` | Cookie issue in dev | Clear browser cookies for localhost |
