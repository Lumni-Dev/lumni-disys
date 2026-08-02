ALTER TABLE "pipeline_cards" ADD COLUMN "candidate_id" integer;--> statement-breakpoint
ALTER TABLE "pipeline_cards" ADD CONSTRAINT "pipeline_cards_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "pipeline_cards" pc
SET "candidate_id" = (
	SELECT c."id"
	FROM "candidates" c
	WHERE c."name" = pc."name"
		AND c."account_id" IS NOT DISTINCT FROM pc."account_id"
	ORDER BY c."id"
	LIMIT 1
)
WHERE pc."candidate_id" IS NULL;