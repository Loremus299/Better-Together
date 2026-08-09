/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
  user,
} from "@/db/schema";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { and, eq, getColumns, InferSelectModel, or } from "drizzle-orm";
import { notificationService } from "../notification/service";

async function isUserAdmin({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: any;
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
  tx: any;
}): Promise<Result<boolean, string>> {
  try {
    const isMember = await tx
      .select({ id: habitTable.id })
      .from(habitTable)
      .leftJoin(habitMembersTable, eq(habitMembersTable.habit, habitTable.id))
      .where(
        and(
          eq(habitTable.id, habitId),
          or(
            eq(habitTable.admin, userId),
            eq(habitMembersTable.member, userId),
          ),
        ),
      )
      .limit(1);

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

async function readAllMembersByHabit({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<{ id: string }[], string>> {
  const isMember = await isUserMember({ tx, userId, habitId });

  if (!isMember.success) {
    return isError(isMember.error);
  }
  if (!isMember.data) {
    return isError("You cannot access this habit.");
  }

  try {
    const members = await tx
      .select({ id: habitMembersTable.member })
      .from(habitMembersTable)
      .where(eq(habitMembersTable.habit, habitId));
    const admin = await tx
      .select({ id: habitTable.admin })
      .from(habitTable)
      .where(eq(habitTable.id, habitId));

    return isOk([...members, ...admin]);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not read all members in this habit");
  }
}

async function readAllHabitLinks({
  userId,
  habitId,
  tx = db,
}: {
  userId: string;
  habitId: string;
  tx: typeof db;
}): Promise<Result<{ id: string; email: string }[], string>> {
  const isAdmin = await isUserAdmin({ tx, userId, habitId });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }
  if (!isAdmin.data) {
    return isError("You cannot access this habit.");
  }

  try {
    return isOk(
      await tx
        .select({ id: habitMembersTable.id, email: user.email })
        .from(habitMembersTable)
        .where(eq(habitMembersTable.habit, habitId))
        .innerJoin(user, eq(habitMembersTable.member, user.id)),
    );
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not read all members in this habit");
  }
}

async function createHabit({
  name,
  description,
  header,
  admin,
  tx = db,
}: {
  name: string;
  description: string;
  header: string;
  admin: string;
  tx: any;
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
  tx: any;
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
  tx: any;
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  try {
    return isOk(
      await tx
        .selectDistinct(getColumns(habitTable))
        .from(habitTable)
        .leftJoin(habitMembersTable, eq(habitMembersTable.habit, habitTable.id))
        .where(
          or(
            eq(habitMembersTable.member, userId),
            eq(habitTable.admin, userId),
          ),
        ),
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
  header: string | null;
  tx: any;
}): Promise<Result<null, string>> {
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

    const members = await readAllMembersByHabit({ habitId, tx, userId });
    if (!members.success) {
      log.warn("500", members.error);
      return isError("Could not send notifications to users");
    }

    for (const member of members.data.filter((item) => item.id !== userId)) {
      await notificationService.createNotification({
        user: member.id,
        title: "Updated Habit",
        body: `Admin has updated habit '${name}'`,
        tx,
      });
    }
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
  tx: any;
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
    const members = await readAllMembersByHabit({ habitId, tx, userId });
    if (!members.success) {
      log.warn("500", members.error);
      return isError("Could not send notifications to users");
    }

    const name = await readHabitById({ habitId, tx, userId });
    if (!name.success) {
      return isError(name.error);
    }
    for (const member of members.data.filter((item) => item.id !== userId)) {
      await notificationService.createNotification({
        user: member.id,
        title: "Deleted Habit",
        body: `Admin has deleted habit '${name.data.name}'`,
        tx,
      });

      await tx.delete(habitTable).where(eq(habitTable.id, habitId));
    }
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

  tx: any;
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

    const members = await readAllMembersByHabit({ habitId, tx, userId });
    if (!members.success) {
      log.warn("500", members.error);
      return isError("Could not send notifications to users");
    }

    const name = await readHabitById({ habitId, tx, userId });
    if (!name.success) {
      return isError(name.error);
    }

    for (const member of members.data.filter((item) => item.id !== userId)) {
      await notificationService.createNotification({
        user: member.id,
        title: "Added task",
        body: `Admin has has added task '${taskName}' in habit '${name.data.name}'`,
        tx,
      });
    }

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
  tx: any;
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
  tx: any;
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
  tx: any;
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

    const members = await readAllMembersByHabit({ habitId, tx, userId });
    if (!members.success) {
      log.warn("500", members.error);
      return isError("Could not send notifications to users");
    }

    const name = await readHabitById({ habitId, tx, userId });
    if (!name.success) {
      return isError(name.error);
    }

    for (const member of members.data.filter((item) => item.id !== userId)) {
      await notificationService.createNotification({
        user: member.id,
        title: "Updated task",
        body: `Admin has updated task '${taskName}' in '${name.data.name}'`,
        tx,
      });
    }
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
  tx: any;
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

    const members = await readAllMembersByHabit({ habitId, tx, userId });
    if (!members.success) {
      log.warn("500", members.error);
      return isError("Could not send notifications to users");
    }

    const name = await readHabitById({ habitId, tx, userId });
    if (!name.success) {
      return isError(name.error);
    }

    const taskName = await readTaskById({ habitId, taskId, tx, userId });
    if (!taskName.success) {
      return isError(taskName.error);
    }

    for (const member of members.data.filter((item) => item.id !== userId)) {
      notificationService.createNotification({
        user: member.id,
        title: "Deleted task",
        body: `Admin has deleted task '${taskName.data.task}' in habit '${name.data.name}'`,
        tx,
      });
    }

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
  tx: any;
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
    const existing = await tx
      .select({ id: habitMembersTable.id })
      .from(habitMembersTable)
      .where(
        and(
          eq(habitMembersTable.habit, habitId),
          eq(habitMembersTable.member, memberId),
        ),
      );

    if (existing.length > 0) {
      log.info("status", "member already exists");
      return isError("User is already a member of this habit.");
    }

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
  tx: any;
}): Promise<Result<null, string>> {
  const habitOfLink = await tx
    .select({
      habit: habitMembersTable.habit,
      member: habitMembersTable.member,
    })
    .from(habitMembersTable)
    .where(eq(habitMembersTable.id, linkId));

  if (habitOfLink.length == 0) {
    log.error("404", "habitOfLink failed");
    return isError("Invalid Link ID.");
  }

  const habitId = habitOfLink[0].habit;
  const memberId = habitOfLink[0].member;

  const isAdmin = await isUserAdmin({ userId, habitId, tx });

  if (!isAdmin.success) {
    return isError(isAdmin.error);
  }

  if (!isAdmin.data) {
    log.error("403", "Forbidden");
    return isError("Only admins can remove members.");
  }

  try {
    await tx
      .delete(habitMembersTable)
      .where(
        and(
          eq(habitMembersTable.habit, habitId),
          eq(habitMembersTable.member, memberId),
        ),
      );
    return isOk(null);
  } catch (error) {
    log.error("500", error as string);
    return isError("Could not remove member.");
  }
}

export const habitService = {
  isUserAdmin,
  isUserMember,
  readAllMembersByHabit,

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
  readAllHabitLinks,
  removeMemberFromHabit,
};
