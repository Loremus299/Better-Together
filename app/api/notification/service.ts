import { Logger } from "@/lib/logger";
import { drizzleService } from "../ops/drizzle";
import { notificationTable } from "@/db/schema/notification";
import { db } from "@/db";
import { Result } from "@/lib/result";

async function create({
  user,
  title,
  body,
  log,
}: {
  user: string;
  title: string;
  body: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "notification service" });
  const q = await drizzleService.insert(
    notificationTable,
    {
      user,
      body,
      title,
    },
    db,
    log,
  );

  if (!q.value.success) return Result.error(q.value.error);

  return Result.ok(undefined);
}

export const notificationService = {
  create,
};
