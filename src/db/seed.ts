import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import {
  companies,
  jobs,
  candidates,
  notifications,
  initialColumns,
} from "../lib/data";
import { initialTeam, MODULES, ACTIONS } from "../lib/permissions";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await db.delete(schema.memberPermissions);
  await db.delete(schema.teamMembers);
  await db.delete(schema.pipelineCards);
  await db.delete(schema.notifications);
  await db.delete(schema.candidates);
  await db.delete(schema.jobs);
  await db.delete(schema.companies);

  await db.insert(schema.companies).values(
    companies.map((c) => ({
      name: c.name,
      sector: c.sector,
      location: c.location,
      openings: c.openings,
      status: c.status,
    })),
  );

  await db.insert(schema.jobs).values(
    jobs.map((j) => ({
      title: j.title,
      company: j.company,
      type: j.type,
      level: j.level,
      applicants: j.applicants,
      status: j.status,
    })),
  );

  await db.insert(schema.candidates).values(
    candidates.map((c) => ({
      name: c.name,
      role: c.role,
      email: c.email,
      stage: c.stage,
      linkedin: c.linkedin ?? "",
    })),
  );

  await db.insert(schema.notifications).values(
    notifications.map((n) => ({
      title: n.title,
      description: n.description,
      tone: n.tone,
      read: n.read,
    })),
  );

  const cards = initialColumns.flatMap((col) =>
    col.cards.map((card, i) => ({
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
