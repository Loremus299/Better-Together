CREATE TABLE "media" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"owner" text
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_owner_user_id_fkey" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE SET NULL;