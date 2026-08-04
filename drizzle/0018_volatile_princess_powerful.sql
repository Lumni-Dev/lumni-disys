ALTER TABLE "candidates" ADD COLUMN "phone" varchar(40) DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "candidates_account_id_idx" ON "candidates" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "candidates_job_id_idx" ON "candidates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "companies_account_id_idx" ON "companies" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "jobs_account_id_idx" ON "jobs" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "jobs_company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pipeline_cards_account_id_idx" ON "pipeline_cards" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "pipeline_cards_candidate_id_idx" ON "pipeline_cards" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "pipeline_cards_job_id_idx" ON "pipeline_cards" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "pipeline_cards_company_id_idx" ON "pipeline_cards" USING btree ("company_id");