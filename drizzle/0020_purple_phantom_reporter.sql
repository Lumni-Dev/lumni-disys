CREATE TABLE "user_billing" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(80) DEFAULT '' NOT NULL,
	"stripe_subscription_id" varchar(80) DEFAULT '' NOT NULL,
	"stripe_status" varchar(40) DEFAULT '' NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"plan_renews_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "name" varchar(120) DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_billing_email_key" ON "user_billing" USING btree ("email");--> statement-breakpoint
INSERT INTO "user_billing" ("email", "plan", "stripe_customer_id", "stripe_subscription_id", "stripe_status", "cancel_at_period_end", "plan_renews_at")
SELECT "owner_email", "plan", "stripe_customer_id", "stripe_subscription_id", "stripe_status", "cancel_at_period_end", "plan_renews_at"
FROM "accounts"
WHERE "plan" <> 'free' OR "stripe_customer_id" <> '' OR "stripe_subscription_id" <> ''
ON CONFLICT ("email") DO NOTHING;