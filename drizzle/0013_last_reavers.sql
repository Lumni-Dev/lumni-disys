CREATE TABLE "deleted_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"owner_email" varchar(200) NOT NULL,
	"account_created_at" timestamp with time zone NOT NULL,
	"companies_count" integer DEFAULT 0 NOT NULL,
	"jobs_count" integer DEFAULT 0 NOT NULL,
	"candidates_count" integer DEFAULT 0 NOT NULL,
	"team_members_count" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL
);
