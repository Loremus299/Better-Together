"use server";

import { withEvlog } from "@/lib/evlog";
import { useLogger } from "evlog/next";
import { AddMemberValues, AddTaskValues } from "./common";
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
      ...values,
      memberId: userId[0].id,
      tx: db,
    });

    if (!req.success) {
      log.error(req.error);
      return isError(req.error);
    }

    return isOk(null);
  },
);

export const addTaskAction = withEvlog(
  async (values: AddTaskValues): Promise<Result<null, string>> => {
    const log = useLogger();
    const req = await habitService.createTask({ ...values, tx: db });

    if (!req.success) {
      log.error(req.error);
      return isError(req.error);
    }

    return isOk(null);
  },
);

export const editHabitAction = withEvlog(
  async ({
    userId,
    habitId,
    name,
    description,
    finalHeader,
  }: {
    userId: string;
    habitId: string;
    name: string;
    description: string;
    finalHeader: string | null;
  }): Promise<Result<null, string>> => {
    const log = useLogger();
    const req = await habitService.updateHabit({
      userId,
      habitId,
      name,
      description,
      header: finalHeader,
      tx: db,
    });

    if (!req.success) {
      log.error(req.error);
      return isError(req.error);
    }
    return isOk(null);
  },
);
