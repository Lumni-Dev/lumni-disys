import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await db.delete(schema.pipelineCards);
  await db.delete(schema.notifications);
  await db.delete(schema.candidates);
  await db.delete(schema.jobs);
  await db.delete(schema.companies);

  await pool.end();
  console.log("Seed data cleared (team members kept).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
