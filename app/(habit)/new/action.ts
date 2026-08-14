"use server";

import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { Result, ResultType } from "@/lib/result";
import { getSession } from "@/lib/server-util";
import z from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
export type CreateHabitValues = z.infer<typeof createHabitSchema>;

export async function createHabitAction(
  values: CreateHabitValues,
): Promise<ResultType<string, string>> {
  const log = new Logger();
  log.trace({ layer: "Create habit action" });
  log.debug({ ...values });
  try {
    const session = await getSession();
    if (!session) {
      return Result.error<string, string>("Session not found").type();
    }
    log.info({ user: session.user.id });

    return (
      await habitService.create({
        user: session.user.id,
        name: values.name,
        description: values.description,
        log,
      })
    ).type();
  } finally {
    log.print();
  }
}
