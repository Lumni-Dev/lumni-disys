ALTER TABLE "team_members" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "invite_token" varchar(40);--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_invite_token_key" ON "team_members" USING btree ("invite_token");--> statement-breakpoint
UPDATE "team_members" SET "status" = 'accepted';