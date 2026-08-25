import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import { redirect } from "next/navigation";
import UpdateTaskDialog from "./updateTaskDialog";
import { habitOps } from "@/app/api/ops/habit";
import AddProofDialog from "./addProofDialog";
import TaskDisplayClient from "./taskDisplayClient";

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
  const isMember = await habitOps.isUserMember({
    user: session.user.id,
    habit,
    log,
  });
  const isChecker = await habitOps.isUserChecker({
    user: session.user.id,
    habit,
    log,
  });

  if (
    !proof.value.success ||
    !isMember.value.success ||
    !isChecker.value.success
  ) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  const userArr = proof.value.data
    .filter((i) => i.user === session.user.id)
    .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));

  return (
    <div>
      <div className="flex justify-between">
        <TaskDisplayClient proofList={userArr} task={name} />
        <div className="flex gap-2">
          {(!isMember.value.data || !isChecker.value.data) && (
            <UpdateTaskDialog description={description} task={name} id={task} />
          )}
          {!isChecker.value.data && <AddProofDialog description="" id={task} />}
        </div>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
