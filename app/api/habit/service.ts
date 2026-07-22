import { db } from "@/db";
import { user } from "@/db/schema";
import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
} from "@/db/schemas/habit";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, InferSelectModel } from "drizzle-orm";

async function createNewHabit({
  name,
  description,
  userId
}: {
  name: string;
  description: string;
  userId: string
}): Promise<Result<null, string>> {
  const id = createId();

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(habitTable)
        .values({ id, name, description, admin: userId });
      await tx
        .insert(habitMembersTable)
        .values({ habit: id, member: userId });
      await tx
        .insert(habitTasksTable)
        .values({
          habit: id,
          task: "Add members to hold yourself accountable.",
        });
      await tx
        .insert(habitTasksTable)
        .values({ habit: id, task: "Create tasks for habit." });
    });

    return isOk(null);
  } catch (e) {
    log.error("500", e as string);
    return isError("Could not create habit.");
  }
}

async function editHabit({ habit, description, name, userId }: { habit: string, description: string, name: string, userId: string }) {
  const getHabit = await db.select().from(habitTable).where(eq(habitTable.id, habit))

  if (getHabit.length == 0) {
    log.error("404", "Habit not found")
    return isError("No habit found")
  }

  if (getHabit[0].admin !== userId) {
    log.error("401", "User cannot edit habit")
    return isError("Only admins can edit habits.")
  }

  try {
    await db.update(habitTable).set({ description, name }).where(eq(habitTable.id, habit))
    return isOk(null)
  } catch (e) {
    log.error("500", e as string)
    return isError("Could not edit habit.")
  }
}

async function getHabits({ userId }: { userId: string }): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  try {
    const habitDetails = await db
      .select({
        id: habitTable.id,
        name: habitTable.name,
        description: habitTable.description,
        admin: habitTable.admin,
        createdAt: habitTable.createdAt,
        updatedAt: habitTable.updatedAt,
      })
      .from(habitMembersTable)
      .innerJoin(habitTable, eq(habitTable.id, habitMembersTable.habit))
      .where(eq(habitMembersTable.member, userId));

    return isOk(habitDetails);
  } catch (e) {
    log.error("500", e as string);
    return isError("Could not fetch habits for user.")
  }
}

async function addMemberToHabit({
  habit,
  memberEmail,
  userId
}: {
  habit: string;
  memberEmail: string;
  userId: string
}): Promise<Result<null, string>> {
  const checkAuthority = await db
    .select({ admin: habitTable.admin })
    .from(habitTable)
    .where(eq(habitTable.id, habit));
  if (!(checkAuthority[0].admin == userId)) {
    log.error("400", "User doesn't have authority to add members.");
    return isError("Only admins can add members.");
  }

  const validateMember = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, memberEmail));
  if (validateMember.length == 0) {
    log.error("404", "User doesn't exist");
    return isError("Couldn't find user with that email.");
  }

  try {
    await db
      .insert(habitMembersTable)
      .values({ habit, member: validateMember[0].id });
    return isOk(null);
  } catch (e) {
    log.error("500", e as string);
    return isError("Could not add member.");
  }
}

async function removeMemberFromHabit({ member, habit, userId }: { member: string, habit: string, userId: string }) {
  const getHabit = await db.select().from(habitTable).where(eq(habitTable.id, habit))

  if (getHabit.length == 0) {
    log.error("404", "Habit not found")
    return isError("No habit found")
  }

  if (getHabit[0].admin !== userId) {
    log.error("401", "User cannot remove members.")
    return isError("Only admins can remove members.")
  }

  try {
    await db.delete(habitMembersTable).where(and(
      eq(habitMembersTable.habit, habit),
      eq(habitMembersTable.member, member)
    ))
    return isOk(null)
  } catch (e) {
    log.error("500", e as string)
    return isError("Could not add member")
  }
}

async function addTaskToHabit({
  habit,
  task,
  userId
}: {
  habit: string;
  task: string;
  userId: string
}): Promise<Result<null, string>> {
  const checkAuthority = await db
    .select({ admin: habitTable.admin })
    .from(habitTable)
    .where(eq(habitTable.id, habit));
  if (!(checkAuthority[0].admin == userId)) {
    log.error("400", "User doesn't have authority to add tasks");
    return isError("Only Admins can add tasks.");
  }

  try {
    await db.insert(habitTasksTable).values({ habit, task });
    return isOk(null);
  } catch (e) {
    log.error("500", e as string);
    return isError("Could not add task.");
  }
}

export const habitService = {
  createNewHabit,
  editHabit,
  getHabits,
  addMemberToHabit,
  removeMemberFromHabit,
  addTaskToHabit,
};
