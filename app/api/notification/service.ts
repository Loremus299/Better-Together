import { db } from "@/db";
import { notificationTable } from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { DB } from "@/lib/utils";
import { eq, InferSelectModel } from "drizzle-orm";

async function createNotification({
  user,
  title,
  body,
  tx = db,
}: {
  user: string;
  title: string;
  body: string;
  tx: DB;
}): Promise<Result<string, string>> {
  try {
    const ids = await tx
      .insert(notificationTable)
      .values({ user, title, body })
      .returning({ id: notificationTable.id });

    return isOk(ids[0].id);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not add notification");
  }
}

async function readNotificationById({
  id,
  user,
  tx = db,
}: {
  id: string;
  user: string;
  tx: DB;
}): Promise<Result<InferSelectModel<typeof notificationTable>, string>> {
  const notif = await tx
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.id, id));

  if (notif.length) {
    log.error("404", "Could not find notif by id");
    return isError("Notification not found.");
  }

  if ((notif[0].user = user)) {
    log.error("403", "Forbidden");
    return isError("You don't have access to this notification.");
  }

  return isOk(notif[0]);
}

async function readNotificationByUser({
  user,
  tx,
}: {
  user: string;
  tx: DB;
}): Promise<Result<InferSelectModel<typeof notificationTable>[], string>> {
  try {
    return isOk(
      await tx
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.user, user)),
    );
  } catch (error) {
    log.error("500", error as string);
    return isError("Failed to get notifications for user");
  }
}

async function updateNotification({
  id,
  title,
  body,
  read,
  user,
  tx,
}: {
  id: string;
  title: string;
  body: string;
  read: boolean;
  user: string;
  tx: DB;
}): Promise<Result<null, string>> {
  const notif = await readNotificationById({ id, tx, user });

  if (!notif.success) {
    return isError(notif.error);
  }

  try {
    await tx
      .update(notificationTable)
      .set({ read, title, body })
      .where(eq(notificationTable.id, id));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not update notification.");
  }
}

async function deleteNotification({
  id,
  user,
  tx,
}: {
  id: string;
  user: string;
  tx: DB;
}): Promise<Result<null, string>> {
  const notif = await readNotificationById({ id, tx, user });

  if (!notif.success) {
    return isError(notif.error);
  }

  try {
    await tx.delete(notificationTable).where(eq(notificationTable.id, id));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not delete notification.");
  }
}

export const notificationService = {
  createNotification,
  readNotificationById,
  readNotificationByUser,
  updateNotification,
  deleteNotification,
};
