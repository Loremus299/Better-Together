ALTER TABLE "media" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;