import { db } from "@/db";
import { notificationTable } from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { DB } from "@/lib/utils";

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

export const notificationService = {
  createNotification,
};
