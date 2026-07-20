import { db } from "@/db";
import { user } from "@/db/schema";
import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
} from "@/db/schemas/habit";
import { auth } from "@/lib/auth";
import { log } from "@/lib/evlog";
import { isError, isOk, Result } from "@/lib/result";
import { createId } from "@paralleldrive/cuid2";
import { eq, InferSelectModel } from "drizzle-orm";
import { headers } from "next/headers";

async function createNewHabit({
  name,
  description,
}: {
  name: string;
  description: string;
}): Promise<Result<null, string>> {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    log.error("401", "User not logged in");
    return isError("Please login before creating a new habit.");
  }

  const id = createId();

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(habitTable)
        .values({ id, name, description, admin: session.user.id });
      await tx
        .insert(habitMembersTable)
        .values({ habit: id, member: session.user.id });
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

async function getHabits(): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    log.error("401", "User not logged in");
    return isError("No user is logged in.");
  }

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
      .where(eq(habitMembersTable.member, session.user.id));

    return isOk(habitDetails);
  } catch (e) {
    log.error("500", e as string);
    return isError("Could not fetch habits for user.")
  }
}

async function addMemberToHabit({
  habit,
  memberEmail,
}: {
  habit: string;
  memberEmail: string;
}): Promise<Result<null, string>> {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    log.error("401", "User not logged in.");
    return isError("Please login before adding a member to a habit.");
  }

  const checkAuthority = await db
    .select({ admin: habitTable.admin })
    .from(habitTable)
    .where(eq(habitTable.id, habit));
  if (!(checkAuthority[0].admin == session.user.id)) {
    log.error("400", "User doesn't have authority to add members.");
    return isError("Only Admins can add members.");
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
    return isError("Could not add member");
  }
}

async function addTaskToHabit({
  habit,
  task,
}: {
  habit: string;
  task: string;
}): Promise<Result<null, string>> {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user) {
    log.error("401", "User not logged in.");
    return isError("Please login before adding a member to a habit.");
  }

  const checkAuthority = await db
    .select({ admin: habitTable.admin })
    .from(habitTable)
    .where(eq(habitTable.id, habit));
  if (!(checkAuthority[0].admin == session.user.id)) {
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
  getHabits,
  addMemberToHabit,
  addTaskToHabit,
};
