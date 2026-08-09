DROP INDEX "accounts_owner_email_key";--> statement-breakpoint
CREATE INDEX "accounts_owner_email_key" ON "accounts" USING btree ("owner_email");