# Farm Express

Production-grade Farm Management mobile app (Android + iOS) for farm owners,
supervisors and labour — attendance, salary, stock, sales, expenses and
reporting in one offline-capable app.

## Tech stack

React Native · Expo SDK 51 · TypeScript · Expo Router · Supabase (Auth,
Postgres, Storage) · Zustand · TanStack Query · React Hook Form · Zod ·
Victory Native · Lucide icons · Expo Notifications · Expo SQLite + MMKV for
offline-first storage.

## Getting started

This project's dependency tree (React Native + Expo + native modules such as
MMKV, SQLite and Reanimated) is large enough that it must be installed on
your own machine — run these commands locally, not in a restricted CI
sandbox:

```bash
npm install
cp .env.example .env   # then fill in your Supabase project URL + anon key
npx expo start
```

Because this app uses native modules that **Expo Go does not include**
(`react-native-mmkv`, `expo-sqlite`, `react-native-reanimated` w/ New
Architecture), you'll want a development build rather than Expo Go:

```bash
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

Or, without a local Xcode/Android Studio setup, build a dev client with EAS:

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

## Project structure

```
app/            Expo Router routes only — thin screens, no business logic
components/ui/  Reusable, theme-aware primitives (Button, Card, Text, ...)
components/providers/  Cross-cutting providers (query cache, offline sync boot)
features/       One folder per module (auth, labour, attendance, salary, ...)
services/       Supabase client, local SQLite + sync engine, MMKV/SecureStore
                storage adapters, Zustand stores, TanStack Query client
hooks/          Cross-feature hooks (theme, network status)
constants/      Design tokens (colors/spacing/type) + app-wide config/enums
utils/          Formatters, Zod primitives, permission helpers, logger
types/          Shared domain types (mirrors the Postgres schema)
database/       schema.sql / policies.sql / migrations (Step 4)
assets/         Fonts, icons, splash images
```

Path aliases (`@components/*`, `@features/*`, `@services/*`, `@hooks/*`,
`@constants/*`, `@utils/*`, `@types/*`, `@database/*`) are configured in both
`tsconfig.json` and `babel.config.js` — always import via the alias, never a
relative `../../../` path.

## Design system

All colors, spacing, radii, type scale and shadows live in
`constants/theme.ts` and are consumed through the `useAppTheme()` hook, so
dark mode and any future rebrand are a one-file change. Every screen should
be built from `components/ui/*` (`Screen`, `Card`, `Button`, `Input`,
`Badge`, `Avatar`, `StatCard`, `EmptyState`, `ErrorState`, `Skeleton`) rather
than raw React Native primitives, to keep the "premium, minimal, agriculture
inspired" look consistent everywhere.

## Offline support

Writes go through `services/offline/mutationQueue.ts` into a local SQLite
outbox; `services/offline/syncEngine.ts` replays them against Supabase the
moment `@react-native-community/netinfo` reports connectivity, and also on a
15s background timer. Reads are served by TanStack Query, persisted to MMKV
via `PersistQueryClientProvider`, so cached data (today's attendance,
current stock, recent sales) renders instantly even with zero connectivity.

## Authentication

Email OTP, Phone OTP (India, `+91`) and Google Login all issue a Supabase
session that's persisted encrypted via `expo-secure-store` (see
`services/storage/secureStore.ts` and `services/supabase/client.ts`). Flow:

```
(auth)/login  --send OTP-->  (auth)/verify-otp  --first sign-in-->  (auth)/complete-profile  -->  (app)/dashboard
                                                  --returning user------------------------------->  (app)/dashboard
```

To actually send codes/log in, configure your Supabase project:

1. **Email OTP** — enabled by default under Authentication → Providers → Email.
2. **Phone OTP** — Authentication → Providers → Phone, plus an SMS provider
   (Twilio, MessageBird, etc.) configured with your credentials.
3. **Google Login** — Authentication → Providers → Google, using OAuth
   client IDs from Google Cloud Console (one Web client ID, plus iOS/Android
   client IDs for native). Put all three in `.env` (see `.env.example`) —
   `services/supabase/authService.ts` exchanges the ID token via
   `supabase.auth.signInWithIdToken`.

The moment someone verifies their first OTP, a Postgres trigger
(`handle_new_user`, database/functions.sql) creates their `public.users`
row with `farm_id = NULL`. The `complete-profile` screen calls the
`complete_owner_profile(p_full_name, p_farm_name)` RPC, which creates their
`farms` row and links it — that's the exact signal `needsProfileCompletion`
in `services/state/authStore.ts` watches. Every self-registered user becomes
the `owner` of a brand-new farm; supervisor/labour accounts instead get
created (with their role and farm already set) via an invite flow once team
management ships in Step 13.

## Database

Schema, RLS policies and functions/triggers live in `database/` as plain
SQL — `schema.sql` (14 tables + `roles` reference table), `functions.sql`
(`current_farm_id()`/`current_role()` helpers, the `handle_new_user` and
`set_updated_at` triggers, the `complete_owner_profile` RPC) and
`policies.sql` (Row Level Security). `database/migrations/0001_init.sql` is
the frozen, applied snapshot of all three — apply it to a real project with:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Every farm-scoped table carries a `farm_id`; RLS (not app-level filtering)
is what actually enforces that one farm can never see another's data —
`current_farm_id()`/`current_role()` read the caller's own `public.users`
row once per query and every policy builds on those two. `stock_history`
and `activity_logs` are deliberately append-only: their policies allow
SELECT and INSERT only, so "history should never be deleted" is enforced by
Postgres, not by the app remembering not to expose a delete button.

Regenerate `services/supabase/database.types.ts` from the real project once
it exists (`npx supabase gen types typescript --project-id <id> > ...`) —
it's hand-written for now, mirroring `schema.sql` exactly, so the app
compiles without a live project during development.

## Dashboard

`app/(app)/dashboard.tsx` pulls live data through `features/dashboard/api/*`
straight from Supabase: worker counts, today's attendance breakdown,
today's sales/expenses, current stock + low-stock alerts, a 7-day sales vs.
expenses chart (Victory Native), and a recent-activity feed off
`activity_logs`. Every widget is its own `useQuery` (see
`useDashboardData.ts`) so one slow/failing widget never blocks the rest of
the screen, each has its own skeleton loading state, and pull-to-refresh
invalidates all of them in parallel.

Since Stock, Sales and Expenses (Steps 9–11) don't exist yet, those numbers
start at zero/empty for a brand-new farm — that's correct, not a bug. Quick
Actions are real, tappable buttons that already point at where each
module's entry screen will live; until that step ships, tapping one shows a
"Coming in Step N" toast instead of a broken route (Add Worker and Mark
Attendance already deep-link for real, now that Steps 6 and 7 exist).
Labour-role users see a simplified placeholder instead of the full farm
view, since "see only your own attendance/salary" needs the worker-to-login
link that Team Management (Step 13) introduces.

## Labour Management

`app/(app)/workers/*` — a Permanent/Casual segmented list (search-filtered
client-side), an add/edit form (`features/labour/components/WorkerForm.tsx`)
that swaps its field set based on type, and a detail screen with
Edit/Deactivate/Delete actions gated by the permission matrix (Deactivate
sets `status = 'inactive'` and keeps history; Delete is a hard delete,
owner-only, matching `PERMISSIONS.DELETE_RECORDS`).

Worker photos go through `services/supabase/storage.ts` (`expo-file-system`
→ base64 → `supabase.storage.upload`) into the `worker-photos` bucket at
`{farm_id}/{worker_id}.jpg` — see `database/storage.sql` for the bucket +
RLS setup. A new worker is created first (to get its id), then the photo
uploads and patches `photo_url` in as a second step.

The Workers tab is hidden entirely for the `labour` role (`href: null` in
`app/(app)/_layout.tsx`) — matching "Labour can only see their own
attendance/salary" from the product brief.

## Attendance

`app/(app)/attendance/*` — a daily marking screen (`index.tsx`) listing every
active worker (permanent + casual together, via `listActiveWorkers`) with
five color-coded status pills — Present, Absent, Half Day, Leave, Late —
tapping one marks that worker for the selected day immediately, no separate
save step. Casual workers get an expandable "Today's Wage" (prefilled from
their daily wage, editable per day) + "Work done" note, since their pay is
computed per day rather than off a fixed salary. A "Mark all present" button
handles the common case of a full crew showing up, and the date header
(`DaySwitcher`) steps a day at a time or opens a calendar to jump further
(never into the future). `history.tsx` shows a month calendar with a dot on
every day that has at least one entry — green if everyone marked was
present, amber otherwise — tapping a date opens the marking screen for it.

Marking writes straight to Supabase's `attendance` table on an
`upsert(... onConflict: "worker_id,date")`, so re-marking a worker for a day
corrects the earlier entry rather than duplicating it. Offline, the same
write goes into the local SQLite outbox instead (`features/attendance/hooks/
useAttendance.ts`) and syncs automatically once connectivity returns; an
"Offline — changes will sync" notice appears on the marking screen while
disconnected. Reads (`getAttendanceForDate`, `getMonthAttendanceOverview`)
deliberately return plain arrays rather than `Map`s — TanStack Query's data
gets `JSON.stringify`'d into MMKV for offline persistence, and a `Map`
silently serializes to `"{}"`; each hook builds its own `Map` locally via
`useMemo` for lookup speed instead.

Marking attendance is gated by `PERMISSIONS.ENTER_ATTENDANCE` (owner +
supervisor); labour accounts see a placeholder in both the Attendance tab
and the dashboard until Step 13 links a login to a worker row, at which
point this same screen becomes "my attendance" for them. The worker detail
screen now shows a real "Attendance this month" summary
(`MonthlyAttendanceSummary`) instead of a placeholder, and the dashboard's
"Mark Attendance" quick action deep-links here for real.

## Roles

`owner` (full access) · `supervisor` (attendance/stock/sales, no deletes) ·
`labour` (own attendance/salary only). The permission matrix is centralized
in `constants/config.ts` (`PERMISSIONS`) and checked via `utils/permissions.ts`
(`can(role, "MANAGE_WORKERS")`, etc.) rather than scattered role string
comparisons.

## Build status

Being built step-by-step per the agreed build order. Currently complete:

- [x] Step 1 — Project initialization
- [x] Step 2 — Folder structure
- [x] Step 3 — Authentication
- [x] Step 4 — Database
- [x] Step 5 — Dashboard
- [x] Step 6 — Labour Management
- [x] Step 7 — Attendance
- [ ] Step 8 — Salary
- [ ] Step 9 — Stock Register
- [ ] Step 10 — Sales
- [ ] Step 11 — Expenses
- [ ] Step 12 — Reports
- [ ] Step 13 — Notifications & Settings
- [ ] Step 14 — Testing
- [ ] Step 15 — Production Build
