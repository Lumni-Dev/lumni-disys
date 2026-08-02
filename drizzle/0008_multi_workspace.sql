DROP INDEX "team_members_email_key";--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "active_account_id" integer;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_active_account_id_accounts_id_fk" FOREIGN KEY ("active_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_account_email_key" ON "team_members" USING btree ("account_id","email");