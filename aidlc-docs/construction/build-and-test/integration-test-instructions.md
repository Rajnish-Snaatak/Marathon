# Integration Test Instructions — Marathon Management Platform

## Purpose

Validate the full 5-stage participant flow end-to-end against a live Supabase instance.

## Prerequisites

- App running: `npm run dev` → http://localhost:3000
- Supabase project configured with migration run and admin user created

---

## Scenario 1 — Happy Path: Full 5-Stage Flow

### Setup
- Open http://localhost:3000 in browser (redirects to `/register`)
- Open Supabase Dashboard → Table Editor → `participants` in a second tab (for verification)

### Steps

**Stage 1: Participant Self-Registration**
1. Fill in the registration form: Name=`Test Runner`, Email=`runner@test.com`, T-Shirt=`M`
2. Click **Register Now**
3. **Expected**: Green toast "Registered! Check in on race day with your BIB number."
4. **Verify in Supabase**: New row with `status = 'registered'`, `bib_number = null`

**Stage 2: Admin Approve + BIB Assignment (auto-confirms)**
1. Navigate to http://localhost:3000/admin/login
2. Sign in with the admin credentials you created
3. Navigate to `/admin/participants` — see `Test Runner` with status badge `Registered`
4. Click **Approve + BIB**
5. **Expected**: Toast "BIB #1001 assigned — Test Runner confirmed"
6. **Verify**: Status badge changes to `Confirmed`, BIB column shows `1001`
7. **Verify in Supabase**: `status = 'confirmed'`, `bib_number = 1001`

**Stage 3: Race Day — BIB Collection**
1. Navigate to `/admin/race-day`
2. Enter `1001` in the BIB field, click **Confirm BIB**
3. **Expected**: Toast "✅ BIB #1001 collected — Test Runner"
4. **Verify in Supabase**: `status = 'bib_collected'`

**Stage 4: Race Day — Certification**
1. Enter `1001` again in the BIB field, click **Confirm BIB**
2. **Expected**: Toast "🏅 Test Runner is certified!" + Certificate component appears below
3. **Verify in Supabase**: `status = 'certified'`, `certified_at` is set

**Stage 5: Certificate Download**
1. Click **⬇ Download PNG**
2. **Expected**: PNG file downloaded named `certificate-bib-1001.png`
3. Open the file — should show participant name, BIB, race name, date

### Cleanup
Delete the test participant in Supabase Dashboard → Table Editor → delete row.

---

## Scenario 2 — Multiple Participants + BIB Increment

1. Register 3 participants: Alice, Bob, Carol (unique emails each)
2. In `/admin/participants`, approve all 3 in sequence
3. **Expected BIBs**: Alice=1001, Bob=1002, Carol=1003
4. Status for all 3 should be `confirmed`

---

## Scenario 3 — Auth Guard

1. Open a new incognito window
2. Navigate directly to http://localhost:3000/admin/participants
3. **Expected**: Redirected to `/admin/login`
4. Sign in → redirected back to `/admin/participants`
5. Click **Sign Out** → redirected to `/admin/login`
6. Try to navigate to `/admin/participants` again → redirected to login

---

## Scenario 4 — Registration Duplicate Prevention

1. Register with email `dup@test.com`
2. Register again with the same email `dup@test.com`
3. **Expected on second attempt**: Red toast "This email is already registered."
4. Participant table should show only one row for that email
