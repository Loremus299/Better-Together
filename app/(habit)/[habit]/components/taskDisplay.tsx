import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import UpdateTaskDialog from "./updateTaskDialog";

export default async function TaskDisplay({
  task,
  name,
  description,
}: {
  task: string;
  name: string;
  description: string;
}) {
  const log = new Logger();
  const session = await getSession();
  if (!session) {
    log.print();
    redirect("/auth/login");
  }
  const proof = await habitService.readProofsByTask({ task, log });

  if (!proof.value.success) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  return (
    <div>
      <div className="flex justify-between">
        <h3
          className={cn(
            "tracking-tight font-semibold",
            proof.value.data.filter((i) => i.user == session.user.id).length ===
              0
              ? ""
              : "line-through text-muted-foreground",
          )}
        >
          {name}
        </h3>
        <UpdateTaskDialog description={description} task={name} id={task} />
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
