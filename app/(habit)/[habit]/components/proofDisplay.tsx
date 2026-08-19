import { user } from "@/db/schema";
import { drizzleOps } from "@/app/api/ops/drizzle";
import { eq } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import { habitService } from "@/app/api/habit/service";
import { redirect } from "next/navigation";
import ProofDisplayClient from "./proofDisplayClient";
import { mediaOps } from "@/app/api/ops/media";

export default async function ProofDisplay({
  id,
  currentUser,
  userid,
  proofTime,
  task,
  proofStatus,
  description,
  media,
}: {
  id: string;
  currentUser: string;
  userid: string;
  proofTime: string;
  task: string;
  proofStatus: string;
  description: string | null;
  media: string | null;
}) {
  const log = new Logger();

  const userDetails = await drizzleOps.readWithCondition(
    user,
    (user) => eq(user.id, userid),
    log,
  );

  let url: string | undefined = undefined;

  if (media) {
    (await mediaOps.readFile({ id: media, log })).mapOk((t) => (url = t));
  }

  const taskDetails = await habitService.readTaskById({ id: task, log });

  if (!taskDetails.value.success || !userDetails.value.success) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  log.print();

  return (
    <ProofDisplayClient
      id={id}
      proofTime={proofTime}
      isSelf={currentUser === userDetails.value.data.id}
      proofStatus={proofStatus}
      userName={userDetails.value.data.name}
      description={description}
      task={taskDetails.value.data.task}
      url={url}
    />
  );
}
