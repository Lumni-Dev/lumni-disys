CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_email" varchar(200) NOT NULL,
	"public_token" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "account_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_owner_email_key" ON "accounts" USING btree ("owner_email");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_public_token_key" ON "accounts" USING btree ("public_token");--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD CONSTRAINT "pipeline_cards_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;