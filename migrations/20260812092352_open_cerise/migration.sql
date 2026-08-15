CREATE TABLE "notification" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE CASCADE;