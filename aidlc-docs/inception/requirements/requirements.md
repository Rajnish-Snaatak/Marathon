# Requirements Document — Marathon Management Platform MVP

## Intent Analysis

- **User Request**: Build a Marathon Management Platform MVP for a 1-day hackathon demo
- **Request Type**: New Project (Greenfield)
- **Scope**: Multiple Components (public registration, admin dashboard, race-day ops, certificate)
- **Complexity**: Moderate (well-constrained; 5-stage state machine is the core logic)
- **Stack**: Next.js (App Router) + Supabase (Postgres + Auth) + Tailwind CSS

---

## Functional Requirements

### FR-1: Participant Self-Registration (Public)
- Public `/register` page (no login required)
- Form fields: Full name, email, phone, age, T-shirt size (S/M/L/XL)
- On submit: participant record created in DB with status = `registered`
- Success: in-app toast confirmation; no email sent

### FR-2: Admin Authentication
- Single admin login via Supabase Auth (email + password)
- All admin routes protected (`/admin/*`)
- No participant login; participants have no app access

### FR-3: Admin Dashboard — Participant Management
- Table view of all participants with status badges
- Filter/search by name, BIB, status
- Actions per participant:
  - **Approve & Assign BIB**: sets status = `approved`, assigns a unique BIB number (auto-incrementing integer), then immediately auto-sets status = `confirmed`
  - **Reject**: removes or flags participant (optional for demo)
- Status badge colour coding:
  - `registered` → grey
  - `confirmed` → blue (approved+BIB assigned = auto-confirmed)
  - `bib_collected` → yellow
  - `certified` → green

### FR-4: 5-Stage Participant Status Flow
```
registered --> confirmed --> bib_collected --> certified
              (auto, when BIB assigned)
```
- `approved` is an internal intermediate that immediately resolves to `confirmed`
- The DB stores the final states: `registered`, `confirmed`, `bib_collected`, `certified`
- State transitions are append-only (no downgrade)

### FR-5: Race Day Station — BIB Collection Simulation
- `/admin/race-day` page simulating a scan station
- Input: BIB number text field (simulates QR scanner)
- On submit: find participant by BIB, if status = `confirmed` → set `bib_collected`, show success toast
- Edge cases: unknown BIB, wrong status — show error toast

### FR-6: Race Day Station — Finisher Certification
- Same `/admin/race-day` page, second action
- Input: BIB number
- On submit: if status = `bib_collected` → set `certified`, show success toast, offer certificate download

### FR-7: Client-Side Certificate Generation
- Triggered after a participant is marked `certified`
- Certificate rendered as HTML/CSS in browser, exportable via `window.print()` or html2canvas → PNG download
- Certificate content: Participant name, BIB number, Race name ("City Marathon 2026"), Completion date
- No server-side PDF generation

### FR-8: Single Hardcoded Race Event
- Race name: configurable via `.env` variable `NEXT_PUBLIC_RACE_NAME`
- No multi-event management UI

---

## Non-Functional Requirements

### NFR-1: Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 18+
- **Styling**: Tailwind CSS v3
- **Backend/DB**: Supabase (PostgreSQL + Row Level Security + Supabase Auth)
- **Deployment**: Local dev (`npm run dev`); Vercel-compatible for demo deploy
- **Certificate**: html2canvas or browser print API (client-side only)

### NFR-2: Performance
- No specific SLA; must be responsive enough for live demo
- Participant table should handle up to ~500 rows without pagination for demo

### NFR-3: Security
- Security extension: **DISABLED** (hackathon prototype)
- Admin routes protected by Supabase session check; public registration unprotected
- RLS on Supabase tables: admin can read/write all, public can only INSERT to participants

### NFR-4: Usability
- Mobile-friendly layout (Tailwind responsive classes)
- All status changes confirmed via in-app toast (react-hot-toast or similar)
- Race-day station page optimised for quick BIB entry (auto-focus input)

### NFR-5: Testing
- Property-based testing: **DISABLED** (hackathon prototype)
- Basic happy-path test via build verification; no automated test suite required for demo

---

## Data Model (Conceptual)

### `participants` table
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| created_at | timestamptz | default now() |
| name | text | required |
| email | text | required, unique |
| phone | text | optional |
| age | int | optional |
| tshirt_size | text | S/M/L/XL |
| status | text | registered, confirmed, bib_collected, certified |
| bib_number | int | null until assigned, unique |
| certified_at | timestamptz | set when certified |

---

## Out of Scope (Hackathon Exclusions)
- Email/SMS notifications
- Task management
- Volunteer category mapping
- Multi-event support
- Participant login / self-service portal
- PDF server-side generation
- Real QR code scanning hardware
- Automated test suite
