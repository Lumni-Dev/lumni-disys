import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

// Cobre a conexao direta (db.<ref>.supabase.co) e o pooler
// (aws-0-<regiao>.pooler.supabase.com); ambos exigem SSL.
const useSsl = (process.env.DATABASE_URL ?? "").includes("supabase");

// Pool enxuto: em serverless cada instance quente mantem seu proprio pool,
// entao um max baixo evita saturar o pooler do Postgres sob concorrencia, e
// conexoes ociosas sao liberadas rapido.
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema, casing: "snake_case" });
export { schema };
