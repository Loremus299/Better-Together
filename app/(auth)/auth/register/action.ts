"use server";

import { notificationService } from "@/app/api/notification/service";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";

export async function signUpNotification({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<Result<"", string>> {
  const log = new Logger();
  log.trace({ layer: "Sign Up Notification Action" });

  try {
    const notif = await notificationService.create({
      user: id,
      title: `Welcome ${name}`,
      body: "Welcome to Better Together. Start by creating your own habit or getting invited to habits from your friends.",
      log,
    });

    if (!notif.value.success) return Result.error(notif.value.error);
    return Result.ok("");
  } finally {
    log.print();
  }
}
