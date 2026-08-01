import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  // Cobre a conexao direta (supabase.co) e o pooler (pooler.supabase.com).
  const useSsl = (process.env.DATABASE_URL ?? "").includes("supabase");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
