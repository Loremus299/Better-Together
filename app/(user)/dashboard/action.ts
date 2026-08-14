"use server";

import { notificationService } from "@/app/api/notification/service";
import { Logger } from "@/lib/logger";
import { Result, ResultType } from "@/lib/result";
import { getSession } from "@/lib/server-util";

export async function markNotificationAsReadAction(
  id: string,
): Promise<ResultType<undefined, { error: string; request: string }>> {
  const log = new Logger();

  try {
    const session = await getSession();
    if (!session) {
      log.error({ error: "No user session found" });
      return Result.error<undefined, { error: string; request: string }>({
        error: "No user session found",
        request: log.getId(),
      }).type();
    }

    const notif = await notificationService.readById({ id, log });
    if (!notif.value.success) {
      return Result.error<undefined, { error: string; request: string }>({
        error: "No notification found",
        request: log.getId(),
      }).type();
    }

    if (notif.value.data.user !== session.user.id) {
      return Result.error<undefined, { error: string; request: string }>({
        error: "You can't mutate this notification",
        request: log.getId(),
      }).type();
    }

    return (await notificationService.markNotifRead({ id, log }))
      .mapError((e) => ({ error: e, request: log.getId() }))
      .type();
  } finally {
    log.print();
  }
}
