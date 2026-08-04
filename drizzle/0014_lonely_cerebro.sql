ALTER TABLE "jobs" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: vincula cada vaga existente a empresa da mesma conta cujo nome
-- bate (sem diferenciar maiusculas/espacos). Vagas sem correspondencia ficam
-- com company_id nulo (orfas) e nao contam para nenhuma empresa.
UPDATE "jobs" AS j
SET "company_id" = co."id"
FROM "companies" AS co
WHERE co."account_id" = j."account_id"
  AND lower(trim(co."name")) = lower(trim(j."company"))
  AND j."company_id" IS NULL;