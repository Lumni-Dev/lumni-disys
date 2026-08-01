import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "pg";

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  const dbName = decodeURIComponent(url.pathname.slice(1));
  url.pathname = "/postgres";

  const client = new Client({ connectionString: url.toString() });
  await client.connect();

  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName],
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created.`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
