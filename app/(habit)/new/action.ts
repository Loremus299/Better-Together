"use server";

import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { Result, ResultType } from "@/lib/result";
import { getSession } from "@/lib/server-util";

export async function createHabitAction({
  name,
  description,
}: {
  name: string;
  description: string;
}): Promise<ResultType<string, string>> {
  const log = new Logger();
  log.trace({ layer: "Create habit action" });
  log.debug({ name, description });
  try {
    const session = await getSession();
    if (!session) {
      return Result.error<string, string>("Session not found").type();
    }
    log.info({ user: session.user.id });

    return (
      await habitService.create({
        user: session.user.id,
        name,
        description,
        log,
      })
    ).type();
  } finally {
    log.print();
  }
}
