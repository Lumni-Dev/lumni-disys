import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const companies = pgTable("companies", {
  id: serial().primaryKey(),
  name: varchar({ length: 160 }).notNull(),
  sector: varchar({ length: 120 }).notNull().default(""),
  location: varchar({ length: 160 }).notNull().default(""),
  openings: integer().notNull().default(0),
  status: varchar({ length: 40 }).notNull().default("Ativa"),
  ...timestamps,
});

export const jobs = pgTable("jobs", {
  id: serial().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  company: varchar({ length: 160 }).notNull().default(""),
  type: varchar({ length: 40 }).notNull().default("Remoto"),
  level: varchar({ length: 40 }).notNull().default("Pleno"),
  applicants: integer().notNull().default(0),
  status: varchar({ length: 40 }).notNull().default("Aberta"),
  ...timestamps,
});

export const candidates = pgTable("candidates", {
  id: serial().primaryKey(),
  name: varchar({ length: 160 }).notNull(),
  role: varchar({ length: 160 }).notNull().default(""),
  email: varchar({ length: 200 }).notNull().default(""),
  stage: varchar({ length: 40 }).notNull().default("Triagem"),
  linkedin: varchar({ length: 300 }).notNull().default(""),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: serial().primaryKey(),
  title: varchar({ length: 160 }).notNull(),
  description: varchar({ length: 300 }).notNull().default(""),
  tone: varchar({ length: 20 }).notNull().default("neutral"),
  read: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const pipelineCards = pgTable("pipeline_cards", {
  id: serial().primaryKey(),
  name: varchar({ length: 160 }).notNull(),
  job: varchar({ length: 200 }).notNull().default(""),
  company: varchar({ length: 160 }).notNull().default(""),
  stage: varchar({ length: 40 }).notNull(),
  position: integer().notNull().default(0),
  ...timestamps,
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 160 }).notNull(),
    email: varchar({ length: 200 }).notNull(),
    role: varchar({ length: 120 }).notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("team_members_email_key").on(t.email)],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: serial().primaryKey(),
    email: varchar({ length: 200 }).notNull(),
    avatarBase64: text().notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("user_profiles_email_key").on(t.email)],
);

export const memberPermissions = pgTable(
  "member_permissions",
  {
    id: serial().primaryKey(),
    memberId: integer()
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    module: varchar({ length: 40 }).notNull(),
    action: varchar({ length: 20 }).notNull(),
  },
  (t) => [
    uniqueIndex("member_permissions_unique").on(t.memberId, t.module, t.action),
  ],
);
