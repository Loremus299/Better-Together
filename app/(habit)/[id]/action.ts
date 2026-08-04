"use server";

import { withEvlog } from "@/lib/evlog";
import { useLogger } from "evlog/next";
import { AddMemberValues } from "./common";
import { habitService } from "@/app/api/habit/service";
import { db } from "@/db";
import { isError, isOk, Result } from "@/lib/result";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const addMemberAction = withEvlog(
  async (values: AddMemberValues): Promise<Result<null, string>> => {
    const log = useLogger();

    const userId = await db
      .select()
      .from(user)
      .where(eq(user.email, values.memberEmail));

    if (userId.length == 0) {
      log.error("User with that email not found");
      return isError("User with that email not found.");
    }

    const req = await habitService.addMemberToHabit({
      habitId: values.habitId,
      memberId: userId[0].id,
      userId: values.userId,
      tx: db,
    });

    if (!req.success) {
      log.error(req.error);
      return isError(req.error);
    }

    return isOk(null);
  },
);
