# Event Seating & Guest Entry Platform

Mobile-first prototype implementing the MVP SRS/UI-UX spec. Organizer, Guest,
Usher and Admin experiences are built as static UI with mock data — ready to
wire to a real backend in Phase 4+.

## Run it

```bash
npm install
npx prisma generate
npx prisma db push      # creates the SQLite tables from prisma/schema.prisma
npm run db:seed         # seeds a demo event so the landing page's demo links work
npm run dev
```

Open `http://localhost:3000` for the landing page. The seed script prints the
demo organizer's activation code to the terminal — use it at
`/organizer/activate`, or use the "I'm a guest" / usher links straight from
the landing page (they point at the pre-seeded demo event).

> **A note on this sandbox:** the code in this delivery was built and fully
> type-checked (`npx tsc --noEmit` — zero errors) inside a sandboxed dev
> environment whose network policy blocks `binaries.prisma.sh`, so
> `prisma generate`/`db push` couldn't actually run there and the DB layer
> couldn't be exercised end-to-end in-sandbox. That domain is a normal
> public CDN — it isn't blocked on your machine or in a real deployment, so
> the three commands above will work as expected. If you hit the same
> "did not initialize yet" error, it means `prisma generate` didn't
> complete — rerun it and check your network/firewall isn't blocking
> `binaries.prisma.sh`.

## Backend architecture (Phase 4, now live)

**Tenancy boundary is `eventId`.** Every table (`Guest`, `Entry`) has an
`eventId` foreign key, and every query — CSV upload, guest search, usher
check-in, admin counts — is scoped `where: { eventId }`. Two events, or
three hundred, never see each other's data.

**The QR code encodes only the `eventId`**, as a permanent URL
(`/guest/{eventId}`), not a snapshot of the guest list. Re-uploading a CSV
or editing rows never touches the QR — it's the same URL, resolving
against whatever the `Guest` table currently holds.

**Guest portal, Usher portal, and Admin counts are three views over the
same `Guest` rows**, not three synced copies:
- Guest portal (`/guest/[eventId]`) searches `Guest.name` scoped to that
  event and returns `table`/`seat`.
- Usher portal (`/usher/[token]`) resolves `token` → `Event` (tokens are
  unique per event), searches the same `Guest` table, and flips
  `checkedIn` on verification, logging an `Entry` row.
- Admin dashboard aggregates `count()` over the same table — there's no
  separate sync step, so the numbers can't disagree.

**Editing preserves check-in state.** Both the CSV re-upload and the new
spreadsheet editor go through `lib/sync-guests.ts`, which matches
incoming rows against existing guests (by `id` from the grid, or by name
for a CSV) and only updates/creates/removes what changed — it never wipes
`checkedIn` for a guest who's already been let in, even if the organizer
edits the seating plan mid-event.

**Spreadsheet editor.** From the seating results screen, "Edit" opens a
real row/column grid (`components/organizer/SeatingGrid.tsx`) — add rows,
edit any cell inline, delete rows, Save. It calls
`PUT /api/organizer/events/[eventId]/guests/bulk`, which runs through the
same `sync-guests` logic.

### API surface

| Route | Purpose |
|---|---|
| `POST /api/admin/events` | Create event → generates activation code + usher token |
| `GET /api/admin/events` | List events with live guest/check-in counts |
| `POST /api/organizer/activate` | Redeem activation code → event session |
| `GET /api/organizer/events/[eventId]/guests` | List guests for the seating results screen |
| `POST /api/organizer/events/[eventId]/guests` | CSV upload → parsed, synced (check-in preserved) |
| `PUT /api/organizer/events/[eventId]/guests/bulk` | Spreadsheet grid save → synced |
| `PATCH /api/organizer/events/[eventId]/guests/[guestId]` | Single-guest edit (API still available; UI now uses the grid) |
| `GET /api/guest/events/[eventId]/find?name=` | Guest name → table/seat |
| `GET /api/usher/[token]/summary` | Live total/checked-in counts |
| `GET /api/usher/[token]/guests?query=` | Usher guest search |
| `POST /api/usher/[token]/checkin` | Check a guest in, logs an `Entry` |

**Admin gate.** No user accounts anywhere in this app — organizer, guest,
and usher all stay code/token-based, by design. But the admin dashboard
*mints* those codes, so it needed something: `middleware.ts` gates
`/admin/*` pages and `/api/admin/*` routes behind one shared password
(`ADMIN_PASSWORD` env var), stored as an httpOnly cookie on login. It's
a lock on the door, not a login system — one password, no usernames.

**Activity monitoring.** `ActivityLog` records event creation, CSV
uploads, spreadsheet edits, and check-ins (`lib/activity.ts`), each
tagged with the `eventId` it happened under. The Admin → Activity page
reads this as a live feed, most recent first. This is separate from
`Entry` (which exists specifically to drive the usher/admin check-in
counts) — `ActivityLog` is the "what's been happening" view.

### Switching to Postgres/Neon for production

The models don't change — only the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL` to your Neon connection string, drop the
`driverAdapters`/`engineType = "wasm"` lines from the `generator client`
block in `prisma/schema.prisma` (those exist only to make local SQLite
dev work without a native binary — Postgres on Vercel doesn't need them),
swap `lib/prisma.ts` back to plain `new PrismaClient()`, then
`npx prisma db push` (or `migrate deploy`) against the new database.

## Going live: step by step

**1. Get it running locally first.**
```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
Confirm all four flows work at `localhost:3000`: create an event in
`/admin` (you'll be asked for `ADMIN_PASSWORD` from your `.env`),
activate it as organizer with the code it gives you, upload a CSV,
scan the QR (or just visit `/guest/<eventId>`) as a guest, check
someone in via the usher link.

**2. Create the Neon database.**
Sign up at neon.tech, create a project, copy the connection string it
gives you (use the pooled connection string if it offers one — better
for serverless). You won't need to create tables by hand; Prisma does
that from the schema.

**3. Push the code to GitHub.**
```bash
git init
git add .
git commit -m "Initial commit"
```
Create a repo on GitHub, then follow its "push an existing repo" 
instructions (`git remote add origin ...`, `git push -u origin main`).
`.gitignore` is already set up to keep `node_modules`, `.next`, your
local `dev.db`, and your `.env` out of the repo — never commit real
secrets.

**4. Import the repo into Vercel.**
vercel.com → New Project → import the GitHub repo. Before the first
deploy, add environment variables (Project Settings → Environment
Variables):
- `DATABASE_URL` — your Neon connection string
- `ADMIN_PASSWORD` — a long random password, different from your local one

**5. Point the schema at Postgres and push it.**
Do this once, locally, against the Neon database (see "Switching to
Postgres/Neon" above for the schema edit):
```bash
DATABASE_URL="<your neon connection string>" npx prisma db push
```
This creates the tables in Neon directly. Vercel will deploy the app
code on every push; it doesn't run migrations for you.

**6. Deploy and seed (optional).**
Vercel builds and deploys automatically once the repo's connected. If
you want a demo event in production too, run the seed script once
against the Neon URL the same way as step 5
(`DATABASE_URL="..." npm run db:seed`), or just create your first real
event through `/admin` on the live site.

**7. Verify on the live URL.**
Same checklist as step 1, now against your Vercel domain — admin
login, create event, organizer activation, CSV upload, guest find,
usher check-in, and the Admin → Activity feed showing all of it.


## Design tokens (Section 22 of the spec)

- **Color:** near-white paper `#FAFAF9`, ink `#14161A`, hairline border `#E6E4DE`,
  one accent — indigo `#4338CA` (also the QR "Indigo" swatch), good `#15803D`.
  No gradients, no glassmorphism, no decorative color.
- **Type:** Geist/Inter, tight restrained scale, tabular numerals for
  table/seat/count digits (the one recurring "signature" — numbers you'd read
  on a boarding pass, sized big only where it's the answer to the user's
  question: guest result, usher counts).
- **Motion:** only state-communicating — import progress, success check,
  save confirmation, QR color swap, live count changes. Nothing decorative.

## What's built vs. what's roadmap

Everything in `app/` and `components/` is real, working (mock-data-backed) UI
for every screen described in the spec: empty state → event code → CSV
upload → import progress → success → seating results → edit sheet → replace
confirmation, the QR page with color picker, Contact Us, the Guest portal
(name → table/seat), the Usher portal (search → verify → check in → live
counts), and the Admin dashboard (events list, create event).

The phases below are the path from this prototype to a shipped product.

---

## Phase 1 — Foundation ✅ (this delivery)
Next.js 15 + TypeScript + Tailwind scaffold, design tokens, shared UI
primitives (`Button`, `Card`, `ProgressBar`, `Badge`), routing skeleton for
all four surfaces, mobile-first responsive shell (bottom tab bar on mobile,
sidebar on desktop for Organizer/Admin).

## Phase 2 — Organizer core flow ✅ (this delivery)
`components/organizer/SeatsFlow.tsx` — the full state machine from the spec:
empty state → event code entry → CSV upload → real progress bar → success →
seating results grouped by table → edit-seat bottom sheet → replace-CSV
confirmation. Currently simulated client-side; Phase 5 swaps in real CSV
parsing and API calls without changing the UI.

## Phase 3 — QR, Guest portal, Usher portal, Admin ✅ (this delivery)
- QR page with 5-color picker (spec 7.2) and download/share actions.
- Guest portal: name entry → large, dominant table/seat result (spec 9.1),
  zero auth, minimal JS.
- Usher portal: live counts + progress bar, guest search, verify → check-in
  two-step (spec 10.2), mobile-first single column.
- Admin: events list + create-event form (spec 13.1–13.2).

## Phase 4 — Data layer ✅ (this delivery)
Prisma schema (`Event`, `Guest`, `Entry`), all event-scoped. SQLite for
local dev via a driver adapter (no native binary needed), one-line switch
to Postgres/Neon for production (see below). Real CSV parsing with
flexible header matching and per-row validation (`lib/csv.ts`), replacing
the old simulated upload.

## Phase 5 — Auth, activation & sessions — partial (this delivery)
Admin creates an event → generates a random, collision-checked activation
code (`EVT-XXXX-XXXX`) and a separate usher token. Organizer redeems the
code via `/api/organizer/activate`, session currently persisted in
`localStorage` (`lib/organizer-session.ts`) — swap-in point for real
signed sessions/72-hour expiry is that one file. Usher links are already
unguessable random tokens, resolved server-side with no separate login.
Still open: expiring the organizer session, and admin auth itself (the
admin dashboard has no login yet — anyone with the URL can create events).

## Phase 6 — Real-time & multi-event
- Wire usher check-in counts to Supabase Realtime/Pusher/WebSockets so the
  progress bar and counts update without refresh (spec §11).
- Event switcher for planners managing multiple events (spec §15.2), full
  data isolation per event ID (spec §16).
- Finish Admin "Usher Access" and "Activity" log pages (stubbed in this
  delivery).

## Phase 7 — Automation & notifications (skipped for now)
Not needed at current scale — dropped Inngest/scheduled jobs from the
plan. If you later want activation-code reminders or session expiry
emails, that's the natural place to add a job runner, but there's
nothing time-based in the app today that requires one.

## Phase 8 — i18n, performance, hardening
- EN/FR translation-ready strings (the language toggle in the organizer
  header is wired for this — hook up a real i18n library).
- Guest portal weight/perf pass for low-connectivity venues (spec §20):
  strip JS, cache static assets, add retry/loading states.
- Security pass per spec §25: rate-limit activation redemption, sanitize
  CSV input, never leak internal IDs, audit log admin/entry actions.

## Phase 9 — Deploy
- Vercel for the Next.js app (all four surfaces share one deployment,
  route-scoped).
- Neon for Postgres, environment-scoped (staging/prod).
- Point the printed venue QR at the prod guest-portal URL; verify the
  "same QR always resolves to latest seating" behavior end-to-end (spec §6).
