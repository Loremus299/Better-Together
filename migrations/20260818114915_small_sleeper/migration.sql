ALTER TABLE "habitProofs" DROP CONSTRAINT "habitProofs_habit_habit_id_fkey";--> statement-breakpoint
ALTER TABLE "habitProofs" ADD COLUMN "task" text NOT NULL;--> statement-breakpoint
ALTER TABLE "habitProofs" ADD COLUMN "user" text NOT NULL;--> statement-breakpoint
ALTER TABLE "habitProofs" DROP COLUMN "habit";--> statement-breakpoint
ALTER TABLE "habitProofs" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "habitProofs" ALTER COLUMN "media" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "habitProofs" ADD CONSTRAINT "habitProofs_task_habitTasks_id_fkey" FOREIGN KEY ("task") REFERENCES "habitTasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "habitProofs" ADD CONSTRAINT "habitProofs_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE CASCADE;