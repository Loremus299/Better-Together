/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { notificationTable } from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
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
  tx: any;
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
  tx: any;
}): Promise<Result<InferSelectModel<typeof notificationTable>, string>> {
  const notif = await tx
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.id, id))
    .where(eq(notificationTable.user, user));

  if (notif.length == 0) {
    log.error("404", "Could not find notif by id");
    return isError("Notification not found.");
  }

  return isOk(notif[0]);
}

async function readNotificationsByUser({
  user,
  tx,
}: {
  user: string;
  tx: any;
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

async function updateNotificationAsRead({
  id,
  user,
  tx,
}: {
  id: string;
  user: string;
  tx: any;
}): Promise<Result<null, string>> {
  const notif = await readNotificationById({ id, tx, user });

  if (!notif.success) {
    return isError(notif.error);
  }

  try {
    await tx
      .update(notificationTable)
      .set({ read: true })
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
  tx: any;
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
  readNotificationsByUser,
  updateNotificationAsRead,
  deleteNotification,
};
