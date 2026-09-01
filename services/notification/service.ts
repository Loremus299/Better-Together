import { notificationTable } from "@/db/schema";
import { Result } from "@/lib/result";
import { eq, InferSelectModel } from "drizzle-orm";
import drizzleOps from "../ops/drizzle";
import { Logger } from "@/lib/logger";

async function createNotif({
  title,
  body,
  user,
  log,
}: {
  title: string;
  body: string;
  user: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof notificationTable>, string>> {
  log.trace({ layer: "notif service - create notif" });
  log.debug({ title, body, user });
  return await drizzleOps.insert(notificationTable, { title, body, user }, log);
}

async function readNotifsByUser({
  user,
  log,
}: {
  user: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof notificationTable>[], string>> {
  log.trace({ layer: "notif service - read notifs by user" });
  log.debug({ user });
  return await drizzleOps.readTable(notificationTable, { user }, log);
}

async function updateNotifById({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof notificationTable>, string>> {
  log.trace({ layer: "notif service - update notif by id" });
  log.debug({ id });
  return await drizzleOps.update(
    notificationTable,
    { read: true },
    (nt) => eq(nt.id, id),
    log,
  );
}

const notifService = { createNotif, readNotifsByUser, updateNotifById };
export default notifService;
