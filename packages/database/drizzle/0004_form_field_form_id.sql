CREATE TABLE IF NOT EXISTS "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(50),
	"description" varchar(150),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'forms_created_by_users_id_fk'
	) THEN
		ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."fieldTypeEnum" AS ENUM('TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form-fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(100) NOT NULL,
	"label_key" varchar(100) NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric NOT NULL,
	"type" "fieldTypeEnum" NOT NULL,
	"form_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "form-fields_form_id_index_unique" UNIQUE("form_id","index")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "form-fields" DROP CONSTRAINT IF EXISTS "form-fields_created_by_forms_id_fk";
	ALTER TABLE "form-fields" DROP CONSTRAINT IF EXISTS "form-fields_created_by_index_unique";

	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'form-fields'
			AND column_name = 'created_by'
	) AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'form-fields'
			AND column_name = 'form_id'
	) THEN
		ALTER TABLE "form-fields" RENAME COLUMN "created_by" TO "form_id";
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'form-fields_form_id_forms_id_fk'
	) THEN
		ALTER TABLE "form-fields" ADD CONSTRAINT "form-fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'form-fields_form_id_index_unique'
	) THEN
		ALTER TABLE "form-fields" ADD CONSTRAINT "form-fields_form_id_index_unique" UNIQUE("form_id","index");
	END IF;
END $$;
