import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
  Roles,
  user,
} from "@/db/schema";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import drizzleOps from "../ops/drizzle";
import {
  and,
  EmptyRelations,
  eq,
  getColumns,
  inArray,
  InferSelectModel,
  ne,
} from "drizzle-orm";
import { db } from "@/db";
import { PgAsyncTransaction, PgQueryResultHKT } from "drizzle-orm/pg-core";
import notifService from "../notification/service";

async function isUserInHabit({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<Roles, string>> {
  log.trace({ layer: "habit service - get user role" });
  log.debug({ user, habit });

  return (
    await drizzleOps.readTableUnique(
      habitMembersTable,
      { habit, member: user },
      log.nest(),
    )
  ).mapOk((e) => e.role as Roles);
}

async function isAdmin({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk((t) => t == "admin");
}

async function isMember({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk(
    (t) => t == "member",
  );
}

async function isChecker({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk(
    (t) => t == "checker",
  );
}

async function createHabit({
  name,
  description,
  admin,
  log,
}: {
  name: string;
  description: string;
  admin: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - create habit" });
  log.debug({ name, description, admin });

  log.trace({ trace: "adding habit" });
  const habit = await drizzleOps.insert(
    habitTable,
    { name, description },
    log.nest(),
  );
  if (!habit.value.success) return Result.error(habit.value.error);
  const habitId = habit.value.data.id;

  log.trace({ trace: "adding member as admin" });
  const addAdmin = await drizzleOps.insert(
    habitMembersTable,
    { habit: habitId, member: admin, role: Roles.admin },
    log.nest(),
  );
  if (!addAdmin.value.success) return Result.error(addAdmin.value.error);

  log.trace({ trace: "adding default tasks" });
  const addTask = (
    task: string,
    description: string,
    tx: PgAsyncTransaction<PgQueryResultHKT, EmptyRelations>,
  ) => {
    return drizzleOps.insert(
      habitTasksTable,
      {
        task,
        description,
        habit: habitId,
      },
      log.nest(),
      tx,
    );
  };

  (
    await Result.tryCatch({}, async () => {
      await db.transaction(async (tx) => {
        await addTask(
          "Add Task",
          "Add task in habit to do everyday with your members.",
          tx,
        );
        await addTask(
          "Invite partners",
          "Invite partners as members to participate with you or checkers to hold you accountable.",
          tx,
        );
      });
    })
  ).mapError((e) => log.warn({ error: e as string }));

  return Result.ok(habit.value.data);
}

async function readHabitById({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - read habit by d" });
  log.debug({ id });

  return await drizzleOps.readTableUnique(habitTable, { id }, log.nest());
}

async function readHabitsByUser({
  user,
  roles,
  log,
}: {
  user: string;
  roles?: Roles[];
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  log.trace({ layer: "habit service - read habits by user" });
  log.debug({ user, roles });

  if (roles) {
    return await drizzleOps.executeQuery(
      db
        .select(getColumns(habitTable))
        .from(habitTable)
        .innerJoin(habitMembersTable, eq(habitMembersTable.member, user))
        .where(
          and(
            eq(habitMembersTable.member, user),
            inArray(habitMembersTable.role, roles),
          ),
        ),
      log.nest(),
    );
  } else {
    return await drizzleOps.executeQuery(
      db
        .select(getColumns(habitTable))
        .from(habitTable)
        .innerJoin(habitMembersTable, eq(habitMembersTable.member, user))
        .where(eq(habitMembersTable.member, user)),
      log.nest(),
    );
  }
}

async function updateHabitById({
  user,
  habit,
  name,
  description,
  log,
}: {
  user: string;
  habit: string;
  name?: string;
  description?: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - update habit by id" });
  log.debug({ habit, name, description });

  log.trace({ trace: "fetching essential data" });
  const allData = await Result.settle([
    readHabitById({ id: habit, log: log.nest() }),
  ]);

  if (!allData.value.success)
    return Result.error("Failed to fetch necessary data for updating habit");

  const [habitDetails] = allData.value.data;

  log.trace({ trace: "updating habit" });
  const data = await drizzleOps.update(
    habitTable,
    {
      name: name ?? habitDetails.name,
      description: description ?? habitDetails.description,
    },
    (t) => eq(t.id, habit),
    log.nest(),
  );
  if (!data.value.success) return Result.error("failed to add member");

  log.trace({ trace: "sending notifications to other admins" });
  (
    await readMembersInHabit({
      habit,
      roles: [Roles.admin],
      log,
      excludeSelf: user,
    })
  ).mapOk(async (members) => {
    for (const member of members) {
      await notifService.createNotif({
        title: "Admin updated habit",
        body: `"${name ?? habitDetails.name}" was updated by admin.`,
        user: member.member,
        log: log.nest(),
      });
    }
  });

  return data;
}

async function deleteHabitById({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - delete habit by id" });
  log.debug({ habit });

  log.trace({ trace: "fetching essential data" });
  const allData = await Result.settle([
    readHabitById({ id: habit, log: log.nest() }),
  ]);

  if (!allData.value.success)
    return Result.error("Failed to fetch necessary data for updating habit");

  const [habitDetails] = allData.value.data;

  log.trace({ trace: "deleting habit" });
  const data = await drizzleOps.delete(
    habitTable,
    (t) => eq(t.id, habit),
    log.nest(),
  );
  if (!data.value.success) return Result.error("failed to add member");

  log.trace({ trace: "sending notifications to other admins" });
  (
    await readMembersInHabit({
      habit,
      roles: [Roles.admin],
      log,
      excludeSelf: user,
    })
  ).mapOk(async (members) => {
    for (const member of members) {
      await notifService.createNotif({
        title: "Admin deleted habit",
        body: `"${habitDetails.name}" was deleted by admin.`,
        user: member.member,
        log: log.nest(),
      });
    }
  });

  return data;
}

async function addEmailToHabit({
  habit,
  email,
  log,
  role,
}: {
  habit: string;
  email: string;
  log: Logger;
  role: Roles;
}): Promise<Result<InferSelectModel<typeof habitMembersTable>, string>> {
  log.trace({ layer: "habit service - add email to habit" });
  log.debug({ habit, email, role });

  log.trace({ trace: "necessary data" });
  const allData = await Result.settle([
    drizzleOps.readTableUnique(user, { email }, log.nest()),
    readHabitById({ id: habit, log: log.nest() }),
  ]);
  if (!allData.value.success)
    return Result.error("Could not fetch essential data to update task");

  const [userDetails, habitDetails] = allData.value.data;

  log.trace({ trace: "Duplication check" });
  const memberExists = await drizzleOps.readTableUnique(
    habitMembersTable,
    {
      habit: habit,
      member: userDetails.id,
    },
    log,
  );
  if (memberExists.value.success)
    return Result.error("Member already exists in habit");

  log.trace({ trace: "Adding member" });
  const data = await drizzleOps.insert(
    habitMembersTable,
    {
      habit: habit,
      member: userDetails.id,
      role,
    },
    log,
  );

  if (!data.value.success) return Result.error("failed to add member");

  notifService.createNotif({
    title: "You were added in task",
    body: `You were added in habit "${habitDetails.name}"`,
    user: userDetails.id,
    log: log.nest(),
  });
  return data;
}

async function readMembersInHabit({
  habit,
  roles = [],
  log,
  excludeSelf,
}: {
  habit: string;
  roles: Roles[];
  log: Logger;
  excludeSelf?: string;
}): Promise<Result<InferSelectModel<typeof habitMembersTable>[], string>> {
  log.trace({ layer: "habit service - read members in habit" });
  log.debug({ user, habit, roles });

  const conditions = [
    eq(habitMembersTable.habit, habit),
    ...(roles.length > 0 ? [inArray(habitMembersTable.role, roles)] : []),
    ...(excludeSelf ? [ne(habitMembersTable.member, excludeSelf)] : []),
  ];

  return await drizzleOps.executeQuery(
    db
      .select()
      .from(habitMembersTable)
      .where(and(...conditions)),
    log,
  );
}

async function removeMemberInHabit({
  email,
  habit,
  log,
}: {
  email: string;
  habit: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitMembersTable>, string>> {
  log.trace({ layer: "habit service - remove member in habit" });
  log.debug({ habit, email });

  log.trace({ trace: "necessary data fetching" });
  const data = await Result.settle([
    (async () => {
      return drizzleOps.readTableUnique(user, { email: email }, log.nest());
    })(),
    readHabitById({ id: habit, log: log.nest() }),
  ]);
  if (!data.value.success)
    return Result.error("Could not fetch essential data to remove member");

  const [userDetails, habitDetails] = data.value.data;

  log.trace({ trace: "remove member" });
  const ret = await drizzleOps.delete(
    habitMembersTable,
    (t) => and(eq(t.member, userDetails.id), eq(t.habit, habit)),
    log.nest(),
  );

  if (!ret.value.success) return Result.error("failed to add member");

  notifService.createNotif({
    title: "You were removed in habit",
    body: `You were removed from habit "${habitDetails.name}"`,
    user: userDetails.id,
    log: log.nest(),
  });
  return ret;
}

const auth = { isUserInHabit, isAdmin, isMember, isChecker };
const members = { addEmailToHabit, readMembersInHabit, removeMemberInHabit };
const habitService = {
  createHabit,
  readHabitById,
  readHabitsByUser,
  updateHabitById,
  deleteHabitById,
  auth,
  members,
};
export default habitService;
