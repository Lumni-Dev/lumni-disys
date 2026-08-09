import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { jobs, candidates, initialColumns } from "../lib/data";
import { initialTeam, MODULES, ACTIONS } from "../lib/permissions";

async function main() {
  const useSsl = (process.env.DATABASE_URL ?? "").includes("supabase.co");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await db.delete(schema.memberPermissions);
  await db.delete(schema.teamMembers);
  await db.delete(schema.pipelineCards);
  await db.delete(schema.candidates);
  await db.delete(schema.jobs);

  await db.insert(schema.jobs).values(
    jobs.map((j) => ({
      title: j.title,
      company: j.company,
      type: j.type,
      level: j.level,
      description: j.description,
      openings: j.openings,
      applicants: j.applicants,
      status: j.status,
    })),
  );



  const cardStageByName = new Map(
    initialColumns.flatMap((col) =>
      col.cards.map((card) => [card.name, col.stage] as const),
    ),
  );

  const candidateRows = await db
    .insert(schema.candidates)
    .values(
      candidates.map((c) => ({
        name: c.name,
        role: c.role,
        email: c.email,
        stage: cardStageByName.get(c.name) ?? c.stage,
        linkedin: c.linkedin ?? "",
      })),
    )
    .returning({ id: schema.candidates.id, name: schema.candidates.name });

  const candidateIdByName = new Map(candidateRows.map((c) => [c.name, c.id]));

  const cards = initialColumns.flatMap((col) =>
    col.cards.map((card, i) => ({
      candidateId: candidateIdByName.get(card.name) ?? null,
      name: card.name,
      job: card.job,
      company: card.company,
      stage: col.stage,
      position: i,
    })),
  );
  await db.insert(schema.pipelineCards).values(cards);

  for (const member of initialTeam) {
    const [row] = await db
      .insert(schema.teamMembers)
      .values({ name: member.name, email: member.email, role: member.role })
      .returning({ id: schema.teamMembers.id });

    const perms: { memberId: number; module: string; action: string }[] = [];
    for (const mod of MODULES) {
      for (const act of ACTIONS) {
        if (member.permissions[mod.key]?.[act.key]) {
          perms.push({ memberId: row.id, module: mod.key, action: act.key });
        }
      }
    }
    if (perms.length) await db.insert(schema.memberPermissions).values(perms);
  }

  await pool.end();
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
