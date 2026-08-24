import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { redirect } from "next/navigation";
import TaskDisplayClient from "./taskDisplayClient";

export default async function TaskDisplay({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) {
  const log = new Logger();
  const proof = await habitService.readProofsByTask({ task: id, log });

  if (!proof.value.success) {
    log.print();
    redirect(`/error?e=${proof.value.error}&id=${log.getId()}`);
  }

  return (
    <TaskDisplayClient
      name={name}
      description={description}
      proofList={proof.value.data}
    />
  );
}
