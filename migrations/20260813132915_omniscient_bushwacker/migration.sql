CREATE TYPE "proofStatus" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "roles" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "habitMembers" (
	"id" text PRIMARY KEY,
	"habit" text NOT NULL,
	"member" text NOT NULL,
	"role" "roles" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habitProofs" (
	"id" text PRIMARY KEY,
	"habit" text NOT NULL,
	"timestamp" text,
	"description" text,
	"media" text NOT NULL,
	"proofStatus" "proofStatus" NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"header" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habitTasks" (
	"id" text PRIMARY KEY,
	"habit" text NOT NULL,
	"task" text NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "habitMembers" ADD CONSTRAINT "habitMembers_habit_habit_id_fkey" FOREIGN KEY ("habit") REFERENCES "habit"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habitMembers" ADD CONSTRAINT "habitMembers_member_user_id_fkey" FOREIGN KEY ("member") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habitProofs" ADD CONSTRAINT "habitProofs_habit_habit_id_fkey" FOREIGN KEY ("habit") REFERENCES "habit"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habitProofs" ADD CONSTRAINT "habitProofs_media_media_id_fkey" FOREIGN KEY ("media") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habit" ADD CONSTRAINT "habit_header_media_id_fkey" FOREIGN KEY ("header") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habitTasks" ADD CONSTRAINT "habitTasks_habit_habit_id_fkey" FOREIGN KEY ("habit") REFERENCES "habit"("id") ON DELETE CASCADE;