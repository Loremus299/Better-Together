"use server";

import { notifOps } from "@/app/api/ops/notification";
import { Logger } from "@/lib/logger";
import { Result, ResultType } from "@/lib/result";

export async function registrationNotification({
  user,
  name,
}: {
  user: string;
  name: string;
}): Promise<ResultType<undefined, { error: string; request: string }>> {
  const log = new Logger();
  try {
    return (
      await notifOps.addNotif({
        user,
        title: `Welcome ${name}`,
        body: "Welcome to Better Together. Create your own habits or ask your partner to invite you in theirs. Best of luck ♡⸜(˶˃ ᵕ ˂˶)⸝♡",
        log,
      })
    )
      .match(
        () =>
          Result.ok<undefined, { error: string; request: string }>(undefined),
        (e) => {
          return Result.error({ error: e, request: log.getId() });
        },
      )
      .type();
  } finally {
    log.print();
  }
}
