"use server";

import { withEvlog } from "@/lib/evlog";
import { habitService } from "@/app/api/habit/service";
import { db } from "@/db";
import { isError, isOk, Result } from "@/lib/result";

export const CreateHabitAction = withEvlog(
  async ({
    name,
    description,
    admin,
    log,
  }: {
    name: string;
    description: string;
    admin: string;
    log: string;
  }): Promise<Result<string, string>> => {
    const habit = await habitService.createHabit({
      name,
      description,
      admin,
      header: log,
      tx: db,
    });

    if (!habit.success) {
      return isError(habit.error);
    }

    await db.transaction(async (tx) => {
      await habitService.createTask({
        habitId: habit.data,
        taskName: "Create tasks.",
        taskDescription: "Create habits you are going to do everyday.",
        userId: admin,
        tx,
      });
      await habitService.createTask({
        habitId: habit.data,
        taskName: "Invite your partners.",
        taskDescription:
          "Invite people to hold you accountable and work together.",
        userId: admin,
        tx,
      });
    });

    return isOk(habit.data);
  },
);
