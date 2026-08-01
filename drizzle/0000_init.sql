CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"role" varchar(160) DEFAULT '' NOT NULL,
	"email" varchar(200) DEFAULT '' NOT NULL,
	"stage" varchar(40) DEFAULT 'Triagem' NOT NULL,
	"linkedin" varchar(300) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"sector" varchar(120) DEFAULT '' NOT NULL,
	"location" varchar(160) DEFAULT '' NOT NULL,
	"openings" integer DEFAULT 0 NOT NULL,
	"status" varchar(40) DEFAULT 'Ativa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"company" varchar(160) DEFAULT '' NOT NULL,
	"type" varchar(40) DEFAULT 'Remoto' NOT NULL,
	"level" varchar(40) DEFAULT 'Pleno' NOT NULL,
	"applicants" integer DEFAULT 0 NOT NULL,
	"status" varchar(40) DEFAULT 'Aberta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"module" varchar(40) NOT NULL,
	"action" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" varchar(300) DEFAULT '' NOT NULL,
	"tone" varchar(20) DEFAULT 'neutral' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"job" varchar(200) DEFAULT '' NOT NULL,
	"company" varchar(160) DEFAULT '' NOT NULL,
	"stage" varchar(40) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(200) NOT NULL,
	"role" varchar(120) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_permissions" ADD CONSTRAINT "member_permissions_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "member_permissions_unique" ON "member_permissions" USING btree ("member_id","module","action");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_email_key" ON "team_members" USING btree ("email");