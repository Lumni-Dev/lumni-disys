ALTER TABLE "candidates" ADD COLUMN "job_id" integer;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD COLUMN "job_id" integer;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD CONSTRAINT "pipeline_cards_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD CONSTRAINT "pipeline_cards_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: vincula por ID casando pelo titulo/nome dentro da mesma conta.
UPDATE "candidates" c
SET "job_id" = j."id"
FROM "jobs" j
WHERE j."account_id" = c."account_id"
  AND lower(trim(j."title")) = lower(trim(c."role"))
  AND c."job_id" IS NULL;--> statement-breakpoint
UPDATE "pipeline_cards" pc
SET "job_id" = j."id"
FROM "jobs" j
WHERE j."account_id" = pc."account_id"
  AND lower(trim(j."title")) = lower(trim(pc."job"))
  AND pc."job_id" IS NULL;--> statement-breakpoint
UPDATE "pipeline_cards" pc
SET "company_id" = co."id"
FROM "companies" co
WHERE co."account_id" = pc."account_id"
  AND lower(trim(co."name")) = lower(trim(pc."company"))
  AND pc."company_id" IS NULL;