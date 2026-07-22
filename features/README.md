# features/

Each subfolder is a **self-contained module** — everything a feature needs
(screens' business logic, hooks, API calls, feature-specific components,
Zod schemas, and Zustand slices if needed) lives together instead of being
scattered across generic `components/`/`hooks/` folders.

Convention for every feature module (filled in as each build step ships):

```
features/<name>/
  api/          # Supabase queries + TanStack Query hooks (useXQuery, useXMutation)
  components/   # UI pieces used only by this feature
  schemas.ts    # Zod validation schemas for this feature's forms
  types.ts      # Feature-local types not shared elsewhere
```

Routes in `app/` stay thin: they import from here and mostly just handle
layout/navigation, so business logic is unit-testable independent of
React Native.

| Folder | Ships in |
| --- | --- |
| `auth` | Step 3 |
| `dashboard` | Step 5 |
| `labour` | Step 6 |
| `attendance` | Step 7 |
| `salary` | Step 8 |
| `stock` | Step 9 |
| `sales` | Step 10 |
| `expenses` | Step 11 |
| `reports` | Step 12 |
| `notifications` | Step 13 |
| `settings` | Step 13 |
