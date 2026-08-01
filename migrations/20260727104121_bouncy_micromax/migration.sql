ALTER TABLE "habitProofs" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "header" text NOT NULL;--> statement-breakpoint
ALTER TABLE "habitTasks" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "habitTasks" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "habitTasks" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "habit" ADD CONSTRAINT "habit_header_media_id_fkey" FOREIGN KEY ("header") REFERENCES "media"("id") ON DELETE CASCADE;