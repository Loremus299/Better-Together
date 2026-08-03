import { db } from "@/db";
import { habitMembersTable, habitTable, habitTasksTable } from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { and, eq, getColumns, InferSelectModel } from "drizzle-orm";

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
      return isError("Habit not found.");
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
      log.info("status", "is not member");
      return isOk(false);
    } else {
      log.info("status", "is member");
      return isOk(true);
    }
  } catch (error) {
    log.error("500", error as string);
    return isError(
      "Could not verify authority of the user over the habit as member.",
    );
  }
}

async function createHabit({
  name,
  description,
  header,
  admin,
  tx = db,
}: {
  userId: string;
  name: string;
  description: string;
  header?: string;
  admin: string;
  tx: typeof db;
}): Promise<Result<string, string>> {
  try {
    const habitId = await tx
      .insert(habitTable)
      .values({ name, admin, description, header })
      .returning({ id: habitTable.id });

    return isOk(habitId[0].id);
  } catch (error) {
    log.error("500", error as string);
    return isError(error as string);
  }
}

async function readHabitById({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  const isMember = await isUserMember({ userId, habitId, tx });

  if (!isMember.success) {
    return isError(isMember.error);
  }

  if (!isMember.data) {
    log.error("403", "Forbidden");
    return isError("You are not a member of this habit.");
  }

  try {
    return isOk(
      (await tx.select().from(habitTable).where(eq(habitTable.id, habitId)))[0],
    );
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not fetch habit.");
  }
}

async function readAllHabitsByUser({
  userId,
  tx = db,
}: {
  userId: string;
  tx: typeof db;
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  try {
    return isOk(
      await tx
        .select(getColumns(habitTable))
        .from(habitTable)
        .innerJoin(
          habitMembersTable,
          eq(habitMembersTable.habit, habitTable.id),
        )
        .where(eq(habitMembersTable.member, userId)),
    );
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not find your habits.");
  }
}

async function updateHabit({
  userId,
  habitId,
  name,
  description,
  header,
  tx = db,
}: {
  userId: string;
  habitId: string;
  name: string;
  description: string;
  header?: string;
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
      .update(habitTable)
      .set({ header, name, description })
      .where(eq(habitTable.id, habitId));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not update habit.");
  }
}

async function deleteHabit({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<null, string>> {
  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can delete habits.");
  }

  try {
    tx.delete(habitTable).where(eq(habitTable.id, habitId));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not delete habit.");
  }
}

async function createTask({
  userId,
  habitId,
  taskName,
  taskDescription,
  tx = db,
}: {
  userId: string;
  habitId: string;
  taskName: string;
  taskDescription: string;

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

async function readTaskById({
  userId,
  habitId,
  taskId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  taskId: string;
  tx: typeof db;
}): Promise<Result<InferSelectModel<typeof habitTasksTable>, string>> {
  const isMember = await isUserMember({ userId, habitId, tx });

  if (!isMember.success) {
    return isError(isMember.error);
  }

  if (!isMember.data) {
    log.error("403", "Forbidden");
    return isError("You are not a member in the habit.");
  }

  try {
    const task = await tx
      .select()
      .from(habitTasksTable)
      .where(
        and(eq(habitTasksTable.id, taskId), eq(habitTasksTable.habit, habitId)),
      );

    if (task.length == 0) {
      log.error("404", "No such task found");
      return isError("The task could not be found.");
    }

    return isOk(task[0]);
  } catch (error) {
    log.error("500", error as string);
    return isError("Task could not be read.");
  }
}

async function readAllTasksByHabit({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<InferSelectModel<typeof habitTasksTable>[], string>> {
  const isMember = await isUserMember({ userId, habitId, tx });

  if (!isMember.success) {
    return isError(isMember.error);
  }

  if (!isMember.data) {
    log.error("403", "Forbidden");
    return isError("You are not a member in the habit.");
  }

  try {
    return isOk(
      await tx
        .select(getColumns(habitTasksTable))
        .from(habitTasksTable)
        .where(eq(habitTasksTable.habit, habitId)),
    );
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not read tasks from this habit.");
  }
}

async function updateTask({
  userId,
  taskId,
  taskName,
  taskDescription,
  tx = db,
}: {
  userId: string;
  taskId: string;
  taskName: string;
  taskDescription: string;
  tx: typeof db;
}): Promise<Result<undefined, string>> {
  const habitForTask = await tx
    .select({ habit: habitTasksTable.habit })
    .from(habitTasksTable)
    .where(eq(habitTasksTable.id, taskId));

  if (habitForTask.length == 0) {
    log.error("404", "HabitForTask failed");
    return isError("Invalid taskId, failed to find ownership over task.");
  }

  const habitId = habitForTask[0].habit;

  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can update tasks.");
  }

  try {
    await tx
      .update(habitTasksTable)
      .set({
        task: taskName,
        description: taskDescription,
      })
      .where(eq(habitTasksTable.id, taskId));
    return isOk(undefined);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not edit task.");
  }
}

async function deleteTask({
  userId,
  taskId,
  tx = db,
}: {
  userId: string;
  taskId: string;
  tx: typeof db;
}): Promise<Result<null, string>> {
  const habitForTask = await tx
    .select({ habit: habitTasksTable.habit })
    .from(habitTasksTable)
    .where(eq(habitTasksTable.id, taskId));

  if (habitForTask.length == 0) {
    log.error("404", "HabitForTask failed");
    return isError("Invalid taskId, failed to find ownership over task.");
  }

  const habitId = habitForTask[0].habit;

  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can delete tasks.");
  }

  try {
    await tx.delete(habitTasksTable).where(eq(habitTasksTable.id, taskId));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not delete task.");
  }
}

async function addMemberToHabit({
  userId,
  habitId,
  memberId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  memberId: string;
  tx: typeof db;
}): Promise<Result<null, string>> {
  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can add members.");
  }

  try {
    await tx
      .insert(habitMembersTable)
      .values({ habit: habitId, member: memberId });
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not add member.");
  }
}

async function removeMemberFromHabit({
  userId,
  linkId,
  tx = db,
}: {
  userId: string;
  linkId: string;
  tx: typeof db;
}): Promise<Result<null, string>> {
  const habitOfLink = await tx
    .select({ habit: habitMembersTable.habit })
    .from(habitMembersTable)
    .where(eq(habitMembersTable.id, linkId));

  if (habitOfLink.length == 0) {
    log.error("404", "habitOfLink failed");
    return isError("Invalid Link ID.");
  }

  const habitId = habitOfLink[0].habit;

  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can remove members.");
  }

  try {
    await tx.delete(habitMembersTable).where(eq(habitMembersTable.id, linkId));
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not remove member.");
  }
}

export const habitService = {
  isUserAdmin,
  isUserMember,

  createHabit,
  readHabitById,
  readAllHabitsByUser,
  updateHabit,
  deleteHabit,

  createTask,
  readTaskById,
  readAllTasksByHabit,
  updateTask,
  deleteTask,

  addMemberToHabit,
  removeMemberFromHabit,
};
