ALTER TABLE "candidates" ADD COLUMN "cv_name" varchar(200) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "cv_base64" text DEFAULT '' NOT NULL;