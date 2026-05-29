# Marathon Management Platform - Requirements Clarification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match your needs, choose the last option (Other) and describe your preference.
Let me know when you're done.

> **Context**: Stack is locked to Next.js + Supabase + Tailwind. 5-stage flow is locked. Defaults are pre-selected for speed — only change what matters to your demo.

---

## Question 1
How do participants get registered in the system?

A) Public self-registration form (no login required for participants — simplest, recommended for demo)

B) Admin manually adds participants from the dashboard only

C) Both — public form AND admin can add manually

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
What admin roles are needed?

A) Single admin role — one login handles everything: approvals, BIB assignment, race-day scanning, all management (simplest)

B) Two roles — Admin (full access) + Race Official (BIB scan station only)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
How should the race event be scoped?

A) Single hardcoded race event — no multi-event management needed (simplest, hackathon-ready)

B) Multiple events — admin can create and switch between races

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
What information should the certificate display?

A) Minimal — Participant name, BIB number, race name, completion date (simplest, client-side HTML/canvas)

B) Extended — Add finish time, distance, placement/rank

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
For the "confirmed" stage in the flow (registered, approved+BIB, confirmed, bib_collected, certified): who triggers confirmation?

A) Automatic — system auto-confirms when admin approves and assigns BIB (simplest, removes a manual step)

B) Participant self-confirms — participant clicks a confirmation link/button (requires participant-facing view)

C) Admin confirms manually — admin explicitly marks participant as confirmed

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6 — Security Extension
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7 — Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers)

X) Other (please describe after [Answer]: tag below)

[Answer]: C
