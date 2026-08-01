ALTER TABLE "user_profiles" ADD COLUMN "name" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "phone" varchar(40) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "role" varchar(120) DEFAULT '' NOT NULL;