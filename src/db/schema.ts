import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};



export const accounts = pgTable(
  "accounts",
  {
    id: serial().primaryKey(),
    ownerEmail: varchar({ length: 200 }).notNull(),


    name: varchar({ length: 120 }).notNull().default(""),
    publicToken: varchar({ length: 40 }).notNull(),


    plan: varchar({ length: 20 }).notNull().default("free"),
    stripeCustomerId: varchar({ length: 80 }).notNull().default(""),
    stripeSubscriptionId: varchar({ length: 80 }).notNull().default(""),

    stripeStatus: varchar({ length: 40 }).notNull().default(""),

    cancelAtPeriodEnd: boolean().notNull().default(false),

    planRenewsAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [

    index("accounts_owner_email_key").on(t.ownerEmail),
    uniqueIndex("accounts_public_token_key").on(t.publicToken),
  ],
);

export const jobs = pgTable("jobs", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  title: varchar({ length: 200 }).notNull(),


  company: varchar({ length: 160 }).notNull().default(""),

  description: text().notNull().default(""),
  type: varchar({ length: 40 }).notNull().default("Remoto"),
  level: varchar({ length: 40 }).notNull().default("Pleno"),

  openings: integer().notNull().default(1),

  applicants: integer().notNull().default(0),

  salaryFrom: integer().notNull().default(0),
  salaryTo: integer().notNull().default(0),
  status: varchar({ length: 40 }).notNull().default("Aberta"),
  ...timestamps,
}, (t) => [
  index("jobs_account_id_idx").on(t.accountId),
]);

export const candidates = pgTable("candidates", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),


  jobId: integer().references(() => jobs.id, { onDelete: "set null" }),
  name: varchar({ length: 160 }).notNull(),
  role: varchar({ length: 160 }).notNull().default(""),
  email: varchar({ length: 200 }).notNull().default(""),
  stage: varchar({ length: 40 }).notNull().default("Triagem"),
  linkedin: varchar({ length: 300 }).notNull().default(""),


  phone: varchar({ length: 40 }).notNull().default(""),

  cvName: varchar({ length: 200 }).notNull().default(""),
  cvBase64: text().notNull().default(""),


  matchScore: integer(),
  ...timestamps,
}, (t) => [
  index("candidates_account_id_idx").on(t.accountId),
  index("candidates_job_id_idx").on(t.jobId),
]);

export const pipelineCards = pgTable("pipeline_cards", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  candidateId: integer().references(() => candidates.id, {
    onDelete: "set null",
  }),


  jobId: integer().references(() => jobs.id, { onDelete: "set null" }),
  name: varchar({ length: 160 }).notNull(),
  job: varchar({ length: 200 }).notNull().default(""),
  company: varchar({ length: 160 }).notNull().default(""),
  stage: varchar({ length: 40 }).notNull(),
  position: integer().notNull().default(0),
  ...timestamps,
}, (t) => [
  index("pipeline_cards_account_id_idx").on(t.accountId),
  index("pipeline_cards_candidate_id_idx").on(t.candidateId),
  index("pipeline_cards_job_id_idx").on(t.jobId),
]);

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial().primaryKey(),
    accountId: integer().references(() => accounts.id),
    name: varchar({ length: 160 }).notNull(),
    email: varchar({ length: 200 }).notNull(),
    role: varchar({ length: 120 }).notNull().default(""),

    status: varchar({ length: 20 }).notNull().default("pending"),

    inviteToken: varchar({ length: 40 }),
    ...timestamps,
  },

  (t) => [
    uniqueIndex("team_members_account_email_key").on(t.accountId, t.email),
    uniqueIndex("team_members_invite_token_key").on(t.inviteToken),
  ],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: serial().primaryKey(),
    email: varchar({ length: 200 }).notNull(),

    activeAccountId: integer().references(() => accounts.id, {
      onDelete: "set null",
    }),
    name: varchar({ length: 160 }).notNull().default(""),
    phone: varchar({ length: 40 }).notNull().default(""),
    role: varchar({ length: 120 }).notNull().default(""),
    avatarBase64: text().notNull().default(""),
    theme: varchar({ length: 20 }).notNull().default("white"),
    ...timestamps,
  },
  (t) => [uniqueIndex("user_profiles_email_key").on(t.email)],
);




export const userBilling = pgTable(
  "user_billing",
  {
    id: serial().primaryKey(),
    email: varchar({ length: 200 }).notNull(),
    plan: varchar({ length: 20 }).notNull().default("free"),
    stripeCustomerId: varchar({ length: 80 }).notNull().default(""),
    stripeSubscriptionId: varchar({ length: 80 }).notNull().default(""),

    stripeStatus: varchar({ length: 40 }).notNull().default(""),

    cancelAtPeriodEnd: boolean().notNull().default(false),

    planRenewsAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("user_billing_email_key").on(t.email)],
);



export const deletedAccounts = pgTable("deleted_accounts", {
  id: serial().primaryKey(),

  accountId: integer().notNull(),
  ownerEmail: varchar({ length: 200 }).notNull(),

  accountCreatedAt: timestamp({ withTimezone: true }).notNull(),

  companiesCount: integer().notNull().default(0),
  jobsCount: integer().notNull().default(0),
  candidatesCount: integer().notNull().default(0),
  teamMembersCount: integer().notNull().default(0),
  deletedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

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
