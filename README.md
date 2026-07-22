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
- [ ] Step 3 — Authentication
- [ ] Step 4 — Database
- [ ] Step 5 — Dashboard
- [ ] Step 6 — Labour Management
- [ ] Step 7 — Attendance
- [ ] Step 8 — Salary
- [ ] Step 9 — Stock Register
- [ ] Step 10 — Sales
- [ ] Step 11 — Expenses
- [ ] Step 12 — Reports
- [ ] Step 13 — Notifications & Settings
- [ ] Step 14 — Testing
- [ ] Step 15 — Production Build
