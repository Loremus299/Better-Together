import { Logger } from "@/lib/logger";
import { drizzleOps } from "../drizzle";
import { notificationTable } from "@/db/schema";
import { Result } from "@/lib/result";
import { InferSelectModel } from "drizzle-orm";

async function addNotif({
  user,
  title,
  body,
  log,
}: {
  user: string;
  title: string;
  body: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof notificationTable>, string>> {
  log.trace({ layer: "notif ops add" });
  return await drizzleOps.insert(notificationTable, { user, title, body }, log);
}

export const notifOps = {
  addNotif,
};
