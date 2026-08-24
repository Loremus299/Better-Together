import { Logger } from "@/lib/logger";
import { drizzleOps } from "../ops/drizzle";
import { notificationTable } from "@/db/schema";
import { and, eq, InferSelectModel } from "drizzle-orm";
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

async function readById({ id, log }: { id: string; log: Logger }) {
  log.trace({ layer: "notif ops read by user" });
  log.debug({ id });
  return await drizzleOps.readWithCondition(
    notificationTable,
    (notificationTable) => eq(notificationTable.id, id),
    log,
  );
}

async function getUnreadNotifsForUser({
  user,
  log,
}: {
  user: string;
  log: Logger;
}) {
  log.trace({ layer: "notif ops read by user" });
  log.debug({ user });
  return await drizzleOps.readWithCondition(
    notificationTable,
    (notificationTable) =>
      and(eq(notificationTable.user, user), eq(notificationTable.read, false)),
    log,
  );
}

export const notificationService = {
  markNotifRead,
  readByUser,
  readById,
  getUnreadNotifsForUser,
};
