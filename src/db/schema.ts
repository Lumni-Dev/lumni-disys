import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
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

// Workspace/conta: o projeto de um dono. Todos os dados sao escopados por conta;
// colaboradores pertencem a uma conta e o link publico usa o public_token.
export const accounts = pgTable(
  "accounts",
  {
    id: serial().primaryKey(),
    ownerEmail: varchar({ length: 200 }).notNull(),
    publicToken: varchar({ length: 40 }).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("accounts_owner_email_key").on(t.ownerEmail),
    uniqueIndex("accounts_public_token_key").on(t.publicToken),
  ],
);

export const companies = pgTable("companies", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  name: varchar({ length: 160 }).notNull(),
  sector: varchar({ length: 120 }).notNull().default(""),
  location: varchar({ length: 160 }).notNull().default(""),
  openings: integer().notNull().default(0),
  status: varchar({ length: 40 }).notNull().default("Ativa"),
  ...timestamps,
});

export const jobs = pgTable("jobs", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  title: varchar({ length: 200 }).notNull(),
  company: varchar({ length: 160 }).notNull().default(""),
  // Descricao da vaga (ate 5000 caracteres, limitado na API).
  description: text().notNull().default(""),
  type: varchar({ length: 40 }).notNull().default("Remoto"),
  level: varchar({ length: 40 }).notNull().default("Pleno"),
  // Quantidade de posicoes abertas nesta vaga (informado ao criar).
  openings: integer().notNull().default(1),
  // Contador automatico de candidaturas (nao editavel no modal).
  applicants: integer().notNull().default(0),
  status: varchar({ length: 40 }).notNull().default("Aberta"),
  ...timestamps,
});

export const candidates = pgTable("candidates", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  name: varchar({ length: 160 }).notNull(),
  role: varchar({ length: 160 }).notNull().default(""),
  email: varchar({ length: 200 }).notNull().default(""),
  stage: varchar({ length: 40 }).notNull().default("Triagem"),
  linkedin: varchar({ length: 300 }).notNull().default(""),
  // Curriculo anexado na candidatura publica (data URL base64, ate ~2 MB).
  cvName: varchar({ length: 200 }).notNull().default(""),
  cvBase64: text().notNull().default(""),
  // Compatibilidade curriculo x vaga (0 a 100) calculada por IA na
  // candidatura; null quando nao analisado.
  matchScore: integer(),
  ...timestamps,
});

export const pipelineCards = pgTable("pipeline_cards", {
  id: serial().primaryKey(),
  accountId: integer().references(() => accounts.id),
  candidateId: integer().references(() => candidates.id, {
    onDelete: "set null",
  }),
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
    accountId: integer().references(() => accounts.id),
    name: varchar({ length: 160 }).notNull(),
    email: varchar({ length: 200 }).notNull(),
    role: varchar({ length: 120 }).notNull().default(""),
    // Convite: nasce "pending" e vira "accepted" quando a pessoa aceita.
    status: varchar({ length: 20 }).notNull().default("pending"),
    // Token do link de aceite enviado por e-mail (limpo apos o aceite).
    inviteToken: varchar({ length: 40 }),
    ...timestamps,
  },
  // Unico por workspace: a mesma pessoa pode colaborar em varias contas.
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
    // Workspace em que a pessoa esta trabalhando (null = resolucao padrao).
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
