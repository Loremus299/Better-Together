import { db } from "@/db";
import { habitMembersTable, habitTable, habitTasksTable } from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { and, eq } from "drizzle-orm";

async function isUserAdmin({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<boolean, string>> {
  try {
    const habitById = await tx
      .select()
      .from(habitTable)
      .where(eq(habitTable.id, habitId));

    if (habitById.length == 0) {
      log.error("404", "Habit Not Found");
      isError("Habit not found.");
    }

    if (habitById[0].admin == userId) {
      log.info("status", "is admin");
      return isOk(true);
    } else {
      log.info("status", "is not admin");
      return isOk(false);
    }
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not verify user authority over the habit as admin.");
  }
}

async function isUserMember({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<boolean, string>> {
  try {
    const isMember = await tx
      .select()
      .from(habitMembersTable)
      .where(
        and(
          eq(habitMembersTable.habit, habitId),
          eq(habitMembersTable.member, userId),
        ),
      );

    if (isMember.length == 0) {
      log.info("status", "is member");
      return isOk(false);
    } else {
      log.info("status", "is not member");
      return isOk(true);
    }
  } catch (error) {
    log.error("500", error as string);
    return isError(
      "Could not verify authority of the user over the habit as member.",
    );
  }
}

async function createTaskInHabit({
  userId,
  taskName,
  taskDescription,
  habitId,
  tx = db,
}: {
  userId: string;
  taskName: string;
  taskDescription: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<string, string>> {
  const isAdmin = await isUserAdmin({ userId, habitId, tx });
  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }
  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can add tasks.");
  }

  try {
    const taskId = await tx
      .insert(habitTasksTable)
      .values({
        task: taskName,
        description: taskDescription,
        habit: habitId,
      })
      .returning({ id: habitTasksTable.id });

    log.info("Task Id", taskId[0].id);
    return isOk(taskId[0].id);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not create task.");
  }
}

async function updateTaskInHabit({
  userId,
  habitId,
  taskId,
  taskName,
  taskDescription,
  tx = db,
}: {
  userId: string;
  habitId: string;
  taskId: string;
  taskName: string;
  taskDescription: string;
  tx: typeof db;
}) {
  const isAdmin = await isUserAdmin({ userId, habitId, tx });
  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }
  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can add tasks.");
  }

  try {
    await tx
      .update(habitTasksTable)
      .set({
        task: taskName,
        description: taskDescription,
      })
      .where(eq(habitTasksTable.id, taskId));
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not edit task.");
  }
}

export const habitService = {
  isUserAdmin,
  isUserMember,
  createTaskInHabit,
  updateTaskInHabit,
};
