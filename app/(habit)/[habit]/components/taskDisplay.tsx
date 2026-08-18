import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import UpdateTaskDialog from "./updateTaskDialog";
import { habitOps } from "@/app/api/ops/habit";
import AddProofDialog from "./addProofDialog";

export default async function TaskDisplay({
  task,
  name,
  habit,
  description,
}: {
  task: string;
  name: string;
  habit: string;
  description: string;
}) {
  const log = new Logger();
  const session = await getSession();
  if (!session) {
    log.print();
    redirect("/auth/login");
  }
  const proof = await habitService.readProofsByTask({ task, log });
  const isAdmin = await habitOps.isUserMember({
    user: session.user.id,
    habit,
    log,
  });

  if (!proof.value.success || !isAdmin.value.success) {
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
        <div className="flex gap-2">
          {isAdmin && (
            <UpdateTaskDialog description={description} task={name} id={task} />
          )}
          <AddProofDialog description="" id={task} />
        </div>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
