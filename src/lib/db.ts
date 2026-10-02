import postgres from "postgres";

// One shared connection to the Supabase Postgres database, using the
// connection string in DATABASE_URL. Server-only: never import from a Client Component.
//
// `prepare: false` is required for Supabase's transaction pooler (port 6543),
// which is the recommended connection for serverless hosts like Vercel.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "");

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    ssl: isLocal ? false : "require",
    max: 5,
  });

// Reuse the connection across hot reloads in development.
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
