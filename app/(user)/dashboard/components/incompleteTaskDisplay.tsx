import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { redirect } from "next/navigation";
import TaskDisplay from "./taskDisplay";

export default async function IncompleteTaskDisplay({
  user,
}: {
  user: string;
}) {
  const log = new Logger();
  const tasks = await habitService.readTaskByUser({ user, log });

  if (!tasks.value.success) {
    log.print();
    redirect(`/error?e=${tasks.value.error}&id=${log.getId()}`);
  }

  return (
    <div className="w-full h-full @container p-4">
      <div className="grid gap-2">
        {tasks.value.data.flat().map((item) => (
          <TaskDisplay
            key={item.id}
            id={item.id}
            name={item.task}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
