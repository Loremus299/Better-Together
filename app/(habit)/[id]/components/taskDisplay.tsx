import { habitService } from "@/app/api/habit/service";
import { db } from "@/db";
import { IconPencil } from "@tabler/icons-react";
import { redirect } from "next/navigation";

export default async function TaskDisplay({
  habitId,
  userId,
  isAdmin,
}: {
  habitId: string;
  userId: string;
  isAdmin: boolean;
}) {
  const todos = await habitService.readAllTasksByHabit({
    userId,
    habitId,
    tx: db,
  });

  if (!todos.success) {
    redirect(`/error?e=${todos.error}`);
  }

  return (
    <div className="w-full h-full p-4">
      <div className="grid gap-2">
        {todos.data.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="tracking-tight font-semibold">{item.task}</p>
              {isAdmin && <IconPencil className="size-4" />}
            </div>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
