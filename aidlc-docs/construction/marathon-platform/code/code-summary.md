# Code Summary — Unit: marathon-platform

## File Manifest

### Config / Root
| File | Purpose |
|---|---|
| `package.json` | Dependencies and scripts |
| `next.config.js` | Next.js config (minimal) |
| `tailwind.config.ts` | Tailwind content paths |
| `tsconfig.json` | TypeScript config |
| `postcss.config.js` | PostCSS (Tailwind + Autoprefixer) |
| `.env.local.example` | Environment variable template |
| `.gitignore` | Git ignore rules |

### Database
| File | Purpose |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | `participants` table, RLS policies, indexes |

### Library
| File | Purpose |
|---|---|
| `src/lib/supabase/client.ts` | Browser Supabase client (createBrowserClient) |
| `src/lib/supabase/server.ts` | Server Supabase client (createServerClient + cookies) |
| `src/lib/types.ts` | `Participant` interface + `ParticipantStatus` type |

### App Router
| File | Purpose |
|---|---|
| `src/middleware.ts` | Auth guard — redirects `/admin/*` if not logged in |
| `src/app/globals.css` | Tailwind directives |
| `src/app/layout.tsx` | Root layout with `<Toaster>` |
| `src/app/page.tsx` | Redirect → `/register` |
| `src/app/api/auth/callback/route.ts` | Supabase OAuth code exchange |
| `src/app/register/page.tsx` | **Public** self-registration form |
| `src/app/admin/login/page.tsx` | Admin email+password login |
| `src/app/admin/layout.tsx` | Admin shell with nav + auth double-check |
| `src/app/admin/page.tsx` | Redirect → `/admin/participants` |
| `src/app/admin/participants/page.tsx` | Participant management (server component) |
| `src/app/admin/race-day/page.tsx` | Race day BIB scan station |

### Components
| File | Purpose |
|---|---|
| `src/components/SignOutButton.tsx` | Client sign-out button (used in admin layout) |
| `src/components/StatusBadge.tsx` | Colour-coded status pill |
| `src/components/ParticipantTable.tsx` | Filterable table + Approve+BIB action |
| `src/components/BibScanner.tsx` | BIB input → status transitions |
| `src/components/Certificate.tsx` | Certificate render + html2canvas download |

---

## Supabase Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API

### 2. Run the Schema Migration
Option A — Supabase Dashboard SQL Editor:
```
Copy contents of supabase/migrations/001_initial_schema.sql and run it
```
Option B — Supabase CLI:
```bash
npx supabase db push
```

### 3. Create Admin User
In Supabase Dashboard → Authentication → Users → Add User:
- Email: your-admin@example.com
- Password: choose a strong password
- Email confirm: tick "Auto confirm"

### 4. Configure Environment Variables
```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# Optionally set NEXT_PUBLIC_RACE_NAME
```

### 5. Run the App
```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Demo Flow

1. **Register** — Go to `/register`, submit the form → participant appears with status `registered`
2. **Admin login** — Go to `/admin/login`, sign in with Supabase admin credentials
3. **Approve + BIB** — In `/admin/participants`, click "Approve + BIB" → status becomes `confirmed`, BIB assigned
4. **Race Day — BIB Collection** — Go to `/admin/race-day`, enter BIB → status becomes `bib_collected`
5. **Race Day — Certify** — Enter same BIB again → status becomes `certified`, certificate appears
6. **Download** — Click "Download PNG" on certificate
