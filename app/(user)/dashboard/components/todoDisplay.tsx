import { habitService } from "@/app/api/habit/service";
import { db } from "@/db";
import { habitTasksTable } from "@/db/schema";
import { userId } from "@/lib/server-util";
import { InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TodoDisplay() {
  const id = await userId();
  if (!id.success) {
    redirect("/auth/login");
  }

  const habits = await habitService.readAllHabitsByUser({
    userId: id.data,
    tx: db,
  });

  if (!habits.success) {
    redirect(`/error?e=${habits.error}`);
  }

  const todos: InferSelectModel<typeof habitTasksTable>[][] = [];
  for (const habit of habits.data) {
    const todo = await habitService.readAllTasksByHabit({
      userId: id.data,
      habitId: habit.id,
      tx: db,
    });

    if (!todo.success) {
      redirect(`/error?e=${todo.error}`);
    }

    todos.push(todo.data);
  }
}
