CREATE TYPE "public"."fieldTypeEnum" AS ENUM('TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD');
--> statement-breakpoint
CREATE TABLE "form-fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(100) NOT NULL,
	"label_key" varchar(100) NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric NOT NULL,
	"type" "fieldTypeEnum" NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "form-fields_created_by_index_unique" UNIQUE("created_by","index")
);
--> statement-breakpoint
ALTER TABLE "form-fields" ADD CONSTRAINT "form-fields_created_by_forms_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;
