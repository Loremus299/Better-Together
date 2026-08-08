"use server";

import { notificationService } from "@/app/api/notification/service";
import { db } from "@/db";
import { withEvlog } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { userId } from "@/lib/server-util";

export const markNotificationAsReadAction = withEvlog(
  async (id: string): Promise<Result<null, string>> => {
    const user = await userId();
    if (!user.success) {
      return isError("Could not get your user id");
    }

    const req = await notificationService.updateNotificationAsRead({
      id,
      user: user.data,
      tx: db,
    });

    if (!req.success) {
      return isError(req.error);
    }

    return isOk(null);
  },
);
