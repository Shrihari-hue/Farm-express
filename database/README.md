# database/

Holds the PostgreSQL/Supabase schema as plain, version-controlled SQL —
the full `schema.sql` (tables, foreign keys, indexes, constraints),
`policies.sql` (Row Level Security) and `seed.sql` land in **Step 4**.

Migrations will be added incrementally under `database/migrations/` as
`NNNN_description.sql`, applied via the Supabase CLI (`supabase db push`)
so schema history stays reviewable in git rather than only living inside
the Supabase dashboard.
