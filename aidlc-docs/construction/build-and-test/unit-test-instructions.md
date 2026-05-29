# Unit Test Instructions — Marathon Management Platform

## Testing Approach

Automated unit tests were **not generated** for this hackathon prototype (PBT and automated test suite disabled per Q7:C decision during Requirements Analysis). Verification is performed via:

1. **TypeScript compilation** — catches type errors at build time
2. **Next.js build** — catches missing imports, invalid JSX, routing errors
3. **Manual smoke test** — verifies the happy path works end-to-end

## TypeScript Type Check

```bash
npx tsc --noEmit
```

**Pass criteria**: Zero errors printed.

## ESLint Check

```bash
npm run lint
```

**Pass criteria**: No errors (warnings acceptable for hackathon).

## Next.js Build Verification

```bash
npm run build
```

**Pass criteria**: All routes compile successfully:
```
Route (app)                    Size
/                               -
/register                     X kB
/admin/login                  X kB
/admin/participants           X kB
/admin/race-day               X kB
✓ Compiled successfully
```

## Boundary Condition Checks (Manual)

| Scenario | Steps | Expected |
|---|---|---|
| Duplicate email | Register same email twice | Second attempt shows "already registered" toast |
| Unknown BIB | Enter BIB 9999 on race-day page | "BIB #9999 not found" toast |
| Wrong status BIB | Enter BIB of a `registered` participant (no BIB yet) | Error toast explaining status |
| Already certified | Enter BIB of certified participant | "Already certified" toast |
| Empty BIB field | Submit race-day form with empty input | Button disabled, no submission |
