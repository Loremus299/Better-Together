import { Logger } from "@/lib/logger";
import { drizzleOps } from "../ops/drizzle";
import { notificationTable } from "@/db/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { Result } from "@/lib/result";

async function markNotifRead({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "notif ops mark read" });
  return await drizzleOps.update(
    notificationTable,
    { read: true },
    (notificationTable) => eq(notificationTable.id, id),
    log,
  );
}

async function readByUser({
  user,
  log,
}: {
  user: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof notificationTable>[], string>> {
  log.trace({ layer: "notif ops read by user" });
  log.debug({ user });
  return await drizzleOps.readAllWithCondition(
    notificationTable,
    (notificationTable) => eq(notificationTable.user, user),
    log,
  );
}

export const notificationService = {
  markNotifRead,
  readByUser,
};
