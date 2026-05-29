# Code Generation Plan — Unit: marathon-platform

**Unit**: marathon-platform (single Next.js monolith)
**Stack**: Next.js 14 App Router + Supabase + Tailwind CSS
**Workspace Root**: /mnt/c/Users/Rajnish/marathon-app

## Unit Context

**Stories implemented**:
- FR-1: Public participant self-registration
- FR-2: Admin authentication (Supabase Auth, email+password)
- FR-3: Admin dashboard — participant management (approve + assign BIB)
- FR-4: 5-stage status flow (registered → confirmed → bib_collected → certified)
- FR-5: Race day station — BIB collection simulation
- FR-6: Race day station — finisher certification
- FR-7: Client-side certificate generation (html2canvas + download)
- FR-8: Single hardcoded race event (via env var)

**Key dependencies**:
- `@supabase/supabase-js` + `@supabase/ssr` — Supabase client with SSR support
- `react-hot-toast` — in-app toast notifications
- `html2canvas` — client-side certificate PNG export
- Tailwind CSS v3 — styling

**State machine**:
```
registered
    |
    v (admin assigns BIB — auto-confirms)
confirmed
    |
    v (race-day: BIB scanned/entered)
bib_collected
    |
    v (race-day: finisher entry)
certified
```

**DB schema — `participants` table**:
```sql
id uuid PK, name text, email text UNIQUE, phone text,
age int, tshirt_size text, status text, bib_number int UNIQUE,
certified_at timestamptz, created_at timestamptz
```

---

## Generation Steps

### Step 1: Project Scaffolding
- [x] Create `package.json` with all dependencies and scripts
- [x] Create `next.config.ts`
- [x] Create `tailwind.config.ts` with content paths
- [x] Create `tsconfig.json`
- [x] Create `.env.local.example` documenting required env vars
- [x] Create `postcss.config.js`

### Step 2: Supabase Database Schema
- [x] Create `supabase/migrations/001_initial_schema.sql`
  - `participants` table with all columns
  - `status` check constraint limiting to 4 valid states
  - `bib_number` unique constraint
  - Row Level Security: admin full access, anon INSERT only
  - Index on `status` and `bib_number`

### Step 3: Supabase Client Library
- [x] Create `src/lib/supabase/client.ts` — browser client (createBrowserClient)
- [x] Create `src/lib/supabase/server.ts` — server client (createServerClient with cookie handling)

### Step 4: Shared Types
- [x] Create `src/lib/types.ts`
  - `Participant` interface matching DB schema
  - `ParticipantStatus` union type (`'registered' | 'confirmed' | 'bib_collected' | 'certified'`)

### Step 5: Auth Middleware
- [x] Create `src/middleware.ts`
  - Protect all `/admin/*` routes except `/admin/login`
  - Redirect unauthenticated users to `/admin/login`
  - Use Supabase SSR session check

### Step 6: Root Layout and Root Page
- [x] Create `src/app/layout.tsx` — root layout with Toaster provider and global styles
- [x] Create `src/app/globals.css` — Tailwind directives
- [x] Create `src/app/page.tsx` — redirects to `/register`

### Step 7: Auth Callback Route
- [x] Create `src/app/api/auth/callback/route.ts` — handles Supabase OAuth/magic-link callback (needed for `@supabase/ssr`)

### Step 8: Public Registration Page
- [x] Create `src/app/register/page.tsx`
  - Form fields: Full Name, Email, Phone (optional), Age (optional), T-shirt size (S/M/L/XL)
  - On submit: INSERT to `participants` with `status = 'registered'`
  - Success: react-hot-toast success message + clear form
  - Error handling: duplicate email toast error
  - Uses browser Supabase client (anon key, public insert via RLS)
  - `data-testid` on all interactive elements

### Step 9: Admin Login Page
- [x] Create `src/app/admin/login/page.tsx`
  - Email + password form
  - Supabase `signInWithPassword`
  - On success: redirect to `/admin/participants`
  - On error: toast error message
  - `data-testid` on all interactive elements

### Step 10: Admin Layout (Auth Guard)
- [x] Create `src/app/admin/layout.tsx`
  - Server component reading Supabase session
  - Redirect to `/admin/login` if no session
  - Renders nav bar (links: Participants, Race Day, Sign Out)
  - Sign out button calls Supabase `signOut` + redirect

### Step 11: Admin Root Page
- [x] Create `src/app/admin/page.tsx` — redirects to `/admin/participants`

### Step 12: Admin Participants Page
- [x] Create `src/app/admin/participants/page.tsx`
  - Fetches all participants (server component with Supabase server client)
  - Renders `<ParticipantTable>` with data
  - Client-side Approve+BIB action:
    - Finds next available BIB number (MAX(bib_number) + 1, starting at 1001)
    - UPDATE participant: `status = 'confirmed'`, `bib_number = N`
    - Toast success: "BIB #N assigned — participant confirmed"
    - Revalidates page

### Step 13: Admin Race-Day Page
- [x] Create `src/app/admin/race-day/page.tsx`
  - Renders `<BibScanner>` component
  - Title: "Race Day Station"
  - Auto-focus BIB input on load

### Step 14: StatusBadge Component
- [x] Create `src/components/StatusBadge.tsx`
  - Maps status to Tailwind colour classes:
    - `registered` → grey badge
    - `confirmed` → blue badge
    - `bib_collected` → yellow badge
    - `certified` → green badge
  - `data-testid="status-badge"`

### Step 15: ParticipantTable Component
- [x] Create `src/components/ParticipantTable.tsx`
  - Columns: Name, Email, BIB#, Status, T-Shirt, Registered At, Actions
  - Search/filter input (client-side, filters by name or BIB)
  - Per-row Approve+BIB button (visible only when status = `registered`)
  - Uses `data-testid` on buttons and inputs

### Step 16: BibScanner Component
- [x] Create `src/components/BibScanner.tsx`
  - Single BIB number input with large font (race-day UX)
  - Auto-focuses on mount
  - On submit:
    - Fetch participant by BIB number
    - If `confirmed` → UPDATE to `bib_collected` + success toast "BIB #N collected"
    - If `bib_collected` → UPDATE to `certified`, set `certified_at = now()` + success toast + show `<Certificate>` modal
    - Otherwise → error toast with reason (not found / wrong status / already done)
  - `data-testid` attributes on input and button

### Step 17: Certificate Component
- [x] Create `src/components/Certificate.tsx`
  - Props: `participant: Participant`
  - Visual certificate layout (Tailwind styled, print-friendly)
  - Content: Race name (from `NEXT_PUBLIC_RACE_NAME`), Participant name, BIB number, Completion date
  - Download button: uses `html2canvas` to capture the certificate div → download as PNG
  - `data-testid="certificate-container"` and `data-testid="certificate-download-btn"`

### Step 18: Documentation Summary
- [x] Create `aidlc-docs/construction/marathon-platform/code/code-summary.md`
  - File manifest with paths
  - Supabase setup instructions (create project, run migration, create admin user, set env vars)

---

## Total Steps: 18 step groups (~35 individual files)

## Traceability
| FR | Steps |
|---|---|
| FR-1 Public Registration | 2, 3, 8 |
| FR-2 Admin Auth | 3, 4, 5, 9, 10 |
| FR-3 Admin Dashboard | 3, 4, 12, 15 |
| FR-4 5-Stage Flow | 2, 4, 12, 16 |
| FR-5 BIB Collection | 13, 16 |
| FR-6 Finisher Cert | 13, 16 |
| FR-7 Client Certificate | 17 |
| FR-8 Single Event | 1, 5 (env var) |
