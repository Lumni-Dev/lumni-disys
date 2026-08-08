-- O workspace passa a ser a empresa: preenche o nome denormalizado das vagas
-- e dos cards com o nome do workspace (accounts.name) antes de remover empresas.
UPDATE "jobs" j SET "company" = a."name"
FROM "accounts" a WHERE j."account_id" = a."id" AND a."name" <> '';--> statement-breakpoint
UPDATE "pipeline_cards" p SET "company" = a."name"
FROM "accounts" a WHERE p."account_id" = a."id" AND a."name" <> '';--> statement-breakpoint
-- DROP TABLE ... CASCADE ja remove as FKs dependentes (jobs/pipeline_cards).
DROP TABLE IF EXISTS "companies" CASCADE;--> statement-breakpoint
DROP INDEX IF EXISTS "jobs_company_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "pipeline_cards_company_id_idx";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "company_id";--> statement-breakpoint
ALTER TABLE "pipeline_cards" DROP COLUMN IF EXISTS "company_id";
